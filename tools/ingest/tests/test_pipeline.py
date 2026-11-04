"""Chaves, deduplicação, classificação, dificuldade, estágios, direitos, portão de publicação e servidor de revisão."""
import copy
import http.client
import json
import shutil
import subprocess
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

from helpers import make_key_pdf
from atlas_ingest import classify, curation, dedup, difficulty, keys as K, preview, publish, rights, stages
import atlas_ingest.common as common

ROOT = Path(__file__).resolve().parents[3]


def row(pos, letter, cor="AZUL", prova="1221", area="CN"):
    return {"CO_POSICAO": pos, "SG_AREA": area, "CO_ITEM": str(1000 + pos), "TX_GABARITO": letter, "TX_COR": cor, "CO_PROVA": prova,
            "IN_ITEM_ABAN": "0", "IN_ITEM_ADAPTADO": "0"}


LETTERS = list("ABCDE") * 9


def item(id_="enem:2099:regular:1", text="Qual órgão realiza a absorção de nutrientes no intestino delgado?", year=2099, **kw):
    it = {"id": id_, "inst": "enem", "year": year, "phase": "regular", "edition": "regular", "area": "CN", "kind": "mc", "co_item": "1",
          "skill": "5", "irt": {"a": 1.5, "b": 0.5, "c": 0.2}, "media_dir": "enem/2099/1-regular",
          "stem": [{"t": "p", "text": text}], "options": [{"label": c, "text": f"opção {c}"} for c in "ABCDE"],
          "flags": [], "missing_words": {}, "extra_words": {}, "facsimiles": [], "annulled": False, "answer_letter": "C", "answer": 2,
          "reasons": [], "review": [], "stage": "pending_science",
          "appearances": [{"booklet": 7, "color": "Azul", "co_prova": "1221", "number": 91, "page": 2, "day": 2, "pdf_url": "https://x.example/p.pdf",
                           "source_url": "https://x.example/p.pdf", "pdf_sha256": "a" * 64, "key_url": "https://x.example/g.pdf", "key_sha256": "b" * 64}]}
    it.update(kw)
    return it


EXPL = {"text": "Resolução.", "steps": ["a", "b"], "by": "claude-assistido", "human": False, "lessons": ["digestorio#4"],
        "why": ["Incorreta: a.", "Incorreta: b.", "Correta. c.", "Incorreta: d.", "Incorreta: e."]}
CLS = {"human_biology": True, "system": "digestorio", "topic": "Absorção no intestino delgado", "by": "claude-assistido", "human": False}


class KeyTests(unittest.TestCase):
    def test_le_gabarito_do_pdf_e_marca_anulada(self):
        with tempfile.TemporaryDirectory() as d:
            letters = list("ABCDE") * 2
            letters[2] = "Anulado"
            make_key_pdf(Path(d) / "g.pdf", letters)
            k = K.parse_key_pdf(Path(d) / "g.pdf")
        self.assertEqual((k[91], k[92], k[93], k[100]), ("A", "B", "ANULADO", "E"))

    def by(self, first_pos, cor="AZUL"):
        return {("1221", "CN"): {first_pos + i: row(first_pos + i, LETTERS[i], cor) for i in range(45)}}

    def test_casa_o_caderno_pelas_letras_nas_tres_numeracoes(self):
        pdf = {91 + i: LETTERS[i] for i in range(45)}
        self.assertEqual(K.match_booklet(self.by(91), "CN", "Azul", pdf, 91)[::3], ("1221", 0))          # absoluta
        self.assertEqual(K.match_booklet(self.by(1), "CN", "Azul", pdf, 91)[::3], ("1221", 90))          # reiniciada em 1
        pdf2 = {46 + i: LETTERS[i] for i in range(45)}
        self.assertEqual(K.match_booklet(self.by(91), "CN", "Azul", pdf2, 46)[::3], ("1221", -45))       # 2016: 91-135 x 46-90

    def test_divergencia_entre_pdf_e_microdados_rejeita_o_caderno(self):
        pdf = {91 + i: LETTERS[(i + 1) % 5] for i in range(45)}
        co, agree, *_ = K.match_booklet(self.by(91), "CN", "Azul", pdf, 91)
        self.assertIsNone(co)
        self.assertLess(agree, 0.9)

    def test_cor_diferente_nao_casa_e_amarelo_casa_com_amarela(self):
        pdf = {91 + i: LETTERS[i] for i in range(45)}
        self.assertIsNone(K.match_booklet(self.by(91, "ROSA"), "CN", "Azul", pdf, 91)[0])
        self.assertEqual(K.match_booklet(self.by(91, "AMARELA"), "CN", "Amarelo", pdf, 91)[0], "1221")

    def test_anulado_no_pdf_nao_conta_como_divergencia(self):
        pdf = {91 + i: LETTERS[i] for i in range(45)}
        pdf[93] = "ANULADO"
        self.assertEqual(K.match_booklet(self.by(91), "CN", "Azul", pdf, 91)[0], "1221")


class DedupClassifyDifficultyTests(unittest.TestCase):
    def test_duplicata_entre_anos_aponta_para_o_mais_antigo(self):
        a, b = item("enem:2018:regular:1", year=2018), item("enem:2022:regular:2", year=2022)
        c = item("enem:2022:regular:3", year=2022, text="Sobre fotossíntese em plantas, qual pigmento absorve luz azul e vermelha nas folhas verdes?")
        self.assertEqual(dedup.find_duplicates([a, b, c]), {"enem:2022:regular:2": "enem:2018:regular:1"})

    def test_classifica_biologia_humana_e_descarta_o_resto(self):
        h = classify.classify(item(text="A bile produzida no fígado e armazenada na vesícula atua na digestão de gorduras no intestino delgado de uma pessoa."))
        self.assertTrue(h["human_biology"])
        self.assertEqual(h["system"], "digestorio")
        for text in ("Em uma indústria, o solo recebe fertilizante e as sementes germinam; a fotossíntese ocorre nas folhas da planta.",
                     "Um carro percorre 200 km em 2 h. Qual a velocidade média do carro em km/h?"):
            self.assertFalse(classify.classify(item(text=text))["human_biology"], text)

    def test_radical_nao_conta_duas_vezes_e_semente_nao_e_semen(self):
        c = classify.classify(item(text="Os ossos do ancestral foram encontrados no solo."))
        self.assertLess(c["score"], 6)
        self.assertNotEqual(classify.classify(item(text="As sementes do fruto de uma árvore"))["system"], "reprodutor")

    def test_p_ref_cresce_quando_o_item_fica_mais_facil(self):
        easy, hard = difficulty.p_ref(1.5, -1.0, 0.2), difficulty.p_ref(1.5, 2.0, 0.2)
        self.assertGreater(easy, hard)
        self.assertGreater(hard, 0.2 - 1e-9, "nunca abaixo do acerto ao acaso c")

    def test_classificacao_nao_depende_do_acerto_ao_acaso(self):
        """Item muito difícil com c alto não pode parecer mais fácil que um de dificuldade média com c baixo."""
        hard_high_c = {"a": 1.7, "b": 2.3, "c": 0.30}
        medium_low_c = {"a": 1.7, "b": 0.5, "c": 0.10}
        self.assertGreater(difficulty.p_ref(1.7, 2.3, 0.30), difficulty.p_ref(1.7, 0.5, 0.10) - 0.6, "P mistura c")
        self.assertLess(difficulty.p_star(1.7, 2.3), difficulty.p_star(1.7, 0.5))
        cal = {"cut_low": 0.1, "cut_high": 0.5}
        self.assertEqual(difficulty.label_for(hard_high_c, cal)["diff"], "Avançada")
        self.assertEqual(difficulty.label_for(medium_low_c, cal)["diff"], "Intermediária")

    def test_calibracao_usa_tercis_e_rotula(self):
        rows = {2099: [{"SG_AREA": "CN", "CO_ITEM": str(i), "NU_PARAM_A": "1.5", "NU_PARAM_B": str(-1 + i * 0.1), "NU_PARAM_C": "0.2"} for i in range(30)]}
        old = difficulty.CAL_PATH
        with tempfile.TemporaryDirectory() as d:
            difficulty.CAL_PATH = Path(d) / "cal.json"
            try:
                cal = difficulty.calibrate(rows)
                self.assertEqual(cal["n_items"], 30)
                self.assertLess(cal["cut_low"], cal["cut_high"])
                lab = lambda b: difficulty.label_for({"a": 1.5, "b": b, "c": 0.2}, cal)["diff"]
                self.assertEqual((lab(-1.0), lab(0.5), lab(1.9)), ("Básica", "Intermediária", "Avançada"))
                self.assertEqual(difficulty.label_for({"a": 1.5, "b": 0, "c": 0.2}, cal)["diff_method"], "irt_p_ref")
                self.assertIsNone(difficulty.label_for({"a": None, "b": 1, "c": 0.2}, cal))
            finally:
                difficulty.CAL_PATH = old


class StageRightsPublishTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = Path(self.tmp.name)
        self.d = d
        for sub in ("items", "media/enem/2099/1-regular", "curation", "official", "pubimg"):
            (d / sub).mkdir(parents=True)
        self.saved = {m: getattr(m, a) for m, a in [(publish, "ITEMS"), (publish, "OFFICIAL"), (publish, "PUBLIC_IMG_Q"), (publish, "STAGING"),
                                                     (curation, "DIR"), (rights, "DECISIONS")]}
        publish.ITEMS, publish.OFFICIAL, publish.PUBLIC_IMG_Q, publish.STAGING = d / "items", d / "official", d / "pubimg", d
        curation.DIR, rights.DECISIONS = d / "curation", d / "rights.json"
        self.decisions({"status": "needs_authorization"})

    def tearDown(self):
        for (m, a), v in zip([(publish, "ITEMS"), (publish, "OFFICIAL"), (publish, "PUBLIC_IMG_Q"), (publish, "STAGING"), (curation, "DIR"), (rights, "DECISIONS")], self.saved.values()):
            setattr(m, a, v)
        self.tmp.cleanup()

    def decisions(self, over):
        d = {"id": "t", "scope": {"inst": "enem"}, "status": "needs_authorization", "covers": [], "decided_by": None, "decided_on": None, "basis": None}
        d.update(over)
        (self.d / "rights.json").write_text(json.dumps({"decisions": [d]}), encoding="utf-8")

    def put(self, it, cur=None):
        common.write_json(self.d / "items" / (it["id"].replace(":", "-") + ".json"), it)
        if cur is not None:
            common.write_json(self.d / "curation" / (it["id"].replace(":", "-") + ".json"), cur)

    def full(self, **over):
        c = {"id": "enem:2099:regular:1", "classification": CLS, "explanation": EXPL}
        c.update(over)
        return c

    def stage_of(self):
        r = publish.evaluate_all()
        return {x["item"]["id"]: x for x in r}

    def test_derivacao_dos_estagios(self):
        cases = [
            (item(reasons=["texto_perdido:x"]), None, "integrity_failed"),
            (item(text="Um carro percorre 200 km em 2 h; qual a velocidade média?"), None, "out_of_scope"),
            (item(review=["palavras_a_mais:de"]), None, "needs_visual_review"),
            (item(), None, "pending_science"),
            (item(), self.full(), "science_ok"),
            (item(), self.full(visual_review={"status": "ok", "by": "x", "human": True}), "science_ok"),
            (item(review=["palavras_a_mais:de"]), self.full(visual_review={"status": "ok", "by": "x", "human": True}), "science_ok"),
        ]
        for it, cur, want in cases:
            for f in (self.d / "items").glob("*.json"):
                f.unlink()
            self.put(it, cur)
            self.assertEqual(self.stage_of()[it["id"]]["stage"], want, (want, it["reasons"], it["review"]))

    def test_comentario_invalido_mantem_pendente(self):
        for ex in ({**EXPL, "why": EXPL["why"][:4]}, {**EXPL, "why": ["Correta. a."] + EXPL["why"][1:]}, {**EXPL, "by": ""}, {**EXPL, "text": ""}):
            self.put(item(), self.full(explanation=ex))
            self.assertEqual(self.stage_of()["enem:2099:regular:1"]["stage"], "pending_science", ex.get("by"))

    def test_figura_sem_alt_bloqueia_ate_haver_texto_alternativo(self):
        it = item(stem=[{"t": "p", "text": "Observe a figura do coração e do sangue."}, {"t": "fig", "src": "f00.png", "alt": None, "text": ""}])
        self.put(it, self.full(explanation=EXPL, classification=CLS))
        self.assertEqual(self.stage_of()[it["id"]]["stage"], "pending_science")
        self.put(it, self.full(alt={"f00.png": "Esquema do coração."}))
        self.assertEqual(self.stage_of()[it["id"]]["stage"], "science_ok")

    def test_direitos_exigem_responsavel_base_e_cobertura(self):
        self.put(item(), self.full())
        r = self.stage_of()["enem:2099:regular:1"]["rights"]
        self.assertEqual(r["status"], "needs_authorization")
        self.decisions({"status": "cleared", "covers": ["text"]})
        self.assertIn("decided_by", self.stage_of()["enem:2099:regular:1"]["rights"]["reasons"][0])
        self.decisions({"status": "cleared", "covers": ["text"], "decided_by": "Pessoa", "decided_on": "2026-01-01", "basis": "autorização X"})
        self.assertEqual(self.stage_of()["enem:2099:regular:1"]["rights"]["status"], "cleared")
        fig = item(stem=[{"t": "p", "text": "Texto."}, {"t": "source", "text": "Disponível em: x."}])
        self.put(fig, self.full())
        r = self.stage_of()["enem:2099:regular:1"]["rights"]
        self.assertEqual(r["status"], "needs_authorization")
        self.assertIn("third_party_text", r["reasons"][0], "trecho de terceiros exige cobertura própria")

    def test_publicacao_so_com_ciencia_e_direitos_e_e_idempotente_e_valida_no_node(self):
        self.put(item(), self.full())
        self.assertEqual(publish.publish()["published"], 0, "sem direitos liberados não publica")
        self.assertEqual(list((self.d / "official").glob("*.json")), [])
        self.decisions({"status": "cleared", "covers": ["text"], "decided_by": "Pessoa", "decided_on": "2026-01-01", "basis": "autorização X"})
        self.assertEqual(publish.publish()["published"], 1)
        self.assertEqual(publish.publish(), {"published": 1, "files_changed": 0}, "segunda execução não altera arquivos")
        out = json.loads((self.d / "official" / "enem-2099-regular.json").read_text(encoding="utf-8"))["questions"][0]
        self.assertEqual((out["type"], out["status"], out["ans"], out["system"], out["diff"]), ("VERIFIED_OFFICIAL", "published", 2, "digestorio", out["diff"]))
        self.assertTrue(out["expl"]["autoral"])
        self.assertEqual(out["rights"]["status"], "cleared")
        self.assertNotIn("facsimiles", out)
        node = shutil.which("node")
        if node:
            js = "const {loadBank}=require(process.argv[1]);const b=loadBank({dir:process.argv[2],publicDir:process.argv[3]});console.log(b.questions.length)"
            res = subprocess.run([node, "-e", js, str(ROOT / "bank.js"), str(self.d / "official"), str(ROOT / "public")], capture_output=True, text=True)
            self.assertEqual((res.returncode, res.stdout.strip()), (0, "1"), res.stderr)
        # perdeu a liberação: sai do banco publicado
        self.decisions({"status": "needs_authorization"})
        self.assertEqual(publish.publish()["published"], 0)
        self.assertEqual(list((self.d / "official").glob("*.json")), [])

    def test_comentario_e_opcional_mas_se_existir_precisa_estar_completo(self):
        sem = {"id": "enem:2099:regular:1", "classification": CLS}
        self.put(item(), sem)
        self.assertEqual(self.stage_of()["enem:2099:regular:1"]["stage"], "science_ok", "sem comentário, ciência completa")
        self.decisions({"status": "cleared", "covers": ["text"], "decided_by": "Pessoa", "decided_on": "2026-01-01", "basis": "autorização X"})
        self.assertEqual(publish.publish()["published"], 1)
        out = json.loads((self.d / "official" / "enem-2099-regular.json").read_text(encoding="utf-8"))["questions"][0]
        self.assertNotIn("expl", out)
        self.assertNotIn("explanation_by", out["science"])
        node = shutil.which("node")
        if node:
            js = "const {loadBank}=require(process.argv[1]);const b=loadBank({dir:process.argv[2],publicDir:process.argv[3]});console.log(b.questions.length)"
            res = subprocess.run([node, "-e", js, str(ROOT / "bank.js"), str(self.d / "official"), str(ROOT / "public")], capture_output=True, text=True)
            self.assertEqual((res.returncode, res.stdout.strip()), (0, "1"), res.stderr)
        self.put(item(), {**sem, "explanation": {**EXPL, "why": EXPL["why"][:4]}})
        self.assertEqual(self.stage_of()["enem:2099:regular:1"]["stage"], "pending_science", "comentário incompleto continua barrando")

    def test_previa_restrita_exclui_o_que_exige_conferencia_e_nunca_vira_publicado(self):
        simples = item("enem:2099:regular:1")
        com_fig = item("enem:2099:regular:2", stem=[{"t": "p", "text": "Observe o coração e o sangue."}, {"t": "fig", "src": "f00.png", "alt": None, "text": ""}])
        com_tab = item("enem:2099:regular:3", stem=[{"t": "p", "text": "Tabela do coração e do sangue."}, {"t": "table", "rows": [["a", "b"]]}])
        revisao = item("enem:2099:regular:4", review=["palavras_a_mais:de"])
        for it in (simples, com_fig, com_tab, revisao):
            self.put(it, {"id": it["id"], "classification": CLS})
        old = preview.STAGING
        preview.STAGING = self.d
        try:
            res = preview.export()
        finally:
            preview.STAGING = old
        self.assertEqual(res["preview_items"], 1)
        self.assertEqual(res["held_for_visual_review"], {"figura_no_enunciado": 1, "tabela_no_enunciado": 1})
        data = json.loads((self.d / "preview" / "preview.json").read_text(encoding="utf-8"))
        q = data["questions"][0]
        self.assertEqual((q["id"], q["status"], q["rights"]["status"]), ("enem:2099:regular:1", "preview", "needs_authorization"))
        self.assertNotIn("expl", q, "a prévia não exporta comentário")
        self.assertEqual(list((self.d / "official").glob("*.json")), [], "a prévia não escreve em questions/official")
        # item com figura entra só depois de comparado com o PDF (curation/preview_checks.json); "defeito" continua retido
        checks = self.d / "checks.json"
        old_checks = preview.CHECKS
        preview.CHECKS = checks
        preview.STAGING = self.d
        try:
            checks.write_text(json.dumps({"checks": {"enem:2099:regular:2": {"result": "ok", "by": "claude-assistido", "human": False},
                                                     "enem:2099:regular:3": {"result": "defeito"}}}), encoding="utf-8")
            res2 = preview.export()
        finally:
            preview.CHECKS, preview.STAGING = old_checks, old
        self.assertEqual((res2["preview_items"], res2["with_figure_or_table_checked"], res2["held_for_visual_review"]), (2, 1, {"tabela_no_enunciado": 1}))
        node = shutil.which("node")
        if node:
            js = ("const {problems,loadBank}=require(process.argv[1]);const q=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8')).questions[0];"
                  "console.log(JSON.stringify([problems(q,{preview:true}),problems(q).length>0]))")
            res = subprocess.run([node, "-e", js, str(ROOT / "bank.js"), str(self.d / "preview" / "preview.json")], capture_output=True, text=True)
            self.assertEqual((res.returncode, res.stdout.strip()), (0, "[[],true]"), res.stderr)

    def test_item_duplicado_nao_e_publicado(self):
        self.decisions({"status": "cleared", "covers": ["text"], "decided_by": "P", "decided_on": "2026-01-01", "basis": "b"})
        a, b = item("enem:2099:regular:1", year=2098), item("enem:2099:regular:2", year=2099)
        self.put(a, self.full(id=a["id"]))
        self.put(b, self.full(id=b["id"]))
        r = self.stage_of()
        self.assertEqual([r[a["id"]]["stage"], r[b["id"]]["stage"]], ["science_ok", "duplicate"])
        self.assertEqual(publish.publish()["published"], 1)


class ReviewServerIsolationTests(unittest.TestCase):
    def setUp(self):
        import review_server as rs
        self.rs = rs
        self.tmp = tempfile.TemporaryDirectory()
        d = Path(self.tmp.name)
        (d / "media" / "enem" / "x").mkdir(parents=True)
        (d / "media" / "enem" / "x" / "f.png").write_bytes(b"\x89PNG-fake")
        (d / "segredo.txt").write_text("nao sair", encoding="utf-8")
        self.saved = (rs.MEDIA, rs.curation.DIR, rs.CACHE["records"], rs.publish.evaluate_all)
        rs.MEDIA, rs.curation.DIR = (d / "media").resolve(), d / "curation"
        it = item()
        it["curation"] = {}
        rs.CACHE["records"] = [{"item": it, "stage": "pending_science", "class": {"human_biology": True, "system": "digestorio", "topic": None},
                               "rights": {"status": "needs_authorization"}, "pending": ["comentario_ausente"], "diff": None, "machine_class": {}}]
        rs.publish.evaluate_all = lambda: rs.CACHE["records"]      # sem ler os milhares de itens reais de staging
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), rs.Handler)
        self.t = threading.Thread(target=self.srv.serve_forever, daemon=True)
        self.t.start()
        self.port = self.srv.server_address[1]
        self.d = d

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.rs.MEDIA, self.rs.curation.DIR, self.rs.CACHE["records"], self.rs.publish.evaluate_all = self.saved
        self.tmp.cleanup()

    def req(self, method, path, body=None, headers=None):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        h = {"Host": f"127.0.0.1:{self.port}", **(headers or {})}
        c.request(method, path, body=json.dumps(body) if body is not None else None, headers=h)
        r = c.getresponse()
        data = r.read()
        c.close()
        return r.status, data

    def test_escuta_so_em_loopback(self):
        self.assertEqual(self.srv.server_address[0], "127.0.0.1")

    def test_host_estrangeiro_e_recusado_dns_rebinding(self):
        for host in ("evil.example.com", "evil.example.com:80", "192.168.0.10:8790"):
            self.assertEqual(self.req("GET", "/api/items", headers={"Host": host})[0], 403, host)
        self.assertEqual(self.req("GET", "/api/items")[0], 200)

    def test_nao_ha_cors_e_ha_csp(self):
        c = http.client.HTTPConnection("127.0.0.1", self.port)
        c.request("GET", "/api/items", headers={"Origin": "https://evil.example"})
        r = c.getresponse(); r.read()
        self.assertIsNone(r.getheader("Access-Control-Allow-Origin"))
        self.assertIn("default-src 'self'", r.getheader("Content-Security-Policy"))

    def test_midia_so_de_staging_media_sem_travessia(self):
        self.assertEqual(self.req("GET", "/media/enem/x/f.png")[0], 200)
        for p in ("/media/../segredo.txt", "/media/..%2Fsegredo.txt", "/media/enem/x/../../../segredo.txt", "/media/enem/x/f.txt"):
            self.assertEqual(self.req("GET", p)[0], 404, p)

    def test_escrita_exige_cabecalho_origem_valida_e_nome_do_revisor(self):
        url = "/api/curation/" + "enem:2099:regular:1"
        body = {"reviewer": "Rev", "visual_review": {"status": "ok"}}
        self.assertEqual(self.req("POST", url, body)[0], 403, "sem X-Atlas-Review")
        self.assertEqual(self.req("POST", url, body, {"X-Atlas-Review": "1", "Origin": "https://evil.example"})[0], 403)
        self.assertEqual(self.req("POST", url, {"visual_review": {"status": "ok"}}, {"X-Atlas-Review": "1"})[0], 400)
        self.assertEqual(self.req("POST", "/api/curation/inexistente", body, {"X-Atlas-Review": "1"})[0], 404)
        self.assertEqual(self.req("POST", url, body, {"X-Atlas-Review": "1"})[0], 200)
        cur = json.loads((self.d / "curation" / "enem-2099-regular-1.json").read_text(encoding="utf-8"))
        self.assertEqual(cur["visual_review"], {"status": "ok", "by": "Rev", "human": True, "notes": ""})

    def test_campos_nao_permitidos_sao_ignorados(self):
        url = "/api/curation/enem:2099:regular:1"
        self.req("POST", url, {"reviewer": "Rev", "explanation": {"text": "x"}, "rights": {"status": "cleared"}, "alt": {"../x.png": "t", "f00.png": "Esquema."}}, {"X-Atlas-Review": "1"})
        cur = json.loads((self.d / "curation" / "enem-2099-regular-1.json").read_text(encoding="utf-8"))
        self.assertNotIn("explanation", cur)
        self.assertNotIn("rights", cur)
        self.assertEqual(cur["alt"], {"f00.png": "Esquema."})


if __name__ == "__main__":
    unittest.main()
