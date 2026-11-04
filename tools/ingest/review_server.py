#!/usr/bin/env python
"""Servidor de revisão LOCAL das questões em staging. Nunca faz parte do app publicado.

- Escuta só em 127.0.0.1 e recusa qualquer requisição cujo Host não seja loopback (anti DNS rebinding)
  ou cuja origem não seja a própria página.
- Mostra cada item como a pessoa verá no app (enunciado, figuras, tabelas, alternativas clicáveis, gabarito e
  comentário), ao lado do fac-símile da prova, e permite registrar revisão visual, texto alternativo e
  confirmação da classificação. Esses registros vão para tools/ingest/curation/ com `human: true`.
- Serve arquivos só de staging/media. Não há CORS.

Uso:  python -I tools/ingest/review_server.py [--port 8790]"""
import argparse
import json
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit, parse_qs

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atlas_ingest import curation, publish  # noqa: E402
from atlas_ingest.common import STAGING, write_json, read_json  # noqa: E402

LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "[::1]"}
MEDIA = (STAGING / "media").resolve()
ALLOWED_FIELDS = {"visual_review", "alt", "classification"}
CACHE = {"records": None}


def records(refresh=False):
    if refresh or CACHE["records"] is None:
        CACHE["records"] = publish.evaluate_all()
    return CACHE["records"]


def summary(r):
    it = r["item"]
    a = it["appearances"][0]
    return {"id": it["id"], "stage": r["stage"], "year": it["year"], "inst": it["inst"], "phase": it["phase"], "number": a["number"],
            "booklet": a["booklet"], "system": r["class"].get("system"), "human": r["class"]["human_biology"],
            "rights": r["rights"]["status"], "pending": r["pending"][:3], "reasons": it.get("reasons", [])[:3]}


def detail(r):
    it = r["item"]
    return {"summary": summary(r), "item": {k: it[k] for k in ("id", "kind", "inst", "year", "phase", "edition", "stem", "options", "answer", "answer_letter",
            "appearances", "facsimiles", "media_dir", "flags", "reasons", "review", "missing_words", "extra_words", "skill")},
            "class": r["class"], "diff": r["diff"], "rights": r["rights"], "pending": r["pending"], "curation": it.get("curation", {})}


class Handler(BaseHTTPRequestHandler):
    server_version = "AtlasReview/1"

    def log_message(self, *a):
        pass

    def _host_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0] if not (self.headers.get("Host") or "").startswith("[") else "[::1]"
        return host in LOOPBACK_HOSTS

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code, obj):
        self._send(code, json.dumps(obj, ensure_ascii=False))

    def do_GET(self):
        if not self._host_ok():
            return self._json(403, {"error": "Host não permitido"})
        u = urlsplit(self.path)
        path = unquote(u.path)
        if path == "/":
            return self._send(200, PAGE, "text/html; charset=utf-8")
        if path == "/api/items":
            q = parse_qs(u.query)
            rs = records(refresh=q.get("refresh") == ["1"])
            stage, text = (q.get("stage") or [""])[0], (q.get("q") or [""])[0].lower()
            out = [summary(r) for r in rs if (not stage or r["stage"] == stage) and (not text or text in r["item"]["id"].lower())]
            counts = {}
            for r in rs:
                counts[r["stage"]] = counts.get(r["stage"], 0) + 1
            return self._json(200, {"items": out[:400], "total": len(out), "counts": counts})
        m = re.fullmatch(r"/api/item/(.+)", path)
        if m:
            for r in records():
                if r["item"]["id"] == m.group(1):
                    return self._json(200, detail(r))
            return self._json(404, {"error": "item não encontrado"})
        if path.startswith("/media/"):
            f = (MEDIA / path[len("/media/"):]).resolve()
            if MEDIA in f.parents and f.is_file() and f.suffix in (".png", ".jpg"):
                return self._send(200, f.read_bytes(), "image/png" if f.suffix == ".png" else "image/jpeg")
        return self._json(404, {"error": "não encontrado"})

    def do_POST(self):
        # lê (com limite) o corpo antes de qualquer recusa: responder sem consumir o corpo derruba a conexão do cliente
        raw = self.rfile.read(min(int(self.headers.get("Content-Length") or 0), 20000))
        if not self._host_ok():
            return self._json(403, {"error": "Host não permitido"})
        origin = self.headers.get("Origin")
        if origin and urlsplit(origin).netloc != self.headers.get("Host"):
            return self._json(403, {"error": "origem não permitida"})
        if self.headers.get("X-Atlas-Review") != "1":
            return self._json(403, {"error": "cabeçalho de revisão ausente"})
        m = re.fullmatch(r"/api/curation/(.+)", unquote(urlsplit(self.path).path))
        if not m:
            return self._json(404, {"error": "não encontrado"})
        item_id = m.group(1)
        if not any(r["item"]["id"] == item_id for r in records()):
            return self._json(404, {"error": "item não encontrado"})
        try:
            body = json.loads(raw or b"{}")
        except ValueError:
            return self._json(400, {"error": "JSON inválido"})
        reviewer = str(body.get("reviewer") or "").strip()[:80]
        if not reviewer:
            return self._json(400, {"error": "Informe o nome de quem revisa."})
        cur = curation.load(item_id) or {"id": item_id}
        for k in ALLOWED_FIELDS & body.keys():
            v = body[k]
            if k == "visual_review" and v.get("status") in ("ok", "rejected"):
                cur[k] = {"status": v["status"], "by": reviewer, "human": True, "notes": str(v.get("notes") or "")[:500]}
            elif k == "alt" and isinstance(v, dict):
                cur.setdefault("alt", {}).update({str(f)[:80]: str(t)[:600] for f, t in v.items() if re.fullmatch(r"[\w.-]+\.(png|jpg)", str(f)) and str(t).strip()})
            elif k == "classification" and isinstance(v.get("human_biology"), bool):
                cur[k] = {"human_biology": v["human_biology"], "system": v.get("system") or None, "topic": v.get("topic") or None, "by": reviewer, "human": True}
        write_json(curation.path_for(item_id), cur)
        records(refresh=True)
        return self._json(200, {"ok": True})


PAGE = r"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão local de questões</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;margin:0;color:#16263D;background:#F5F8FC}
header{background:#7A1F1F;color:#fff;padding:10px 16px;font-weight:600}
main{display:flex;gap:16px;padding:16px;flex-wrap:wrap}
aside{flex:1 1 300px;max-width:380px}.det{flex:3 1 560px;min-width:0}
.card{background:#fff;border:1px solid #DCE5EF;border-radius:12px;padding:16px;margin-bottom:12px}
button{min-height:36px;border-radius:8px;border:1px solid #C9D6E5;background:#fff;padding:0 12px;cursor:pointer;font:inherit}
button.on{background:#16263D;color:#fff}.alt{display:block;width:100%;text-align:left;margin:6px 0;padding:10px}
.ok{border:2px solid #1F7A4D;background:#E8F4EC}.bad{border:2px solid #B3372F;background:#FBECEA}
.tag{font-size:12px;padding:2px 6px;border-radius:6px;background:#EEF3FE;margin-right:6px}
img{max-width:100%;height:auto}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
li{cursor:pointer;padding:6px 0;border-bottom:1px solid #EEF2F7}li.cur{font-weight:700}
</style></head><body>
<header>REVISÃO LOCAL · conteúdo de staging, restrito a esta máquina · não faz parte do app</header>
<main><aside><div class="card"><label>Revisor(a): <input id="rev" placeholder="seu nome" maxlength="80"></label>
<div class="row" id="stages" style="margin-top:8px"></div><input id="q" placeholder="filtrar por id" style="margin-top:8px;width:100%">
<ul id="list" style="list-style:none;padding:0;max-height:60vh;overflow:auto"></ul></div></aside>
<div class="det" id="det"><div class="card">Escolha um item na lista.</div></div></main>
<script>
const $=id=>document.getElementById(id);let stage='',cur=null,picked=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rich=t=>esc(t).replace(/_\{([^}]*)\}/g,'<sub>$1</sub>').replace(/\^\{([^}]*)\}/g,'<sup>$1</sup>');
const api=(u,o)=>fetch(u,o).then(r=>r.json());
$('rev').value=localStorage.getItem('rev')||'';$('rev').onchange=()=>localStorage.setItem('rev',$('rev').value);
async function load(){const d=await api('/api/items?stage='+stage+'&q='+encodeURIComponent($('q').value));
 $('stages').innerHTML=['','integrity_failed','needs_visual_review','pending_science','science_ok','out_of_scope','duplicate'].map(s=>'<button class="'+(s===stage?'on':'')+'" data-s="'+s+'">'+(s||'todos')+(s?' ('+(d.counts[s]||0)+')':'')+'</button>').join('');
 document.querySelectorAll('#stages button').forEach(b=>b.onclick=()=>{stage=b.dataset.s;load()});
 $('list').innerHTML=d.items.map(i=>'<li data-id="'+esc(i.id)+'" class="'+(cur&&cur.summary.id===i.id?'cur':'')+'">'+esc(i.inst)+' '+i.year+' '+esc(i.phase)+' q'+i.number+' <span class="tag">'+i.stage+'</span>'+(i.system?'<span class="tag">'+i.system+'</span>':'')+'</li>').join('');
 document.querySelectorAll('#list li').forEach(li=>li.onclick=()=>open(li.dataset.id));}
async function open(id){cur=await api('/api/item/'+encodeURIComponent(id));picked=null;render();load()}
function blocks(it){return it.stem.map(b=>b.t==='p'?'<p>'+rich(b.text)+'</p>':b.t==='source'?'<p style="font-size:12px;text-align:right;color:#53657C">'+rich(b.text)+'</p>':
 b.t==='fig'?'<figure><img src="/media/'+it.media_dir+'/'+b.src+'" alt="'+esc(b.alt||(cur.curation.alt||{})[b.src]||'')+'"><figcaption style="font-size:12px;color:#53657C">alt: '+esc((cur.curation.alt||{})[b.src]||b.alt||'(sem texto alternativo)')+' · texto extraído da figura: '+esc(b.text||'')+'</figcaption></figure>':
 '<table border="1" cellpadding="4">'+b.rows.map(r=>'<tr>'+r.map(c=>'<td>'+rich(c)+'</td>').join('')+'</tr>').join('')+'</table>').join('')}
function render(){const it=cur.item,ex=cur.curation.explanation,done=picked!==null;
 const alts=it.options.map((o,i)=>{let c='alt';if(done&&i===it.answer)c+=' ok';else if(done&&i===picked)c+=' bad';
  return '<button class="'+c+'" data-i="'+i+'"><b>'+o.label+'</b> '+(o.text?rich(o.text):'<img src="/media/'+it.media_dir+'/'+o.fig+'" alt="'+esc((cur.curation.alt||{})[o.fig]||'')+'">')+(done&&ex&&ex.why?'<div style="font-size:14px;color:#34475F;margin-top:4px">'+esc(ex.why[i]||'')+'</div>':'')+'</button>'}).join('');
 $('det').innerHTML='<div class="card"><div class="row"><span class="tag">'+cur.summary.stage+'</span><span class="tag">direitos: '+cur.rights.status+'</span><span class="tag">sistema: '+(cur.class.system||'—')+' ('+(cur.class.confidence||'—')+')</span><span class="tag">dificuldade: '+(cur.diff?cur.diff.diff:'—')+'</span></div>'+
 '<p style="font-size:13px;color:#53657C">'+it.appearances.map(a=>'caderno '+a.booklet+' ('+(a.color||'')+') q'+a.number+' p.'+a.page).join(' · ')+' · <a href="'+it.appearances[0].pdf_url+'" target="_blank" rel="noopener noreferrer">PDF oficial</a></p>'+
 blocks(it)+'<div role="radiogroup">'+alts+'</div>'+(done?'<p><b>Gabarito oficial: '+it.answer_letter+'</b> · '+(picked===it.answer?'você acertou':'você marcou '+it.options[picked].label)+'</p>'+(ex?'<p>'+esc(ex.text)+'</p><p style="font-size:12px">Comentário de '+esc(ex.by)+(ex.human?' (revisado por pessoa)':' (sem revisão humana)')+'</p>':'<p>(sem comentário autoral ainda)</p>'):'')+'</div>'+
 '<div class="card"><b>Pendências:</b> '+esc(cur.pending.join('; ')||'nenhuma')+'<br><b>Motivos de rejeição:</b> '+esc(it.reasons.join('; ')||'nenhum')+'<br><b>Para revisão visual:</b> '+esc(it.review.join('; ')||'nada')+
 '<div class="row" style="margin-top:10px"><button id="vok">Conferi com o PDF: texto e figuras corretos</button><button id="vno">Rejeitar extração</button><button id="chy">Confirmar: é biologia humana</button><button id="chn">Não é biologia humana</button></div>'+
 '<div style="margin-top:10px">'+it.stem.filter(b=>b.t==='fig').map(b=>'<label>alt de '+b.src+': <input data-alt="'+b.src+'" value="'+esc((cur.curation.alt||{})[b.src]||'')+'" style="width:60%"></label>').join('<br>')+'<br><button id="salt">Salvar textos alternativos</button></div></div>'+
 '<div class="card"><b>Fac-símile da prova (conferência):</b><br>'+it.facsimiles.map(f=>'<img src="/media/'+it.media_dir+'/'+f+'" alt="Recorte da prova original">').join('')+'</div>';
 document.querySelectorAll('.alt').forEach(b=>b.onclick=()=>{if(picked===null){picked=+b.dataset.i;render()}});
 const post=body=>{const r=$('rev').value.trim();if(!r){alert('Informe o nome de quem revisa.');return}api('/api/curation/'+encodeURIComponent(it.id),{method:'POST',headers:{'Content-Type':'application/json','X-Atlas-Review':'1'},body:JSON.stringify(Object.assign({reviewer:r},body))}).then(d=>{if(d.error)alert(d.error);else open(it.id)})};
 $('vok').onclick=()=>post({visual_review:{status:'ok'}});$('vno').onclick=()=>post({visual_review:{status:'rejected',notes:prompt('Motivo')||''}});
 $('chy').onclick=()=>post({classification:{human_biology:true,system:prompt('Sistema (ex.: digestorio)',cur.class.system||'')||null,topic:cur.class.topic||null}});
 $('chn').onclick=()=>post({classification:{human_biology:false}});
 $('salt').onclick=()=>{const alt={};document.querySelectorAll('[data-alt]').forEach(i=>{if(i.value.trim())alt[i.dataset.alt]=i.value});post({alt})}}
$('q').oninput=load;load();
</script></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8790)
    a = ap.parse_args()
    srv = ThreadingHTTPServer(("127.0.0.1", a.port), Handler)
    print(f"Revisão local em http://127.0.0.1:{a.port} (só esta máquina; Ctrl+C encerra)")
    srv.serve_forever()


if __name__ == "__main__":
    main()
