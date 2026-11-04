"""Extração da 1ª fase da FUVEST (prova V, ou V1 desde 2025) a partir do PDF oficial e do gabarito oficial.

Mesmo formato dos itens do ENEM (staging/items/*.json), para seguir as mesmas etapas: classificação, curadoria,
direitos e publicação. Só entra a questão que passa em verificações estruturais; o que é duvidoso é descartado e contado
(nunca "consertado"): figura, gráfico, tabela e desenho vetorial na região da questão, fórmula em linha que o extrator
não reproduz, alternativas fora de A-E em ordem, texto sobrando depois da alternativa E, gabarito anulado ou ausente.

Layout (2019-2026): duas colunas, número da questão em negrito sozinho na linha ("08" ou "{28}"), alternativas "(A) ..."
e textos de apoio introduzidos por "TEXTO PARA AS QUESTÕES x E y". A ordem dos blocos do PyMuPDF segue a leitura."""
import re
from pathlib import Path

import pymupdf

from .common import ITEMS, RAW, sha256_file, write_json

BASE = "https://www.fuvest.br/wp-content/uploads/"
# ano -> (prova, gabarito, nome do caderno). O caderno do gabarito é o primeiro da tabela (V, ou V1 desde 2025).
EXAMS = {
    2019: ("fuvest_2019_primeira_fase.pdf", "fuv2019.gabarito.oficial.pdf", "V"),
    2020: ("fuvest_2020_primeira_fase_prova_V.pdf", "fuvest_2020_primeira_fase_gabaritos.pdf", "V"),
    2021: ("fuvest_2021_primeira_fase.pdf", "fuvest_2021_primeira_fase_gabarito_v2.pdf", "V"),
    2022: ("fuvest_2022_primeira_fase_tipo_V.pdf", "fuvest_2022_primeira_fase_gabarito_retificado.pdf", "V"),
    2023: ("fuvest2023_primeira_fase_prova_V.pdf", "fuvest2023_gabarito_primeira_fase.pdf", "V"),
    2024: ("fuvest2024_primeira_fase_prova_V.pdf", "fuvest2024_gabarito_primeira_fase_retificado_2023-11-24.pdf", "V"),
    2025: ("fuvest2025_primeira_fase_prova_V1.pdf", "fuvest2025_gabarito_primeira_fase.pdf", "V1"),
    2026: ("fuvest2026-fase1-prova-V1.pdf", "fuvest2026-fase1-gabarito.pdf", "V1"),
}
LOCAL = {y: (f"{y}-prova.pdf", f"{y}-gabarito.pdf") for y in EXAMS}
TOTAL = 90

NUM = re.compile(r"^\{?\s*(\d{1,2})\s*\}?$")
OPT = re.compile(r"^\(([A-E])\)\s*(.*)$")
SHARED = re.compile(r"^TEXTO\s+PARA\s+AS\s+QUEST", re.I)
NOTE = re.compile(r"^(note\s+e\s+adote|nota:|dados:)", re.I)
HEADER = re.compile(r"^Concurso Vestibular FUVEST", re.I)
BOOKLET = re.compile(r"^(V\d?|K|Q|X|Z)$")
SOURCE = re.compile(r"(adaptad[oa]s?\.?$|^dispon[ií]vel em|^fonte:|acesso em)", re.I)


def clean(s):
    s = s.replace("¬", " ").replace(" ", " ").replace(" ", " ").replace("​", "")
    s = re.sub(r"#{3,}", " ", s)   # marca invisível de fim de página em alguns PDFs
    return re.sub(r"\s+", " ", s).strip()


def line_text(line):
    """Texto da linha com subscrito/sobrescrito no mesmo formato dos itens do ENEM (_{..} e ^{..})."""
    spans = [s for s in line["spans"] if s["text"].strip() or s["text"] == " "]
    if not spans:
        return "", False
    main = max(spans, key=lambda s: s["size"] * len(s["text"]))
    out, mixed = "", False
    for s in spans:
        t = s["text"]
        if s is not main and s["size"] < main["size"] * 0.86 and t.strip() and abs(s["origin"][1] - main["origin"][1]) > 1.2:
            mixed = True
            out += ("_{%s}" if s["origin"][1] > main["origin"][1] else "^{%s}") % t.strip()
        else:
            out += t
    return clean(out), mixed


def read_blocks(doc):
    """Lista de linhas na ordem de leitura, com bloco, bbox, página e se a linha é número de questão (negrito)."""
    lines = []
    for pn, page in enumerate(doc):
        for bi, b in enumerate(page.get_text("dict")["blocks"]):
            if b["type"] != 0:
                continue
            for l in b["lines"]:
                text, mixed = line_text(l)
                if not text:
                    continue
                x0, y0, x1, y1 = l["bbox"]
                if y0 < 40 and HEADER.match(text):
                    continue
                if BOOKLET.match(text) and y0 < 70:
                    continue
                bold = bool(l["spans"][0]["flags"] & 16) or l["spans"][0]["size"] >= 12   # número da questão: negrito ou corpo maior
                lines.append({"page": pn, "blk": (pn, bi), "bbox": (x0, y0, x1, y1), "text": text, "bold": bold, "mixed": mixed})
    return lines


def visuals(doc):
    """Imagens e desenhos vetoriais de cada página: (retângulo, 'img'|'draw'). Ficam de fora o filete entre as colunas e
    as linhas do cabeçalho e do rodapé, que aparecem em toda página."""
    out = []
    for page in doc:
        h, w = page.rect.height, page.rect.width
        rs = [(pymupdf.Rect(i["bbox"]), "img") for i in page.get_image_info()]
        for d in page.get_drawings():
            r = d["rect"]
            if max(r.width, r.height) <= 12:
                continue
            if r.width < 3 and r.height > h * 0.6:   # filete vertical entre as colunas
                continue
            if r.height < 3 and (r.y0 < 45 or r.y0 > h - 40):   # linha de cabeçalho/rodapé
                continue
            rs.append((pymupdf.Rect(r), "draw"))
        out.append([(r, k) for r, k in rs if r.y1 > 45 and r.y0 < h - 40])
    return out


def has_visual(spans, vis, page_width=595):
    """spans: {página: {coluna: (ymin, ymax)}}. Há figura/desenho/tabela dentro da região da questão?
    Imagem sempre conta; desenhos contam se forem 3 ou mais ou se algum for grande (um filete solto não é figura)."""
    draws = 0
    for pn, cols in spans.items():
        for r, kind in vis[pn]:
            col = 0 if (r.x0 + r.x1) / 2 < page_width / 2 else 1
            cands = cols.values() if r.width > page_width * 0.7 else ([cols[col]] if col in cols else [])
            for ymin, ymax in cands:
                if r.y1 >= ymin - 2 and r.y0 <= ymax + 2:
                    if kind == "img":
                        return True
                    draws += 1
                    if draws >= 3 or (r.width > 25 and r.height > 25):
                        return True
    return False


def parse_exam(doc):
    lines = read_blocks(doc)
    vis = visuals(doc)
    # início de cada questão: número em negrito, na sequência esperada
    starts, exp = [], 1
    for i, l in enumerate(lines):
        m = NUM.match(l["text"])
        if m and int(m.group(1)) == exp and l["bold"]:
            starts.append((exp, i))
            exp += 1
            if exp > TOTAL:
                break
    found = {n for n, _ in starts}
    questions, pending_shared = {}, []
    bounds = [(n, i, (starts[k + 1][1] if k + 1 < len(starts) else len(lines))) for k, (n, i) in enumerate(starts)]
    shared_for = {}   # n -> lista de linhas de texto de apoio
    for n, i0, i1 in bounds:
        seg = lines[i0 + 1:i1]
        # texto de apoio do(s) próximo(s) enunciado(s): cabeçalho "TEXTO PARA AS QUESTÕES ..." até o fim do segmento
        cut = next((k for k, l in enumerate(seg) if SHARED.match(l["text"])), None)
        shared_lines = []
        if cut is not None:
            shared_lines = seg[cut:]
            seg = seg[:cut]
            nums = [int(x) for x in re.findall(r"\d+", shared_lines[0]["text"]) if 1 <= int(x) <= TOTAL]
            # o cabeçalho pode vir quebrado em duas linhas: lê as linhas seguintes até achar números
            k = 1
            while not nums and k < min(3, len(shared_lines)):
                nums = [int(x) for x in re.findall(r"\d+", shared_lines[k]["text"]) if 1 <= int(x) <= TOTAL]
                k += 1
            if nums:
                lo, hi = min(nums), max(nums)
                for q in range(lo, hi + 1):
                    shared_for.setdefault(q, []).extend(shared_lines)
        questions[n] = {"number": n, "lines": seg, "num_line": lines[i0]}
    return questions, shared_for, vis, found


def build(q, shared, vis):
    """Devolve (item_parcial, motivo_de_descarte)."""
    seg = q["lines"]
    if not seg:
        return None, "vazia"
    # alternativas: linhas que começam com (A)..(E), em ordem; continuação = linhas coladas na anterior
    opt_idx = [k for k, l in enumerate(seg) if OPT.match(l["text"])]
    labels = [OPT.match(seg[k]["text"]).group(1) for k in opt_idx]
    if labels != list("ABCDE"):
        return None, "alternativas_fora_de_A_E"
    stem_lines = seg[:opt_idx[0]]
    if not stem_lines:
        return None, "sem_enunciado"
    opts = []
    for j, k in enumerate(opt_idx):
        end = opt_idx[j + 1] if j + 1 < len(opt_idx) else len(seg)
        part = seg[k:end]
        text = OPT.match(part[0]["text"]).group(2)
        last = part[0]
        for l in part[1:]:
            if j + 1 == len(opt_idx):
                # na última alternativa só vale continuação colada à linha anterior (mesma página, espaçamento normal de linha)
                gap = l["bbox"][1] - last["bbox"][3]
                new_col = l["page"] == last["page"] and l["bbox"][0] > 297 > last["bbox"][0]
                if NOTE.match(l["text"]) or (l["page"] == last["page"] and not new_col and not -3 <= gap <= 4 and l["blk"] != last["blk"]):
                    return None, "texto_depois_da_alternativa_E"
            text += " " + l["text"]
            last = l
        opts.append({"label": labels[j], "text": clean(text)})
    # parágrafos do enunciado (blocos do PDF); apoio compartilhado vem antes
    def paragraphs(ls):
        out, cur, blk = [], [], None
        for l in ls:
            if l["blk"] != blk and cur:
                out.append(cur)
                cur = []
            cur.append(l)
            blk = l["blk"]
        if cur:
            out.append(cur)
        return out

    def join(par):
        txt = ""
        for l in par:
            t = l["text"]
            if txt.endswith("-") and t[:1].islower():
                return None   # hifenização ambígua: não adivinha
            txt = (txt + " " + t).strip()
        return clean(txt)

    blocks = []
    all_lines = list(shared) + list(stem_lines)
    for par in paragraphs(all_lines):
        if SHARED.match(par[0]["text"]):
            par = par[1:]
            if not par:
                continue
        t = join(par)
        if t is None:
            return None, "hifenizacao_ambigua"
        if NOTE.match(t):
            return None, "note_e_adote"
        blocks.append({"t": "source" if (SOURCE.search(t) and len(t) < 260) else "p", "text": t})
    if not blocks:
        return None, "sem_enunciado"
    # região da questão para detectar figura/tabela
    spans = {}
    for l in [q["num_line"]] + list(shared) + seg:
        col = 0 if (l["bbox"][0] + l["bbox"][2]) / 2 < 297 else 1
        d = spans.setdefault(l["page"], {})
        lo, hi = d.get(col, (l["bbox"][1], l["bbox"][3]))
        d[col] = (min(lo, l["bbox"][1]), max(hi, l["bbox"][3]))
    if has_visual(spans, vis):
        return None, "figura_ou_tabela"
    text_all = " ".join(b["text"] for b in blocks) + " " + " ".join(o["text"] for o in opts)
    if re.search(r"[\ufffd\u0000-\u0008\u0b80-\u0bff\U0001d400-\U0001d7ff]|\(cid:", text_all):
        return None, "lixo_de_codificacao"
    for o in opts:
        if not o["text"]:
            return None, "alternativa_vazia"
    return {"stem": blocks, "options": [{"label": o["label"], "text": o["text"]} for o in opts], "page": q["num_line"]["page"] + 1}, None


def parse_key(doc):
    """Gabarito do caderno V/V1: primeira ocorrência de cada número 1-90 na tabela. Anulada ("*", duas letras) fica fora."""
    text = "\n".join(p.get_text("text") for p in doc)
    text = text.replace("‐", "-").replace("‑", "-")
    tokens = re.findall(r"(\d{1,2})\s*-\s*([A-E*])|(?<![\w])(\d{1,2})\s+((?:[A-E*](?:\s+(?=[A-E*]\b))?)+)", text)
    ans = {}
    seen_second = set()
    for a, b, c, d in tokens:
        num = int(a or c)
        letters = (b or d).split()
        letters = [x for x in re.findall(r"[A-E*]", b or d)]
        if not 1 <= num <= TOTAL or num in ans:
            continue
        ans[num] = letters[0] if len(letters) == 1 and letters[0] in "ABCDE" else None   # duas letras ou "*": anulada
    return ans


def ingest(years=None, verbose=True):
    ITEMS.mkdir(parents=True, exist_ok=True)
    report = {}
    for year in sorted(years or EXAMS):
        prova_f, gab_f, booklet = EXAMS[year]
        local_prova, local_gab = LOCAL[year]
        pp, gp = RAW / "fuvest" / local_prova, RAW / "fuvest" / local_gab
        if not pp.exists() or not gp.exists():
            report[year] = "arquivo ausente"
            continue
        doc, kdoc = pymupdf.open(pp), pymupdf.open(gp)
        questions, shared_for, vis, found = parse_exam(doc)
        key = parse_key(kdoc)
        sha_p, sha_g = sha256_file(pp), sha256_file(gp)
        stats = {"encontradas": len(found), "gabarito": len(key), "ok": 0}
        for n in range(1, TOTAL + 1):
            if n not in questions:
                stats["sem_inicio"] = stats.get("sem_inicio", 0) + 1
                continue
            built, why = build(questions[n], shared_for.get(n, []), vis)
            if not built:
                stats[why] = stats.get(why, 0) + 1
                continue
            letter = key.get(n)
            if not letter:
                stats["gabarito_anulado_ou_ausente"] = stats.get("gabarito_anulado_ou_ausente", 0) + 1
                continue
            item = {
                "id": f"fuvest:{year}:1fase:{n:02d}", "inst": "fuvest", "year": year, "phase": "1fase", "edition": "1fase",
                "area": None, "kind": "mc", "stem": built["stem"], "options": built["options"],
                "answer": "ABCDE".index(letter), "answer_letter": letter, "annulled": False,
                "appearances": [{"booklet": booklet, "color": None, "co_prova": None, "number": n, "page": built["page"], "day": None,
                                "pdf_url": BASE + prova_f, "key_url": BASE + gab_f, "source_url": BASE + prova_f,
                                "pdf_sha256": sha_p, "key_sha256": sha_g}],
                "media_dir": f"fuvest/{year}/{n:02d}", "facsimiles": [], "flags": [], "review": [], "reasons": [],
                "missing_words": {}, "extra_words": {}, "ocr": False, "ocr_reasons": [], "irt": None, "skill": None,
            }
            write_json(ITEMS / f"fuvest-{year}-1fase-{n:02d}.json", item)
            stats["ok"] += 1
        report[year] = stats
        if verbose:
            print(year, stats)
    return report
