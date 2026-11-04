"""Etapa 3: direitos de reprodução. Independente da etapa científica e da publicação.

A decisão vem de tools/ingest/rights_decisions.json, editado por pessoa responsável. O pipeline só calcula,
para cada item, quais tipos de material ele contém (texto, figuras, trechos de terceiros) e se a decisão da
fonte cobre todos eles. Sem decisão `cleared` completa, o status é `needs_authorization`."""
from .common import INGEST, read_json

DECISIONS = INGEST / "rights_decisions.json"


def material_needed(item):
    needed = {"text"}
    if any(b["t"] == "fig" for b in item["stem"]) or any(o.get("fig") for o in item["options"]):
        needed.add("figures")
    if any(b["t"] == "source" for b in item["stem"]):
        needed.add("third_party_text")
    return needed


def third_party(item):
    return [{"citation": b["text"], "kind": "texto"} for b in item["stem"] if b["t"] == "source"] + \
           [{"citation": None, "kind": "figura", "file": b["src"]} for b in item["stem"] if b["t"] == "fig"] + \
           [{"citation": None, "kind": "figura-alternativa", "file": o["fig"]} for o in item["options"] if o.get("fig")]


def decision_for(item, decisions):
    for d in decisions["decisions"]:
        s = d["scope"]
        if s.get("inst") == item["inst"] and s.get("year", item["year"]) == item["year"]:
            return d
    return None


def evaluate(item, decisions=None):
    decisions = decisions or read_json(DECISIONS, {"decisions": []})
    d = decision_for(item, decisions)
    needed = sorted(material_needed(item))
    base = {"needed": needed, "third_party": third_party(item), "decision": d["id"] if d else None}
    if not d or d["status"] != "cleared":
        return {**base, "status": "needs_authorization", "reasons": ["sem decisão de liberação para a fonte"]}
    problems = []
    if not (d.get("decided_by") and d.get("decided_on") and d.get("basis")):
        problems.append("decisão `cleared` sem decided_by/decided_on/basis")
    missing = [m for m in needed if m not in d.get("covers", [])]
    if missing:
        problems.append("decisão não cobre: " + ", ".join(missing))
    if problems:
        return {**base, "status": "needs_authorization", "reasons": problems}
    return {**base, "status": "cleared", "basis": d["basis"], "decided_by": d["decided_by"],
            "decided_on": d["decided_on"], "evidence": d.get("evidence", []), "reasons": []}
