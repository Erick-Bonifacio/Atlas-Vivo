"""Extração de questões de PDFs de provas com camada de texto nativa (PyMuPDF).

Fluxo: linhas com geometria -> colunas -> blocos por "QUESTÃO N" -> enunciado, alternativas,
figuras (raster e vetoriais) e tabelas. Nada é reescrito: o texto sai como está no PDF, com
subscritos/sobrescritos marcados como `_{..}` e `^{..}`. Cada questão leva a contagem de palavras
lidas de forma independente (`page.get_text("words")` na região) e das recuperadas, para a
validação detectar perdas.

A configuração por instituição fica em `Profile`: regex do cabeçalho da questão, formato das
alternativas e ruído de página."""
import re
from collections import Counter
from dataclasses import dataclass, field

import pymupdf

from . import ocr

LABELS = "ABCDEFGHIJ"
OCR_OPTION = re.compile(r"^\(?([A-E])[\).]?\s+(\S.*)$")   # em OCR não há tabulação entre rótulo e texto
MICROPRINT = 3.0      # texto de segurança (ex.: "ENEM 2022" repetido em corpo 1,8) não é conteúdo da prova
MARK = re.compile(r"[_^]\{([^}]*)\}")
WORD = re.compile(r"\S+")


@dataclass
class Profile:
    name: str
    question_re: re.Pattern
    option_re: re.Pattern            # grupos: rótulo, texto
    marker_re: re.Pattern            # linha só com o rótulo (glifo) da alternativa
    noise_re: re.Pattern
    boundary_re: re.Pattern          # cabeçalhos de seção que encerram a questão anterior
    columns: int = 2
    small_font: float = 7.5          # linhas menores que isto são fontes/créditos
    top: float = 55.0                # topo útil da coluna
    bottom: float = 735.0            # base útil da coluna
    para_gap: float = 18.0           # espaço vertical que separa parágrafos
    area_re: re.Pattern = re.compile(r"^\s*(CN|CH|LC|MT)\s*\W\s*\d")


ENEM = Profile(
    name="enem",
    question_re=re.compile(r"^QUEST[ÃA]O\s+(\d{1,3})\s*$", re.I),
    option_re=re.compile(r"^([A-E])\s*\t\s*(\S.*)$"),
    marker_re=re.compile(r"^([A-E])\s*\t?\s*$"),
    noise_re=re.compile(r"^(\*[\w\d]+\*|(CN|CH|LC|MT)\s*\W\s*\d.?\s*DIA.*|[A-Z]{2}\d{2,}.*|.*\|\s*\d.?\s*DIA\s*\|.*)$"),
    boundary_re=re.compile(r"^(CI[ÊE]NCIAS (DA NATUREZA|HUMANAS)|MATEM[ÁA]TICA E SUAS|LINGUAGENS, C[ÓO]DIGOS|"
                           r"Quest[õo]es de \d+ a \d+|FOLHA DE RASCUNHO|RASCUNHO)", re.I),
)


def plain(text):
    """Texto sem as marcas de subscrito/sobrescrito."""
    return MARK.sub(lambda m: m.group(1), text)


@dataclass
class Line:
    page: int
    col: int
    x0: float
    y0: float
    x1: float
    y1: float
    size: float
    bold: bool
    text: str
    font: str = ""
    rotated: bool = False
    moved: bool = False
    hole: bool = False     # símbolo desenhado (seta, barra, sinal) ao lado do texto, que a camada de texto não traz


@dataclass
class Extent:
    """Faixa vertical de uma coluna que pertence à questão."""
    page: int
    col: int
    x0: float
    x1: float
    y0: float
    y1: float


@dataclass
class RawQuestion:
    number: int
    page: int
    area: str | None
    lines: list = field(default_factory=list)
    extents: list = field(default_factory=list)


def _line_text(line):
    """Junta os spans de uma linha marcando subscritos e sobrescritos pela posição vertical."""
    spans = [s for s in line["spans"] if s["text"] != ""]
    if not spans:
        return "", 0.0, "", False
    main = max(spans, key=lambda s: s["size"] * len(s["text"].strip() or "x"))
    size, base = main["size"], main["origin"][1]
    horizontal = abs(line["dir"][1]) < 0.05
    out, i = [], 0
    while i < len(spans):
        s = spans[i]
        small = horizontal and s["size"] < size * 0.82 and len(spans) > 1
        off = s["origin"][1] - base
        kind = "_" if small and off > size * 0.12 else "^" if small and off < -size * 0.15 else None
        if kind:
            buf = s["text"]
            while i + 1 < len(spans) and spans[i + 1]["size"] < size * 0.82 and \
                    (spans[i + 1]["origin"][1] - base > size * 0.12) == (kind == "_"):
                i += 1
                buf += spans[i]["text"]
            out.append(f"{kind}{{{buf.strip()}}}" if buf.strip() else buf)
        else:
            out.append(s["text"])
        i += 1
    return "".join(out).rstrip(), size, main["font"], "bold" in main["font"].lower()


FRAC = "⁄"   # barra de fração: "1⁄4". Nas contagens de palavras vira espaço (ver build_question)


def page_drawings(page):
    """Desenhos da página com o retângulo recortado pelo `scissor` (máscara de recorte): hachuras de gráfico são
    linhas longas que o PDF mascara, e sem o recorte elas parecem atravessar parágrafos inteiros."""
    cache = getattr(page.parent, "_draw_cache", None)
    if cache is None:
        cache = page.parent._draw_cache = {}
    if page.number not in cache:
        out = []
        for d in page.get_drawings():
            r, sc = d["rect"], d.get("scissor")
            x0, y0, x1, y1 = r.x0, r.y0, r.x1, r.y1
            if sc is not None:
                x0, y0, x1, y1 = max(x0, sc.x0), max(y0, sc.y0), min(x1, sc.x1), min(y1, sc.y1)
                if x1 < x0 - 0.01 or y1 < y0 - 0.01:
                    continue
            out.append({**d, "rect": pymupdf.Rect(x0, y0, x1, y1)})
        cache[page.number] = out
    return cache[page.number]


def _is_bar(r):
    return r.height <= 1.6 and r.width >= 3


def _merge_stacked_fractions(lines, page):
    """Fração empilhada (numerador, barra desenhada, denominador) vira uma linha "n⁄d". Só quando há barra
    entre duas linhas curtas, centradas uma sobre a outra; sem barra nada é reescrito."""
    bars = [d["rect"] for d in page_drawings(page) if _is_bar(d["rect"]) and d["rect"].width <= 90 and sum(d.get("fill") or d.get("color") or (0,)) / len(d.get("fill") or d.get("color") or (0,)) < 0.7]
    used = set()
    for bar in bars:
        up = [l for l in lines if id(l) not in used and not l.rotated and bar.y0 - 6 <= l.y1 <= bar.y0 + 1 and min(l.x1, bar.x1) - max(l.x0, bar.x0) > 0.5 * (l.x1 - l.x0)]
        dn = [l for l in lines if id(l) not in used and not l.rotated and bar.y1 - 1 <= l.y0 <= bar.y1 + 6 and min(l.x1, bar.x1) - max(l.x0, bar.x0) > 0.5 * (l.x1 - l.x0)]
        if not up or not dn:
            continue
        a, b = max(up, key=lambda l: l.y1), min(dn, key=lambda l: l.y0)
        short = len(a.text.strip()) <= 14 and len(b.text.strip()) <= 14
        if a.col != b.col or not short or abs((a.x0 + a.x1) / 2 - (b.x0 + b.x1) / 2) > 5 or abs(a.size - b.size) > 1.2:
            continue
        used |= {id(a), id(b)}
        h = a.y1 - a.y0
        mid = (a.y0 + b.y1) / 2
        a.text = a.text.strip() + FRAC + b.text.strip()
        a.x0, a.x1, a.y0, a.y1 = min(a.x0, b.x0), max(a.x1, b.x1), mid - h / 2, mid + h / 2
        b.text = ""
    # numerador no fim de uma linha e denominador no começo da seguinte ("A  1" / "4 (25%)"), com a barra entre os dois
    tail, head = re.compile(r"(\S{1,6})\s*$"), re.compile(r"^\s*(\S{1,6})(.*)$")
    for bar in bars:
        if bar.width > 40:
            continue
        up = [l for l in lines if l.text and not l.rotated and abs(l.x1 - bar.x1) <= 4 and l.y0 < bar.y0 < l.y1 + 1]
        for a in up:
            dn = [l for l in lines if l is not a and l.text and l.col == a.col and not l.rotated and abs(l.x0 - bar.x0) <= 4
                  and 0 < l.y0 - a.y0 < 16 and l.y0 <= bar.y1 + 4 and l.y1 > bar.y1]
            if not dn:
                continue
            b = min(dn, key=lambda l: l.y0)
            mt, mh = tail.search(a.text), head.match(b.text)
            if not mt or not mh:
                continue
            a.text = a.text[:mt.start(1)] + mt.group(1) + FRAC + mh.group(1) + mh.group(2)
            a.x1, a.y1 = max(a.x1, b.x1), max(a.y1, b.y1)
            b.text = ""
            break
    return [l for l in lines if l.text != ""]


def _mark_holes(lines, page):
    """Marca a linha que tem um símbolo desenhado colado (seta de reação, barra de unidade, sinal vetorial) ou uma
    barra horizontal curta entre duas linhas (fração que não deu para juntar). O texto desse trecho está incompleto."""
    def dark(d):
        """Traço ou preenchimento escuro: branco e cinza claro são molduras (círculo da letra da alternativa) e máscaras."""
        cols = [c for c in (d.get("fill"), d.get("color")) if c]
        return any(sum(c) / len(c) < 0.7 for c in cols)
    ds = [d for d in page_drawings(page) if dark(d)]
    marks = [d["rect"] for d in ds if not _is_bar(d["rect"]) and d["rect"].width <= 40 and d["rect"].height <= 25 and not (d["rect"].width <= 0.8 and d["rect"].height > 12)]
    bars = [d["rect"] for d in ds if _is_bar(d["rect"]) and d["rect"].width <= 90]
    for ln in lines:
        if ln.rotated:
            continue
        for r in marks:
            cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
            if ln.y0 - 2 <= cy <= ln.y1 + 2 and ln.x0 - 28 <= cx <= ln.x1 + 28:
                ln.hole = True
                break
        else:
            for bar in bars:
                if ln.y1 <= bar.y0 + 1 and bar.y0 - ln.y1 <= 6 and min(ln.x1, bar.x1) - max(ln.x0, bar.x0) > 0.5 * (ln.x1 - ln.x0) and                         any(o is not ln and not o.rotated and bar.y1 - 1 <= o.y0 <= bar.y1 + 6 and min(o.x1, bar.x1) - max(o.x0, bar.x0) > 0.5 * (o.x1 - o.x0) for o in lines):
                    ln.hole = True
                    break


def page_lines(page, number, profile):
    """Linhas da página na ordem de leitura (coluna esquerda, depois direita), sem ruído."""
    mid = page.rect.width * (0.5 if profile.columns == 2 else 2.0)
    raw, seen = [], set()
    for b in page.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for ln in b["lines"]:
            text, size, font, bold = _line_text(ln)
            if not text.strip():
                continue
            x0, y0, x1, y1 = ln["bbox"]
            key = (round(x0), round(y0), plain(text))
            if key in seen:
                continue
            seen.add(key)
            if size < MICROPRINT or y0 > profile.bottom or y0 < profile.top - 5 or profile.noise_re.match(plain(text).strip()):
                continue
            col = 0 if x0 < mid - 10 else 1       # linhas largas (caixas de página inteira) começam na coluna 0
            raw.append(Line(number, col, x0, y0, x1, y1, size, bold, text, font, abs(ln["dir"][1]) > 0.5))
    raw = _merge_script_lines(raw)
    raw = _merge_stacked_fractions(raw, page)
    _mark_holes(raw, page)
    _merge_wide_zones(page, raw, profile)
    raw.sort(key=lambda l: (l.col, round(l.y0, 0), l.x0))
    return raw


def _merge_script_lines(lines):
    """Subscrito/sobrescrito que o PyMuPDF devolveu como linha própria e que está no fim da linha-base volta
    para ela. No meio da linha não há como saber a posição exata do caractere: fica como linha solta, visível
    na revisão, em vez de ser encaixado no lugar errado."""
    out = []
    for ln in lines:
        base = next((b for b in out if b.col == ln.col and b.size > ln.size * 1.2 and b.x1 - 12 <= ln.x0 <= b.x1 + 4
                     and ln.y1 > b.y0 + 0.3 * (b.y1 - b.y0) and ln.y0 < b.y1 and not ln.rotated), None)
        if base is not None:
            mid_l, mid_b = (ln.y0 + ln.y1) / 2, (base.y0 + base.y1) / 2
            kind = "^" if mid_l < mid_b - 1 else "_" if mid_l > mid_b + 1 else None
            if kind:
                base.text += f"{kind}{{{ln.text.strip()}}}"
                base.x1 = max(base.x1, ln.x1)
                continue
        out.append(ln)
    return out


def _merge_wide_zones(page, lines, profile):
    """Questões de página inteira (texto, imagem ou gráfico cruzando o vão entre colunas): as linhas da
    coluna direita na mesma faixa vertical passam para o fluxo da coluna esquerda, em ordem de altura."""
    pw = page.rect.width
    mid = pw / 2
    heads = sorted(l.y0 for l in lines if l.col == 0 and profile.question_re.match(plain(l.text).strip()))
    if not heads:
        return
    wide = [(l.y0, l.y1) for l in lines if l.col == 0 and l.x1 > mid + 3 and not l.rotated]
    for info in page.get_image_info():
        r = info["bbox"]
        if r[0] < mid - 10 and r[2] > mid + 10 and (r[2] - r[0]) > 0.6 * pw:
            wide.append((r[1], r[3]))
    try:
        for r in page.cluster_drawings():
            if r.x0 < mid - 10 and r.x1 > mid + 10 and r.width > 0.6 * pw and r.height > 20:
                wide.append((r.y0, r.y1))
    except Exception:
        pass
    bounds = heads + [profile.bottom + 1]
    for i, hy in enumerate(heads):
        inside = [w for w in wide if hy - 1 <= w[0] < bounds[i + 1] - 1]
        if not inside:
            continue
        end = max(w[1] for w in inside)
        for l in lines:
            if l.col == 1 and hy - 1 <= l.y0 <= end + 2 and not l.rotated:
                l.col, l.moved = 0, True


def page_area(page, profile):
    head = page.get_text()[:200].upper()
    for name, code in (("CIÊNCIAS DA NATUREZA", "CN"), ("CIÊNCIAS HUMANAS", "CH"), ("MATEMÁTICA", "MT"), ("LINGUAGENS", "LC")):
        if head.startswith(name) and "|" in head.splitlines()[0]:
            return code
    for b in page.get_text("blocks"):
        for row in b[4].splitlines():
            m = profile.area_re.match(row)
            if m:
                return m.group(1)
    return None


def split_questions(doc, profile=ENEM, allow_ocr=True):
    """Percorre o documento e devolve as questões na ordem do caderno, com suas faixas de coluna."""
    questions, cur = [], None

    def open_extent(q, page, col, y0, pw):
        half = pw / 2
        x0, x1 = (0.0, half) if col == 0 else (half, pw)
        q.extents.append(Extent(page, col, x0, x1, y0, profile.bottom))

    def close(q, y):
        if q and q.extents:
            q.extents[-1].y1 = min(q.extents[-1].y1, y)

    for pno in range(doc.page_count):
        page = doc[pno]
        pw, area = page.rect.width, page_area(page, profile)
        last_slot = None
        scanned = allow_ocr and ocr.needs_ocr(page)   # digitalizada ou com texto ilegível: OCR, sempre com revisão humana depois
        for ln in (ocr.ocr_lines(page, pno + 1, profile) if scanned else page_lines(page, pno + 1, profile)):
            slot = (pno + 1, ln.col)
            t = plain(ln.text).strip()
            m = profile.question_re.match(t)
            if m:
                if cur and cur.extents and (cur.extents[-1].page, cur.extents[-1].col) == slot:
                    close(cur, ln.y0 - 1)
                cur = RawQuestion(int(m.group(1)), pno + 1, area)
                questions.append(cur)
                open_extent(cur, pno + 1, ln.col, ln.y0 - 2, pw)
                last_slot = slot
                continue
            if profile.boundary_re.match(t):
                if cur and cur.extents and (cur.extents[-1].page, cur.extents[-1].col) == slot:
                    close(cur, ln.y0 - 1)
                cur, last_slot = None, slot
                continue
            if cur is None:
                continue
            if slot != last_slot and (cur.extents[-1].page, cur.extents[-1].col) != slot:
                open_extent(cur, pno + 1, ln.col, profile.top, pw)
            last_slot = slot
            cur.lines.append(ln)
    return questions


def _ocr_option_starts(lines):
    """Em OCR não há tabulação: uma linha "A algo" pode ser alternativa ou só um artigo no começo da frase.
    Só valem como alternativas as linhas da última sequência A, B, C, D (e E) em ordem."""
    cand = [(i, OCR_OPTION.match(l.text.strip()).group(1)) for i, l in enumerate(lines)
            if l.font == "ocr" and OCR_OPTION.match(l.text.strip())]
    for k in range(len(cand) - 1, -1, -1):
        if cand[k][1] != "A":
            continue
        seq, want = [cand[k][0]], "B"
        for i, lab in cand[k + 1:]:
            if lab == want:
                seq.append(i)
                want = chr(ord(want) + 1)
        if len(seq) >= 4:
            return {id(lines[i]) for i in seq}
    return set()


def parse_options(lines, profile):
    """Separa enunciado e alternativas; marcadores só com o rótulo servem de âncora para figuras."""
    stem, opts, cur = [], [], None
    starts = _ocr_option_starts(lines)
    for ln in lines:
        t = ln.text.strip()
        glyph = "bundesbahn" in ln.font.lower() or "pi" == ln.font.lower()[-2:]
        mk = profile.marker_re.match(t) if (glyph or "\t" in ln.text) else None
        mo = (OCR_OPTION.match(t) if id(ln) in starts else None) if ln.font == "ocr" else profile.option_re.match(t)
        if mk and not mo:
            label = mk.group(1)
            if opts and opts[-1]["label"] == label:
                opts[-1].setdefault("markers", []).append(ln)
            elif label == LABELS[len(opts)]:
                cur = {"label": label, "text": "", "lines": [], "markers": [ln], "page": ln.page, "col": ln.col,
                       "y0": ln.y0, "y1": ln.y1}
                opts.append(cur)
            continue
        if mo and mo.group(1) == LABELS[len(opts)] and (not opts or opts[-1]["text"] or opts[-1]["lines"] or True):
            label, rest = mo.group(1), mo.group(2).strip()
            cur = {"label": label, "text": rest, "lines": [ln], "markers": [], "page": ln.page, "col": ln.col,
                   "y0": ln.y0, "y1": ln.y1}
            opts.append(cur)
        elif mo and opts and mo.group(1) == opts[-1]["label"]:
            cur = opts[-1]
            if not cur["text"]:
                cur["text"], cur["lines"] = mo.group(2).strip(), [ln]
        elif cur is not None:
            cur["text"] = (cur["text"] + " " + t).strip()
            cur["lines"].append(ln)
            cur["y1"] = max(cur["y1"], ln.y1)
        else:
            stem.append(ln)
    return stem, opts


def tabular_groups(lines):
    """Agrupa linhas na mesma altura em linhas de tabela; devolve itens ('row', [linhas]) em ordem."""
    rows = []
    for ln in lines:
        if rows and rows[-1][0].page == ln.page and rows[-1][0].col == ln.col and abs(rows[-1][0].y0 - ln.y0) < 2.5 \
                and not ln.rotated:
            rows[-1].append(ln)
        else:
            rows.append([ln])
    return rows


def _is_real_table(run):
    """Tabela de verdade: pelo menos duas linhas, colunas alinhadas e com vão claro entre as células. Uma linha de
    parágrafo que o PDF partiu em palavras soltas (texto justificado) ou uma equação com símbolo desenhado no meio
    NÃO é tabela: vira texto corrido."""
    if len(run) < 2:
        return False
    sizes = Counter(len(r) for r in run)
    ncols, n_ok = sizes.most_common(1)[0]
    if ncols < 2 or n_ok < max(2, 0.75 * len(run)):
        return False
    rows = [r for r in run if len(r) == ncols]
    for j in range(ncols):
        xs = sorted(r[j].x0 for r in rows)
        cs = sorted((r[j].x0 + r[j].x1) / 2 for r in rows)
        med = xs[len(xs) // 2]
        if not all(abs(x - med) <= 8 for x in xs) and not all(abs(c - cs[len(cs) // 2]) <= 8 for c in cs):
            return False
    for r in rows:
        if any(r[j + 1].x0 - r[j].x1 < 10 for j in range(ncols - 1)):
            return False
        if any(len(plain(c.text)) > 60 for c in r):
            return False
    return True


def _flatten_row(row):
    """Linha de texto que o PDF partiu em pedaços na mesma altura: volta a ser uma linha só."""
    row = sorted(row, key=lambda l: l.x0)
    first = row[0]
    return Line(first.page, first.col, first.x0, min(l.y0 for l in row), max(l.x1 for l in row), max(l.y1 for l in row),
                first.size, first.bold, " ".join(l.text.strip() for l in row), first.font, False, False, any(l.hole for l in row))


def stem_blocks(stem_lines, profile):
    """Parágrafos, fontes e tabelas do enunciado. Linhas com várias células na mesma altura só viram tabela se o
    conjunto parecer tabela (`_is_real_table`); senão voltam a ser texto corrido."""
    groups = []
    for row in tabular_groups(stem_lines):
        row.sort(key=lambda l: l.x0)
        groups.append(row)
    # corridas de linhas "tabulares" (2+ células, fonte normal) vizinhas
    items, i = [], 0
    while i < len(groups):
        row = groups[i]
        tab = len(row) >= 2 and all(l.size > profile.small_font for l in row)
        if not tab:
            items.append(("line", row[0]))
            i += 1
            continue
        run = [row]
        j = i + 1
        while j < len(groups):
            nxt = groups[j]
            same = nxt[0].page == run[-1][0].page and nxt[0].col == run[-1][0].col and nxt[0].y0 - max(l.y1 for l in run[-1]) < 22
            if same and len(nxt) >= 2 and all(l.size > profile.small_font for l in nxt):
                run.append(nxt)
                j += 1
            elif same and len(nxt) == 1 and len(nxt[0].text) < 28 and nxt[0].size > profile.small_font and len(run) >= 2:
                run.append(nxt)           # célula isolada dentro da tabela (cabeçalho ou valor curto)
                j += 1
            else:
                break
        if _is_real_table([r for r in run]):
            items.append(("table", run))
        else:
            items += [("line", _flatten_row(r) if len(r) > 1 else r[0]) for r in run]
        i = j
    blocks, prev = [], None
    for kind_, payload in items:
        if kind_ == "table":
            first = payload[0][0]
            blocks.append({"t": "table", "rows": [[plain(l.text).strip() for l in r] for r in payload], "page": first.page, "col": first.col,
                           "y": first.y0, "y1": max(l.y1 for r in payload for l in r), "holes": any(l.hole for r in payload for l in r)})
            prev = None
            continue
        ln = payload
        kind = "source" if ln.size <= profile.small_font else "p"
        txt = ln.text.strip()
        new = (prev is None or prev[0] != kind or prev[1].page != ln.page or prev[1].col != ln.col
               or (ln.y0 - prev[1].y1) > (profile.para_gap if kind == "p" else 6.0))
        if new:
            blocks.append({"t": kind, "text": txt, "page": ln.page, "col": ln.col, "y": ln.y0, "y1": ln.y1})
        else:
            blocks[-1]["text"] += " " + txt
            blocks[-1]["y1"] = ln.y1
        prev = (kind, ln)
    return blocks


def microprint_rects(page):
    """Retângulos das linhas de microimpressão da página (cacheados na própria página)."""
    cache = getattr(page.parent, "_micro_cache", None)
    if cache is None:
        cache = page.parent._micro_cache = {}
    if page.number not in cache:
        rects = []
        for b in page.get_text("dict")["blocks"]:
            for ln in b.get("lines", []):
                if ln["spans"] and max(sp["size"] for sp in ln["spans"]) < MICROPRINT:
                    rects.append(pymupdf.Rect(ln["bbox"]) + (-1.5, -1.5, 1.5, 1.5))
        cache[page.number] = rects
    return cache[page.number]


def content_words(page, clip):
    """Palavras do retângulo que não pertencem à microimpressão e cujo centro está dentro dele."""
    micro = microprint_rects(page)
    out = []
    for w in page.get_text("words", clip=clip):
        c = pymupdf.Point((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)
        if clip.contains(c) and not any(r.contains(c) for r in micro):
            out.append(w)
    return out
