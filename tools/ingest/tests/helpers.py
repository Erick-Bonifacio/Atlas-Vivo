"""Utilitários dos testes: PDFs sintéticos com o layout das provas (duas colunas, QUESTÃO N, alternativas)
e um servidor HTTP local com ETag, Range e falhas programáveis. Nada aqui usa material de provas reais."""
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

FONT = "helv"


def make_exam_pdf(path, questions, footer="CN - 2º DIA - CADERNO 7 - AZUL"):
    """questions: lista de dicts {n, stem:[linhas], opts:[textos], wide:bool, fig:bool, sub:(texto, sub)}.
    Desenha em duas colunas (x=31 e x=289); a questão `wide` ocupa a largura da página."""
    doc = pymupdf.open()
    page = doc.new_page(width=567, height=780)
    col, y = 0, 70
    xs = [31, 289]

    def new_col():
        nonlocal page, col, y
        if col == 0:
            col, y = 1, 70
        else:
            page = doc.new_page(width=567, height=780)
            col, y = 0, 70

    page.insert_text((31, 740), footer, fontsize=7, fontname=FONT)
    for q in questions:
        need = 40 + 13 * (len(q["stem"]) + len(q["opts"])) + (90 if q.get("fig") else 0)
        if y + need > 725:
            new_col()
            page.insert_text((31, 740), footer, fontsize=7, fontname=FONT)
        x = xs[col]
        page.insert_text((x, y), f"QUESTÃO {q['n']}", fontsize=9.8, fontname="hebo")
        y += 17
        for line in q["stem"]:
            page.insert_text((x, y), line, fontsize=9.8, fontname=FONT)
            y += 12
        if q.get("sub"):
            base, sub = q["sub"]
            page.insert_text((x, y), base, fontsize=9.8, fontname=FONT)
            w = pymupdf.get_text_length(base, fontname=FONT, fontsize=9.8)
            page.insert_text((x + w, y + 3), sub, fontsize=6.5, fontname=FONT)
            y += 14
        if q.get("fig"):
            page.draw_rect(pymupdf.Rect(x + 10, y, x + 200, y + 70), color=(0, 0, 0), fill=(0.8, 0.9, 1))
            page.insert_text((x + 20, y + 40), "Eixo X", fontsize=8, fontname=FONT)
            y += 82
        y += 6
        for i, text in enumerate(q["opts"]):
            lab = "ABCDEFGHIJ"[i]
            page.insert_text((x, y), f"{lab}\t {text}", fontsize=9.8, fontname=FONT)
            y += 13
        y += 14
    doc.save(str(path))
    doc.close()


def make_key_pdf(path, letters, first_number=91, header="CADERNO 7 Azul Gabarito"):
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((40, 40), header, fontsize=10)
    page.insert_text((40, 60), "QUESTÃO GABARITO", fontsize=10)
    y = 80
    for i, l in enumerate(letters):
        page.insert_text((40, y), f"{first_number + i} {l}", fontsize=10, fontname=FONT)
        y += 12
        if y > 780:
            page = doc.new_page()
            y = 40
    doc.save(str(path))
    doc.close()


class _H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_HEAD(self):
        self._serve(head=True)

    def do_GET(self):
        self._serve()

    def _serve(self, head=False):
        srv = self.server
        srv.hits.append((self.command, self.path, dict(self.headers)))
        route = srv.routes.get(self.path.split("?")[0])
        if route is None:
            self.send_response(404)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if route.get("fail", 0) > 0:
            route["fail"] -= 1
            self.send_response(route.get("fail_code", 503))
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        body, etag = route["body"], route.get("etag")
        if etag and self.headers.get("If-None-Match") == etag:
            self.send_response(304)
            self.end_headers()
            return
        rng = self.headers.get("Range")
        if rng and route.get("ranges", True):
            a, b = rng.split("=")[1].split("-")
            a, b = int(a), min(int(b), len(body) - 1)
            part = body[a:b + 1]
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {a}-{b}/{len(body)}")
            self.send_header("Content-Length", str(len(part)))
            self.end_headers()
            if not head:
                self.wfile.write(part)
            return
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Accept-Ranges", "bytes")
        if etag:
            self.send_header("ETag", etag)
        self.end_headers()
        if not head:
            self.wfile.write(body)


class LocalServer:
    def __init__(self, routes):
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), _H)
        self.srv.routes, self.srv.hits = routes, []
        self.thread = threading.Thread(target=self.srv.serve_forever, daemon=True)

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *a):
        self.srv.shutdown()
        self.srv.server_close()

    @property
    def base(self):
        return f"http://127.0.0.1:{self.srv.server_address[1]}"

    @property
    def hits(self):
        return self.srv.hits
