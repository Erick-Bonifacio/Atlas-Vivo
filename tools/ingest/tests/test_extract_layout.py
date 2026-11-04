"""Layout da extração, nos casos que a conferência contra os PDFs reais reprovou: texto justificado partido em palavras
(falsa tabela), tabela de verdade, frações empilhadas, legenda com símbolo desenhado, hachura que atravessa o
parágrafo, escala de cores, símbolo vetorial no meio do texto e molduras claras das alternativas."""
import dataclasses
import re
import tempfile
import unittest
from pathlib import Path

import pymupdf

from helpers import make_key_pdf  # noqa: F401  (ajusta o sys.path para atlas_ingest)

from atlas_ingest.build_question import build_question
from atlas_ingest.extract_pdf import ENEM, FRAC, split_questions

PROFILE = dataclasses.replace(ENEM, option_re=re.compile(r"^([A-E])\s+(\S.*)$"), marker_re=re.compile(r"^$"))
F = "helv"


def make_doc(path, draw, options=("um", "dois", "três", "quatro", "cinco")):
    doc = pymupdf.open()
    page = doc.new_page(width=567, height=780)
    page.insert_text((31, 740), "CN - 2º DIA - CADERNO 7 - AZUL", fontsize=7, fontname=F)
    page.insert_text((31, 70), "QUESTÃO 91", fontsize=9.8, fontname="hebo")
    y = draw(page, 90)
    for i, t in enumerate(options):
        page.insert_text((31, y), f"{'ABCDE'[i]}\t {t}", fontsize=9.8, fontname=F)
        y += 13
    doc.save(str(path))
    doc.close()


def para(page, y, lines):
    for ln in lines:
        page.insert_text((31, y), ln, fontsize=9.8, fontname=F)
        y += 12
    return y


class LayoutTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def build(self, draw, **kw):
        pdf = self.dir / "p.pdf"
        make_doc(pdf, draw, **kw)
        doc = pymupdf.open(pdf)
        qs = split_questions(doc, PROFILE)
        self.assertEqual([q.number for q in qs], [91])
        return build_question(doc, qs[0], self.dir / "m", PROFILE)

    @staticmethod
    def text(res):
        return " ".join(b["text"] for b in res["stem"] if b["t"] in ("p", "source"))

    def test_linha_partida_em_palavras_nao_vira_tabela(self):
        def draw(page, y):
            for x, w in ((31, "A"), (50, "poluição"), (110, "radioativa"), (175, "compreende"), (245, "mais")):
                page.insert_text((x, y), w, fontsize=9.8, fontname=F)       # texto justificado: o PDF entrega palavras soltas
            return para(page, y + 12, ["de 200 nuclídeos e outros elementos."]) + 6
        r = self.build(draw)
        self.assertFalse([b for b in r["stem"] if b["t"] == "table"], "uma linha só não é tabela")
        self.assertEqual(self.text(r), "A poluição radioativa compreende mais de 200 nuclídeos e outros elementos.")
        self.assertEqual(r["flags"], [])

    def test_tabela_de_verdade_continua_tabela(self):
        def draw(page, y):
            for i, (a, b) in enumerate((("Enzima", "pH ótimo"), ("Amilase", "6,8"), ("Pepsina", "2,0"))):
                page.insert_text((31, y + 13 * i), a, fontsize=9.8, fontname=F)
                page.insert_text((150, y + 13 * i), b, fontsize=9.8, fontname=F)
            return y + 13 * 3 + 6
        r = self.build(draw)
        tabs = [b for b in r["stem"] if b["t"] == "table"]
        self.assertEqual(len(tabs), 1)
        self.assertEqual(tabs[0]["rows"], [["Enzima", "pH ótimo"], ["Amilase", "6,8"], ["Pepsina", "2,0"]])

    def test_fracao_empilhada_com_barra_vira_n_barra_d_e_a_cobertura_nao_acusa(self):
        def draw(page, y):
            y = para(page, y, ["Qual é a probabilidade pedida?"])
            page.insert_text((60, y + 8), "1", fontsize=9.8, fontname=F)
            page.draw_rect(pymupdf.Rect(57, y + 11, 68, y + 11.8), color=None, fill=(0, 0, 0))
            page.insert_text((60, y + 22), "4", fontsize=9.8, fontname=F)
            return y + 30
        r = self.build(draw)
        self.assertIn("1" + FRAC + "4", self.text(r))
        self.assertEqual((r["flags"], r["missing_words"], r["extra_words"]), ([], {}, {}))

    def test_fracao_na_alternativa_numerador_no_fim_da_linha_e_denominador_no_comeco_da_seguinte(self):
        def draw(page, y):
            return para(page, y, ["Qual é a fração?"]) + 6
        pdf = self.dir / "p.pdf"
        make_doc(pdf, draw, options=("um", "dois", "três", "quatro", "cinco"))
        doc = pymupdf.open(pdf)
        page = doc[0]
        # reescreve a alternativa A como "A  1 / 4 (25%)" empilhada
        words = page.get_text("words")
        a = [w for w in words if w[4] == "A"][0]
        page.add_redact_annot(pymupdf.Rect(0, a[1] - 2, 300, a[3] + 12))
        page.apply_redactions()
        y = a[3]
        page.insert_text((31, y), "A\t 1", fontsize=9.8, fontname=F)
        x1 = 31 + pymupdf.get_text_length("A\t 1", fontname=F, fontsize=9.8)
        page.draw_rect(pymupdf.Rect(x1 - 5.5, y + 2.5, x1, y + 3.2), color=None, fill=(0, 0, 0))
        page.insert_text((x1 - 5.5, y + 12), "4 (25%)", fontsize=9.8, fontname=F)
        doc.save(str(self.dir / "q.pdf"))
        doc = pymupdf.open(self.dir / "q.pdf")
        qs = split_questions(doc, PROFILE)
        r = build_question(doc, qs[0], self.dir / "m2", PROFILE)
        self.assertTrue(r["options"][0]["text"].startswith("1" + FRAC + "4"), r["options"][0]["text"])

    def test_legenda_com_simbolo_desenhado_fica_dentro_da_figura(self):
        def draw(page, y):
            y = para(page, y, ["Observe o gráfico e a legenda."])
            page.draw_rect(pymupdf.Rect(36, y + 4, 180, y + 84), color=(0, 0, 0), fill=(0.8, 0.9, 1))
            for i, label in enumerate(("Animal macho", "Animal fêmea")):
                page.draw_rect(pymupdf.Rect(200, y + 12 + 16 * i, 208, y + 20 + 16 * i), color=(0, 0, 0), fill=(0, 0, 0))
                page.insert_text((214, y + 19 + 16 * i), label, fontsize=8.5, fontname=F)
            return y + 100
        r = self.build(draw)
        figs = [b for b in r["stem"] if b["t"] == "fig"]
        self.assertEqual(len(figs), 1)
        self.assertGreater(figs[0]["bbox"][2], 214, "o recorte inclui o símbolo e o rótulo da legenda")
        self.assertIn("Animal macho", figs[0]["text"])
        self.assertNotIn("Animal", self.text(r), "o rótulo da legenda não vira parágrafo solto")

    def test_hachura_que_atravessa_o_paragrafo_nao_engole_o_texto(self):
        def draw(page, y):
            y0 = y
            y = para(page, y, ["Um pesquisador mediu a quantidade de gordura nas fezes dos pacientes.",
                               "Mantendo a mesma dieta, fez as medidas antes e depois do medicamento."])
            for x in (60, 90, 120):                                     # máscara do PDF: traço vertical longo, fino
                page.draw_line((x, y0 - 8), (x, y + 80), color=(0.6, 0.6, 0.6), width=0.5)
            page.draw_rect(pymupdf.Rect(50, y + 40, 62, y + 80), color=None, fill=(0.3, 0.3, 0.3))
            page.draw_rect(pymupdf.Rect(80, y + 20, 92, y + 80), color=None, fill=(0.3, 0.3, 0.3))
            page.draw_rect(pymupdf.Rect(110, y + 30, 122, y + 80), color=None, fill=(0.3, 0.3, 0.3))
            return y + 96
        r = self.build(draw)
        self.assertIn("Um pesquisador mediu a quantidade de gordura nas fezes dos pacientes.", self.text(r))
        self.assertIn("medidas antes e depois do medicamento.", self.text(r))

    def test_escala_de_cores_baixa_e_larga_e_figura(self):
        def draw(page, y):
            y = para(page, y, ["Compare a cor com a escala indicadora de pH abaixo."])
            for i in range(6):
                page.draw_rect(pymupdf.Rect(60 + 40 * i, y + 4, 100 + 40 * i, y + 22), color=(0, 0, 0), fill=(0.9, 0.7 - 0.1 * i, 0.8))
                page.insert_text((70 + 40 * i, y + 16), "Cor" + str(i), fontsize=8, fontname=F)
            return y + 40
        r = self.build(draw)
        figs = [b for b in r["stem"] if b["t"] == "fig"]
        self.assertEqual(len(figs), 1)
        self.assertNotIn("Cor0", self.text(r))

    def test_bloco_decorativo_sozinho_nao_e_figura(self):
        def draw(page, y):
            page.draw_rect(pymupdf.Rect(2, 60, 24, 140), color=None, fill=(0.3, 0.3, 0.3))      # aba lateral da diagramação
            return para(page, y, ["Qual órgão absorve a maior parte dos nutrientes?"]) + 6
        r = self.build(draw)
        self.assertFalse([b for b in r["stem"] if b["t"] == "fig"])

    def test_rotulos_de_eixo_e_titulo_girado_entram_na_figura(self):
        def draw(page, y):
            y = para(page, y, ["O gráfico mostra a concentração do hormônio."])
            page.draw_rect(pymupdf.Rect(90, y + 4, 230, y + 90), color=(0, 0, 0), fill=(0.9, 0.9, 0.9))
            for i, n in enumerate(("0", "1", "2", "3")):                                          # números do eixo, fora do retângulo
                page.insert_text((80, y + 90 - 26 * i), n, fontsize=9, fontname=F)
            page.insert_text((52, y + 80), "Concentração (ng)", fontsize=9, fontname=F, rotate=90)  # título girado do eixo y
            return y + 110
        r = self.build(draw)
        figs = [b for b in r["stem"] if b["t"] == "fig"]
        self.assertEqual(len(figs), 1)
        self.assertLess(figs[0]["bbox"][0], 60, "o recorte vai até o título girado")
        self.assertNotIn("Concentração (ng)", self.text(r))
        self.assertEqual((r["flags"], r["missing_words"]), ([], {}))

    def test_simbolo_vetorial_entre_dois_trechos_pede_revisao(self):
        def draw(page, y):
            y = para(page, y, ["A reação ocorre assim:"])
            page.insert_text((31, y), "Hb + O2", fontsize=9.8, fontname=F)
            page.insert_text((140, y), "HbO2", fontsize=9.8, fontname=F)
            page.draw_polyline([(88, y - 3), (128, y - 3)], color=(0, 0, 0), width=1)          # linha da seta
            page.draw_polyline([(120, y - 7), (128, y - 3), (120, y + 1)], color=(0, 0, 0), fill=(0, 0, 0), closePath=True)   # ponta
            return y + 20
        r = self.build(draw)
        self.assertIn("simbolo_vetorial_no_texto", r["flags"])

    def test_moldura_clara_da_letra_da_alternativa_nao_e_simbolo(self):
        def draw(page, y):
            y = para(page, y, ["Qual órgão absorve nutrientes?"]) + 6
            for i in range(5):                                           # círculo cinza claro que o ENEM desenha em volta da letra
                page.draw_circle((35, y + 13 * i - 3), 4.4, color=(0.86, 0.87, 0.87))
            return y
        r = self.build(draw)
        self.assertNotIn("simbolo_vetorial_no_texto", r["flags"])


if __name__ == "__main__":
    unittest.main()
