"""Ingestão do ENEM: provas e gabaritos oficiais + ITENS_PROVA -> itens candidatos em staging/items.

Um item é identificado pelo CO_ITEM oficial: o mesmo CO_ITEM em vários cadernos vira um único item com
várias `appearances`. O texto de cada caderno é comparado ao do item canônico; divergências ficam
registradas. Só a área CN (Ciências da Natureza) é extraída: é onde está a biologia humana."""
import re
import shutil
from pathlib import Path

import pymupdf

from . import keys as K
from .build_question import build_question
from .common import ITEMS, RAW, REPORTS, STAGING, norm, read_json, sha256_file, write_json
from .extract_pdf import plain, split_questions
from .http_client import FetchError, NotFound
from .validate import check_item

PHASES = {"regular": "regular", "ppl": "ppl", "segunda_aplicacao": "segunda"}
OCR_DONE = set()


def fingerprint(item):
    """Texto normalizado do enunciado e das alternativas (sem rótulos), base de comparação entre cadernos."""
    parts = [plain(b.get("text", "")) for b in item["stem"] if b["t"] in ("p", "source", "fig")]
    parts += [c for b in item["stem"] if b["t"] == "table" for r in b["rows"] for c in r]
    return norm(" ".join(parts)), [norm(plain(o["text"]) + " " + (o.get("fig_text") or "")) for o in item["options"]]


def raw_path(url, year):
    return RAW / "enem" / str(year) / url.rsplit("/", 1)[-1]


def fetch_pair(http, bk):
    """Baixa prova e gabarito do caderno (cache condicional). Devolve (pdf_prova, pdf_gabarito, shas)."""
    out = []
    for url in (bk["exam_url"], bk["key_url"]):
        dest, sha, _ = http.download(url, raw_path(url, bk["year"]))
        out.append((dest, sha))
    return out[0], out[1]


def item_id(year, phase, co_item):
    return f"enem:{year}:{phase}:{co_item}"


def process_booklet(http, bk, rows, by_prova, report):
    """Extrai os itens CN de um caderno. Devolve a lista de itens candidatos (ainda sem deduplicar)."""
    entry = {k: bk[k] for k in ("year", "application", "day", "booklet", "color", "exam_url", "key_url")}
    try:
        (exam_pdf, exam_sha), (key_pdf, key_sha) = fetch_pair(http, bk)
    except (NotFound, FetchError) as e:
        report.append({**entry, "status": "download_falhou", "reason": str(e)})
        return []
    key = K.parse_key_pdf(key_pdf)
    area_start = 46 if bk["year"] <= 2016 else 91
    co_prova, agree, diffs, offset = K.match_booklet(by_prova, "CN", bk["color"], key, area_start)
    if not co_prova:
        # caderno sem CN (dia 1 de 2017+) ou sem concordância de gabarito
        has_cn = any(a == "CN" for (_, a) in by_prova)
        report.append({**entry, "status": "sem_cn" if len(key) and not any(
            n in key for n in range(91, 136)) and bk["day"] == 1 and bk["year"] >= 2017 else "gabarito_sem_correspondencia",
            "best_agreement": round(agree, 3), "reason": f"CN: melhor concordância {agree:.2f}", "has_cn": has_cn})
        return []
    positions = {p + offset: r for p, r in by_prova[(co_prova, "CN")].items()}
    doc = pymupdf.open(exam_pdf)
    phase = PHASES.get(bk["application"], bk["application"].replace(":", "-"))
    app_key = (bk["year"], bk["application"])
    allow_ocr = app_key not in OCR_DONE          # OCR é lento: só o primeiro caderno de cada aplicação; os demais entram como cópias
    OCR_DONE.add(app_key)
    # uma pasta por PDF: provas impressa e digital têm o mesmo número de caderno e questões diferentes na mesma posição
    tmp = STAGING / "tmp" / f"{bk['year']}-{phase}-{bk['booklet']}-{Path(exam_pdf).stem}"
    items, n_bad = [], 0
    for rq in split_questions(doc, allow_ocr=allow_ocr):
        row = positions.get(rq.number)
        if row is None:
            continue
        cand = build_question(doc, rq, tmp)
        letter = row["TX_GABARITO"]
        annulled = key.get(rq.number) == "ANULADO" or row.get("IN_ITEM_ABAN") == "1" or not letter
        item = {
            "id": item_id(bk["year"], phase, row["CO_ITEM"]), "inst": "enem", "year": bk["year"], "phase": phase,
            "edition": bk["application"], "area": "CN", "kind": "mc", "co_item": row["CO_ITEM"],
            "skill": row["CO_HABILIDADE"], "irt": {k: float(row[f"NU_PARAM_{k.upper()}"]) if row[f"NU_PARAM_{k.upper()}"] else None for k in "abc"},
            "stem": cand["stem"], "options": cand["options"], "flags": cand["flags"], "missing_words": cand["missing_words"],
            "extra_words": cand["extra_words"], "facsimiles": cand["facsimiles"], "annulled": annulled,
            "ocr": cand["ocr"], "ocr_reasons": cand["ocr_reasons"],
            "answer_letter": letter or None,
            "answer": "ABCDE".index(letter) if letter in list("ABCDE") else None,
            "appearances": [{
                "booklet": bk["booklet"], "color": bk["color"], "co_prova": co_prova, "number": rq.number,
                "page": cand["page"], "pdf_url": bk["exam_url"], "source_url": bk["exam_url"], "pdf_sha256": exam_sha,
                "key_url": bk["key_url"], "key_sha256": key_sha, "key_letter_pdf": key.get(rq.number),
                "key_letter_microdata": letter, "day": bk["day"], "key_agreement": round(agree, 4),
            }],
            "_tmp": str(tmp),
        }
        if key.get(rq.number) not in (letter, "ANULADO"):
            item["flags"].append("gabarito_divergente")
        items.append(item)
    report.append({**entry, "status": "ok", "co_prova": co_prova, "key_agreement": round(agree, 4),
                   "items": len(items), "expected_items": len(positions)})
    return items


GARBAGE = re.compile(r"[\ufffd\x00-\x08\x0e-\x1f]")


def quality(it):
    """Menor é melhor: texto ilegível (fonte sem mapa Unicode), alternativas incompletas, palavras perdidas."""
    text = " ".join(plain(b.get("text", "")) for b in it["stem"]) + " ".join(o["text"] for o in it["options"])
    broken = bool(GARBAGE.search(text)) or len(it["options"]) != 5
    return (broken, len(it["missing_words"]), len(it["flags"]), len(it["extra_words"]))


def merge_items(items):
    """Une itens com o mesmo id (CO_ITEM). Fica como canônico o caderno com a melhor extração; os demais
    entram como `appearances` e, quando legíveis, precisam concordar com ele."""
    out = {}
    for it in items:
        cur = out.get(it["id"])
        if cur is None:
            out[it["id"]] = it
            continue
        a, b = (cur, it) if quality(cur) <= quality(it) else (it, cur)
        if not quality(a)[0] and not quality(b)[0] and fingerprint(a) != fingerprint(b):
            a["flags"].append("divergencia_entre_cadernos")
        if b["appearances"][0]["key_letter_microdata"] != a["answer_letter"]:
            a["flags"].append("gabarito_diferente_entre_cadernos")
        a["flags"] = sorted(set(a["flags"]) | {f for f in b["flags"] if f.startswith("gabarito_")})
        a["appearances"] = a["appearances"] + b["appearances"]
        out[it["id"]] = a
    for it in out.values():
        it["flags"] = sorted(set(it["flags"]))
    return list(out.values())


def commit_items(items, report_all):
    """Move a mídia para staging/media, valida e grava os itens (idempotente: só escreve se mudou)."""
    written = 0
    for it in items:
        key = it["id"].replace(":", "-")
        it["media_dir"] = f"enem/{it['year']}/{it['id'].split(':')[-1]}-{it['phase']}"
        dest = STAGING / "media" / it["media_dir"]
        src = it.pop("_tmp")
        if dest.exists():
            shutil.rmtree(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        # a mídia do item vem do primeiro caderno: as demais cópias ficam descartadas com o tmp
        first = Path(src)
        for f in first.glob(f"q{it['appearances'][0]['number']:03d}-*"):
            dest.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dest / f.name.split("-", 1)[1])
        for blk in it["stem"]:
            if blk["t"] == "fig":
                blk["src"] = blk["src"].split("-", 1)[1]
        for o in it["options"]:
            if o.get("fig"):
                o["fig"] = o["fig"].split("-", 1)[1]
        it["facsimiles"] = [f.split("-", 1)[1] for f in it["facsimiles"]]
        reasons, review = check_item(it, expected_options=5)    # o ENEM tem 5 alternativas em todos os itens
        if it["annulled"]:
            reasons.append("item_anulado")
        if "gabarito_divergente" in it["flags"] or "gabarito_diferente_entre_cadernos" in it["flags"]:
            reasons.append("gabarito_inconsistente")
        if "divergencia_entre_cadernos" in it["flags"]:
            review.append("divergencia_entre_cadernos")
        it["reasons"] = sorted(set(reasons))
        it["review"] = sorted(set(review))
        it["stage"] = "integrity_failed" if it["reasons"] else ("needs_visual_review" if it["review"] else "pending_science")
        it["media_dir"] = it["media_dir"]
        if write_json(ITEMS / f"{key}.json", it):
            written += 1
    shutil.rmtree(STAGING / "tmp", ignore_errors=True)
    return written


def ingest_year(http, year, bookmarks, log=print):
    """Processa todos os cadernos padrão com prova e gabarito de um ano."""
    rows = K.itens_prova(http, year)
    by_prova = K.index_by_prova(rows)
    cn_days = {1} if year <= 2016 else {2}
    report, items = [], []
    for bk in bookmarks:
        if bk["year"] != year or bk["variant"] != "standard" or not (bk["exam_url"] and bk["key_url"]):
            continue
        if bk["day"] not in cn_days:
            continue
        log(f"  {year} {bk['application']} dia {bk['day']} caderno {bk['booklet']} {bk['color']}")
        items += process_booklet(http, bk, rows, by_prova, report)
    merged = merge_items(items)
    written = commit_items(merged, report)
    write_json(REPORTS / "booklets" / f"enem-{year}.json", report)
    return {"year": year, "booklets": len(report), "items": len(merged), "written": written}
