"""Listas de exercícios do Projeto Medicina (PDF aberto, com a prova de origem de cada questão e gabarito).

As questões são de vestibulares reais ("1) (Fuvest-1998) ..."); o PDF é só o caminho até o texto, então cada item guarda a
prova que a lista informa e o endereço da lista (`source`). Texto e gabarito NÃO foram conferidos com a prova original,
e a resolução comentada da lista nunca é copiada. Só entra questão de múltipla escolha a-e, em texto puro, com gabarito
"N) Alternativa: X"; figura, tabela e soma de proposições são descartadas e contadas."""
import re

import pymupdf

from .common import ITEMS, RAW, sha256_file, strip_accents, write_json
from .vest_fuvest import clean, line_text

HOST = "https://projetomedicina.com.br/site/attachments/article/"
# lista -> (arquivo, url do PDF, sistema padrão da lista)
LISTS = {
    "esqueleto": ("esqueleto.pdf", "642/biologia_exercicios_fisiologia_animal_esqueleto_sustentacao_movimento_gabarito_resolucao.pdf"),
    "excrecao": ("excrecao.pdf", "666/biologia_exercicios_fisiologia_animal_excrecao_gabarito_resolucao.pdf"),
    "respiracao": ("respiracao.pdf", "668/biologia_exercicios_fisiologia_animal_respiracao_gabarito_resolucao.pdf"),
    "reproducao": ("reproducao.pdf", "667/biologia_exercicios_fisiologia_animal_reproducao_gabarito_resolucao.pdf"),
    "histologia": ("histologia.pdf", "477/biologia_exercicios_histologia_animal.pdf"),
    "nervoso": ("nervoso.pdf", "670/biologia_exercicios_fisiologia_animal_sistema_nervoso_gabarito_resolucao.pdf"),
}
START = re.compile(r"^(\d{1,3})\)\s*\(([^()]+?)-(\d{4})\)\s*(.*)$")
OPT = re.compile(r"^([a-e])\)\s*(.*)$")
KEY = re.compile(r"^(\d{1,3})\)\s*Alternativa:\s*([A-E])\b")
HEADER = re.compile(r"^\d+\s*\|\s*Projeto Medicina")


def read_lines(doc):
    lines = []
    for pn, page in enumerate(doc):
        imgs = [pymupdf.Rect(i["bbox"]) for i in page.get_image_info()]
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for l in b["lines"]:
                text, _ = line_text(l)
                if not text or HEADER.match(text):
                    continue
                lines.append({"page": pn, "bbox": l["bbox"], "text": text, "imgs": imgs})
    return lines


def split(lines):
    """(itens, gabarito): o gabarito começa na última linha que é só a palavra 'Gabarito'."""
    gi = max((i for i, l in enumerate(lines) if re.fullmatch(r"Gabaritos?( e [Rr]esolu[çc][õo]es)?", l["text"])), default=len(lines))
    return lines[:gi], lines[gi:]


def parse_list(doc):
    lines, keylines = split(read_lines(doc))
    key = {}
    for l in keylines:
        m = KEY.match(l["text"])
        if m:
            key.setdefault(int(m.group(1)), m.group(2))
    starts = [i for i, l in enumerate(lines) if START.match(l["text"])]
    items = []
    for k, i in enumerate(starts):
        seg = lines[i:(starts[k + 1] if k + 1 < len(starts) else len(lines))]
        items.append(seg)
    return items, key


DISPLAY = {"fuvest": "FUVEST", "unicamp": "UNICAMP", "unifesp": "UNIFESP", "fgv": "FGV", "vunesp": "VUNESP", "unifor": "UniFor",
           "fazu": "FaZU", "fatec": "Fatec", "ufscar": "UFSCar", "mack": "Mackenzie", "puccamp": "PUC-Campinas"}


def norm_inst(raw):
    """(chave, nome para exibir): a chave junta variações de grafia ("PUC - RJ", "PUC-RJ"); o nome sai como "PUC-RJ"."""
    key = re.sub(r"[^a-z0-9]+", "", strip_accents(raw).lower())
    return key, DISPLAY.get(key) or re.sub(r"\s*-\s*", "-", raw.strip()).upper()


def build(seg):
    m = START.match(seg[0]["text"])
    num, raw_inst, year, first = int(m.group(1)), m.group(2), int(m.group(3)), m.group(4)
    body = [{**seg[0], "text": first}] + seg[1:]
    idx = [k for k, l in enumerate(body) if OPT.match(l["text"])]
    labels = [OPT.match(body[k]["text"]).group(1) for k in idx]
    if labels != list("abcde"):
        return None, "sem_alternativas_a_e"
    # figura entre a primeira linha e o fim do item
    y0, y1 = seg[0]["bbox"][1] - 2, seg[-1]["bbox"][3] + 2
    for l in seg:
        for r in l["imgs"]:
            if r.height > 12 and r.width > 12 and y0 <= (r.y0 + r.y1) / 2 <= y1 and l["page"] == seg[0]["page"]:
                return None, "figura"
    if len({l["page"] for l in seg}) > 1:
        for l in seg:
            if any(r.height > 12 and r.width > 12 for r in l["imgs"]) and l["page"] != seg[0]["page"]:
                return None, "figura"
    stem_lines = body[:idx[0]]
    stem = clean(" ".join(l["text"] for l in stem_lines))
    if not stem or len(stem) < 25:
        return None, "enunciado_curto"
    if re.search(r"\b(figura|esquema|gr[aá]fico|tabela|ilustra[çc][ãa]o|charge|tirinha|mapa|heredograma|cladograma)\b", stem, re.I) and re.search(r"\b(a|o|na|no|da|do|nesta|neste|abaixo|seguir|acima)\s+(figura|esquema|gr[aá]fico|tabela|ilustra[çc][ãa]o)", stem, re.I):
        return None, "refere_figura"
    opts = []
    for j, k in enumerate(idx):
        end = idx[j + 1] if j + 1 < len(idx) else len(body)
        txt = OPT.match(body[k]["text"]).group(2)
        for l in body[k + 1:end]:
            txt += " " + l["text"]
        opts.append({"label": labels[j].upper(), "text": clean(txt)})
    text_all = stem + " " + " ".join(o["text"] for o in opts)
    if re.search(r"[�\u0000-\u0008]", text_all) or any(not o["text"] for o in opts):
        return None, "lixo_ou_alternativa_vazia"
    inst, inst_name = norm_inst(raw_inst)
    return {"num": num, "inst": inst, "inst_name": inst_name, "year": year, "stem": stem, "options": opts, "page": seg[0]["page"] + 1}, None


def ingest(lists=None, verbose=True):
    ITEMS.mkdir(parents=True, exist_ok=True)
    report = {}
    for name in lists or LISTS:
        fname, rel = LISTS[name]
        path = RAW / "projetomedicina" / fname
        if not path.exists():
            report[name] = "arquivo ausente"
            continue
        doc = pymupdf.open(path)
        items, key = parse_list(doc)
        sha = sha256_file(path)
        url = HOST + rel
        stats = {"itens": len(items), "gabarito": len(key), "ok": 0}
        for seg in items:
            b, why = build(seg)
            if not b:
                stats[why] = stats.get(why, 0) + 1
                continue
            letter = key.get(b["num"])
            if not letter:
                stats["sem_gabarito_em_letra"] = stats.get("sem_gabarito_em_letra", 0) + 1
                continue
            item = {
                "id": f"{b['inst']}:{b['year']}:pm-{name}:{b['num']:02d}", "inst": b["inst"], "inst_name": b["inst_name"], "year": b["year"],
                "phase": f"pm-{name}", "edition": "lista", "area": None, "kind": "mc",
                "stem": [{"t": "p", "text": b["stem"]}], "options": b["options"],
                "answer": "ABCDE".index(letter), "answer_letter": letter, "annulled": False,
                "source": {"name": "Projeto Medicina", "list": name, "note": "texto e gabarito da lista, não conferidos com a prova original"},
                "appearances": [{"booklet": None, "color": None, "co_prova": None, "number": b["num"], "page": b["page"], "day": None,
                                 "pdf_url": url, "key_url": url, "source_url": url, "pdf_sha256": sha, "key_sha256": sha}],
                "media_dir": f"pm/{name}/{b['num']:02d}", "facsimiles": [], "flags": [], "review": [], "reasons": [],
                "missing_words": {}, "extra_words": {}, "ocr": False, "ocr_reasons": [], "irt": None, "skill": None,
            }
            write_json(ITEMS / f"pm-{name}-{b['num']:02d}.json", item)
            stats["ok"] += 1
        report[name] = stats
        if verbose:
            print(name, stats)
    return report
