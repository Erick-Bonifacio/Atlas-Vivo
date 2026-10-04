/* Atlas Vivo — cena 3D v2 (otimizada). Anatomia: BodyParts3D © DBCLS, CC BY 4.0 (geometria simplificada, com níveis de detalhe). */
(function(){
if(customElements.get('atlas-3d-v2'))return;
const T_URL='https://cdn.jsdelivr.net/npm/three@0.186.0/+esm';
const BVH_URL='https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.9.15/+esm';
const DEC_URL='https://cdn.jsdelivr.net/npm/meshoptimizer@1.3.0/meshopt_decoder.mjs';
const MAN_URL='atlas2/manifest.json';
const COL={tegumentar:0x9cc8f2,muscular:0x5a82c0,esqueletico:0xe6e9ec,cardiovascular:0xc7404d,nervoso:0xe3b864,digestorio:0xd99a80,respiratorio:0xe5a8b4,urinario:0xcb8a72,endocrino:0xa487d8,linfatico:0x77ba96,reprodutor:0xc994ad};
const VEIN=0x3d62b4;
const RO={tegumentar:1,muscular:2};
const DEF={batch:true,lod:true,adaptive:true,mats:'mixed',bvh:true,shadowCache:true,alphaHash:false,workers:2,singlePass:false,singleSide:true,tau:1};
const TAU=1.0,TAU_OUT=0.6;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tick0=()=>new Promise(r=>setTimeout(r,0));

class Atlas3DV2 extends HTMLElement{
  connectedCallback(){
    if(this._init)return;this._init=true;
    let o=null;try{o=JSON.parse(this.getAttribute('opts')||'null');}catch(e){}
    this.opt=Object.assign({},DEF,o||window.AV3D_OPTS||{});
    Object.assign(this.style,{display:'block',position:'absolute',inset:'0',overflow:'hidden'});
    this._onCmd=e=>this.cmd(e.detail||{});
    window.addEventListener('av3d:cmd',this._onCmd);
    this.start().catch(err=>{console.error(err);this.emit('error',{message:String(err&&err.message||err)})});
  }
  disconnectedCallback(){this.dispose();}
  emit(t,d){window.dispatchEvent(new CustomEvent('av3d:'+t,{detail:d}))}

  async start(){
    const [T,BVH,DEC]=await Promise.all([import(T_URL),import(BVH_URL).catch(e=>{console.warn('BVH indisponível',e);return null;}),import(DEC_URL)]);
    if(this._dead)return;
    this.T=T;this.MeshBVH=BVH&&BVH.MeshBVH;this.Dec=DEC.MeshoptDecoder;await this.Dec.ready;
    if(this.opt.workers)this.Dec.useWorkers(Math.max(1,Math.min(this.opt.workers,(navigator.hardwareConcurrency||2)-1)));
    const canvas=document.createElement('canvas');
    canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:none;cursor:grab';
    canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Cena 3D do corpo humano. A lista de sistemas oferece o mesmo acesso pelo teclado.');
    this.appendChild(canvas);this.canvas=canvas;
    let r;try{r=new T.WebGLRenderer({canvas,antialias:this.opt.aa===true,powerPreference:'high-performance',preserveDrawingBuffer:false});}catch(e){this.emit('error',{message:'webgl'});return;}
    if(!r.getContext()){this.emit('error',{message:'webgl'});return;}
    this.renderer=r;const dp=window.devicePixelRatio||1;this.maxDpr=this.opt.aa===true?Math.min(dp,1.75):Math.min(2,Math.max(dp,dp*(this.opt.ss||1.35)));r.setPixelRatio(this.maxDpr);
    r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
    r.shadowMap.enabled=this.opt.shadow!=='off';r.shadowMap.type=this.opt.shadow==='pcf'?T.PCFShadowMap:T.PCFSoftShadowMap;r.shadowMap.autoUpdate=!this.opt.shadowCache;
    // sem preserveDrawingBuffer: capturas (toDataURL/toBlob) renderizam o quadro na mesma tarefa da leitura
    const tdu=canvas.toDataURL.bind(canvas),tbl=canvas.toBlob.bind(canvas);
    canvas.toDataURL=(...a)=>{this.renderNow();return tdu(...a)};canvas.toBlob=(...a)=>{this.renderNow();return tbl(...a)};
    this.state={focus:null,vis:{},dim:0.15,isolate:false,skin:true,muscle:0.4,sel:null,micro:false};
    this.buildScene();this.bindControls();
    this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this);this.resize();
    this.loop();
    this.emit('boot',{});
    await this.load();
  }

  buildScene(){
    const T=this.T;const s=new T.Scene();this.scene=s;
    s.background=new T.Color(0x0c2238);s.fog=new T.Fog(0x0c2238,5.5,13);
    const env=new T.Scene();env.background=new T.Color(0x1a3654);
    const panel=(w,h,x,y,z,ry,rx,c,i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);env.add(m);};
    panel(6,2,0,5,0,0,Math.PI/2,0xeaf4ff,3.2);panel(2.5,4,-4,2,1,Math.PI/2,0,0xbfe0ff,1.6);panel(2.5,4,4,2,-1,-Math.PI/2,0,0x9fd0ff,1.1);panel(4,1.2,0,1,-5,0,0,0x7fc6ff,0.8);
    this.pmrem=new T.PMREMGenerator(this.renderer);this.envRT=this.pmrem.fromScene(env,0.04);s.environment=this.envRT.texture;s.environmentIntensity=0.55;
    env.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});this.pmrem.dispose();this.pmrem=null;
    const room=new T.Group();s.add(room);
    const floor=new T.Mesh(new T.CircleGeometry(9,96),new T.MeshStandardMaterial({color:0x163552,roughness:0.32,metalness:0.15}));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;room.add(floor);
    const wallM=new T.MeshStandardMaterial({color:0x122d4b,roughness:0.85});
    const back=new T.Mesh(new T.PlaneGeometry(18,7),wallM);back.position.set(0,3.5,-5.2);back.receiveShadow=true;room.add(back);
    [-1,1].forEach(sd=>{const w=new T.Mesh(new T.PlaneGeometry(14,7),wallM);w.position.set(sd*6.4,3.5,0);w.rotation.y=-sd*Math.PI/2;room.add(w);});
    const slats=new T.InstancedMesh(new T.BoxGeometry(0.05,5.2,0.08),new T.MeshStandardMaterial({color:0x183a5c,roughness:0.6}),17);
    const dm=new T.Object3D();for(let i=-8;i<=8;i++){dm.position.set(i*0.55,2.6,-5.12);dm.updateMatrix();slats.setMatrixAt(i+8,dm.matrix);}room.add(slats);
    const glowM=new T.MeshBasicMaterial({color:0xcfeaff});
    const strip=new T.Mesh(new T.BoxGeometry(9,0.035,0.035),glowM);strip.position.set(0,5.1,-5.05);room.add(strip);
    [-1,1].forEach(sd=>{const p=new T.Mesh(new T.PlaneGeometry(0.04,4.2),glowM);p.position.set(sd*3.2,2.4,-5.08);room.add(p);});
    const ceil=new T.Mesh(new T.PlaneGeometry(3.2,1.2),new T.MeshBasicMaterial({color:0xe6f3ff}));ceil.position.set(0,5.4,0.4);ceil.rotation.x=Math.PI/2;room.add(ceil);
    const plat=new T.Mesh(new T.CylinderGeometry(0.62,0.66,0.045,96),new T.MeshStandardMaterial({color:0x1d4368,roughness:0.28,metalness:0.2}));plat.position.y=0.0225;plat.receiveShadow=true;room.add(plat);
    const ring=new T.Mesh(new T.TorusGeometry(0.64,0.004,8,160),new T.MeshBasicMaterial({color:0x31b8d6}));ring.rotation.x=Math.PI/2;ring.position.y=0.046;room.add(ring);
    // placas na parede do fundo: UNIFEI à direita do corpo, IMC à esquerda (a cena só redesenha sob demanda: dirty ao carregar a textura)
    // [arquivo, largura, altura/largura, x, y]
    for(const [file,w,ar,x,y] of [['img/unifei.png',1.5,900/1024,1.7,1.45],['img/imc.png',2.1,544/1024,-4.75,1.45]]){
      const plaque=new T.Mesh(new T.PlaneGeometry(w,w*ar),new T.MeshBasicMaterial({transparent:true,visible:false}));plaque.position.set(x,y,-5.02);room.add(plaque);
      new T.TextureLoader().load(new URL(file,document.baseURI).href,tx=>{if(this._dead){tx.dispose();return;}tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=this.renderer.capabilities.getMaxAnisotropy();plaque.material.map=tx;plaque.material.visible=true;plaque.material.needsUpdate=true;this.dirty=true;},undefined,e=>console.warn('placa indisponível: '+file,e));
    }
    room.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){o.matrixAutoUpdate=false;o.updateMatrix();}});
    s.add(new T.HemisphereLight(0xd4e9ff,0x0a1828,0.55));
    const key=new T.DirectionalLight(0xffffff,2.1);key.position.set(1.6,3.6,2.4);key.castShadow=true;this.keyLight=key;
    key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-1.3,right:1.3,top:2.1,bottom:-0.2,near:0.5,far:9});key.shadow.bias=-0.0004;key.shadow.normalBias=0.02;
    key.target.position.set(0,0.9,0);s.add(key,key.target);
    const rim=new T.DirectionalLight(0x86d8ff,1.5);rim.position.set(-1.8,2.4,-2.6);s.add(rim);
    const fill=new T.DirectionalLight(0xa9c6ff,0.45);fill.position.set(-2.5,1.4,1.5);s.add(fill);
    this.body=new T.Group();s.add(this.body);
    this.camera=new T.PerspectiveCamera(38,1,0.02,40);
    this.home={t:new T.Vector3(0,0.95,0),r:3.2,th:0.38,ph:1.43};
    this.cm={t:this.home.t.clone(),r:this.home.r,th:this.home.th,ph:this.home.ph};
    this.cd={t:this.home.t.clone(),r:this.home.r,th:this.home.th,ph:this.home.ph};
    this.lim={r:[0.3,4.3],ph:[0.12,1.58],t:[[-0.5,0.5],[0.08,1.75],[-0.32,0.32]]};
    // posições quantizadas (u16 normalizado) → metros
    this.M=new T.Matrix4().set(0.8,0,0,-0.4, 0,0,1.8,-0.042, 0,-0.8,0,0.305, 0,0,0,1);this.Minv=this.M.clone().invert();
    this.G={};this.parts=[];this.sysParts={};this.chunkState={};this.chunkQ=[];this.bvhQ=[];
    this.ray=new T.Raycaster();this.ptr=new T.Vector2();this._lr=new T.Ray();this._frus=new T.Frustum();this._pm=new T.Matrix4();this._cand=[];this._v=new T.Vector3();
    this.pickList=[];this.pickDirty=true;this.partsDirty=true;this.shadowDirty=true;
    this.ovH=this.mkOverlay(0x2a6fd6);this.ovS=this.mkOverlay(0x31b8d6);
    this.dirty=true;this.anim=true;this.dprCur=this.maxDpr;this.lastMove=0;this.ema=16;this.movingFrames=0;
  }

  mkMats(key){
    const T=this.T;const sys=key.replace(/_v$|_w$/,'');const c=key.endsWith('_v')?VEIN:COL[sys];
    const phys=this.opt.mats==='physical'||sys==='cardiovascular'||sys==='tegumentar';
    let P;
    if(phys){P={roughness:0.42,clearcoat:0.35,clearcoatRoughness:0.35};
      if(sys==='muscular')Object.assign(P,{roughness:0.5,clearcoat:0.18,sheen:0.6,sheenColor:0xa8ccff,sheenRoughness:0.5});
      if(sys==='esqueletico')Object.assign(P,{roughness:0.62,clearcoat:0.05});
      if(sys==='cardiovascular')Object.assign(P,{roughness:0.33,clearcoat:0.6});
      if(sys==='tegumentar')Object.assign(P,{roughness:0.18,clearcoat:0.8});}
    else P={roughness:sys==='muscular'?0.47:sys==='esqueletico'?0.6:0.37};
    const make=tr=>{const o=Object.assign({color:c,metalness:0,side:T.DoubleSide},P);
      if(sys==='tegumentar')Object.assign(o,{transparent:true,opacity:0.16,depthWrite:false});
      else if(tr){if(this.opt.alphaHash&&sys==='muscular')Object.assign(o,{alphaHash:true});else o.transparent=true;}
      const m=phys?new T.MeshPhysicalMaterial(o):new T.MeshStandardMaterial(o);
      if(this.opt.singlePass&&(o.transparent))m.forceSinglePass=true;
      // transparente + DoubleSide = 2 passes. Pele (superfície fechada única) usa FrontSide com opacidade compensada.
      // Músculos ficam DoubleSide: a interpenetração entre músculos gera fragmentos com face única (testado).
      if(this.opt.singleSide&&o.transparent&&(sys==='tegumentar'||this.opt.singleSide==='all'))m.side=T.FrontSide;
      // normais voltadas para a câmera (faceforward) em vez de gl_FrontFacing: triângulos com winding invertido no BodyParts3D não escurecem
      const FF='#include <normal_fragment_begin>\n#ifndef FLAT_SHADED\nnormal=normalize(vNormal);normal=dot(normal,vViewPosition)<0.0?-normal:normal;nonPerturbedNormal=normal;\n#endif\n';
      const ff=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',FF);};
      m.onBeforeCompile=ff;m.customProgramCacheKey=()=>'av-ff';
      if(sys==='tegumentar'){m.onBeforeCompile=sh=>{ff(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat frs=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.2);totalEmissiveRadiance+=vec3(0.32,0.68,1.0)*frs*0.55;diffuseColor.a=clamp(diffuseColor.a+frs*diffuseColor.a*2.2,0.0,1.0);');};m.customProgramCacheKey=()=>'av-skin-ff';}
      else if(!phys&&sys==='muscular'){m.onBeforeCompile=sh=>{ff(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat rimF=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0);totalEmissiveRadiance+=vec3(0.62,0.78,1.0)*rimF*0.14;');};m.customProgramCacheKey=()=>'av-musc-ff';}
      return m;};
    const o=make(false),t=sys==='tegumentar'?o:make(true);
    return{key,sys,o,t,cur:sys==='tegumentar'?'t':'o',batches:[],meshes:[],rb:{},base:null,visOn:true,u:{op:sys==='tegumentar'?0.16:1,tgt:1,em:0,emT:0}};
  }
  grp(key){return this.G[key]||(this.G[key]=this.mkMats(key));}
  setVariant(G,v){if(G.cur===v)return;G.cur=v;const m=v==='t'?G.t:G.o;for(const b of G.batches)b.material=m;for(const me of G.meshes)me.material=m;}

  mkOverlay(em){
    const T=this.T;const m=new T.MeshStandardMaterial({color:0xffffff,roughness:0.4,metalness:0,side:T.DoubleSide,emissive:em,emissiveIntensity:0.55,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
    const mesh=new T.Mesh(new T.BufferGeometry(),m);m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n#ifndef FLAT_SHADED\nnormal=normalize(vNormal);normal=dot(normal,vViewPosition)<0.0?-normal:normal;nonPerturbedNormal=normal;\n#endif\n');};m.customProgramCacheKey=()=>'av-ff';mesh.matrixAutoUpdate=false;mesh.matrix.copy(this.M);mesh.frustumCulled=false;mesh.visible=false;mesh.renderOrder=5;this.body.add(mesh);
    return{mesh,part:null,geos:new Map()};
  }
  overlayGeo(O,b){let g=O.geos.get(b);if(!g){const T=this.T;g=new T.BufferGeometry();g.setAttribute('position',b.geometry.getAttribute('position'));g.setAttribute('normal',b.geometry.getAttribute('normal'));g.setIndex(b.geometry.getIndex());O.geos.set(b,g);}return g;}
  refreshOverlay(O){
    const P=O.part;const hide=!P||!P.vis||P.lvl<0||(O===this.ovH&&P===this.ovS.part);
    if(hide){if(O.mesh.visible){O.mesh.visible=false;this.dirty=true;}return;}
    const g=P.g[P.lvl];if(!g){O.mesh.visible=false;return;}
    if(this.opt.batch){const geo=this.overlayGeo(O,g.batch);const r=g.batch.getGeometryRangeAt(g.gid);geo.setDrawRange(r.start,r.count);O.mesh.geometry=geo;}
    else O.mesh.geometry=g.geo;
    O.mesh.material.color.setHex(P.key.endsWith('_v')?VEIN:COL[P.s]);O.mesh.visible=true;this.dirty=true;
  }
  setOverlay(O,P){if(O.part===P)return;O.part=P;this.refreshOverlay(O);if(O===this.ovS)this.refreshOverlay(this.ovH);}

  async load(){
    const T=this.T;
    const man=await (await fetch(new URL(MAN_URL,document.baseURI))).json();if(this._dead)return;this.man=man;
    const counts={};
    man.parts.forEach((p,i)=>{p.i=i;counts[p.s]=(counts[p.s]||0)+1;
      let key=p.s;if(p.s==='cardiovascular'&&/vein|vena|sinus/.test(p.n))key+='_v';if(p.n==='wall of heart')key='cardiovascular_w';
      const b=p.bb;const c=new T.Vector3((b[0]+b[3])/2000,((b[2]+b[5])/2+13)/1000+0.045,-((b[1]+b[4])/2+95)/1000);
      const rad=Math.hypot(b[3]-b[0],b[4]-b[1],b[5]-b[2])/2000;
      const lbox=new T.Box3(new T.Vector3((b[0]+400)/800,(b[1]+400)/800,(b[2]+100)/1800),new T.Vector3((b[3]+400)/800,(b[4]+400)/800,(b[5]+100)/1800));
      const P={i,p,key,s:p.s,c,size:Math.max(b[3]-b[0],b[4]-b[1],b[5]-b[2])/1000,r:rad,sph:new T.Sphere(c,rad),lbox,g:[null,null,null],lvl:-1,lvlW:2,vis:false,base:null,l0b:null,l0i:null,loadedAny:false};
      P.err=[0,1,2].map(L=>p.lv[this.dl(P,L)].e||0);
      this.parts.push(P);(this.sysParts[p.s]=this.sysParts[p.s]||[]).push(P);this.grp(key);
    });
    const rf=man.parts.find(p=>p.n==='right femur');this.rightSign=rf?Math.sign(rf.bb[0]+rf.bb[3])||-1:-1;
    this.heartP=this.parts.find(P=>P.p.n==='wall of heart')||null;
    if(this.opt.batch){
      for(const k in this.G){const G=this.G[k];let v=0,ix=0,n=0;
        for(const P of this.parts){if(P.key!==k)continue;n++;for(let L=0;L<3;L++){const d=P.p.lv[L];if(d&&man.files[d.f].kind!==0){v+=d.nv;ix+=d.ni;}}}
        if(n)G.base=this.mkBatch(G,n,v,ix);}
    }
    this.counts=counts;this.applyState();
    const fk=k=>man.files.map((f,i)=>i).filter(i=>man.files[i].kind===k);
    this.bytesTotal=[...fk(2),...fk(1)].reduce((a,i)=>a+man.files[i].bytes,0);this.bytesDone=0;
    await this.loadFiles(fk(2),'Carregando visão geral do corpo');if(this._dead)return;
    await this.precompile();if(this._dead)return;
    this.partsDirty=true;this.dirty=true;this.emit('ready',{counts});
    await this.loadFiles(fk(1),'Carregando detalhes');if(this._dead)return;
    this.loaded=true;this.emit('progress',{pct:100,label:'Modelo completo',counts,done:true});this.emitState(true);
    this.scheduleIdle();
  }
  dl(P,L){const lv=P.p.lv;for(let k=L;k<3;k++)if(lv[k])return k;for(let k=L-1;k>=0;k--)if(lv[k])return k;return 0;}

  mkBatch(G,n,v,ix){
    const T=this.T;const b=new T.BatchedMesh(n,Math.max(v,3),Math.max(ix,3),G.cur==='t'?G.t:G.o);
    b.sortObjects=true;b.perObjectFrustumCulled=true;b.frustumCulled=false;b.castShadow=G.sys!=='tegumentar';b.receiveShadow=G.sys==='esqueletico';
    b.renderOrder=RO[G.sys]||0;b.matrixAutoUpdate=false;b.visible=G.visOn;this.body.add(b);G.batches.push(b);return b;
  }

  async loadFiles(idxs,label){
    if(!idxs.length)return;const man=this.man;const set=new Set(idxs);
    if(label)this.emit('progress',{pct:Math.round(this.bytesDone/this.bytesTotal*100),label,counts:this.counts});
    const bufs={};await Promise.all(idxs.map(async i=>{const r=await fetch(new URL(man.files[i].url,document.baseURI));bufs[i]=new Uint8Array(await r.arrayBuffer());}));
    if(this._dead)return;
    const items=[];for(const P of this.parts)for(let L=0;L<3;L++){const d=P.p.lv[L];if(d&&set.has(d.f)&&!P.g[L])items.push({P,L,d});}
    if(this.opt.batch){const caps={};for(const it of items){const f=man.files[it.d.f];if(f.kind!==0)continue;const k=it.P.key+'@'+f.rg;const c=caps[k]||(caps[k]={G:this.G[it.P.key],rg:f.rg,n:0,v:0,i:0});c.n++;c.v+=it.d.nv;c.i+=it.d.ni;}
      for(const k in caps){const c=caps[k];if(!c.G.rb[c.rg])c.G.rb[c.rg]=this.mkBatch(c.G,c.n,c.v,c.i);}}
    let t=performance.now();
    for(let s=0;s<items.length;s+=48){
      const wave=items.slice(s,s+48);const dec=await Promise.all(wave.map(it=>this.decode(it,bufs[it.d.f])));if(this._dead)return;
      for(let j=0;j<wave.length;j++){this.addLevel(wave[j],dec[j]);if(performance.now()-t>6){await tick0();if(this._dead)return;t=performance.now();}}
      if(label){const frac=Math.min(1,(s+wave.length)/items.length);const bytes=idxs.reduce((a,i)=>a+man.files[i].bytes,0);this.emit('progress',{pct:Math.round((this.bytesDone+bytes*frac)/this.bytesTotal*100),label,counts:this.counts});}
    }
    if(label)this.bytesDone+=idxs.reduce((a,i)=>a+man.files[i].bytes,0);
    this.partsDirty=true;this.shadowDirty=true;this.dirty=true;
  }
  async decode(it,u8){
    const d=it.d,D=this.Dec,o=d.o;
    const [pb,nb,ib]=await Promise.all([D.decodeGltfBufferAsync(d.nv,8,u8.subarray(o[0],o[0]+o[1]),'ATTRIBUTES'),D.decodeGltfBufferAsync(d.nv,4,u8.subarray(o[2],o[2]+o[3]),'ATTRIBUTES'),D.decodeGltfBufferAsync(d.ni,d.isz,u8.subarray(o[4],o[4]+o[5]),'TRIANGLES')]);
    const p4=new Uint16Array(pb.buffer,pb.byteOffset,d.nv*4),n4=new Int8Array(nb.buffer,nb.byteOffset,d.nv*4);
    const pos=new Uint16Array(d.nv*3),nrm=new Int8Array(d.nv*3);
    for(let i=0,j=0,k=0;i<d.nv;i++,j+=3,k+=4){pos[j]=p4[k];pos[j+1]=p4[k+1];pos[j+2]=p4[k+2];nrm[j]=n4[k];nrm[j+1]=n4[k+1];nrm[j+2]=n4[k+2];}
    const idx=d.isz===2?new Uint16Array(ib.buffer,ib.byteOffset,d.ni):new Uint32Array(ib.buffer,ib.byteOffset,d.ni);
    return[pos,nrm,idx];
  }
  addLevel(it,[pos,nrm,idx]){
    const T=this.T,P=it.P,L=it.L;const G=this.G[P.key];
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3,true));geo.setAttribute('normal',new T.BufferAttribute(nrm,3,true));geo.setIndex(new T.BufferAttribute(idx,1));
    geo.boundingBox=P.lbox.clone();geo.boundingSphere=P.lbox.getBoundingSphere(new T.Sphere());
    const g={geo,L,bvh:null};
    if(this.opt.batch){const f=this.man.files[it.d.f];const b=f.kind===0?G.rb[f.rg]:G.base;g.batch=b;g.gid=b.addGeometry(geo);
      if(f.kind===0){g.inst=b.addInstance(g.gid);b.setMatrixAt(g.inst,this.M);b.setVisibleAt(g.inst,false);P.l0b=b;P.l0i=g.inst;}
      else if(P.base==null){P.base=b.addInstance(g.gid);P.baseGid=g.gid;b.setMatrixAt(P.base,this.M);b.setVisibleAt(P.base,false);}
      geo.deleteAttribute('normal');}
    else if(!P.mesh){const m=new T.Mesh(geo,G.cur==='t'?G.t:G.o);m.matrixAutoUpdate=false;m.matrix.copy(this.M);m.castShadow=P.s!=='tegumentar';m.receiveShadow=P.s==='esqueletico';m.renderOrder=RO[P.s]||0;m.visible=false;
      m.matrixWorldNeedsUpdate=true;this.body.add(m);G.meshes.push(m);P.mesh=m;}
    P.g[L]=g;P.loadedAny=true;this.bvhQ.push(g);
  }

  requestChunk(rg){if(rg==null||this.chunkState[rg])return;this.chunkState[rg]='q';this.chunkQ.push(rg);this.pumpChunks();}
  async pumpChunks(){
    if(this._pumping||!this.man)return;this._pumping=true;
    while(this.chunkQ.length&&!this._dead){
      const cp=this.cm.t;this.chunkQ.sort((a,b)=>this.rgDist(a,cp)-this.rgDist(b,cp));
      const rg=this.chunkQ.shift();const idxs=this.man.files.map((f,i)=>i).filter(i=>this.man.files[i].kind===0&&this.man.files[i].rg===rg);
      try{await this.loadFiles(idxs,null);}catch(e){console.error(e);}
      this.chunkState[rg]='ok';this.partsDirty=true;this.dirty=true;this.scheduleIdle();
    }
    this._pumping=false;
  }
  rgDist(rg,p){if(!this._rgC){this._rgC={};for(const P of this.parts){const a=this._rgC[P.p.rg]||(this._rgC[P.p.rg]={x:0,y:0,z:0,n:0});a.x+=P.c.x;a.y+=P.c.y;a.z+=P.c.z;a.n++;}}const a=this._rgC[rg];return a?Math.hypot(a.x/a.n-p.x,a.y/a.n-p.y,a.z/a.n-p.z):9;}

  scheduleIdle(){
    if(this._idle||this._dead||!this.opt.bvh||!this.MeshBVH)return;
    const ric=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8}),30));
    this._idle=ric(dl=>{this._idle=null;if(this._dead)return;
      this.bvhQ.sort((a,b)=>b.L-a.L);
      while(this.bvhQ.length&&dl.timeRemaining()>3){const g=this.bvhQ.shift();if(!g.bvh&&g.geo)g.bvh=new this.MeshBVH(g.geo);}
      if(this.bvhQ.length)this.scheduleIdle();});
  }

  async precompile(){
    const r=this.renderer;if(!r.compileAsync)return;
    const saved={};for(const k in this.G)saved[k]=this.G[k].cur;
    let ref=null;for(const k in this.G){const G=this.G[k];if(G.base){ref=G.base;break;}}
    for(const O of [this.ovH,this.ovS]){if(this.opt.batch&&ref){const g=this.overlayGeo(O,ref);g.setDrawRange(0,0);O.mesh.geometry=g;}O.mesh.visible=true;}
    try{for(const v of ['t','o']){for(const k in this.G)this.setVariant(this.G[k],v);await r.compileAsync(this.scene,this.camera);}}catch(e){console.warn(e);}
    for(const k in this.G)this.setVariant(this.G[k],saved[k]);
    this.ovH.mesh.visible=this.ovS.mesh.visible=false;this.dirty=true;
  }

  cmd(c){
    if(!this.renderer)return;
    if(c.type==='state'){Object.assign(this.state,c.s||{});this.applyState();if(this.state.micro)this.useMicro(this.state.micro===true?'capilar':this.state.micro);this.updateCursor();}
    else if(c.type==='zoom'){this.cd.r=clamp(this.cd.r*(c.dir>0?0.78:1.28),...this.activeLim().r);}
    else if(c.type==='reset'){if(this.state.micro){const mc=(this.micros&&this.micros[this.microKind]||{}).cam||{t:new this.T.Vector3(),r:2.2};this.mcd={t:mc.t.clone(),r:mc.r,th:0.5,ph:1.25};}else{this.cd={t:this.home.t.clone(),r:this.home.r,th:this.home.th,ph:this.home.ph};}}
    else if(c.type==='view'){const d=this.state.micro?this.mcd:this.cd;const R=this.rightSign<0?-1:1;
      d.th={front:0,back:Math.PI,right:R*Math.PI/2,left:-R*Math.PI/2}[c.v]??0;d.ph=1.5;
      const cur=this.state.micro?this.mcm:this.cm;while(d.th-cur.th>Math.PI)cur.th+=Math.PI*2;while(cur.th-d.th>Math.PI)cur.th-=Math.PI*2;}
    else if(c.type==='frame'){this.frameSys(c.sys);}
    else if(c.type==='part'){this.showParts(c);}
    else if(c.type==='clear'){this.setMulti([]);}
    this.anim=true;this.dirty=true;
  }
  activeLim(){return this.state.micro?{r:[0.55,3.6],ph:[0.2,2.9],t:[[-1,1],[-0.7,0.7],[-0.6,0.6]]}:this.lim;}
  frameSys(sys){
    // sys: um sistema ou uma lista deles
    this.frameParts([].concat(sys).flatMap(x=>this.sysParts[x]||[]),1.85,0.25);
  }
  frameParts(ps,k,pad){
    if(!ps.length)return;const T=this.T;
    const box=new T.Box3();ps.forEach(P=>{const s=P.size/2;box.expandByPoint(P.c.clone().addScalar(s*0.7));box.expandByPoint(P.c.clone().addScalar(-s*0.7));});
    const c=box.getCenter(new T.Vector3()),sz=box.getSize(new T.Vector3());
    const L=this.lim.t;this.cd.t.set(clamp(c.x,...L[0]),clamp(c.y,...L[1]),clamp(c.z,...L[2]));
    this.cd.r=clamp(Math.max(sz.y,sz.x*0.9)*k+pad,0.55,this.home.r);this.anim=true;
  }
  // Destaca e enquadra estruturas: por ids (c.ids) ou pelo nome, em português ou FMA, dentro de um sistema (c.sys + c.q, trechos do nome).
  showParts(c){
    const nm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const qs=(c.q||[]).map(nm);
    const ps=c.ids?this.parts.filter(P=>c.ids.includes(P.p.id)):(this.sysParts[c.sys]||[]).filter(P=>{const a=nm(P.p.pt),b=nm(P.p.n);return qs.some(x=>a.includes(x)||b.includes(x));});
    this.setMulti(ps);this.frameParts(ps,2.3,0.4);
  }
  // seleção de várias estruturas: a primeira usa o overlay de seleção; as demais, overlays extras (até 8)
  setMulti(ps){
    this.setOverlay(this.ovS,ps[0]||null);this.ovX=this.ovX||[];
    for(let i=0;i<Math.max(this.ovX.length,ps.length-1)&&i<8;i++){if(!this.ovX[i])this.ovX[i]=this.mkOverlay(0x31b8d6);this.setOverlay(this.ovX[i],ps[i+1]||null);}
  }
  applyState(){
    const S=this.state;const f=S.focus;
    for(const k in this.G){const G=this.G[k];const sys=G.sys;
      let vis=S.vis[sys]!==false;if(sys==='tegumentar'&&!S.skin)vis=false;if(sys==='muscular'&&S.muscle<=0.01)vis=false;
      if(S.isolate&&f&&sys!==f&&sys!=='tegumentar')vis=false;
      if(sys==='tegumentar'&&f!=='tegumentar'&&this.skinFactor()<=0.25)vis=false;
      let base=sys==='tegumentar'?0.16*this.skinFactor():sys==='muscular'?S.muscle:1;
      if(k==='cardiovascular_w')base*=this.heartCut||1;
      let op=base;
      if(f){if(sys===f)op=sys==='tegumentar'?0.6:(sys==='muscular'?Math.max(base,0.85):base);else op=sys==='tegumentar'?base*0.6:base*S.dim;}
      const t=vis?op:0;if(Math.abs(t-G.u.tgt)>1e-4||G.u.emT!==(f&&sys===f?1:0)){G.u.tgt=t;G.u.emT=f&&sys===f?1:0;this.pickDirty=true;}}
    if(f!==this._lastFocus){this._lastFocus=f;this.partsDirty=true;this.pickDirty=true;}
    this.anim=true;this.dirty=true;
  }
  skinFactor(){const r=this.cm?this.cm.r:3;return clamp((r-0.55)/1.2,0.18,1);}

  updateParts(){
    if(!this.parts.length||!this.man)return;this.partsDirty=false;
    const cam=this.camera,cp=cam.position,S=this.state;
    const vh=(this.clientHeight||1)*(window.devicePixelRatio||1);const pxPerM=vh/(2*Math.tan(cam.fov*Math.PI/360));
    this._frus.setFromProjectionMatrix(this._pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
    let changed=false;
    for(const P of this.parts){if(!P.loadedAny)continue;const G=this.G[P.key];
      const dc=cp.distanceTo(P.c);const small=P.size/dc<0.0045&&S.focus!==P.s;const vis=G.visOn&&!small;
      let want=0;
      if(this.opt.lod){const d=Math.max(0.02,dc-P.r);
        const tau=this.opt.tau||TAU;for(let L=2;L>=1;L--)if(P.err[L]*pxPerM/d<=tau){want=L;break;}
        if(want>P.lvlW){let w2=P.lvlW;for(let L=want;L>P.lvlW;L--)if(P.err[L]*pxPerM/d<=tau*TAU_OUT){w2=L;break;}want=w2;}
        if(want<1&&!this._frus.intersectsSphere(P.sph))want=1;}
      P.lvlW=want;
      const dL=vis?this.resolve(P,want):P.lvl;
      const v=vis&&dL>=0;
      if(v!==P.vis||(v&&dL!==P.lvl)){this.apply(P,dL,v);changed=true;}
    }
    if(changed){this.shadowDirty=true;this.pickDirty=true;this.dirty=true;this.refreshOverlay(this.ovH);this.refreshOverlay(this.ovS);(this.ovX||[]).forEach(O=>this.refreshOverlay(O));}
  }
  resolve(P,want){
    const d=this.dl(P,want);if(P.g[d])return d;
    const lv=P.p.lv[d];if(lv&&this.man.files[lv.f].kind===0)this.requestChunk(P.p.rg);
    for(let k=d+1;k<3;k++)if(P.g[k])return k;for(let k=d-1;k>=0;k--)if(P.g[k])return k;return -1;
  }
  apply(P,dL,vis){
    if(this.opt.batch){
      const g=dL>=0?P.g[dL]:null;const inBase=!!g&&g.batch!==P.l0b;
      if(P.base!=null){const b=this.G[P.key].base;const on=vis&&inBase;if(on&&P.baseGid!==g.gid){b.setGeometryIdAt(P.base,g.gid);P.baseGid=g.gid;}b.setVisibleAt(P.base,on);}
      if(P.l0i!=null)P.l0b.setVisibleAt(P.l0i,vis&&!!g&&!inBase);
    }else if(P.mesh){P.mesh.visible=vis;if(vis&&P.g[dL]&&P.mesh.geometry!==P.g[dL].geo)P.mesh.geometry=P.g[dL].geo;}
    P.lvl=dL;P.vis=vis;
  }

  bindControls(){
    const cv=this.canvas;const P=new Map();let mode=null,moved=0,last=null,pinch=null;
    const act=()=>this.state.micro?this.mcd:this.cd;
    const L=this._L=[];const on=(t,f,o)=>{cv.addEventListener(t,f,o);L.push([t,f,o]);};
    on('contextmenu',e=>e.preventDefault());
    on('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;
      if(P.size===1){mode=(e.shiftKey||e.button===2||e.button===1)?'pan':'orbit';last={x:e.clientX,y:e.clientY};}
      if(P.size===2){const a=[...P.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m:{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}};mode='pinch';}
      cv.style.cursor=mode==='pan'?'move':'grabbing';});
    on('pointermove',e=>{
      if(!P.has(e.pointerId)){if(!this.state.micro){this.hev={clientX:e.clientX,clientY:e.clientY};this.hoverReq=true;this.ptrIn=true;}return;}
      P.set(e.pointerId,{x:e.clientX,y:e.clientY});const d=act();const h=cv.clientHeight||1;
      if(mode==='pinch'&&P.size>=2){const a=[...P.values()];const dd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);const mm={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};
        d.r=clamp(d.r*pinch.d/Math.max(dd,1),...this.activeLim().r);this.pan(mm.x-pinch.m.x,mm.y-pinch.m.y);pinch={d:dd,m:mm};moved+=10;}
      else if(last){const dx=e.clientX-last.x,dy=e.clientY-last.y;moved+=Math.abs(dx)+Math.abs(dy);last={x:e.clientX,y:e.clientY};
        if(moved>5){this.dragging=true;if(mode==='orbit'){d.th-=dx/h*3.2;d.ph=clamp(d.ph-dy/h*2.6,...this.activeLim().ph);}else this.pan(dx,dy);}}
      this.anim=true;});
    const up=e=>{const wasTap=P.size===1&&moved<=5&&mode!=='pinch';P.delete(e.pointerId);
      if(P.size===0){if(wasTap&&e.type==='pointerup')this.tap(e);mode=null;last=null;pinch=null;this.dragging=false;this.hev={clientX:e.clientX,clientY:e.clientY};this.hoverReq=e.pointerType==='mouse';this.updateCursor();}
      else if(P.size===1){const a=[...P.values()][0];last={x:a.x,y:a.y};mode='orbit';}};
    on('pointerup',up);on('pointercancel',up);
    on('pointerleave',()=>{this.ptrIn=false;this.hoverReq=false;if(!P.size&&this.hoverId!=null){this.hoverId=null;this.setOverlay(this.ovH,null);this.emit('hover',null);this.updateCursor();}});
    on('wheel',e=>{e.preventDefault();const d=act();d.r=clamp(d.r*Math.exp(e.deltaY*0.0012),...this.activeLim().r);this.anim=true;},{passive:false});
    on('dblclick',e=>{if(this.state.micro)return;const h=this.pick(e);if(h){const L=this.lim.t;this.cd.t.set(clamp(h.point.x,...L[0]),clamp(h.point.y,...L[1]),clamp(h.point.z,...L[2]));this.cd.r=Math.min(this.cd.r,1.1);this.anim=true;}});
    on('keydown',e=>{const d=act();const k=e.key;
      if(k==='ArrowLeft')d.th+=0.15;else if(k==='ArrowRight')d.th-=0.15;else if(k==='ArrowUp')d.ph=clamp(d.ph-0.1,...this.activeLim().ph);else if(k==='ArrowDown')d.ph=clamp(d.ph+0.1,...this.activeLim().ph);
      else if(k==='+'||k==='=')d.r=clamp(d.r*0.85,...this.activeLim().r);else if(k==='-')d.r=clamp(d.r*1.18,...this.activeLim().r);else return;e.preventDefault();this.anim=true;});
  }
  updateCursor(){if(this.canvas)this.canvas.style.cursor=this.hoverId!=null&&!this.state.micro?'pointer':'grab';}
  pan(dx,dy){const T=this.T;const d=this.state.micro?this.mcd:this.cd;const h=this.canvas.clientHeight||1;
    const s=d.r*Math.tan(this.camera.fov*Math.PI/360)*2/h;const cam=this.camera;
    const right=new T.Vector3().setFromMatrixColumn(cam.matrix,0),upv=new T.Vector3().setFromMatrixColumn(cam.matrix,1);
    d.t.addScaledVector(right,-dx*s).addScaledVector(upv,dy*s);const L=this.activeLim().t;
    d.t.set(clamp(d.t.x,...L[0]),clamp(d.t.y,...L[1]),clamp(d.t.z,...L[2]));}

  rebuildPickable(){const S=this.state;this.pickList=this.parts.filter(P=>P.vis&&P.lvl>=0&&this.G[P.key].u.tgt>0.3&&(P.s!=='tegumentar'||S.focus==='tegumentar'));this.pickDirty=false;}
  pick(e){if(!this.canvas||!this.parts.length)return null;const rect=this.canvas.getBoundingClientRect();return this.pickNDC((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);}
  pickNDC(x,y){
    if(this.pickDirty)this.rebuildPickable();
    this.ptr.set(x,y);this.ray.setFromCamera(this.ptr,this.camera);const wr=this.ray.ray;const lr=this._lr.copy(wr).applyMatrix4(this.Minv);
    const C=this._cand;C.length=0;const o=wr.origin,dir=wr.direction;
    for(const P of this.pickList){const c=P.sph.center;const ox=c.x-o.x,oy=c.y-o.y,oz=c.z-o.z;const tca=ox*dir.x+oy*dir.y+oz*dir.z;const d2=ox*ox+oy*oy+oz*oz-tca*tca;const r2=P.r*P.r;if(d2>r2)continue;const thc=Math.sqrt(r2-d2);if(tca+thc<0)continue;C.push([Math.max(0,tca-thc),P]);}
    C.sort((a,b)=>a[0]-b[0]);
    let best=null;
    for(const [d,P] of C){if(best&&d>best.distance)break;if(!lr.intersectsBox(P.lbox))continue;const hit=this.rayPart(P,lr,wr);
      if(hit&&(!best||hit.distance<best.distance))best=hit;}
    return best;
  }
  rayPart(P,lr,wr){
    const g=P.g[P.lvl];if(!g)return null;const T=this.T;
    if(this.opt.bvh&&this.MeshBVH){if(!g.bvh)g.bvh=new this.MeshBVH(g.geo);const h=g.bvh.raycastFirst(lr,T.DoubleSide);if(!h)return null;const w=h.point.clone().applyMatrix4(this.M);return{part:P,point:w,distance:w.distanceTo(wr.origin)};}
    const m=this._tm||(this._tm=new T.Mesh(undefined,new T.MeshBasicMaterial({side:T.DoubleSide})));m.geometry=g.geo;m.matrixWorld.copy(this.M);const hits=[];m.raycast(this.ray,hits);if(!hits.length)return null;hits.sort((a,b)=>a.distance-b.distance);return{part:P,point:hits[0].point,distance:hits[0].distance};
  }
  doHover(){const h=this.pick(this.hev);const P=h?h.part:null;const id=P?P.i:null;
    if(id!==this.hoverId){this.hoverId=id;this.setOverlay(this.ovH,P);this.emit('hover',P?this.partInfo(P):null);this.updateCursor();}}
  partInfo(P){const p=P.p;return{id:p.id,sys:p.s,n:p.n,pt:p.pt};}
  tap(e){if(this.state.micro)return;const h=this.pick(e);this.emit('select',h?this.partInfo(h.part):null);this.setMulti(h?[h.part]:[]);}

  buildMicro(){
    const T=this.T;const s=new T.Scene();s.background=new T.Color(0x0b1f33);s.fog=new T.Fog(0x0b1f33,2.2,6.5);s.environment=this.scene.environment;s.environmentIntensity=0.5;
    s.add(new T.HemisphereLight(0xd4e9ff,0x0a1828,0.7));const k=new T.DirectionalLight(0xffffff,1.8);k.position.set(1,2,2);s.add(k);const rl=new T.DirectionalLight(0x86d8ff,1);rl.position.set(-2,1,-2);s.add(rl);
    const rnd=(()=>{let x=7;return()=>(x=(x*16807)%2147483647)/2147483647;})();
    const wave=(y,z,ph)=>{const pts=[];for(let i=0;i<=8;i++){const x=-1.5+i*3/8;pts.push(new T.Vector3(x,y+Math.sin(i*0.9+ph)*0.05,z+Math.cos(i*0.7+ph)*0.05));}return new T.CatmullRomCurve3(pts);};
    const art=wave(0.42,-0.05,0),ven=wave(-0.42,0.05,1.3);
    const mA=new T.MeshPhysicalMaterial({color:0xc7404d,roughness:0.3,clearcoat:0.7}),mV=new T.MeshPhysicalMaterial({color:0x3d62b4,roughness:0.3,clearcoat:0.7});
    s.add(new T.Mesh(new T.TubeGeometry(art,120,0.075,24),mA),new T.Mesh(new T.TubeGeometry(ven,120,0.09,24),mV));
    const cA=new T.Color(0xd4545f),cV=new T.Color(0x5277c6);const capM=new T.MeshPhysicalMaterial({vertexColors:true,roughness:0.35,clearcoat:0.5,transparent:true,opacity:0.95});
    this.caps=[];
    for(let i=0;i<30;i++){const t=0.04+i/30*0.92;const a=art.getPoint(t),v=ven.getPoint(clamp(t+(rnd()-0.5)*0.08,0,1));
      const z=(rnd()-0.5)*0.7;const pts=[a,new T.Vector3(a.x+(rnd()-0.5)*0.12,0.18,z*0.7),new T.Vector3(a.x+(rnd()-0.5)*0.16,-0.02,z),new T.Vector3(v.x+(rnd()-0.5)*0.12,-0.2,z*0.7),v];
      const cu=new T.CatmullRomCurve3(pts);const g=new T.TubeGeometry(cu,48,0.013,8);const uv=g.attributes.uv,cols=new Float32Array(uv.count*3);
      for(let j=0;j<uv.count;j++){const c=cA.clone().lerp(cV,uv.getX(j));cols[j*3]=c.r;cols[j*3+1]=c.g;cols[j*3+2]=c.b;}
      g.setAttribute('color',new T.BufferAttribute(cols,3));s.add(new T.Mesh(g,capM));this.caps.push(cu);}
    const fM=new T.MeshPhysicalMaterial({color:0x5a82c0,roughness:0.55,sheen:0.6,sheenColor:0xa8ccff,transparent:true,opacity:0.32,depthWrite:false});
    const fG=new T.CapsuleGeometry(0.13,3,8,24);for(let i=0;i<7;i++){const f=new T.Mesh(fG,fM);f.rotation.z=Math.PI/2;f.position.set(0,-0.75+i*0.25,-0.55-(i%2)*0.08);s.add(f);}
    const N=140;const inst=new T.InstancedMesh(new T.SphereGeometry(0.018,14,10),new T.MeshPhysicalMaterial({color:0xd44a55,roughness:0.4,clearcoat:0.4}),N);this.rbc=[];for(let i=0;i<N;i++)this.rbc.push({c:i%this.caps.length,t:rnd(),sp:0.05+rnd()*0.05});
    s.add(inst);this.rbcMesh=inst;
    this.gas=null;this.gasMesh=null;this.microBox=[3,1.3];
    this.micro=s;this.mcm={t:new T.Vector3(),r:2.2,th:0.5,ph:1.25};this.mcd={t:new T.Vector3(),r:2.2,th:0.5,ph:1.25};
  }
  // Troca a ampliação didática em uso ('capilar' ou 'alveolo'), construindo a cena na primeira vez.
  useMicro(kind){
    if(this.microKind===kind)return;this.microKind=kind;this.micros=this.micros||{};
    let m=this.micros[kind];
    if(!m){
      this.microReady=false;if(kind==='alveolo')this.buildAlveolo();else this.buildMicro();
      m=this.micros[kind]={scene:this.micro,caps:this.caps,rbc:this.rbc,inst:this.rbcMesh,gas:this.gas,gasMesh:this.gasMesh,box:this.microBox,cam:{t:this.mcd.t.clone(),r:this.mcd.r}};
      m.cam.r=this.microDist(m.box);this.mcm.r=this.mcd.r=m.cam.r;
      const done=()=>{m.ready=true;if(this.microKind===kind){this.microReady=true;this.dirty=true;}};
      if(this.renderer.compileAsync)this.renderer.compileAsync(m.scene,this.camera).then(done,done);else done();
      return;
    }
    this.micro=m.scene;this.caps=m.caps;this.rbc=m.rbc;this.rbcMesh=m.inst;this.gas=m.gas;this.gasMesh=m.gasMesh;this.microReady=!!m.ready;
    m.cam.r=this.microDist(m.box);
    this.mcm={t:m.cam.t.clone(),r:m.cam.r,th:0.5,ph:1.25};this.mcd={t:m.cam.t.clone(),r:m.cam.r,th:0.5,ph:1.25};this.dirty=true;
  }
  // distância para a caixa [largura, altura] caber na tela atual (campo de visão vertical de 38°), dentro dos limites de zoom
  microDist(box){const tv=Math.tan(19*Math.PI/180),a=this.camera.aspect||1;return clamp(Math.max(box[0]/(2*tv*a),box[1]/(2*tv))*1.12,0.8,3.6);}
  // Ampliação didática do alvéolo, esquemática e fora de escala: um saco alveolar envolto por capilares.
  // O sangue chega pobre em O₂ (azul) e sai rico em O₂ (vermelho); partículas mostram O₂ indo do ar para o sangue e CO₂ no sentido inverso.
  buildAlveolo(){
    const T=this.T;const s=new T.Scene();s.background=new T.Color(0x0b1f33);s.fog=new T.Fog(0x0b1f33,2.6,7);s.environment=this.scene.environment;s.environmentIntensity=0.5;
    s.add(new T.HemisphereLight(0xd4e9ff,0x0a1828,0.7));const k=new T.DirectionalLight(0xffffff,1.8);k.position.set(1,2,2);s.add(k);const rl=new T.DirectionalLight(0x86d8ff,1);rl.position.set(-2,1,-2);s.add(rl);
    const rnd=(()=>{let x=11;return()=>(x=(x*16807)%2147483647)/2147483647;})();
    const Rs=0.62;const grp=new T.Group();grp.scale.setScalar(0.6);s.add(grp);
    const wallM=new T.MeshPhysicalMaterial({color:0xe5a8b4,roughness:0.5,sheen:0.5,sheenColor:0xffd9e0,transparent:true,opacity:0.3,depthWrite:false,side:T.DoubleSide});
    grp.add(new T.Mesh(new T.SphereGeometry(Rs-0.03,48,32),wallM));
    const duct=new T.Mesh(new T.CylinderGeometry(0.17,0.2,1.1,32,1,true),wallM);duct.position.set(0,Rs+0.42,0);grp.add(duct);
    const mBlue=new T.MeshPhysicalMaterial({color:0x3d62b4,roughness:0.3,clearcoat:0.7}),mRed=new T.MeshPhysicalMaterial({color:0xc7404d,roughness:0.3,clearcoat:0.7});
    const feed=new T.CatmullRomCurve3([new T.Vector3(-0.78,-1.5,0.1),new T.Vector3(-0.86,-0.7,0.05),new T.Vector3(-Rs-0.02,0,0)]);
    const drain=new T.CatmullRomCurve3([new T.Vector3(Rs+0.02,0,0),new T.Vector3(0.86,-0.7,-0.05),new T.Vector3(0.78,-1.5,-0.1)]);
    grp.add(new T.Mesh(new T.TubeGeometry(feed,60,0.075,20),mBlue),new T.Mesh(new T.TubeGeometry(drain,60,0.085,20),mRed));
    const cB=new T.Color(0x5277c6),cR=new T.Color(0xd4545f);const capM=new T.MeshPhysicalMaterial({vertexColors:true,roughness:0.35,clearcoat:0.5});
    this.caps=[];const NC=18,Rc=Rs+0.012;
    for(let i=0;i<NC;i++){const ph=i/NC*Math.PI*2+(rnd()-0.5)*0.15;const pts=[];
      for(let j=0;j<=12;j++){const u=j/12;const rad=Rc*Math.sin(Math.PI*u),w=Math.sin(u*Math.PI*3+i)*0.05*Math.sin(Math.PI*u);
        pts.push(new T.Vector3(-Rc*Math.cos(Math.PI*u),rad*Math.cos(ph+w),rad*Math.sin(ph+w)));}
      const cu=new T.CatmullRomCurve3(pts);const g=new T.TubeGeometry(cu,64,0.016,8);const uv=g.attributes.uv,cols=new Float32Array(uv.count*3);
      for(let j=0;j<uv.count;j++){const c=cB.clone().lerp(cR,uv.getX(j));cols[j*3]=c.r;cols[j*3+1]=c.g;cols[j*3+2]=c.b;}
      g.setAttribute('color',new T.BufferAttribute(cols,3));grp.add(new T.Mesh(g,capM));this.caps.push(cu);}
    const N=110;const inst=new T.InstancedMesh(new T.SphereGeometry(0.02,14,10),new T.MeshPhysicalMaterial({color:0xd44a55,roughness:0.4,clearcoat:0.4}),N);this.rbc=[];for(let i=0;i<N;i++)this.rbc.push({c:i%NC,t:rnd(),sp:0.06+rnd()*0.05});
    grp.add(inst);this.rbcMesh=inst;
    // gases: O₂ (ciano) do centro do alvéolo para a parede; CO₂ (âmbar) da parede para o centro
    const NG=90;const gm=new T.InstancedMesh(new T.SphereGeometry(0.016,10,8),new T.MeshBasicMaterial({color:0xffffff}),NG);const o2=new T.Color(0x9fe3f2),co2=new T.Color(0xf0b45a);this.gas=[];
    for(let i=0;i<NG;i++){const z=rnd()*2-1,a=rnd()*Math.PI*2,q=Math.sqrt(1-z*z);const isO2=i%2===0;this.gas.push({d:new T.Vector3(q*Math.cos(a),z,q*Math.sin(a)),t:rnd(),sp:0.12+rnd()*0.1,o2:isO2});gm.setColorAt(i,isO2?o2:co2);}
    gm.instanceColor.needsUpdate=true;grp.add(gm);this.gasMesh=gm;
    // alvo abaixo do centro: no painel da aula, a legenda cobre a parte de baixo da cena
    this.micro=s;this.mcm={t:new T.Vector3(0,-0.25,0),r:2.9,th:0.5,ph:1.25};this.mcd={t:new T.Vector3(0,-0.25,0),r:2.9,th:0.5,ph:1.25};this.microBox=[1.1,1.9];
  }

  resize(){if(!this.renderer)return;const w=this.clientWidth||1,h=this.clientHeight||1;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.dirty=true;this.partsDirty=true;
    const mm=this.state&&this.state.micro&&this.micros&&this.micros[this.microKind];if(mm&&this.mcd){mm.cam.r=this.microDist(mm.box);this.mcd.r=mm.cam.r;}}
  setDpr(v){if(Math.abs(v-this.dprCur)<1e-3)return;this.dprCur=v;this.renderer.setPixelRatio(v);this.dirty=true;}
  renderNow(){if(!this.renderer||this._dead)return;const m=this.state.micro&&this.microReady;if(!m&&this.shadowDirty&&this.opt.shadowCache){this.renderer.shadowMap.needsUpdate=true;this.shadowDirty=false;}this.renderer.render(m?this.micro:this.scene,this.camera);}

  loop(){
    const T=this.T;let prev=performance.now();const dummy=new T.Object3D();const up=new T.Vector3(0,1,0);let wasMoving=false,frame=0;
    const tick=now=>{if(this._dead)return;this._raf=requestAnimationFrame(tick);
      const dtMs=now-prev;const dt=Math.min(0.05,dtMs/1000);prev=now;frame++;
      if(!this.offsetParent&&this.offsetWidth===0)return;
      const micro=this.state.micro&&this.micro&&this.microReady;const cm=micro?this.mcm:this.cm,cd=micro?this.mcd:this.cd;
      const k=1-Math.pow(0.0008,dt);let moving=false;
      const dr=cd.r-cm.r,dth=cd.th-cm.th,dph=cd.ph-cm.ph,dtt=cm.t.distanceTo(cd.t);
      if(Math.abs(dr)>1e-4||Math.abs(dth)>1e-4||Math.abs(dph)>1e-4||dtt>1e-4){cm.r+=dr*k;cm.th+=dth*k;cm.ph+=dph*k;cm.t.lerp(cd.t,k);moving=true;}
      const cam=this.camera;const sp=Math.sin(cm.ph);
      cam.position.set(cm.t.x+cm.r*sp*Math.sin(cm.th),cm.t.y+cm.r*Math.cos(cm.ph),cm.t.z+cm.r*sp*Math.cos(cm.th));
      if(!micro&&cam.position.y<0.1)cam.position.y=0.1;
      cam.lookAt(cm.t);cam.updateMatrixWorld();
      if(!micro&&(moving||this.anim)){
        if(moving)this.applyState();
        const hc=this.heartP?this.heartP.c:null;
        const near=hc?cam.position.distanceTo(hc):9;const cut=(this.state.focus==='cardiovascular'&&near<0.75)?clamp((near-0.35)/0.4,0.28,1):1;
        if(Math.abs(cut-(this.heartCut||1))>0.01){this.heartCut=cut;this.applyState();}
        this.emitState();}
      let animM=false;
      for(const key in this.G){const G=this.G[key],u=G.u;const d=u.tgt-u.op;if(Math.abs(d)>0.004){u.op+=d*Math.min(1,dt*9);animM=true;}else u.op=u.tgt;
        const tr=G.sys==='tegumentar'||u.op<0.995||u.tgt<0.995;this.setVariant(G,tr?'t':'o');
        G.t.opacity=G.t.side===T.FrontSide&&G.t.transparent?1-(1-u.op)*(1-u.op):u.op;G.t.depthWrite=G.sys==='tegumentar'?false:(G.t.alphaHash?true:u.op>0.6);
        const de=u.emT-u.em;if(Math.abs(de)>0.004){u.em+=de*Math.min(1,dt*9);animM=true;}else u.em=u.emT;
        G.o.emissive.copy(G.o.color).multiplyScalar(u.em*0.16);if(G.t!==G.o)G.t.emissive.copy(G.o.emissive);
        const vis=u.op>0.01;if(vis!==G.visOn){G.visOn=vis;for(const b of G.batches)b.visible=vis;this.partsDirty=true;this.pickDirty=true;this.shadowDirty=true;}}
      if(!micro&&(this.partsDirty||(moving&&frame%2===0)||(wasMoving&&!moving)))this.updateParts();
      if(wasMoving&&!moving&&this.ptrIn)this.hoverReq=true;
      wasMoving=moving;
      if(!micro&&this.hoverReq&&!this.dragging&&!moving&&this.parts.length){this.hoverReq=false;this.doHover();}
      // resolução adaptativa: ~1x enquanto a câmera se move ou há transição; ao parar, um quadro supersampled (substitui o MSAA)
      if(this.__lockDpr)this.setDpr(this.__lockDpr);
      else if(this.opt.adaptive){
        if(moving||this.dragging||animM){this.lastMove=now;this.movingFrames++;this.ema=this.ema*0.9+dtMs*0.1;
          const lo=Math.min(1,this.maxDpr);
          if(this.dprCur>lo+1e-3&&!this.stepped)this.setDpr(lo);
          else if(this.movingFrames>24&&this.ema>26&&!this.stepped&&this.dprCur>0.76){this.setDpr(Math.max(0.75,this.dprCur*0.75));this.stepped=true;}}
        else if(now-this.lastMove>260){this.movingFrames=0;this.stepped=false;this.ema=16;if(this.dprCur!==this.maxDpr)this.setDpr(this.maxDpr);}}
      this.anim=animM||moving;
      if(micro){const inst=this.rbcMesh;for(let i=0;i<this.rbc.length;i++){const r=this.rbc[i];r.t+=r.sp*dt;if(r.t>1){r.t=0;r.c=(r.c+7)%this.caps.length;}
          const p=this.caps[r.c].getPoint(r.t),tg=this.caps[r.c].getTangent(r.t);dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(up,tg);dummy.scale.set(1,0.38,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}
        inst.instanceMatrix.needsUpdate=true;
        if(this.gas){const gm=this.gasMesh;for(let i=0;i<this.gas.length;i++){const g=this.gas[i];g.t+=g.sp*dt;if(g.t>1)g.t=0;const rr=g.o2?0.1+0.5*g.t:0.6-0.5*g.t;
            const sc=0.15+0.85*Math.sin(g.t*Math.PI);dummy.position.set(g.d.x*rr,g.d.y*rr,g.d.z*rr);dummy.quaternion.identity();dummy.scale.set(sc,sc,sc);dummy.updateMatrix();gm.setMatrixAt(i,dummy.matrix);}
          gm.instanceMatrix.needsUpdate=true;}
        this.renderer.render(this.micro,cam);return;}
      if(this.dirty||moving||animM){if(this.shadowDirty&&this.opt.shadowCache){this.renderer.shadowMap.needsUpdate=true;this.shadowDirty=false;}this.renderer.render(this.scene,cam);this.dirty=false;}
    };
    this._raf=requestAnimationFrame(tick);
  }

  emitState(force){
    const now=performance.now();if(!force&&now-(this._es||0)<160)return;this._es=now;
    const r=this.cm.r,y=this.cm.t.y;const scale=r>2.1?0:r>1.0?1:r>0.5?2:3;
    const region=y>1.42?'cabeça e pescoço':y>1.08?'tórax':y>0.86?'abdome':y>0.7?'pelve':'membros inferiores';
    let center=this._center||null,centerSys=this._centerSys||null;
    if(scale>=2&&this.parts.length){if(force||now-(this._ct||0)>320){this._ct=now;const h=this.pickNDC(0,0);if(h&&h.part.s!=='tegumentar'){const p=h.part.p;center=p.pt?p.pt:p.n+' (nome FMA em inglês)';centerSys=p.s;}else{center=null;centerSys=null;}this._center=center;this._centerSys=centerSys;}}
    else{center=null;centerSys=null;this._center=null;this._centerSys=null;}
    const microAvail=scale>=2&&(centerSys==='cardiovascular'||centerSys==='muscular'||this.state.focus==='cardiovascular');
    const sig=[scale,region,center,microAvail].join('|');if(!force&&sig===this._sig)return;this._sig=sig;
    this.emit('state',{scale,region,center,centerSys,microAvail});
  }

  whenIdle(){return new Promise(res=>{const chk=()=>{if(this._dead)return res();this.updateParts();if(this.loaded&&!this._pumping&&!this.chunkQ.length)res();else setTimeout(chk,120);};chk();});}
  statsLOD(){const lv=[0,0,0],hid=[0];let bvh=0,geo=0;for(const P of this.parts){if(P.vis&&P.lvl>=0)lv[P.lvl]++;else hid[0]++;for(const g of P.g)if(g){geo++;if(g.bvh)bvh++;}}
    let batches=0;for(const k in this.G)batches+=this.G[k].batches.length;
    return{shownL0:lv[0],shownL1:lv[1],shownL2:lv[2],hidden:hid[0],chunks:Object.keys(this.chunkState).filter(k=>this.chunkState[k]==='ok').length,bvh,geo,batches,dpr:this.dprCur};}

  dispose(){
    if(this._dead)return;this._dead=true;cancelAnimationFrame(this._raf);window.removeEventListener('av3d:cmd',this._onCmd);
    if(this.ro)this.ro.disconnect();if(this._idle!=null){(window.cancelIdleCallback||clearTimeout)(this._idle);this._idle=null;}
    if(this._L&&this.canvas)for(const [t,f,o] of this._L)this.canvas.removeEventListener(t,f,o);
    const geos=new Set(),mats=new Set();
    const visit=o=>{if(o.isBatchedMesh||o.isInstancedMesh)o.dispose();if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));};
    if(this.scene)this.scene.traverse(visit);Object.values(this.micros||{}).forEach(m=>m.scene.traverse(visit));
    for(const k in this.G){mats.add(this.G[k].o);mats.add(this.G[k].t);}
    for(const O of [this.ovH,this.ovS].concat(this.ovX||[]))if(O)O.geos.forEach(g=>geos.add(g));
    for(const P of this.parts)for(const g of P.g)if(g){if(g.geo)geos.add(g.geo);g.bvh=null;g.geo=null;}
    geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
    if(this.envRT)this.envRT.dispose();if(this.keyLight&&this.keyLight.shadow)this.keyLight.shadow.dispose();
    if(this.renderer){this.renderer.renderLists.dispose();this.renderer.dispose();this.renderer.forceContextLoss&&this.renderer.forceContextLoss();}
    if(this.Dec&&this.opt&&this.opt.workers&&!document.querySelector('atlas-3d-v2'))try{this.Dec.useWorkers(0);}catch(e){}
    if(this.canvas)this.canvas.remove();
    this.parts=[];this.G={};this.bvhQ=[];this.pickList=[];this.scene=this.micro=this.renderer=null;
  }
}
customElements.define('atlas-3d-v2',Atlas3DV2);
})();
