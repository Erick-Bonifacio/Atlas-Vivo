"""Extração da 1ª fase da UNICAMP (Conhecimentos Gerais) a partir do caderno e do gabarito oficiais da Comvest.

Mesmo formato dos itens do ENEM e da FUVEST. Layout: uma coluna, "QUESTÃO n", 4 alternativas "a) ... d)". Só entra questão
em texto puro; figura, tabela, texto depois da alternativa d e gabarito ausente são descartados e contados.

O gabarito oficial traz uma coluna (ou página) por caderno. Qual coluna é a do caderno baixado não está escrito no PDF:
COLUMNS registra a coluna por ano, decidida conferindo o conteúdo de questões de resposta conhecida (ver docs/pipeline.md)."""
import re

import pymupdf

from .common import ITEMS, RAW, STAGING, sha256_file, write_json
from .vest_fuvest import clean, has_visual, line_text, visuals

BASE = "https://www.comvest.unicamp.br/"
# ano -> (caderno baixado, url do caderno, url do gabarito, n.º de questões)
EXAMS = {
    2011: ("QZ", "vest2011/F1/f12011QZ.pdf", "vest2011/F1/gabarito2011.pdf", 48),
    2012: ("QZ", "vest2012/F1/f12012QZ.pdf", "vest2012/F1/gabarito2012.pdf", 48),
    2013: ("QZ", "vest2013/F1/f12013QZ.pdf", "vest2013/F1/gabarito2013.pdf", 48),
    2014: ("QX", "vest2014/F1/f12014QX.pdf", "vest2014/F1/gabarito2014.pdf", 48),
    2015: ("QW", "vest2015/F1/f12015QW.pdf", "vest2015/F1/gabarito2015.pdf", 90),
    2017: ("QY", "wp-content/uploads/2017/02/f12017QY.pdf", "wp-content/uploads/2017/02/gabarito2017.pdf", 90),
}
COLUMNS = {2011: 0, 2012: 0, 2014: 0, 2015: 0, 2017: 0}   # ano -> coluna/página do gabarito (0-based), conferida pelo conteúdo
# (ano, questão) -> [(página 1-based, (x0, y0, x1, y1))]: figura recortada à mão; o texto dentro do retângulo sai do enunciado.
FIGURES = {
    (2011, 8): [(6, (50, 345, 562, 490))],
    (2017, 41): [(12, (365, 373, 480, 490))],
}

QSTART = re.compile(r"^QUEST[ÃA]O\s+(\d{1,2})\s*$", re.I)
OPT = re.compile(r"^([a-d])\)\s*(.*)$")
ENDNOTE = re.compile(r"^(\(?adaptad|\(?fonte|glossário|disponível em|acessado em)", re.I)


def read_lines(doc):
    lines = []
    for pn, page in enumerate(doc):
        h = page.rect.height
        for bi, b in enumerate(page.get_text("dict")["blocks"]):
            if b["type"] != 0:
                continue
            for l in b["lines"]:
                text, mixed = line_text(l)
                if not text:
                    continue
                x0, y0, x1, y1 = l["bbox"]
                if (y0 < 55 or y0 > h - 45) and re.fullmatch(r"\d{1,2}", text):   # número da página
                    continue
                lines.append({"page": pn, "blk": (pn, bi), "bbox": (x0, y0, x1, y1), "text": text, "mixed": mixed})
    return lines


def parse_exam(doc, total):
    lines = read_lines(doc)
    vis = visuals(doc)
    starts, exp = [], 1
    for i, l in enumerate(lines):
        m = QSTART.match(l["text"])
        if m and int(m.group(1)) == exp:
            starts.append((exp, i))
            exp += 1
            if exp > total:
                break
    out = {}
    for k, (n, i) in enumerate(starts):
        end = starts[k + 1][1] if k + 1 < len(starts) else len(lines)
        out[n] = {"number": n, "lines": lines[i + 1:end], "num_line": lines[i]}
    return out, vis


def build(q, vis, figs=None):
    seg = q["lines"]
    idx = [k for k, l in enumerate(seg) if OPT.match(l["text"])]
    labels = [OPT.match(seg[k]["text"]).group(1) for k in idx]
    if labels != list("abcd"):
        return None, "alternativas_fora_de_a_d"
    stem_lines = seg[:idx[0]]
    if not stem_lines:
        return None, "sem_enunciado"
    if figs:
        placed, kept = set(), []
        for l in stem_lines:
            hit = next((k for k, (pg, r) in enumerate(figs)
                        if l["page"] == pg - 1 and r[0] <= (l["bbox"][0] + l["bbox"][2]) / 2 <= r[2] and r[1] <= (l["bbox"][1] + l["bbox"][3]) / 2 <= r[3]), None)
            if hit is not None:
                if hit not in placed:
                    placed.add(hit)
                    kept.append({"fig": hit, "blk": ("fig", hit), "page": l["page"], "bbox": l["bbox"], "text": "", "mixed": False})
                continue
            kept.append(l)
        for k, (pg, r) in enumerate(figs):
            if k not in placed:
                at = next((i for i, l in enumerate(kept) if l["page"] == pg - 1 and l["bbox"][1] >= r[3]), len(kept))
                kept.insert(at, {"fig": k, "blk": ("fig", k), "page": pg - 1, "bbox": (r[0], r[1], r[2], r[3]), "text": "", "mixed": False})
        stem_lines = kept
    opts = []
    for j, k in enumerate(idx):
        end = idx[j + 1] if j + 1 < len(idx) else len(seg)
        part = seg[k:end]
        text = OPT.match(part[0]["text"]).group(2)
        last = part[0]
        for l in part[1:]:
            if j + 1 == len(idx):
                gap = l["bbox"][1] - last["bbox"][3]
                if ENDNOTE.match(l["text"]) or (l["page"] == last["page"] and not -3 <= gap <= 4 and l["blk"] != last["blk"]):
                    return None, "texto_depois_da_alternativa_d"
                if l["page"] != last["page"] and ENDNOTE.match(l["text"]):
                    return None, "texto_depois_da_alternativa_d"
            text += " " + l["text"]
            last = l
        opts.append({"label": labels[j].upper(), "text": clean(text)})

    blocks, cur, blk = [], [], None
    groups = []
    for l in stem_lines:
        if l["blk"] != blk and cur:
            groups.append(cur)
            cur = []
        cur.append(l)
        blk = l["blk"]
    if cur:
        groups.append(cur)
    for par in groups:
        if "fig" in par[0]:
            blocks.append({"t": "fig", "src": f"f{par[0]['fig']:02d}.png", "alt": ""})
            continue
        txt = ""
        for l in par:
            if txt.endswith("-") and l["text"][:1].islower():
                return None, "hifenizacao_ambigua"
            txt = (txt + " " + l["text"]).strip()
        txt = clean(txt)
        if not txt:
            continue
        src = re.match(r"^\((adaptad|fonte|disponível|extra[ií]do|texto)", txt, re.I) or re.match(r"^(glossário|acessado em)", txt, re.I)
        blocks.append({"t": "source" if src and len(txt) < 330 else "p", "text": txt})
    if not blocks:
        return None, "sem_enunciado"
    spans = {}
    for l in [q["num_line"]] + seg:
        col = 0 if (l["bbox"][0] + l["bbox"][2]) / 2 < 297 else 1
        d = spans.setdefault(l["page"], {})
        lo, hi = d.get(col, (l["bbox"][1], l["bbox"][3]))
        d[col] = (min(lo, l["bbox"][1]), max(hi, l["bbox"][3]))
    if not figs and has_visual(spans, vis):
        return None, "figura_ou_tabela"
    text_all = " ".join(b.get("text", "") for b in blocks) + " " + " ".join(o["text"] for o in opts)
    if re.search(r"[�\u0000-\u0008஀-௿\U0001d400-\U0001d7ff]|\(cid:", text_all):
        return None, "lixo_de_codificacao"
    if any(not o["text"] for o in opts):
        return None, "alternativa_vazia"
    return {"stem": blocks, "options": opts, "page": q["num_line"]["page"] + 1}, None


def key_columns(doc, total):
    """Gabarito: {coluna: {questão: letra}}. Dois formatos: matriz com 4 letras por número (2011-2014) e uma página por caderno (2015+)."""
    ncols = 4
    if len(doc) >= 4 and sum(len(p.get_text("text")) for p in doc) > 500 and len(doc) == 4:
        cols = {}
        for c, page in enumerate(doc):
            toks = page.get_text("text").split()
            for i in range(0, len(toks) - 1, 2):
                if toks[i].isdigit() and toks[i + 1] in ("A", "B", "C", "D"):
                    cols.setdefault(c, {})[int(toks[i])] = toks[i + 1]
        return cols
    toks = "\n".join(p.get_text("text") for p in doc).split()
    seen, cols = {}, {c: {} for c in range(ncols)}
    for i in range(len(toks) - 1):
        if toks[i].isdigit() and toks[i + 1] in ("A", "B", "C", "D"):
            n = int(toks[i])
            k = seen.get(n, 0)
            if k < ncols and 1 <= n <= total:
                cols[k][n] = toks[i + 1]
                seen[n] = k + 1
    return cols


def ingest(years=None, verbose=True):
    ITEMS.mkdir(parents=True, exist_ok=True)
    report = {}
    for year in sorted(years or EXAMS):
        booklet, prova_u, gab_u, total = EXAMS[year]
        pp, gp = RAW / "unicamp" / f"{year}-prova.pdf", RAW / "unicamp" / f"{year}-gabarito.pdf"
        if not pp.exists() or not gp.exists():
            report[year] = "arquivo ausente"
            continue
        doc, kdoc = pymupdf.open(pp), pymupdf.open(gp)
        questions, vis = parse_exam(doc, total)
        cols = key_columns(kdoc, total)
        col = COLUMNS.get(year)
        stats = {"encontradas": len(questions), "colunas": {c: len(v) for c, v in cols.items()}, "ok": 0}
        sha_p, sha_g = sha256_file(pp), sha256_file(gp)
        for n in range(1, total + 1):
            if n not in questions:
                stats["sem_inicio"] = stats.get("sem_inicio", 0) + 1
                continue
            figs = FIGURES.get((year, n))
            built, why = build(questions[n], vis, figs)
            if not built:
                stats[why] = stats.get(why, 0) + 1
                continue
            letter = cols.get(col, {}).get(n) if col is not None else None
            if not letter:
                stats["sem_gabarito_conferido"] = stats.get("sem_gabarito_conferido", 0) + 1
                continue
            item = {
                "id": f"unicamp:{year}:1fase:{n:02d}", "inst": "unicamp", "year": year, "phase": "1fase", "edition": "1fase",
                "area": None, "kind": "mc", "stem": built["stem"], "options": built["options"],
                "answer": "ABCD".index(letter), "answer_letter": letter, "annulled": False,
                "appearances": [{"booklet": booklet, "color": None, "co_prova": None, "number": n, "page": built["page"], "day": None,
                                "pdf_url": BASE + prova_u, "key_url": BASE + gab_u, "source_url": BASE + prova_u,
                                "pdf_sha256": sha_p, "key_sha256": sha_g}],
                "media_dir": f"unicamp/{year}/{n:02d}", "facsimiles": [], "flags": [], "review": [], "reasons": [],
                "missing_words": {}, "extra_words": {}, "ocr": False, "ocr_reasons": [], "irt": None, "skill": None,
            }
            for k, (pg, r) in enumerate(figs or []):
                out = STAGING / "media" / item["media_dir"]
                out.mkdir(parents=True, exist_ok=True)
                doc[pg - 1].get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=pymupdf.Rect(*r)).save(out / f"f{k:02d}.png")
            write_json(ITEMS / f"unicamp-{year}-1fase-{n:02d}.json", item)
            stats["ok"] += 1
        report[year] = stats
        if verbose:
            print(year, stats)
    return report
