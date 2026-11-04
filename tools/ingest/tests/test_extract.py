"""Extração: segmentação por questão, 4 e 5 alternativas, subscritos, figuras, tabelas, caixas largas e perda de texto."""
import dataclasses
import re
import tempfile
import unittest
from pathlib import Path

import pymupdf

from helpers import make_exam_pdf
from atlas_ingest.build_question import build_question
from atlas_ingest.extract_pdf import ENEM, Line, parse_options, page_lines, plain, split_questions, stem_blocks
from atlas_ingest.validate import check_item, image_blank

# O PDF sintético não tem o glifo de tabulação das provas reais: rótulo e texto vêm separados por espaço.
PROFILE = dataclasses.replace(ENEM, option_re=re.compile(r"^([A-E])\s+(\S.*)$"), marker_re=re.compile(r"^$"))
Q5 = lambda n, extra=None: dict(n=n, stem=[f"Enunciado da questão {n} sobre digestão e absorção.", "Qual alternativa está correta?"],
                                opts=[f"Opção {c} da {n}." for c in "ABCDE"], **(extra or {}))


class ExtractTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def build(self, questions, **kw):
        pdf = self.dir / "p.pdf"
        make_exam_pdf(pdf, questions, **kw)
        doc = pymupdf.open(pdf)
        qs = split_questions(doc, PROFILE)
        return doc, qs, [build_question(doc, q, self.dir / "m", PROFILE) for q in qs]

    def test_segmenta_questoes_e_le_a_area_do_rodape(self):
        doc, qs, res = self.build([Q5(91), Q5(92), Q5(93)])
        self.assertEqual([q.number for q in qs], [91, 92, 93])
        self.assertEqual({q.area for q in qs}, {"CN"})
        self.assertEqual([len(r["options"]) for r in res], [5, 5, 5])

    def test_texto_sai_como_esta_no_pdf_e_sem_palavras_perdidas(self):
        _, _, res = self.build([Q5(91)])
        r = res[0]
        self.assertEqual(r["flags"], [])
        text = " ".join(b["text"] for b in r["stem"] if b["t"] == "p")
        self.assertEqual(text, "Enunciado da questão 91 sobre digestão e absorção. Qual alternativa está correta?")
        self.assertEqual([o["text"] for o in r["options"]][:2], ["Opção A da 91.", "Opção B da 91."])

    def test_quatro_alternativas_nao_sao_completadas_com_uma_quinta(self):
        q = dict(n=1, stem=["Prova de quatro alternativas."], opts=["um", "dois", "tres", "quatro"])
        _, _, res = self.build([q])
        self.assertEqual([o["label"] for o in res[0]["options"]], list("ABCD"))
        self.assertEqual(res[0]["flags"], [])

    def test_subscrito_vira_marca_e_plain_remove(self):
        _, _, res = self.build([Q5(91, dict(sub=("Fórmula da água: H", "2")))])
        txt = " ".join(b["text"] for b in res[0]["stem"] if b["t"] == "p")
        self.assertIn("H_{2}", txt)
        self.assertEqual(plain("H_{2}O e 10^{−3}"), "H2O e 10−3")

    def test_figura_vetorial_vira_imagem_e_seu_texto_nao_entra_no_enunciado(self):
        _, _, res = self.build([Q5(91, dict(fig=True))])
        r = res[0]
        figs = [b for b in r["stem"] if b["t"] == "fig"]
        self.assertEqual(len(figs), 1)
        self.assertIn("Eixo", figs[0]["text"])
        self.assertTrue((self.dir / "m" / figs[0]["src"]).exists())
        self.assertFalse(image_blank(self.dir / "m" / figs[0]["src"]))
        self.assertFalse(any("Eixo" in b.get("text", "") for b in r["stem"] if b["t"] == "p"))
        self.assertEqual(r["flags"], [])

    def test_texto_perdido_e_detectado_pela_contagem_independente(self):
        pdf = self.dir / "p.pdf"
        make_exam_pdf(pdf, [Q5(91)])
        doc = pymupdf.open(pdf)
        rq = split_questions(doc, PROFILE)[0]
        rq.lines = [l for l in rq.lines if "Qual alternativa" not in l.text]       # simula linha perdida
        r = build_question(doc, rq, self.dir / "m", PROFILE)
        self.assertIn("palavras_nao_recuperadas", r["flags"])
        self.assertIn("Qual", r["missing_words"])
        reasons, _ = check_item({"kind": "mc", "stem": r["stem"], "options": r["options"], "answer": 0, "flags": r["flags"],
                                 "missing_words": r["missing_words"], "extra_words": r["extra_words"], "facsimiles": [],
                                 "media_dir": "x", "appearances": []})
        self.assertTrue(any(x.startswith("texto_perdido") for x in reasons))

    def test_questao_que_continua_na_outra_coluna_junta_as_faixas(self):
        many = dict(n=91, stem=[f"linha {i}" for i in range(48)], opts=list("abcde"))
        doc, qs, res = self.build([many])
        self.assertGreaterEqual(len(qs[0].extents), 1)
        self.assertEqual(res[0]["flags"], [])
        self.assertEqual(sum(1 for b in res[0]["stem"] if b["t"] == "p"), 1, "um parágrafo contínuo")

    def test_caixa_larga_leva_linhas_da_coluna_direita_para_o_fluxo_da_esquerda(self):
        doc = pymupdf.open()
        page = doc.new_page(width=567, height=780)
        page.insert_text((31, 80), "QUESTÃO 91", fontsize=9.8, fontname="hebo")
        page.insert_text((31, 100), "Linha larga que atravessa as duas colunas da página inteira do caderno de provas aqui", fontsize=9.8, fontname="helv")
        page.insert_text((400, 160), "Crédito no canto direito", fontsize=6, fontname="helv")
        page.draw_rect(pymupdf.Rect(40, 115, 520, 175), color=(0, 0, 0), fill=(0.9, 0.9, 0.9))   # figura que cruza as colunas
        page.insert_text((31, 200), "A  alfa", fontsize=9.8, fontname="helv")
        lines = page_lines(page, 1, PROFILE)
        credit = next(l for l in lines if "Crédito" in l.text)
        self.assertEqual((credit.col, credit.moved), (0, True))

    def test_furniture_do_topo_e_do_rodape_nao_entra_no_enunciado(self):
        doc = pymupdf.open()
        page = doc.new_page(width=567, height=780)
        page.insert_text((294, 30), "2015", fontsize=6.6, fontname="helv")
        page.insert_text((37, 753), "CN - 1º dia | Caderno 1 - AZUL - Página 16", fontsize=8, fontname="helv")
        page.insert_text((31, 80), "Texto útil", fontsize=9.8, fontname="helv")
        texts = [l.text for l in page_lines(page, 1, PROFILE)]
        self.assertEqual(texts, ["Texto útil"])

    def test_tabela_por_alinhamento_vira_bloco_table(self):
        mk = lambda t, x, y: Line(1, 0, x, y, x + 40, y + 10, 9.8, False, t)
        blocks = stem_blocks([mk("Texto antes.", 31, 100), mk("Teste", 41, 130), mk("Parâmetro", 140, 130.4), mk("1", 41, 145), mk("Cálcio", 140, 145.2)], PROFILE)
        self.assertEqual([b["t"] for b in blocks], ["p", "table"])
        self.assertEqual(blocks[1]["rows"], [["Teste", "Parâmetro"], ["1", "Cálcio"]])


class OptionParsingTests(unittest.TestCase):
    """Formato real das provas: 'A\\t texto' + linha-glifo do rótulo (fonte BundesbahnPi), em ordem variável."""
    def L(self, text, y, font="ArialMT"):
        return Line(1, 0, 31, y, 200, y + 10, 9.8, False, text, font)

    def test_linha_de_glifo_antes_ou_depois_do_texto(self):
        lines = [self.L("Enunciado", 100)]
        for i, c in enumerate("ABCDE"):
            if i % 2:
                lines += [self.L(f"{c}\t opção {c}", 120 + 13 * i), self.L(c, 122 + 13 * i, "BundesbahnPiStd-1")]
            else:
                lines += [self.L(c, 118 + 13 * i, "BundesbahnPiStd-1"), self.L(f"{c}\t opção {c}", 120 + 13 * i)]
        stem, opts = parse_options(lines, ENEM)
        self.assertEqual([o["label"] for o in opts], list("ABCDE"))
        self.assertEqual([o["text"] for o in opts], [f"opção {c}" for c in "ABCDE"])
        self.assertEqual(len(stem), 1)

    def test_alternativa_so_com_glifo_fica_sem_texto_para_virar_figura(self):
        lines = [self.L("Enunciado", 100)] + [self.L(c, 120 + 13 * i, "BundesbahnPiStd-1") for i, c in enumerate("ABCDE")]
        _, opts = parse_options(lines, ENEM)
        self.assertEqual([o["label"] for o in opts], list("ABCDE"))
        self.assertTrue(all(o["text"] == "" for o in opts))

    def test_alternativa_em_duas_linhas_continua_a_anterior(self):
        lines = [self.L("A\t primeira parte", 120), self.L("segue na linha de baixo", 132), self.L("B\t outra", 150)]
        _, opts = parse_options(lines, ENEM)
        self.assertEqual(opts[0]["text"], "primeira parte segue na linha de baixo")


class ValidateTests(unittest.TestCase):
    def good(self):
        return {"kind": "mc", "stem": [{"t": "p", "text": "Enunciado."}], "options": [{"label": c, "text": f"o {c}"} for c in "ABCDE"], "answer": 2,
                "flags": [], "missing_words": {}, "extra_words": {}, "facsimiles": [], "media_dir": "x",
                "appearances": [{"source_url": "https://x", "number": 1, "page": 1, "pdf_sha256": "a" * 64}]}

    def test_item_integro_passa(self):
        self.assertEqual(check_item(self.good()), ([], []))

    def test_rejeicoes(self):
        for mut, key in [(lambda i: i.update(stem=[]), "enunciado_vazio"), (lambda i: i["options"].pop(), "alternativas_inconsistentes"),
                         (lambda i: i.update(answer=None), "gabarito_ausente"), (lambda i: i.update(answer=7), "gabarito_ausente"),
                         (lambda i: i["options"][1].update(text=""), "alternativa_vazia"),
                         (lambda i: i["stem"].append({"t": "p", "text": "lixo �"}), "lixo_de_codificacao"),
                         (lambda i: i["appearances"][0].update(pdf_sha256=""), "proveniencia_incompleta")]:
            i = self.good(); mut(i)
            reasons, _ = check_item(i, expected_options=5)
            self.assertTrue(any(r.startswith(key) for r in reasons), (key, reasons))

    def test_numero_de_alternativas_vem_do_item_e_discursiva_nao_exige_alternativas(self):
        i = self.good(); i["options"] = i["options"][:4]; i["answer"] = 1
        self.assertEqual(check_item(i, expected_options=4), ([], []))
        o = {"kind": "open", "stem": [{"t": "p", "text": "Explique."}], "options": [], "flags": [], "missing_words": {}, "extra_words": {},
             "facsimiles": [], "media_dir": "x", "appearances": self.good()["appearances"]}
        self.assertEqual(check_item(o), ([], []))

    def test_figura_em_branco_e_rejeitada_e_sem_alt_vai_para_revisao(self):
        with tempfile.TemporaryDirectory() as d:
            import atlas_ingest.validate as v
            old = v.STAGING
            v.STAGING = Path(d)
            try:
                (Path(d) / "media" / "x").mkdir(parents=True)
                pix = pymupdf.Pixmap(pymupdf.csRGB, pymupdf.IRect(0, 0, 50, 50), False)
                pix.set_rect(pix.irect, (255, 255, 255))
                pix.save(str(Path(d) / "media" / "x" / "branca.png"))
                i = self.good(); i["stem"].append({"t": "fig", "src": "branca.png", "alt": None, "text": ""})
                reasons, review = check_item(i)
                self.assertTrue(any(r.startswith("figura_vazia") for r in reasons))
                self.assertIn("figura_sem_alt", review)
            finally:
                v.STAGING = old


if __name__ == "__main__":
    unittest.main()
