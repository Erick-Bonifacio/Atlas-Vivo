"""OCR opcional para páginas sem camada de texto (provas digitalizadas).

Regras de segurança:
- só é usado quando a página não tem texto nativo útil (`needs_ocr`); páginas com texto nativo nunca passam por OCR;
- cada palavra vem com a confiança do Tesseract; confiança média abaixo de MIN_PAGE_CONF ou qualquer palavra
  abaixo de MIN_WORD_CONF rejeita a questão (nunca se "adivinha" o que não foi lido);
- como não existe uma segunda leitura independente do texto, todo item vindo de OCR é marcado
  `ocr_sem_verificacao_independente` e vai para revisão visual humana obrigatória: o OCR nunca aprova sozinho.

O executável e os dados de idioma são procurados em ATLAS_TESSERACT / ATLAS_TESSDATA, no PATH e nos locais
de instalação comuns do Windows."""
import csv
import io
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import pymupdf

MIN_WORD_CONF = 50
MIN_PAGE_CONF = 80
DPI = 300


def tesseract_path():
    cands = [os.environ.get("ATLAS_TESSERACT"), shutil.which("tesseract"), r"C:\Program Files\Tesseract-OCR\tesseract.exe"]
    return next((c for c in cands if c and Path(c).exists()), None)


def tessdata_dir(lang="por"):
    cands = [os.environ.get("ATLAS_TESSDATA"), os.environ.get("TESSDATA_PREFIX"), r"D:\atlas-tools\tessdata",
             r"C:\Program Files\Tesseract-OCR\tessdata"]
    return next((c for c in cands if c and (Path(c) / f"{lang}.traineddata").exists()), None)


def available(lang="por"):
    return bool(tesseract_path() and tessdata_dir(lang))


_OK_CHARS = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \n\t.,;:!?()[]{}'\"%/+-–—−=<>°ºª$&*@#_×·≈≠≤≥±→←↔√∞µ"
                "áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ“”‘’…•")


def garbled(page):
    """True se a camada de texto existe mas é pouco confiável: fonte sem mapa Unicode produz símbolos e
    caracteres de controle no lugar das letras. Critério: mais de 6% dos caracteres fora do alfabeto esperado."""
    t = page.get_text()
    letters = [c for c in t if not c.isspace()]
    if len(letters) < 80:
        return False
    odd = sum(1 for c in letters if c not in _OK_CHARS and not c.isalpha())
    return odd / len(letters) > 0.06


def needs_ocr(page, allow_garbled=True):
    """True para página digitalizada (sem texto nativo útil, mas com imagem ou desenho) ou, se permitido,
    com camada de texto ilegível."""
    if len(page.get_text().strip()) < 40:
        return bool(page.get_images() or page.get_drawings())
    return allow_garbled and garbled(page)


def ocr_words(page, lang="por", dpi=DPI):
    """Palavras reconhecidas na página: (texto, confiança, bbox em pontos da página, nº do bloco, nº da linha)."""
    if not available(lang):
        raise RuntimeError("Tesseract e/ou o idioma 'por' não estão disponíveis (ATLAS_TESSERACT, ATLAS_TESSDATA)")
    with tempfile.TemporaryDirectory() as d:
        img = Path(d) / "p.png"
        page.get_pixmap(dpi=dpi, alpha=False).save(str(img))
        out = subprocess.run([tesseract_path(), str(img), "stdout", "-l", lang, "--tessdata-dir", tessdata_dir(lang), "--psm", "3", "-c", "tessedit_create_tsv=1"],
                             capture_output=True, text=True, encoding="utf-8", check=True).stdout
    k = 72.0 / dpi
    words = []
    for r in csv.DictReader(io.StringIO(out), delimiter="\t", quoting=csv.QUOTE_NONE):
        txt = (r.get("text") or "").strip()
        if r.get("level") != "5" or not txt:
            continue
        x, y, w, h = (int(r[c]) for c in ("left", "top", "width", "height"))
        words.append((txt, float(r["conf"]), (x * k, y * k, (x + w) * k, (y + h) * k), int(r["block_num"]), int(r["line_num"]), int(r["par_num"])))
    return words


def ocr_lines(page, number, profile):
    """Linhas de OCR como objetos Line (fonte 'ocr'), com a confiança mínima e a média da linha."""
    from .extract_pdf import Line   # import tardio: evita ciclo

    by = {}
    for txt, conf, bbox, blk, ln, par in ocr_words(page):
        by.setdefault((blk, par, ln), []).append((txt, conf, bbox))
    mid = page.rect.width / 2
    lines = []
    for ws in by.values():
        ws.sort(key=lambda w: w[2][0])
        x0, y0 = min(w[2][0] for w in ws), min(w[2][1] for w in ws)
        x1, y1 = max(w[2][2] for w in ws), max(w[2][3] for w in ws)
        ln = Line(number, 0 if x0 < mid - 10 else 1, x0, y0, x1, y1, (y1 - y0) * 0.8, False, " ".join(w[0] for w in ws), "ocr")
        ln.ocr_conf = (sum(w[1] for w in ws) / len(ws), min(w[1] for w in ws))
        lines.append(ln)
    lines.sort(key=lambda l: (l.col, round(l.y0), l.x0))
    return lines


def judge(lines):
    """(motivos de rejeição, avisos) para as linhas de OCR de uma questão."""
    if not lines:
        return [], []
    mean = sum(l.ocr_conf[0] for l in lines) / len(lines)
    worst = min(l.ocr_conf[1] for l in lines)
    reasons = []
    if mean < MIN_PAGE_CONF:
        reasons.append(f"ocr_confianca_media_baixa:{mean:.0f}")
    if worst < MIN_WORD_CONF:
        reasons.append(f"ocr_palavra_incerta:{worst:.0f}")
    return reasons, ["ocr_sem_verificacao_independente"]
