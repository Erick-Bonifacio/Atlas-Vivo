#!/usr/bin/env python
"""Orquestrador do pipeline de ingestão de questões oficiais (execução local, só leitura de fontes públicas).

Uso:
  python -I tools/ingest/run.py discover-enem [--years 2023]
  python -I tools/ingest/run.py ingest-enem   [--years 2015-2025]
  python -I tools/ingest/run.py classify | difficulty | rights | publish | report
  python -I tools/ingest/run.py preview-export   # staging/preview/preview.json, só para tools/preview (127.0.0.1)
  python -I tools/ingest/run.py pilot         # ENEM 2023: discover + ingest + classify + difficulty + report
  python -I tools/ingest/run.py all           # todos os anos configurados

Todas as etapas são idempotentes: rodar de novo sem mudanças nas fontes não altera arquivos."""
import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8")

from atlas_ingest import difficulty, discover_enem, enem_ingest, keys, preview, publish, report, vest_fuvest  # noqa: E402
from atlas_ingest import common  # noqa: E402
from atlas_ingest.common import INGEST, read_json, write_json  # noqa: E402
from atlas_ingest.http_client import Http  # noqa: E402

SOURCES = INGEST / "sources"


def parse_years(spec):
    out = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            out += range(int(a), int(b) + 1)
        else:
            out.append(int(part))
    return out


def cmd_discover_enem(http, years):
    path = SOURCES / "enem.json"
    known = read_json(path, {"booklets": []})["booklets"]
    keep = [b for b in known if b["year"] not in years]
    found = discover_enem.discover(http, years)
    write_json(path, {"source": "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos",
                      "booklets": sorted(keep + found, key=lambda b: (b["year"], b["application"], b["day"], b["booklet"], b["variant"]))})
    print(f"discover-enem: {len(found)} cadernos em {len(years)} ano(s)")


def cmd_ingest_enem(http, years):
    booklets = read_json(SOURCES / "enem.json", {"booklets": []})["booklets"]
    for y in years:
        print(enem_ingest.ingest_year(http, y, booklets))


def cmd_calibrate(http, years):
    # a calibração usa todos os anos com ITENS_PROVA já baixados, mais os pedidos: cortes estáveis entre execuções
    cached = {int(m.group(1)) for f in (common.RAW / "microdados").glob("ITENS_PROVA_*.csv") if (m := re.search(r"_(\d{4})\.csv$", f.name))}
    rows = {y: keys.itens_prova(http, y) for y in sorted(cached | set(years))}
    print("calibrate:", difficulty.calibrate(rows))


def cmd_report():
    records = publish.evaluate_all()
    rep = report.run(records)
    print("report:", {k: rep[k] for k in ("total_extracted", "by_stage", "available_to_students")})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command")
    ap.add_argument("--years", default="2015-2025")
    ap.add_argument("--interval", type=float, default=1.0, help="segundos entre requisições ao mesmo host")
    a = ap.parse_args()
    http = Http(min_interval=a.interval)
    years = parse_years("2023" if a.command == "pilot" else a.years)
    if a.command in ("discover-enem", "pilot", "all"):
        cmd_discover_enem(http, years)
    if a.command in ("ingest-enem", "pilot", "all"):
        cmd_ingest_enem(http, years)
    if a.command in ("calibrate", "pilot", "all"):
        cmd_calibrate(http, years)
    if a.command in ("report", "pilot", "all"):
        cmd_report()
    if a.command == "ingest-fuvest":
        # PDFs já baixados em staging/raw/fuvest (<ano>-prova.pdf e <ano>-gabarito.pdf); ver docs/pipeline.md
        print("ingest-fuvest:", vest_fuvest.ingest([y for y in years if y in vest_fuvest.EXAMS]))
    if a.command == "preview-export":
        print("preview-export:", preview.export())
    if a.command in ("publish", "all"):
        print("publish:", publish.publish())


if __name__ == "__main__":
    main()
