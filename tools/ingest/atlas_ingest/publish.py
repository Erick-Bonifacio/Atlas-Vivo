"""Etapa 4: publicação. Só entra em questions/official/ o item que passou pelas três etapas:
integridade (sem rejeição), científica (`science_ok`) e direitos (`cleared`, com responsável e base).
A publicação é uma projeção determinística: rodar de novo sem mudanças não altera arquivos, e itens que
deixaram de cumprir os requisitos saem. Facsímiles (conferência) nunca são publicados."""
import shutil

from . import classify, curation, dedup, rights, stages
from .common import ITEMS, OFFICIAL, PUBLIC_IMG_Q, STAGING, read_json, write_json


def public_item(item, cls, diff, rt):
    base = f"img/q/{item['id'].replace(':', '-')}"
    stem = []
    for b in item["stem"]:
        if b["t"] == "fig":
            stem.append({"t": "fig", "src": f"{base}/{b['src']}", "alt": b["alt"]})
        elif b["t"] == "table":
            stem.append({"t": "table", "rows": b["rows"]})
        elif b["t"] in ("p", "source"):
            stem.append({"t": b["t"], "text": b["text"]})
    opts = [({"fig": f"{base}/{o['fig']}", "alt": o["alt"]} if o.get("fig") else {"text": o["text"]}) for o in item["options"]]
    ex = item["curation"].get("explanation")
    out = {
        "id": item["id"], "type": "VERIFIED_OFFICIAL", "status": "published", "kind": item["kind"],
        "inst": item["inst"], "year": item["year"], "phase": item["phase"], "edition": item["edition"], "area": item["area"],
        "stem": stem, "opts": opts, "ans": item["answer"],
        "appearances": [{k: a[k] for k in ("booklet", "color", "co_prova", "number", "page", "day", "pdf_url", "key_url")}
                        for a in item["appearances"]],
        "system": cls["system"], "topic": cls["topic"], "skills": [item["skill"]] if item.get("skill") else [],
        "diff": diff["diff"] if diff else None, "diff_method": diff["diff_method"] if diff else None,
        "diff_stats": diff["diff_stats"] if diff else None,
        "third_party": rt["third_party"],
        "rights": {k: rt[k] for k in ("status", "basis", "decided_by", "decided_on", "evidence")},
        "science": {"classification_by": cls.get("confirmed_by"), "classification_human": cls.get("human_reviewed", False)},
        "lessons": [],
    }
    if item.get("source"):   # questão que chegou por uma lista de terceiros: a fonte aparece na questão
        out["source"] = item["source"]
    if item.get("inst_name"):
        out["inst_name"] = item["inst_name"]
    if ex:   # comentário opcional: só vai junto com a autoria e se houve revisão humana
        out["science"].update({"explanation_by": ex["by"], "explanation_human": bool(ex.get("human"))})
        out["expl"] = {"autoral": True, "text": ex["text"], "steps": ex.get("steps", []), "why": ex["why"]}
        out["lessons"] = ex.get("lessons", [])
    return out


def evaluate_all():
    """Calcula estágio, classificação e direitos de todos os itens em staging. Devolve a lista de registros."""
    items = [read_json(f) for f in sorted(ITEMS.glob("*.json"))]
    dups = dedup.find_duplicates([i for i in items if not i.get("reasons")])
    decisions = read_json(rights.DECISIONS, {"decisions": []})
    out = []
    for raw in items:
        item = curation.apply(raw, curation.load(raw["id"]))
        machine = classify.classify(item)
        stage, pending = stages.derive(item, machine, dups.get(item["id"]))
        out.append({"item": item, "machine_class": machine, "class": stages.effective_class(item, machine),
                    "stage": stage, "pending": pending, "diff": stages.difficulty(item), "rights": rights.evaluate(item, decisions)})
    return out


def publish(records=None):
    records = records or evaluate_all()
    OFFICIAL.mkdir(parents=True, exist_ok=True)
    groups, keep_media = {}, set()
    for r in records:
        if r["stage"] != "science_ok" or r["rights"]["status"] != "cleared":
            continue
        it = r["item"]
        groups.setdefault(f"{it['inst']}-{it['year']}-{it['phase']}", []).append(public_item(it, r["class"], r["diff"], r["rights"]))
        base = PUBLIC_IMG_Q / it["id"].replace(":", "-")
        keep_media.add(base.name)
        base.mkdir(parents=True, exist_ok=True)
        for b in it["stem"]:
            if b["t"] == "fig":
                shutil.copy2(STAGING / "media" / it["media_dir"] / b["src"], base / b["src"])
        for o in it["options"]:
            if o.get("fig"):
                shutil.copy2(STAGING / "media" / it["media_dir"] / o["fig"], base / o["fig"])
    changed = 0
    wanted = set()
    for name, qs in groups.items():
        wanted.add(f"{name}.json")
        changed += bool(write_json(OFFICIAL / f"{name}.json", {"questions": sorted(qs, key=lambda q: q["id"])}))
    for f in OFFICIAL.glob("*.json"):
        if f.name not in wanted:
            f.unlink()
            changed += 1
    if PUBLIC_IMG_Q.exists():
        for d in PUBLIC_IMG_Q.iterdir():
            if d.is_dir() and d.name not in keep_media:
                shutil.rmtree(d)
    return {"published": sum(len(v) for v in groups.values()), "files_changed": changed}
