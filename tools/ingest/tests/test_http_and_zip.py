"""Cliente HTTP: intervalo por host, tentativas com recuo, 404 sem repetir, cache condicional e leitura de zip por faixas."""
import io
import tempfile
import unittest
import zipfile
from pathlib import Path

from helpers import LocalServer
from atlas_ingest.http_client import FetchError, Http, NotFound
from atlas_ingest.remote_zip import open_zip


class FakeClock:
    def __init__(self):
        self.t, self.sleeps = 0.0, []

    def now(self):
        return self.t

    def sleep(self, s):
        self.sleeps.append(s)
        self.t += s


def client(clock, **kw):
    return Http(min_interval=1.0, sleep=clock.sleep, clock=clock.now, **kw)


class HttpTests(unittest.TestCase):
    def test_intervalo_minimo_por_host(self):
        clock = FakeClock()
        with LocalServer({"/a": {"body": b"x"}}) as s:
            h = client(clock)
            for _ in range(3):
                h.text(s.base + "/a")
        gaps = [x for x in clock.sleeps if x > 0]
        self.assertEqual(len(gaps), 2, "da segunda requisição em diante espera o intervalo")
        self.assertTrue(all(abs(g - 1.0) < 1e-6 for g in gaps))

    def test_tentativas_com_recuo_exponencial(self):
        clock = FakeClock()
        with LocalServer({"/f": {"body": b"ok", "fail": 2}}) as s:
            self.assertEqual(client(clock).text(s.base + "/f"), "ok")
            self.assertEqual(len(s.hits), 3, "duas falhas 503 e um sucesso")
        backoffs = [x for x in clock.sleeps if x in (1.0, 2.0)]
        self.assertIn(2.0, backoffs, "recuo cresce: 1, 2, ...")

    def test_desiste_depois_do_limite_de_tentativas(self):
        clock = FakeClock()
        with LocalServer({"/f": {"body": b"ok", "fail": 99}}) as s:
            with self.assertRaises(FetchError):
                client(clock, retries=3).text(s.base + "/f")
            self.assertEqual(len(s.hits), 3)

    def test_404_nao_repete(self):
        with LocalServer({}) as s:
            with self.assertRaises(NotFound):
                client(FakeClock()).text(s.base + "/nada")
            self.assertEqual(len(s.hits), 1)

    def test_erro_4xx_diferente_de_404_nao_repete(self):
        with LocalServer({"/f": {"body": b"x", "fail": 5, "fail_code": 403}}) as s:
            with self.assertRaises(FetchError):
                client(FakeClock()).text(s.base + "/f")
            self.assertEqual(len(s.hits), 1)

    def test_cache_condicional_reusa_arquivo_e_registra_sha256(self):
        with LocalServer({"/p.pdf": {"body": b"PDF-CONTEUDO", "etag": '"v1"'}}) as s, tempfile.TemporaryDirectory() as d:
            h, dest = client(FakeClock()), Path(d) / "p.pdf"
            path, sha1, st1 = h.download(s.base + "/p.pdf", dest)
            self.assertEqual((st1, path.read_bytes()), ("novo", b"PDF-CONTEUDO"))
            _, sha2, st2 = h.download(s.base + "/p.pdf", dest)
            self.assertEqual((st2, sha2), ("cache", sha1))
            self.assertEqual(s.hits[-1][2].get("If-None-Match"), '"v1"')
            self.assertEqual(len(sha1), 64)

    def test_arquivo_alterado_na_fonte_e_atualizado(self):
        routes = {"/p": {"body": b"um", "etag": '"v1"'}}
        with LocalServer(routes) as s, tempfile.TemporaryDirectory() as d:
            h, dest = client(FakeClock()), Path(d) / "p"
            h.download(s.base + "/p", dest)
            routes["/p"].update(body=b"dois", etag='"v2"')
            _, _, st = h.download(s.base + "/p", dest)
            self.assertEqual((st, dest.read_bytes()), ("atualizado", b"dois"))


class RemoteZipTests(unittest.TestCase):
    def make_zip(self):
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("DADOS/GRANDE.bin", b"x" * 6_000_000)
            z.writestr("DADOS/ITENS_PROVA_2099.csv", "CO_POSICAO;SG_AREA\n1;CN\n")
        return buf.getvalue()

    def test_le_um_membro_sem_baixar_o_zip_inteiro(self):
        body = self.make_zip()
        with LocalServer({"/m.zip": {"body": body}}) as s:
            z = open_zip(client(FakeClock()), s.base + "/m.zip")
            self.assertIn("DADOS/ITENS_PROVA_2099.csv", z.namelist())
            self.assertEqual(z.read("DADOS/ITENS_PROVA_2099.csv"), b"CO_POSICAO;SG_AREA\n1;CN\n")
            got = sum(int(h[2]["Range"].split("=")[1].split("-")[1]) - int(h[2]["Range"].split("=")[1].split("-")[0]) + 1
                      for h in s.hits if "Range" in h[2])
            self.assertLess(got, len(body), "leu menos bytes do que o arquivo todo")

    def test_servidor_sem_range_falha_com_mensagem_clara(self):
        with LocalServer({"/m.zip": {"body": self.make_zip(), "ranges": False}}) as s:
            with self.assertRaises(FetchError):
                open_zip(client(FakeClock()), s.base + "/m.zip")


if __name__ == "__main__":
    unittest.main()
