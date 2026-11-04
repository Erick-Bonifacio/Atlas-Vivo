"""Estágios do item, derivados dos campos (nunca editados à mão) e contados separadamente no relatório.

  integrity_failed     extração incompleta ou inconsistente: rejeitado
  duplicate            repete outro item: fora do banco
  out_of_scope         íntegro, mas não é biologia humana por sistemas
  needs_visual_review  íntegro, mas há divergência ou palavras a mais para conferir contra o PDF
  pending_science      falta texto alternativo, confirmação da classificação ou há comentário autoral incompleto
  science_ok           etapa científica completa (a autoria registra se houve revisão humana)
Direitos (`rights.status`) e publicação (`published`) são eixos separados: só o item `science_ok` com
direitos `cleared` pode ser publicado."""
from . import curation
from .common import read_json
from .difficulty import label_for

REVIEW_RESOLVED_BY_VISUAL = ("palavras_a_mais", "divergencia_entre_cadernos", "ocr_sem_verificacao_independente", "simbolo_vetorial_no_texto")


def effective_class(item, machine):
    cur = item.get("curation", {}).get("classification")
    if cur:
        return {**machine, "human_biology": cur["human_biology"], "system": cur.get("system"),
                "topic": cur.get("topic"), "confirmed": True, "confirmed_by": cur.get("by"), "human_reviewed": bool(cur.get("human"))}
    return {**machine, "confirmed": False}


def open_visual_review(item):
    cur = item.get("curation", {}).get("visual_review") or {}
    open_ = [r for r in item.get("review", []) if r.split(":")[0] in REVIEW_RESOLVED_BY_VISUAL]
    if cur.get("status") == "ok":
        # texto de OCR não tem conferência automática: só revisor humano o libera
        return [r for r in open_ if r == "ocr_sem_verificacao_independente" and not cur.get("human")]
    return open_


def explanation_problems(item):
    ex = item.get("curation", {}).get("explanation")
    if not ex:
        return []   # o comentário é opcional; se existir, precisa estar completo e coerente com o gabarito
    probs = []
    if not ex.get("text") or not ex.get("by"):
        probs.append("comentario_incompleto")
    if item["kind"] == "mc":
        why = ex.get("why") or []
        if len(why) != len(item["options"]):
            probs.append(f"why_{len(why)}_de_{len(item['options'])}")
        elif item.get("answer") is not None and not why[item["answer"]].startswith("Correta"):
            probs.append("why_do_gabarito_nao_comeca_com_Correta")
        elif any(w.startswith("Correta") for i, w in enumerate(why) if i != item.get("answer")):
            probs.append("why_marca_correta_outra_alternativa")
    return probs


def derive(item, machine_class, duplicate_of=None):
    """Devolve (stage, motivos pendentes)."""
    if item.get("reasons"):
        return "integrity_failed", item["reasons"]
    if duplicate_of:
        return "duplicate", [f"duplicado de {duplicate_of}"]
    cls = effective_class(item, machine_class)
    if not cls["human_biology"]:
        return "out_of_scope", []
    pend = open_visual_review(item)
    if pend:
        return "needs_visual_review", pend
    pend = []
    if curation.missing_alt(item):
        pend.append("alt_ausente:" + ",".join(curation.missing_alt(item)))
    if not cls["confirmed"]:
        pend.append("classificacao_nao_confirmada")
    pend += explanation_problems(item)
    return ("pending_science", pend) if pend else ("science_ok", [])


def difficulty(item):
    return label_for(item.get("irt")) if item["inst"] == "enem" else None


def load_all(items_dir):
    out = []
    for f in sorted(items_dir.glob("*.json")):
        out.append(read_json(f))
    return out
