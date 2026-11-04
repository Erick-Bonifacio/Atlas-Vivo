"""Curadoria sobreposta ao resultado da máquina: texto alternativo de figuras, revisão visual,
confirmação científica da classificação e comentário autoral. Fica em tools/ingest/curation/<arquivo>.json
(versionado), separado de staging/items (regerado pelo pipeline). Cada campo registra QUEM produziu o
conteúdo e se houve revisão humana: o pipeline nunca afirma validação humana que não existe.

Formato de um arquivo de curadoria (um por item):
{
  "id": "enem:2023:regular:141723",
  "visual_review": {"status": "ok" | "rejected", "by": "claude-assistido" | "<nome>", "human": false, "notes": "..."},
  "alt": {"<arquivo da figura>": "<texto alternativo>"},
  "classification": {"human_biology": true, "system": "linfatico", "topic": "...", "by": "...", "human": false},
  "explanation": {"text": "...", "steps": ["..."], "why": ["comentário da alternativa A", "..."],
                  "lessons": ["linfatico#2"], "by": "claude-assistido", "human": false},
  "kind_override": null
}"""
from .common import INGEST, read_json

DIR = INGEST / "curation"


def path_for(item_id):
    return DIR / (item_id.replace(":", "-") + ".json")


def load(item_id):
    return read_json(path_for(item_id), None)


def apply(item, cur):
    """Devolve cópia do item com a curadoria aplicada (alt, revisão visual, explicação)."""
    out = dict(item)
    out["curation"] = cur or {}
    if not cur:
        return out
    stem = []
    for b in item["stem"]:
        b = dict(b)
        if b["t"] == "fig" and cur.get("alt", {}).get(b["src"]):
            b["alt"] = cur["alt"][b["src"]]
        stem.append(b)
    out["stem"] = stem
    opts = []
    for o in item["options"]:
        o = dict(o)
        if o.get("fig") and cur.get("alt", {}).get(o["fig"]):
            o["alt"] = cur["alt"][o["fig"]]
        opts.append(o)
    out["options"] = opts
    return out


def missing_alt(item):
    names = [b["src"] for b in item["stem"] if b["t"] == "fig" and not b.get("alt")]
    names += [o["fig"] for o in item["options"] if o.get("fig") and not o.get("alt")]
    return names
