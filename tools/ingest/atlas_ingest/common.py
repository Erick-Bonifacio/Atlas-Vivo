"""Caminhos, E/S de JSON e utilitários compartilhados pelas etapas do pipeline."""
import hashlib
import json
import os
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
INGEST = ROOT / "tools" / "ingest"
STAGING = Path(os.environ.get("ATLAS_STAGING") or ROOT / "staging")
RAW = STAGING / "raw"
ITEMS = STAGING / "items"
REPORTS = STAGING / "reports"
OFFICIAL = ROOT / "questions" / "official"
PUBLIC_IMG_Q = ROOT / "public" / "img" / "q"
USER_AGENT = "AtlasVivo-ingest/1.0 (projeto educacional UNIFEI; leitura de acervos publicos)"


def read_json(path, default=None):
    path = Path(path)
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, data):
    """Grava só se o conteúdo mudou (idempotência: a segunda execução não altera arquivos)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return False
    path.write_text(text, encoding="utf-8")
    return True


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))


def norm(s):
    """Minúsculas, sem acentos nem pontuação, espaços colapsados: base de buscas e fingerprints."""
    s = strip_accents(s or "").lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", strip_accents(s).lower()).strip("-")
