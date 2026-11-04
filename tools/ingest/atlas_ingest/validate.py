"""Validação de integridade de um item extraído (etapa 1). Não avalia mérito científico nem direitos."""
import re

import pymupdf

from .common import STAGING
from .extract_pdf import plain

REQUIRED_PROVENANCE = ("source_url", "number", "page", "pdf_sha256")


def image_blank(path):
    """True se a imagem não existe, está vazia ou é praticamente toda branca."""
    try:
        pix = pymupdf.Pixmap(str(path))
    except Exception:
        return True
    if pix.width < 8 or pix.height < 8:
        return True
    samples = pix.samples
    step = max(1, len(samples) // 20000)
    sample = samples[::step]
    return min(sample) > 245


def check_item(item, expected_options=None):
    """Devolve (lista de motivos de rejeição, lista de avisos que exigem revisão visual)."""
    reasons, review = [], []
    kind = item.get("kind")
    opts = item.get("options", [])
    if not any(b["t"] in ("p", "fig", "table") for b in item.get("stem", [])):
        reasons.append("enunciado_vazio")
    for b in item.get("stem", []):
        if b["t"] in ("p", "source") and not plain(b.get("text", "")).strip():
            reasons.append("bloco_de_texto_vazio")
        if b["t"] == "fig":
            if image_blank(STAGING / "media" / item["media_dir"] / b["src"]):
                reasons.append(f"figura_vazia:{b['src']}")
            if not b.get("alt"):
                review.append("figura_sem_alt")
    if kind == "mc":
        n = expected_options or len(opts)
        if len(opts) != n or [o["label"] for o in opts] != list("ABCDEFGHIJ"[:n]):
            reasons.append(f"alternativas_inconsistentes:{[o['label'] for o in opts]}")
        for o in opts:
            if not o.get("text") and not o.get("fig"):
                reasons.append(f"alternativa_vazia:{o['label']}")
            if o.get("fig") and image_blank(STAGING / "media" / item["media_dir"] / o["fig"]):
                reasons.append(f"figura_vazia:{o['fig']}")
            if o.get("fig") and not o.get("alt"):
                review.append("alternativa_figura_sem_alt")
        if item.get("answer") is None or not (0 <= item["answer"] < len(opts)):
            reasons.append("gabarito_ausente")
    for fac in item.get("facsimiles", []):
        if image_blank(STAGING / "media" / item["media_dir"] / fac):
            reasons.append(f"facsimile_vazio:{fac}")
    reasons += item.get("ocr_reasons", [])
    if item.get("ocr"):
        review.append("ocr_sem_verificacao_independente")
    if "palavras_nao_recuperadas" in item.get("flags", []):
        reasons.append("texto_perdido:" + ",".join(list(item["missing_words"])[:6]))
    if "simbolo_vetorial_no_texto" in item.get("flags", []):
        review.append("simbolo_vetorial_no_texto")
    if "palavras_a_mais" in item.get("flags", []):
        review.append("palavras_a_mais:" + ",".join(list(item["extra_words"])[:6]))
    text = " ".join(plain(b.get("text", "")) for b in item.get("stem", []))
    if re.search(r"[�]|[\u0000-\u0008]", text):
        reasons.append("lixo_de_codificacao")
    for k in REQUIRED_PROVENANCE:
        if not all(a.get(k) not in (None, "") for a in item.get("appearances", [])):
            reasons.append(f"proveniencia_incompleta:{k}")
            break
    return sorted(set(reasons)), sorted(set(review))
