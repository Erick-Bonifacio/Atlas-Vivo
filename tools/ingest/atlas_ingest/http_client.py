"""Cliente HTTP educado: intervalo mínimo por host, tentativas com recuo exponencial,
cache condicional (ETag / Last-Modified) e leitura por faixas (Range)."""
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from .common import USER_AGENT, sha256_file


class NotFound(Exception):
    pass


class FetchError(Exception):
    pass


class Http:
    def __init__(self, min_interval=1.0, retries=4, timeout=90, backoff=2.0, sleep=time.sleep, clock=time.monotonic):
        self.min_interval = min_interval
        self.retries = retries
        self.timeout = timeout
        self.backoff = backoff
        self._sleep = sleep
        self._clock = clock
        self._last = {}
        self.requests = 0

    def _wait(self, url):
        host = urllib.parse.urlsplit(url).netloc
        gap = self.min_interval - (self._clock() - self._last.get(host, -1e9))
        if gap > 0:
            self._sleep(gap)
        self._last[host] = self._clock()

    def _open(self, url, headers=None, method="GET"):
        """Abre a URL com tentativas. 404/410 não repetem; 304 volta como resposta normal."""
        req_headers = {"User-Agent": USER_AGENT, **(headers or {})}
        last = None
        for attempt in range(self.retries):
            self._wait(url)
            self.requests += 1
            try:
                return urllib.request.urlopen(
                    urllib.request.Request(url, headers=req_headers, method=method), timeout=self.timeout)
            except urllib.error.HTTPError as e:
                if e.code == 304:
                    return e
                if e.code in (404, 410):
                    raise NotFound(url)
                if e.code not in (408, 425, 429, 500, 502, 503, 504):
                    raise FetchError(f"{url}: HTTP {e.code}")
                last = e
            except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
                last = e
            if attempt < self.retries - 1:
                self._sleep(self.backoff ** attempt)
        raise FetchError(f"{url}: {last}")

    def text(self, url, encoding="utf-8"):
        with self._open(url) as r:
            return r.read().decode(encoding, errors="replace")

    def head(self, url):
        with self._open(url, method="HEAD") as r:
            return {k.lower(): v for k, v in r.headers.items()}

    def range(self, url, start, length):
        end = start + length - 1
        with self._open(url, {"Range": f"bytes={start}-{end}"}) as r:
            if r.status != 206:
                raise FetchError(f"{url}: servidor ignorou Range (HTTP {r.status})")
            return r.read()

    def download(self, url, dest):
        """Baixa para dest com cache condicional. Retorna (caminho, sha256, status), onde status
        é 'novo', 'atualizado' ou 'cache'."""
        dest = Path(dest)
        meta_path = dest.with_name(dest.name + ".meta.json")
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        headers = {}
        if dest.exists() and meta:
            if meta.get("etag"):
                headers["If-None-Match"] = meta["etag"]
            if meta.get("last_modified"):
                headers["If-Modified-Since"] = meta["last_modified"]
        resp = self._open(url, headers)
        if resp.status == 304:
            return dest, meta["sha256"], "cache"
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_name(dest.name + ".part")
        with resp, open(tmp, "wb") as f:
            while chunk := resp.read(1 << 20):
                f.write(chunk)
        existed = dest.exists()
        tmp.replace(dest)
        digest = sha256_file(dest)
        meta_path.write_text(json.dumps({
            "url": url, "sha256": digest, "etag": resp.headers.get("ETag"),
            "last_modified": resp.headers.get("Last-Modified"), "bytes": dest.stat().st_size,
        }, indent=1), encoding="utf-8")
        return dest, digest, ("atualizado" if existed else "novo")
