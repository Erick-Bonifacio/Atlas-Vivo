"""Gabaritos: leitura do PDF oficial do caderno e cruzamento com os microdados (ITENS_PROVA).

O PDF fornece a letra por número de questão do caderno exato. Os microdados fornecem, por CO_PROVA e
posição, o CO_ITEM, a letra, a habilidade e os parâmetros TRI. O CO_PROVA de cada caderno é identificado
comparando as letras das duas fontes; sem concordância suficiente, o caderno inteiro é rejeitado."""
import csv
import io
import re
from collections import defaultdict

import pymupdf

from .common import RAW, norm
from .remote_zip import open_zip

PAIR = re.compile(r"(?<![\d,.])(\d{1,3})\s+([A-E]|Anulad[oa])(?![\w])")
COLORS = {"azul": "AZUL", "amarelo": "AMARELA", "amarela": "AMARELA", "branco": "BRANCA", "branca": "BRANCA",
          "rosa": "ROSA", "cinza": "CINZA", "laranja": "LARANJA", "verde": "VERDE", "roxo": "ROXA", "roxa": "ROXA"}


def parse_key_pdf(path):
    """Devolve {número da questão: letra | 'ANULADO'} lido do PDF de gabarito do caderno."""
    doc = pymupdf.open(path)
    text = "\n".join(p.get_text() for p in doc)
    key = {}
    for num, val in PAIR.findall(text):
        n = int(num)
        val = "ANULADO" if val.lower().startswith("anulad") else val
        key.setdefault(n, val)       # números 1-5 repetem para inglês/espanhol: vale o primeiro
    return key


def itens_prova(http, year):
    """ITENS_PROVA do ano (lido do zip oficial por faixas HTTP e guardado em staging/raw/microdados)."""
    dest = RAW / "microdados" / f"ITENS_PROVA_{year}.csv"
    if not dest.exists():
        url = f"https://download.inep.gov.br/microdados/microdados_enem_{year}.zip"
        z = open_zip(http, url)
        name = next(i.filename for i in z.infolist() if re.search(r"ITENS_PROVA_\d{4}\.csv$", i.filename, re.I))
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(z.read(name))
        dest.with_name(dest.name + ".source").write_text(f"{url}\n{name}\n", encoding="utf-8")
    raw = dest.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")
    delim = ";" if text.split("\n", 1)[0].count(";") > text.split("\n", 1)[0].count(",") else ","
    rows = list(csv.DictReader(io.StringIO(text), delimiter=delim))
    for r in rows:
        r["CO_POSICAO"] = int(r["CO_POSICAO"])
    return rows


def index_by_prova(rows):
    by = defaultdict(dict)
    for r in rows:
        if r.get("IN_ITEM_ADAPTADO") in (None, "", "0"):
            by[(r["CO_PROVA"], r["SG_AREA"])][r["CO_POSICAO"]] = r
    return by


def match_booklet(by_prova, area, color, pdf_key, area_start, min_agree=0.9):
    """Identifica o CO_PROVA do caderno: entre as provas da mesma cor e área, a de maior concordância
    de letras com o PDF. A numeração de CO_POSICAO varia por ano (absoluta no caderno ou reiniciada em 1
    dentro da área, ou numeração unificada de outro dia): testa sem deslocamento e com o deslocamento que leva a menor
    posição ao primeiro número da área no caderno (`area_start`).
    Devolve (co_prova, concordância, divergências, deslocamento); co_prova None se insuficiente."""
    want = (COLORS.get(norm(color or "").split(" ")[0]) or "")[:5] if color else None
    best = (None, 0.0, [], 0)
    for (co_prova, sg_area), pos in by_prova.items():
        if sg_area != area or not pos:
            continue
        if want and next(iter(pos.values()))["TX_COR"].upper()[:5] != want:
            continue
        for offset in sorted({0, area_start - min(pos)}):
            shifted = {p + offset: r for p, r in pos.items()}
            common = [n for n in shifted if n in pdf_key]
            if len(common) < 0.8 * len(shifted):
                continue
            diffs = [n for n in common if pdf_key[n] != shifted[n]["TX_GABARITO"] and pdf_key[n] != "ANULADO"]
            agree = 1 - len(diffs) / len(common)
            if agree > best[1]:
                best = (co_prova, agree, diffs, offset)
    if best[1] < min_agree:
        return None, best[1], best[2], best[3]
    return best
