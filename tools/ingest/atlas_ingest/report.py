"""Relatório de cobertura: quantas questões estão em cada estágio, por instituição, ano e sistema.
Itens não publicados nunca contam como disponíveis ao aluno: `available_to_students` conta só o que
está em questions/official/ e passa pelo mesmo gate do servidor."""
import json
from collections import Counter, defaultdict

from .common import OFFICIAL, REPORTS, ROOT, read_json, write_json

STAGES = ("integrity_failed", "duplicate", "out_of_scope", "needs_visual_review", "pending_science", "science_ok")


def build(records):
    by_stage = Counter(r["stage"] for r in records)
    table = defaultdict(lambda: Counter())
    systems = defaultdict(lambda: Counter())
    for r in records:
        it = r["item"]
        key = f"{it['inst']}|{it['year']}"
        c = table[key]
        c["extracted"] += 1
        c[r["stage"]] += 1
        if r["stage"] not in ("integrity_failed", "duplicate"):
            c["integrity_ok"] += 1
        if r["stage"] in ("needs_visual_review", "pending_science", "science_ok") or (r["stage"] == "out_of_scope" and False):
            c["human_biology"] += 1
            systems[key][r["class"].get("system") or "?"] += 1
        if r["stage"] == "science_ok":
            c["science_ok"] += 0
        c["rights_cleared"] += (r["rights"]["status"] == "cleared" and r["stage"] == "science_ok")
        c["publishable"] += (r["stage"] == "science_ok" and r["rights"]["status"] == "cleared")
    published = 0
    pub_by = Counter()
    for f in OFFICIAL.glob("*.json"):
        qs = read_json(f)["questions"]
        published += len(qs)
        for q in qs:
            pub_by[(q["inst"], q["year"], q["system"])] += 1
    reasons = Counter()
    for r in records:
        if r["stage"] == "integrity_failed":
            for x in r["item"]["reasons"]:
                reasons[x.split(":")[0]] += 1
    flagged_images = [
        {"id": r["item"]["id"], "reasons": [x for x in r["item"]["reasons"] if x.startswith(("figura_vazia", "facsimile_vazio"))]}
        for r in records if any(x.startswith(("figura_vazia", "facsimile_vazio")) for x in r["item"]["reasons"])]
    rights = Counter(r["rights"]["status"] for r in records if r["stage"] in ("science_ok", "pending_science", "needs_visual_review"))
    booklets = []
    for f in sorted((REPORTS / "booklets").glob("*.json")) if (REPORTS / "booklets").exists() else []:
        booklets += [{**b, "file": f.name} for b in read_json(f)]
    bk = Counter(b["status"] for b in booklets)
    return {
        "total_extracted": len(records), "by_stage": dict(by_stage),
        "by_inst_year": {k: dict(v) for k, v in sorted(table.items())},
        "human_biology_by_system": {k: dict(v) for k, v in sorted(systems.items())},
        "rejection_reasons": dict(reasons.most_common()), "image_validation_failures": flagged_images,
        "rights_status_of_human_biology_items": dict(rights),
        "available_to_students": published,
        "available_by_inst_year_system": {f"{a}|{b}|{c}": n for (a, b, c), n in sorted(pub_by.items(), key=str)},
        "booklets": dict(bk), "booklet_problems": [b for b in booklets if b["status"] != "ok"],
    }


def markdown(rep):
    L = ["# Cobertura do banco de questões oficiais", "",
         "Gerado por `python -I tools/ingest/run.py report`. Só contagens: nenhum enunciado de prova aparece aqui.", "",
         f"- Itens extraídos: **{rep['total_extracted']}**",
         f"- Disponíveis ao aluno (publicados no app): **{rep['available_to_students']}**", "",
         "## Itens por estágio", "", "| Estágio | Itens |", "| --- | ---: |"]
    for s in STAGES:
        L.append(f"| {s} | {rep['by_stage'].get(s, 0)} |")
    L += ["", "## Por instituição e ano", "",
          "| Fonte | Extraídos | Íntegros | Biologia humana | Ciência OK | Publicáveis |", "| --- | ---: | ---: | ---: | ---: | ---: |"]
    for k, c in rep["by_inst_year"].items():
        L.append(f"| {k.replace('|', ' ')} | {c.get('extracted', 0)} | {c.get('integrity_ok', 0)} | {c.get('human_biology', 0)} | "
                 f"{c.get('science_ok', 0)} | {c.get('publishable', 0)} |")
    L += ["", "## Biologia humana por sistema (itens íntegros, ainda não publicados)", "", "| Fonte | Sistemas |", "| --- | --- |"]
    for k, c in rep["human_biology_by_system"].items():
        L.append(f"| {k.replace('|', ' ')} | " + ", ".join(f"{s}: {n}" for s, n in sorted(c.items())) + " |")
    L += ["", "## Motivos de rejeição", "", "| Motivo | Itens |", "| --- | ---: |"]
    for k, n in rep["rejection_reasons"].items():
        L.append(f"| {k} | {n} |")
    L += ["", "## Direitos dos itens de biologia humana", "", json.dumps(rep["rights_status_of_human_biology_items"], ensure_ascii=False), "",
          "## Cadernos", "", json.dumps(rep["booklets"], ensure_ascii=False), ""]
    return "\n".join(L)


def run(records):
    rep = build(records)
    write_json(REPORTS / "coverage.json", rep)
    (ROOT / "docs").mkdir(exist_ok=True)
    md = markdown(rep)
    p = ROOT / "docs" / "cobertura.md"
    if not p.exists() or p.read_text(encoding="utf-8") != md:
        p.write_text(md, encoding="utf-8")
    return rep
