"""Lê membros de um .zip remoto grande por faixas HTTP, sem baixar o arquivo inteiro."""
import io
import zipfile

BLOCK = 4 << 20


class RangeFile(io.RawIOBase):
    def __init__(self, http, url):
        self.http, self.url = http, url
        self.size = int(http.head(url)["content-length"])
        self.pos = 0
        self._start, self._block = -1, b""

    def seekable(self):
        return True

    def readable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, offset, whence=io.SEEK_SET):
        self.pos = {io.SEEK_SET: offset, io.SEEK_CUR: self.pos + offset, io.SEEK_END: self.size + offset}[whence]
        return self.pos

    def readinto(self, buf):
        want = min(len(buf), self.size - self.pos)
        if want <= 0:
            return 0
        if not (self._start <= self.pos < self._start + len(self._block)):
            self._block = self.http.range(self.url, self.pos, min(BLOCK, self.size - self.pos))
            self._start = self.pos
        off = self.pos - self._start
        n = min(want, len(self._block) - off)
        buf[:n] = self._block[off:off + n]
        self.pos += n
        return n


def open_zip(http, url):
    return zipfile.ZipFile(io.BufferedReader(RangeFile(http, url), 1 << 16))
