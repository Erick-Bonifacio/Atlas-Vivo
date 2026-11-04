"""OCR opcional: só em página sem texto nativo; baixa confiança rejeita; nunca aprova sozinho."""
import dataclasses
import re
import tempfile
import unittest
from pathlib import Path

import pymupdf

from helpers import make_exam_pdf
from atlas_ingest import ocr, stages
from atlas_ingest.build_question import build_question
from atlas_ingest.extract_pdf import ENEM, Line, split_questions
from atlas_ingest.validate import check_item

PROFILE = dataclasses.replace(ENEM, option_re=re.compile(r"^([A-E])\s+(\S.*)$"), marker_re=re.compile(r"^$"))


def scanned_pdf(path):
    """PDF só com imagem (sem camada de texto), como uma prova digitalizada."""
    src = pymupdf.open()
    p = src.new_page(width=567, height=780)
    p.insert_text((40, 90), "QUESTÃO 91", fontsize=18, fontname="hebo")
    for i, t in enumerate(["O estômago produz ácido clorídrico e pepsina", "para iniciar a digestão das proteínas no alimento."]):
        p.insert_text((40, 130 + 26 * i), t, fontsize=16, fontname="helv")
    for i, (lab, t) in enumerate(zip("ABCDE", ["fígado", "pâncreas", "estômago", "esôfago", "intestino"])):
        p.insert_text((40, 220 + 28 * i), f"{lab}  {t}", fontsize=16, fontname="helv")
    png = p.get_pixmap(dpi=200, alpha=False).tobytes("png")
    out = pymupdf.open()
    q = out.new_page(width=567, height=780)
    q.insert_image(q.rect, stream=png)
    out.save(str(path))


class OcrTests(unittest.TestCase):
    def test_pagina_com_texto_nativo_nunca_usa_ocr(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as d:
            make_exam_pdf(Path(d) / "p.pdf", [dict(n=91, stem=["Enunciado com texto nativo."], opts=list("abcde"))])
            doc = pymupdf.open(Path(d) / "p.pdf")
            self.assertFalse(ocr.needs_ocr(doc[0]))

    def test_julgamento_rejeita_baixa_confianca_e_sempre_pede_revisao(self):
        mk = lambda mean, worst: dataclasses.replace(Line(1, 0, 0, 0, 10, 10, 9, False, "x", "ocr")) if False else _line(mean, worst)
        ok, avisos = ocr.judge([mk(95, 90), mk(92, 80)])
        self.assertEqual(ok, [])
        self.assertEqual(avisos, ["ocr_sem_verificacao_independente"])
        reasons, _ = ocr.judge([mk(60, 40), mk(70, 55)])
        self.assertTrue(any(r.startswith("ocr_confianca_media_baixa") for r in reasons))
        self.assertTrue(any(r.startswith("ocr_palavra_incerta") for r in reasons))

    @unittest.skipUnless(ocr.available(), "Tesseract com idioma 'por' não está instalado")
    def test_prova_digitalizada_vira_questao_marcada_para_revisao_humana(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as d:
            scanned_pdf(Path(d) / "s.pdf")
            doc = pymupdf.open(Path(d) / "s.pdf")
            self.assertTrue(ocr.needs_ocr(doc[0]))
            qs = split_questions(doc, PROFILE)
            self.assertEqual([q.number for q in qs], [91])
            r = build_question(doc, qs[0], Path(d) / "m", PROFILE)
            self.assertTrue(r["ocr"])
            self.assertIn("ocr_sem_verificacao_independente", r["flags"])
            self.assertEqual([o["label"] for o in r["options"]], list("ABCDE"))
            self.assertIn("estômago", " ".join(o["text"] for o in r["options"]).lower())
            item = {"kind": "mc", "stem": r["stem"], "options": r["options"], "answer": 2, "flags": r["flags"], "missing_words": {}, "extra_words": {},
                    "facsimiles": [], "media_dir": "x", "ocr": r["ocr"], "ocr_reasons": r["ocr_reasons"],
                    "appearances": [{"source_url": "https://x", "number": 91, "page": 1, "pdf_sha256": "a" * 64}]}
            reasons, review = check_item(item, expected_options=5)
            self.assertEqual(reasons, r["ocr_reasons"])
            self.assertIn("ocr_sem_verificacao_independente", review)
            # só revisor humano libera
            item["review"] = review
            item["curation"] = {"visual_review": {"status": "ok", "by": "claude-assistido", "human": False}}
            self.assertEqual(stages.open_visual_review(item), ["ocr_sem_verificacao_independente"])
            item["curation"] = {"visual_review": {"status": "ok", "by": "Pessoa", "human": True}}
            self.assertEqual(stages.open_visual_review(item), [])


class GarbledAndOptionTests(unittest.TestCase):
    def page_with(self, text):
        doc = pymupdf.open()
        pg = doc.new_page()
        for i, line in enumerate(text.split(chr(10))):
            pg.insert_text((40, 60 + 14 * i), line, fontsize=10, fontname="helv")
        return doc, pg

    def test_texto_normal_nao_e_ilegivel(self):
        doc, pg = self.page_with(chr(10).join(["O estômago armazena o alimento e inicia a digestão das proteínas, com ácido e pepsina."] * 6))
        self.assertFalse(ocr.garbled(pg))
        self.assertFalse(ocr.needs_ocr(pg))

    def test_sopa_de_simbolos_e_ilegivel(self):
        doc, pg = self.page_with(chr(10).join(["]§•¶è† Ü°†ü•Ü ¢¶ê Ü êØ•îü† èê °£êí¶î Ü§3íîíÜü•ê§2 ÜóZû èê £†§ †¶ü†"] * 8))
        self.assertTrue(ocr.garbled(pg))
        self.assertTrue(ocr.needs_ocr(pg))
        self.assertFalse(ocr.needs_ocr(pg, allow_garbled=False))

    def test_artigo_no_inicio_da_frase_nao_vira_alternativa(self):
        from atlas_ingest.extract_pdf import _ocr_option_starts
        mk = lambda t, y: Line(1, 0, 30, y, 200, y + 10, 9, False, t, "ocr")
        lines = [mk("A perda da capacidade de obter a toxina é causada pela", 10), mk("A diferença de umidade.", 30), mk("B variação de luz.", 45),
                 mk("C dieta.", 60), mk("D altitude.", 75), mk("E genética.", 90)]
        starts = _ocr_option_starts(lines)
        self.assertEqual(starts, {id(l) for l in lines[1:]})
        self.assertEqual(_ocr_option_starts(lines[:3]), set(), "menos de quatro rótulos em sequência: nenhuma alternativa")


def _line(mean, worst):
    ln = Line(1, 0, 0, 0, 10, 10, 9, False, "x", "ocr")
    ln.ocr_conf = (mean, worst)
    return ln


if __name__ == "__main__":
    unittest.main()
