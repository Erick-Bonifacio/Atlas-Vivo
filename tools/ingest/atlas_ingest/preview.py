"""Pré-visualização restrita: projeta os itens de biologia humana que passaram na integridade da extração em
staging/preview/preview.json, no mesmo formato do banco publicado, para conferir como o aluno os veria.

Não é publicação. Itens com figura ou tabela só entram se constarem em curation/preview_checks.json (comparação com o PDF). Os itens saem com status "preview" e SEM decisão de direitos: o carregador de produção
(bank.js, status "published" + direitos liberados) os recusa. O arquivo fica em staging/ (fora do git, fora
do deploy) e só é lido por tools/preview/server.js, que escuta apenas em 127.0.0.1. Itens com revisão visual aberta
(needs_visual_review) ficam de fora: só aparecem no servidor de revisão. Comentários autorais
não são exportados: a pré-visualização mostra o que o aluno veria sem comentário não verificado."""
from . import publish
from .common import INGEST, STAGING, read_json, write_json

SKIP = ("integrity_failed", "duplicate", "out_of_scope", "needs_visual_review")   # revisão visual aberta: só no servidor de revisão
NO_ALT = "Figura do enunciado (texto alternativo ainda não escrito)."


CHECKS = INGEST / "curation" / "preview_checks.json"


def load_checks():
    """Itens com figura ou tabela cuja extração foi comparada com o PDF e conferiu. Cada registro diz quem comparou
    (`by`) e se foi uma pessoa (`human`): comparação feita pelo assistente de IA vale só para a pré-visualização."""
    return (read_json(CHECKS, {}) or {}).get("checks", {})


def visual_hold(item, checks=None):
    """Figuras e tabelas ainda não são reproduzidas com fidelidade pela extração: em conferência contra os PDFs, figuras
    levaram junto parágrafos, perderam símbolos de legenda e frações, e "tabelas" eram linhas de texto partidas.
    Esses itens ficam só no servidor de revisão até uma pessoa conferir. Devolve o motivo ou None."""
    why = None
    if any(b["t"] == "fig" for b in item["stem"]):
        why = "figura_no_enunciado"
    elif any(b["t"] == "table" for b in item["stem"]):
        why = "tabela_no_enunciado"
    elif any(o.get("fig") for o in item["options"]):
        why = "figura_nas_alternativas"
    if why and (checks or {}).get(item["id"], {}).get("result") == "ok":
        return None
    return why


def preview_item(item, cls):
    base_id = item["id"].replace(":", "-")
    base = f"img/q/{base_id}"
    stem = []
    for b in item["stem"]:
        if b["t"] == "fig":
            stem.append({"t": "fig", "src": f"{base}/{b['src']}", "alt": b.get("alt") or NO_ALT})
        elif b["t"] == "table":
            stem.append({"t": "table", "rows": b["rows"]})
        elif b["t"] in ("p", "source"):
            stem.append({"t": b["t"], "text": b["text"]})
    opts = [({"fig": f"{base}/{o['fig']}", "alt": o.get("alt") or NO_ALT} if o.get("fig") else {"text": o["text"]}) for o in item["options"]]
    return {
        "id": item["id"], "type": "VERIFIED_OFFICIAL", "status": "preview", "kind": item["kind"],
        "inst": item["inst"], "year": item["year"], "phase": item["phase"], "edition": item["edition"], "area": item["area"],
        "stem": stem, "opts": opts, "ans": item["answer"],
        "appearances": [{k: a.get(k) for k in ("booklet", "color", "co_prova", "number", "page", "day", "pdf_url", "key_url")}
                        for a in item["appearances"]],
        "system": cls["system"], "topic": cls["topic"], "diff": None, "diff_method": None,
        "rights": {"status": "needs_authorization"}, "science": {}, "lessons": [],
    }, base_id


def export(records=None):
    records = records or publish.evaluate_all()
    questions, media, meta, held, checks, held_ids = [], {}, {}, {}, load_checks(), {}
    for r in records:
        if r["stage"] in SKIP or r["item"].get("annulled") or r["item"].get("answer") is None:
            continue
        cls = r["class"]
        if not (cls.get("human_biology") and cls.get("system") and cls.get("topic")):
            continue
        why = visual_hold(r["item"], checks)
        if why:
            held[why] = held.get(why, 0) + 1
            held_ids[r["item"]["id"]] = why
            continue
        q, base_id = preview_item(r["item"], cls)
        questions.append(q)
        media[base_id] = r["item"]["media_dir"]
        meta[q["id"]] = {"stage": r["stage"], "pending": r["pending"], "review": r["item"].get("review", [])}
    questions.sort(key=lambda q: q["id"])
    changed = write_json(STAGING / "preview" / "preview.json", {"questions": questions, "media": media, "meta": meta, "held": held_ids})
    by_stage = {}
    for m in meta.values():
        by_stage[m["stage"]] = by_stage.get(m["stage"], 0) + 1
    with_visual = sum(1 for q in questions if any(b["t"] in ("fig", "table") for b in q["stem"]) or any(o.get("fig") for o in q["opts"]))
    return {"preview_items": len(questions), "with_figure_or_table_checked": with_visual, "by_stage": by_stage, "held_for_visual_review": held, "file_changed": bool(changed)}
