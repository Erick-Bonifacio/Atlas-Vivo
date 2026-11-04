"""Montagem do candidato de questão: figuras, alternativas, fac-símiles e cobertura de palavras."""
import re
from collections import Counter

import pymupdf

from . import ocr
from .extract_pdf import ENEM, FRAC, _is_bar, content_words, page_drawings, parse_options, plain, stem_blocks


def _uniform(page, rect):
    """Região de uma cor só (variação mínima entre os pixels)."""
    try:
        pix = page.get_pixmap(clip=rect, dpi=30, alpha=False)
    except Exception:
        return False
    sm = pix.samples
    return len(sm) > 0 and max(sm) - min(sm) < 12


def _solid_block(d):
    """Retângulo cheio, escuro e sem contorno: as abas e blocos decorativos da diagramação da prova."""
    fill = d.get("fill")
    return bool(fill) and not d.get("color") and sum(fill) / len(fill) < 0.6 and all(it[0] == "re" for it in d["items"])


def _legend_groups(smalls, lines, ext):
    """Chaves de legenda: símbolo pequeno desenhado + rótulo de texto logo à direita. Entradas empilhadas e o
    título ("LEGENDA") viram um só retângulo, para o símbolo não ficar para trás quando a figura é recortada."""
    entries = []
    for r in smalls:
        for ln in lines:
            if ln.rotated or not (r.x1 - 1 <= ln.x0 <= r.x1 + 30):
                continue
            if ln.y0 - 3 <= (r.y0 + r.y1) / 2 <= ln.y1 + 3 and len(plain(ln.text).split()) <= 9:
                entries.append(pymupdf.Rect(r) | pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1))
                break
    groups = []
    for e in sorted(entries, key=lambda e: (e.x0, e.y0)):
        for i, g in enumerate(groups):
            if abs(g.x0 - e.x0) < 25 and e.y0 - g.y1 < 16 and e.y1 > g.y0 - 16:
                groups[i] = g | e
                break
        else:
            groups.append(pymupdf.Rect(e))
    out = []
    for g in groups:
        if sum(1 for e in entries if e.intersects(g)) < 2:
            continue                          # um símbolo isolado não é legenda
        for ln in lines:                      # título curto logo acima
            if ln.y1 <= g.y0 + 1 and g.y0 - ln.y1 < 14 and len(plain(ln.text).split()) <= 2 and g.x0 - 12 <= ln.x0 <= g.x1:
                g |= pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1)
        out.append(g)
    return out


def find_figures(page, ext, lines, profile):
    """Retângulos de figuras dentro da faixa: imagens raster e agrupamentos de desenhos vetoriais (já recortados
    pela máscara do PDF), ampliados para incluir rótulos de eixo e legendas vizinhos. Chaves de legenda
    (símbolo + rótulo) entram na figura a que pertencem."""
    clip = pymupdf.Rect(ext.x0, ext.y0, ext.x1, ext.y1)
    left = min((ln.x0 for ln in lines if not ln.rotated), default=ext.x0)
    cands, legend = [], []
    for info in page.get_image_info():
        r = pymupdf.Rect(info["bbox"]) & clip
        page_area_ = page.rect.width * page.rect.height
        if r.width * r.height > 0.6 * page_area_:
            continue                      # imagem do tamanho da página = fundo de página digitalizada, não figura
        if r.width * r.height > 500 and r.width > 14 and r.height > 14:
            if _uniform(page, r):
                continue                  # imagem de uma cor só: aba decorativa da prova, não figura
            cands.append(r)
    try:
        ds = [d for d in page_drawings(page) if d["rect"].x0 <= clip.x1 and d["rect"].x1 >= clip.x0
              and d["rect"].y0 <= clip.y1 and d["rect"].y1 >= clip.y0]       # inclusive: eixos e traços finos têm largura ou altura zero
        # hachura de barra de gráfico: traço fino e longo que atravessa texto corrido é máscara do PDF, não figura
        body = [pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1) for ln in lines if not ln.rotated and len(plain(ln.text).split()) >= 5]

        def cuts_text(r):
            if min(r.width, r.height) > 1.2 or max(r.width, r.height) < 40:
                return False
            for b in body:
                if r.height >= r.width and b.x0 + 2 <= r.x0 <= b.x1 - 2 and min(r.y1, b.y1) - max(r.y0, b.y0) > 4:
                    return True
                if r.width > r.height and b.y0 + 2 <= r.y0 <= b.y1 - 2 and min(r.x1, b.x1) - max(r.x0, b.x0) > 4:
                    return True
            return False
        ds = [d for d in ds if not cuts_text(d["rect"])]
        smalls = []
        for r in page.cluster_drawings(clip=clip, drawings=ds):
            r = pymupdf.Rect(r) & clip
            low_wide = not (r.width > 24 and r.height > 24) and r.width > 60 and r.height > 12
            if low_wide:                  # escala ou barra de cores: figura baixa, feita de vários retângulos e sem cruzar alternativas
                parts = sum(1 for d in ds if r.x0 - 1 <= (d["rect"].x0 + d["rect"].x1) / 2 <= r.x1 + 1 and r.y0 - 1 <= (d["rect"].y0 + d["rect"].y1) / 2 <= r.y1 + 1)
                on_option = any(profile.option_re.match(ln.text.strip()) and pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1).intersects(r) for ln in lines)
                if parts < 4 or on_option:
                    continue
            if (r.width > 24 and r.height > 24) or low_wide:
                inside_ds = [d for d in ds if r.x0 - 1 <= (d["rect"].x0 + d["rect"].x1) / 2 <= r.x1 + 1 and r.y0 - 1 <= (d["rect"].y0 + d["rect"].y1) / 2 <= r.y1 + 1]
                if len(inside_ds) == 1 and _solid_block(inside_ds[0]):
                    continue              # bloco cinza ou preto sozinho: enfeite da página (aba lateral), não figura
                if r.x1 < left - 6:
                    continue              # faixa decorativa na margem, fora da coluna de texto
                cands.append(r)
            elif not _is_bar(r) and 3 <= max(r.width, r.height) <= 24:
                smalls.append(r)
        legend = _legend_groups(smalls, lines, ext)
    except Exception:
        pass
    merged = []
    for r in sorted(cands, key=lambda r: (r.y0, r.x0)):
        for i, m in enumerate(merged):
            if (m + (-6, -6, 6, 6)).intersects(r):
                merged[i] = m | r
                break
        else:
            merged.append(pymupdf.Rect(r))
    for g in legend:                          # a legenda entra na figura vizinha; sem vizinha, vira figura própria
        for i, m in enumerate(merged):
            side = min(m.y1, g.y1) - max(m.y0, g.y0) > 0 and (0 <= g.x0 - m.x1 <= 70 or 0 <= m.x0 - g.x1 <= 70)
            below = min(m.x1, g.x1) - max(m.x0, g.x0) > 0 and (0 <= g.y0 - m.y1 <= 30 or 0 <= m.y0 - g.y1 <= 30)
            if m.intersects(g) or side or below:
                merged[i] = m | g
                break
        else:
            merged.append(pymupdf.Rect(g))
    colw = ext.x1 - ext.x0
    figs = []
    for r in merged:
        grown = pymupdf.Rect(r)
        for _ in range(2):
            for ln in lines:
                lr = pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1)
                para_like = ((ln.x1 - ln.x0) > 0.82 * colw or len(plain(ln.text).split()) >= 10) and not ln.rotated and ln.size >= 9
                if profile.option_re.match(ln.text.strip()) or "bundesbahn" in ln.font.lower():
                    continue                                    # alternativas nunca são absorvidas como texto de figura
                inside_x = ln.x0 >= r.x0 - 10 and ln.x1 <= r.x1 + 10      # rótulo de eixo, célula: dentro da largura da figura
                nwords = len(plain(ln.text).split())
                outside_above = lr.y1 <= r.y0 + 3 and (nwords > 4 or plain(ln.text).rstrip().endswith("."))   # fim do parágrafo que antecede a figura
                outside_below = lr.y0 >= r.y1 - 3 and nwords >= 6                                           # fonte ou legenda longa abaixo: bloco próprio
                short_label = nwords <= 3 and not plain(ln.text).rstrip().endswith(".") and r.x0 - 40 <= ln.x0 and ln.x1 <= r.x1 + 40    # número de eixo, nome de estrutura
                axis_title = ln.rotated and r.x0 - 60 <= ln.x1 <= r.x0 + 4 and min(ln.y1, r.y1) - max(ln.y0, r.y0) > 8                 # título girado do eixo y
                if not para_like and not outside_above and not outside_below and (inside_x or short_label or axis_title)                         and ((grown + (-10, -8, 10, 8)).intersects(lr) or (axis_title and (grown + (-40, 0, 0, 0)).intersects(lr))) and lr.y0 >= ext.y0 - 1:
                    grown |= lr
        for _ in range(2):                    # linha de texto cortada pela borda da figura entra inteira (nunca parágrafo ou alternativa)
            for ln in lines:
                lr = pymupdf.Rect(ln.x0, ln.y0, ln.x1, ln.y1)
                if ln.rotated or profile.option_re.match(ln.text.strip()) or "bundesbahn" in ln.font.lower():
                    continue
                if lr.intersects(grown) and not grown.contains(lr) and (ln.x1 - ln.x0) <= 0.82 * colw and len(plain(ln.text).split()) < 10                         and min(lr.x1, grown.x1) - max(lr.x0, grown.x0) > 2:
                    grown |= lr
        figs.append(grown & clip)
    return figs


def padded(rect, lines, pad=2.0):
    """Margem de 2 pt em volta da figura, sem invadir a linha de texto vizinha (a borda de uma frase cortada pela
    metade na figura confunde o aluno)."""
    out = pymupdf.Rect(rect.x0 - pad, rect.y0 - pad, rect.x1 + pad, rect.y1 + pad)
    for ln in lines:
        if ln.rotated or min(ln.x1, rect.x1) - max(ln.x0, rect.x0) <= 2:
            continue
        if ln.y0 >= rect.y1 - 3 and ln.y0 < out.y1:           # a caixa da linha é folgada: o topo das letras já entra no recorte
            out.y1 = max(rect.y1 - 1.5, ln.y0 - 2.5)
        if ln.y1 <= rect.y0 + 3 and ln.y1 > out.y0:
            out.y0 = min(rect.y0 + 1.5, ln.y1 + 2.5)
    return out


def render(page, rect, path, dpi=200, jpeg_over=350_000):
    """Salva o recorte; fotos grandes saem em JPEG. Devolve o nome final do arquivo."""
    pix = page.get_pixmap(clip=rect, dpi=dpi, alpha=False)
    png = pix.tobytes("png")
    if len(png) > jpeg_over:
        path = path.with_suffix(".jpg")
        path.write_bytes(pix.tobytes("jpeg", jpg_quality=86))
    else:
        path.write_bytes(png)
    return path.name


def words_in(page, rect):
    """Palavras dentro do retângulo, em ordem de leitura, como texto de apoio do alt."""
    ws = content_words(page, rect)
    ws.sort(key=lambda w: (round(w[1] / 4), w[0]))
    return " ".join(w[4] for w in ws)


def _widen(doc, rq):
    """Caixa que cruza o vão entre colunas: a faixa da coluna esquerda passa a ter a largura da página."""
    for ext in rq.extents:
        pw = doc[ext.page - 1].rect.width
        slot = [l for l in rq.lines if l.page == ext.page and l.col == ext.col]
        if slot and ext.col == 0 and (max(l.x1 for l in slot) > pw / 2 + 3 or any(l.moved for l in slot)):
            ext.x1 = pw


def build_question(doc, rq, out_dir, profile=ENEM):
    """Monta o candidato de questão e grava figuras e fac-símiles em out_dir."""
    out_dir.mkdir(parents=True, exist_ok=True)
    _widen(doc, rq)
    stem_lines, opts = parse_options(rq.lines, profile)
    flags = []
    n = f"q{rq.number:03d}"
    fig_blocks, opt_figs, taken = [], {}, set()
    for ei, ext in enumerate(rq.extents):
        page = doc[ext.page - 1]
        seg_lines = [l for l in rq.lines if l.page == ext.page and l.col == ext.col]
        marks = [(o["y0"], i) for i, o in enumerate(opts) if o["page"] == ext.page and o["col"] == ext.col]
        first_opt_y = min((m[0] for m in marks), default=None)
        for fi, rect in enumerate(find_figures(page, ext, seg_lines, profile)):
            inside = [l for l in seg_lines if rect.contains(pymupdf.Point((l.x0 + l.x1) / 2, (l.y0 + l.y1) / 2))]
            taken.update(id(l) for l in inside)
            taken_here = {id(l) for l in inside}
            holds_marker = [m for m in marks if rect.y0 - 4 <= m[0] <= rect.y1 + 4]
            if first_opt_y is not None and (rect.y0 >= first_opt_y - 12 or holds_marker):
                prev = holds_marker[:1] or [m for m in marks if m[0] <= rect.y1]
                idx = prev[-1][1] if prev else marks[0][1]
                name = render(page, padded(rect, [l for l in seg_lines if id(l) not in taken_here]), out_dir / f"{n}-o{opts[idx]['label']}.png")
                opt_figs.setdefault(idx, (name, words_in(page, rect)))
                continue
            name = render(page, padded(rect, [l for l in seg_lines if id(l) not in taken_here]), out_dir / f"{n}-f{ei}{fi}.png")
            fig_blocks.append({"t": "fig", "src": name, "page": ext.page, "col": ext.col, "y": rect.y0, "y1": rect.y1,
                               "bbox": [round(v, 1) for v in rect], "text": words_in(page, rect), "alt": None})
    stem_rest = [l for l in stem_lines if id(l) not in taken]
    blocks = stem_blocks(stem_rest, profile) + fig_blocks
    blocks.sort(key=lambda b: (b["page"], b["col"], b["y"]))
    options = []
    for i, o in enumerate(opts):
        o_lines = [l for l in o["lines"] if id(l) not in taken]
        entry = {"label": o["label"], "text": o["text"] if o_lines else ""}
        if i in opt_figs:
            entry["fig"], entry["fig_text"] = opt_figs[i]
            entry["text"] = ""
        elif not entry["text"]:
            ext = next((e for e in rq.extents if e.page == o["page"] and e.col == o["col"]), None)
            if ext:
                same = i + 1 < len(opts) and opts[i + 1]["col"] == o["col"] and opts[i + 1]["page"] == o["page"]
                rect = pymupdf.Rect(ext.x0, o["y0"] - 3, ext.x1, opts[i + 1]["y0"] - 3 if same else ext.y1)
                if rect.height > 6:
                    pg = doc[o["page"] - 1]
                    entry["fig"] = render(pg, rect, out_dir / f"{n}-o{o['label']}.png")
                    entry["fig_text"] = words_in(pg, rect)
        options.append(entry)
    facs = []
    for ei, ext in enumerate(rq.extents):
        rect = pymupdf.Rect(ext.x0, ext.y0, ext.x1, ext.y1)
        facs.append(render(doc[ext.page - 1], rect, out_dir / f"{n}-fac{ei}.png", dpi=150, jpeg_over=10**9))
    # cobertura: palavras lidas de forma independente na região x palavras recuperadas
    label_boxes = [pymupdf.Rect(m.x0 - 1, m.y0 - 1, m.x1 + 1, m.y1 + 1) for o in opts for m in o["markers"]] + \
                  [pymupdf.Rect(l.x0 - 1, l.y0 - 1, l.x0 + 12, l.y1 + 1) for o in opts for l in o["lines"][:1]]
    region, seen_w = Counter(), set()
    for ext in rq.extents:
        clip = pymupdf.Rect(ext.x0, ext.y0, ext.x1, ext.y1)
        for w in content_words(doc[ext.page - 1], clip):
            key = (ext.page, round(w[0]), round(w[1]), w[4])
            if key in seen_w:                          # faixas largas e estreitas podem se sobrepor
                continue
            seen_w.add(key)
            if re.fullmatch(r"[A-E]", w[4]) and any(pymupdf.Rect(w[:4]).intersects(b) for b in label_boxes):
                continue                               # rótulo da alternativa
            region.update(w[4].split())
    for head in ("QUESTÃO", "Questão", "QUESTãO", "QUESTAO", "Questao"):      # palavra do cabeçalho "QUESTÃO N" (caixa varia por ano)
        if region[head] > 0:
            region[head] -= 1
            break
    region.subtract([str(rq.number)])
    region = Counter({k: v for k, v in region.items() if v > 0})
    kept = Counter()
    for b in blocks:
        if b["t"] in ("p", "source", "fig"):
            kept.update(plain(b["text"]).replace(FRAC, " ").split())
        elif b["t"] == "table":
            for r in b["rows"]:
                for c in r:
                    kept.update(c.replace(FRAC, " ").split())
    for o in options:
        kept.update(plain(o["text"]).replace(FRAC, " ").split())
        kept.update(o.get("fig_text", "").split())
    missing, extra = dict(region - kept), dict(kept - region)
    ocr_lines_ = [l for l in rq.lines if l.font == "ocr"]
    ocr_reasons = []
    if ocr_lines_:                       # não há camada de texto para conferir: a conferência é a revisão humana
        missing, extra = {}, {}
        ocr_reasons, _ = ocr.judge(ocr_lines_)
        flags.append("ocr_sem_verificacao_independente")
    if any(l.hole for l in rq.lines if id(l) not in taken):
        flags.append("simbolo_vetorial_no_texto")      # seta, barra ou sinal desenhado que a camada de texto não traz
    if missing:
        flags.append("palavras_nao_recuperadas")
    if extra:
        flags.append("palavras_a_mais")
    return {
        "number": rq.number, "page": rq.page, "pages": sorted({e.page for e in rq.extents}), "area": rq.area,
        "stem": [{k: v for k, v in b.items() if k not in ("page", "col", "y", "y1", "holes")} for b in blocks],
        "options": options, "facsimiles": facs, "missing_words": missing, "extra_words": extra, "flags": flags,
        "ocr": bool(ocr_lines_), "ocr_reasons": ocr_reasons,
    }
