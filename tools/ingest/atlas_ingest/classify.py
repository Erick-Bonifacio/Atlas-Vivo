"""Classificação semântica: o item trata de anatomia/fisiologia humana? De qual sistema e tópico?

Método: léxico ponderado por sistema (tools/ingest/taxonomy.json) sobre o texto normalizado do enunciado
e das alternativas, com pistas de contexto humano e penalidade para contexto vegetal/ecológico. A
confiança é a margem entre o melhor e o segundo sistema. Nada é publicado só pela classificação: itens
de baixa margem seguem para revisão e a classificação precisa passar pela etapa científica."""
import re

from .common import INGEST, norm, read_json
from .extract_pdf import plain

TAX = read_json(INGEST / "taxonomy.json")
MIN_SCORE = 3
MIN_MARGIN = 2


def item_text(item):
    parts = [plain(b.get("text", "")) for b in item.get("stem", []) if b["t"] in ("p", "source", "fig")]
    parts += [c for b in item.get("stem", []) if b["t"] == "table" for r in b["rows"] for c in r]
    for o in item.get("options", []):
        parts.append(plain(o.get("text", "")))
        parts.append(o.get("fig_text", ""))
    return " " + norm(" ".join(parts)) + " "


def _rx(term):
    return re.compile(r"(?<![a-z0-9])" + re.escape(norm(term)))


# Léxico compilado uma vez: sistema -> tópico -> [(termo, peso, regex)]
LEX = {sid: {tname: [(t, w, _rx(t)) for t, w in terms.items()] for tname, terms in sysdef["topics"].items()}
       for sid, sysdef in TAX["systems"].items()}
CUES = [(c, _rx(c)) for c in TAX["human_cues"]]
NEGS = [(c, _rx(c)) for c in TAX["negative"]]


def _hits(text, entries):
    """Termos distintos encontrados no início de palavra; devolve {termo: peso}."""
    return {t: w for t, w, rx in entries if rx.search(text)}


def classify(item):
    text = item_text(item)
    scores, topic_scores, evidence = {}, {}, {}
    for sid, topics in LEX.items():
        total, ev = 0, []
        for tname, entries in topics.items():
            h = _hits(text, entries)
            topic_scores[(sid, tname)] = sum(h.values())
            total += sum(h.values())
            ev += list(h)
        scores[sid], evidence[sid] = total, ev
    ranked = sorted(scores.items(), key=lambda kv: -kv[1])
    best, best_score = ranked[0]
    second = ranked[1][1] if len(ranked) > 1 else 0
    cues = [c for c, rx in CUES if rx.search(text)]
    neg = [c for c, rx in NEGS if rx.search(text)]
    human = best_score >= MIN_SCORE and bool(cues or best_score >= 6) and best_score > 2 * len(neg)
    topic = max(((t, s) for (sid, t), s in topic_scores.items() if sid == best), key=lambda x: x[1])[0] if human else None
    margin = best_score - second
    return {
        "human_biology": human, "system": best if human else None, "topic": topic,
        "score": best_score, "margin": margin, "evidence": evidence[best][:8], "human_cues": cues[:4],
        "negative_cues": neg[:4],
        "confidence": "alta" if human and margin >= MIN_MARGIN * 2 else "media" if human and margin >= MIN_MARGIN else "baixa" if human else None,
        "method": "lexico-ponderado-v1",
    }
