"""Descoberta das provas e gabaritos do ENEM na página oficial do INEP.

Lê as abas por ano (https://www.gov.br/inep/.../provas-e-gabaritos/<ano>) e registra somente URLs
realmente encontradas na página. Só cadernos padrão (impressos, sem adaptação) alimentam a
extração; cadernos ampliados, ledor, Libras, braile e leitores de tela são adaptações dos mesmos
itens e ficam registrados como `variant` diferente de `standard`."""
import html
import re

from .common import norm

PAGE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/{year}"
TOKEN = re.compile(
    r'<h3[^>]*>(?P<h3>.*?)</h3>|<p class="callout">(?P<call>.*?)</p>|'
    r'<a [^>]*href="(?P<href>https://download\.inep\.gov\.br/[^"]+)"[^>]*>(?P<txt>.*?)</a>', re.S)
ADAPTED = ("ampliad", "ledor", "braile", "libras", "tela", "dosvox", "nvda", "atendimento")


def _text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment or ""))).strip()


def _application(section, label):
    s = norm(section + " " + label)
    if "ppl" in s or "reaplic" in s:
        return "ppl"
    if "2 aplicacao" in s or "segunda aplicacao" in s:
        return "segunda_aplicacao"
    if "regular" in s:
        return "regular"
    return "local:" + re.sub(r"\s+", "-", norm(section))[:40]


def parse_year_page(page_html, year):
    """Converte o HTML de um ano em registros de caderno: uma prova + o gabarito correspondente."""
    body = page_html[page_html.find('id="content-core"'):] if 'id="content-core"' in page_html else page_html
    section, label, booklets, cur = "", "", [], None
    for m in TOKEN.finditer(body):
        if m.group("h3") is not None:
            section = _text(m.group("h3"))
        elif m.group("call") is not None:
            label = _text(m.group("call"))
            dia = re.search(r"(\d)\s*[ºo°ª]?\s*dia", label, re.I)
            cad = re.search(r"caderno\W*(\d+)", label, re.I)
            if not (dia and cad):
                cur = None
                continue
            color = re.search(r"caderno\W*\d+\W*(?:-|–|—)?\s*([A-Za-zçãéíóú]+)", label, re.I)
            n = norm(label)
            cur = {
                "inst": "enem", "year": year, "section": section, "label": label,
                "application": _application(section, label), "day": int(dia.group(1)), "booklet": int(cad.group(1)),
                "color": color.group(1).capitalize() if color else None,
                "variant": "standard" if not any(a in n for a in ADAPTED) else "adapted",
                "exam_url": None, "key_url": None, "extra_urls": [],
            }
            booklets.append(cur)
        elif cur is not None:
            kind, url = norm(_text(m.group("txt"))), m.group("href")
            if kind == "prova" and not cur["exam_url"]:
                cur["exam_url"] = url
            elif kind == "gabarito" and not cur["key_url"]:
                cur["key_url"] = url
            else:
                cur["extra_urls"].append({"label": _text(m.group("txt")), "url": url})
    return [b for b in booklets if b["exam_url"] or b["key_url"]]


def discover(http, years):
    out = []
    for y in years:
        out += parse_year_page(http.text(PAGE.format(year=y)), y)
    return out


def microdata_url(year):
    return f"https://download.inep.gov.br/microdados/microdados_enem_{year}.zip"
