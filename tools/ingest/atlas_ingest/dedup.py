"""Detecção de duplicatas entre itens (mesma questão em cadernos, aplicações ou anos diferentes).

Dentro do ENEM, o CO_ITEM oficial já reúne os cadernos de uma mesma aplicação. Esta etapa pega o que
o identificador não pega: o mesmo texto republicado em outra aplicação ou em outra instituição. A
comparação usa shingles de 5 palavras sobre enunciado + alternativas normalizados (Jaccard >= 0,9)."""
import re

from .common import norm
from .extract_pdf import plain

SHINGLE = 5
THRESHOLD = 0.9


def text_of(item):
    parts = [plain(b.get("text", "")) for b in item["stem"] if b["t"] in ("p", "source", "fig")]
    parts += [c for b in item["stem"] if b["t"] == "table" for r in b["rows"] for c in r]
    parts += [plain(o.get("text", "")) + " " + o.get("fig_text", "") for o in item["options"]]
    return norm(" ".join(parts))


def shingles(text, k=SHINGLE):
    w = text.split()
    if len(w) < k:
        return {" ".join(w)} if w else set()
    return {" ".join(w[i:i + k]) for i in range(len(w) - k + 1)}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def find_duplicates(items, threshold=THRESHOLD):
    """Devolve {id_duplicado: id_canônico}; o canônico é o item de menor (ano, id)."""
    ordered = sorted(items, key=lambda i: (i["year"], i["id"]))
    sh = {i["id"]: shingles(text_of(i)) for i in ordered}
    dup, bucket = {}, {}
    for it in ordered:
        s = sh[it["id"]]
        cands = set()
        for g in list(s)[:40]:                       # índice invertido grosso: evita comparar todos contra todos
            cands |= bucket.get(g, set())
        match = next((c for c in sorted(cands) if jaccard(s, sh[c]) >= threshold), None)
        if match:
            dup[it["id"]] = dup.get(match, match)
        else:
            for g in s:
                bucket.setdefault(g, set()).add(it["id"])
    return dup
