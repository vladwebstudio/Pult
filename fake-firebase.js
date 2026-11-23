/* Підставна «база» замість Firebase: усе в пам'яті, для тесту карточки. Нічого нікуди не пишеться. */
(function(){
  const DB = {};              // шлях документа -> дані
  const LIS = [];             // слухачі {kind,path,fn}
  const clone = v => v===undefined ? undefined : JSON.parse(JSON.stringify(v, (k,x)=> (x && x.__ts) ? {__ts:x.ms} : x), (k,x)=> (x && typeof x==="object" && "__ts" in x) ? new TS(x.__ts) : x);
  class TS { constructor(ms){ this.__ts=true; this.ms=ms; this.seconds=Math.floor(ms/1000); this.nanoseconds=(ms%1000)*1e6; }
    toMillis(){ return this.ms; } toDate(){ return new Date(this.ms); } toJSON(){ return {__ts:this.ms}; } }
  const SERVER = {__sv:"ts"}, DEL = {__sv:"del"};
  const FV = { serverTimestamp:()=>SERVER, delete:()=>DEL, increment:n=>({__sv:"inc",n}), arrayUnion:(...a)=>({__sv:"au",a}), arrayRemove:(...a)=>({__sv:"ar",a}) };
  const rnd = () => Math.random().toString(36).slice(2,12);
  function applyPatch(base, patch, merge){
    const out = merge ? Object.assign({}, base||{}) : {};
    Object.keys(patch).forEach(k=>{
      const v = patch[k];
      let tgt = out, parts = k.split(".");
      if (!merge || true){ for (let i=0;i<parts.length-1;i++){ tgt[parts[i]] = Object.assign({}, tgt[parts[i]]||{}); tgt = tgt[parts[i]]; } }
      const last = parts[parts.length-1];
      if (v && v.__sv==="ts") tgt[last] = new TS(Date.now());
      else if (v && v.__sv==="del") delete tgt[last];
      else if (v && v.__sv==="inc") tgt[last] = (Number(tgt[last])||0) + v.n;
      else if (v && v.__sv==="au") tgt[last] = Array.from(new Set([].concat(tgt[last]||[], v.a)));
      else if (v && v.__sv==="ar") tgt[last] = (tgt[last]||[]).filter(x=>!v.a.includes(x));
      else tgt[last] = v;
    });
    return out;
  }
  function childrenOf(colPath){
    const pre = colPath + "/";
    return Object.keys(DB).filter(p => p.startsWith(pre) && p.indexOf("/", pre.length) === -1);
  }
  function notify(path){
    const parent = path.slice(0, path.lastIndexOf("/"));
    LIS.slice().forEach(l=>{ if ((l.kind==="doc" && l.path===path) || (l.kind==="col" && l.path===parent)) setTimeout(()=>{ try{ l.run(); }catch(e){ console.warn(e); } }, 0); });
  }
  class DocSnap { constructor(path, data){ this.ref = new DocRef(path); this.id = path.split("/").pop(); this.exists = data!==undefined; this._d = data; }
    data(){ return this._d===undefined ? undefined : clone(this._d); } get(f){ return this._d ? this._d[f] : undefined; } }
  class QSnap { constructor(docs){ this.docs = docs; this.size = docs.length; this.empty = !docs.length; }
    forEach(f){ this.docs.forEach(f); } docChanges(){ return this.docs.map(d=>({type:"added", doc:d})); } }
  class DocRef {
    constructor(path){ this.path = path; this.id = path.split("/").pop(); this.parent = new ColRef(path.slice(0, path.lastIndexOf("/"))); }
    collection(n){ return new ColRef(this.path + "/" + n); }
    async get(){ return new DocSnap(this.path, DB[this.path]); }
    async set(d, o){ DB[this.path] = applyPatch(DB[this.path], d, !!(o && o.merge)); notify(this.path); }
    async update(d){ if (!(this.path in DB)) throw Object.assign(new Error("not-found"), {code:"not-found"}); DB[this.path] = applyPatch(DB[this.path], d, true); notify(this.path); }
    async delete(){ delete DB[this.path]; notify(this.path); }
    onSnapshot(cb, err){ const l = {kind:"doc", path:this.path, run:()=>cb(new DocSnap(this.path, DB[this.path]))}; LIS.push(l); setTimeout(()=>{ try{ l.run(); }catch(e){ console.warn(e); } }, 0); return ()=>{ const i=LIS.indexOf(l); if(i>=0) LIS.splice(i,1); }; }
  }
  class Query {
    constructor(path, f, o, lim){ this.path=path; this.f=f||[]; this.o=o||[]; this.lim=lim||0; }
    where(field, op, v){ return new Query(this.path, this.f.concat([[field,op,v]]), this.o, this.lim); }
    orderBy(field, dir){ return new Query(this.path, this.f, this.o.concat([[field, dir||"asc"]]), this.lim); }
    limit(n){ return new Query(this.path, this.f, this.o, n); }
    _run(){
      let docs = childrenOf(this.path).map(p => new DocSnap(p, DB[p]));
      const get = (d, f) => f.split(".").reduce((a,k)=>a==null?undefined:a[k], d._d);
      this.f.forEach(([f,op,v])=>{ docs = docs.filter(d=>{ const x = get(d,f);
        if (op==="==") return x===v; if (op==="!=") return x!==v; if (op==="in") return v.includes(x);
        if (op===">") return x>v; if (op===">=") return x>=v; if (op==="<") return x<v; if (op==="<=") return x<=v;
        if (op==="array-contains") return Array.isArray(x) && x.includes(v); return true; }); });
      this.o.slice().reverse().forEach(([f,dir])=>{ docs.sort((a,b)=>{ let x=get(a,f), y=get(b,f); if (x&&x.toMillis) x=x.toMillis(); if (y&&y.toMillis) y=y.toMillis();
        return (x>y?1:x<y?-1:0) * (dir==="desc"?-1:1); }); });
      if (this.lim) docs = docs.slice(0, this.lim);
      return new QSnap(docs);
    }
    async get(){ return this._run(); }
    onSnapshot(cb, err){ const l = {kind:"col", path:this.path, run:()=>cb(this._run())}; LIS.push(l); setTimeout(()=>{ try{ l.run(); }catch(e){ console.warn(e); } }, 0); return ()=>{ const i=LIS.indexOf(l); if(i>=0) LIS.splice(i,1); }; }
  }
  class ColRef extends Query {
    constructor(path){ super(path); this.id = path.split("/").pop(); }
    doc(id){ return new DocRef(this.path + "/" + (id || rnd())); }
    async add(d){ const r = this.doc(); await r.set(d); return r; }
  }
  const db = {
    collection: n => new ColRef(n),
    enablePersistence: () => Promise.resolve(), terminate: () => Promise.resolve(), clearPersistence: () => Promise.resolve(),
    batch: () => { const ops=[]; return { set:(r,d,o)=>{ops.push(()=>r.set(d,o));}, update:(r,d)=>{ops.push(()=>r.update(d));}, delete:r=>{ops.push(()=>r.delete());}, commit: async()=>{ for (const f of ops) await f(); } }; },
  };
  const authL = [];
  const fakeUser = { uid:"demo-dev", email:"vlad@demo.local", displayName:"Влад", reauthenticateWithCredential: ()=>Promise.resolve(), updatePassword: ()=>Promise.resolve() };
  const auth = {
    currentUser: null,
    onAuthStateChanged(cb){ authL.push(cb); setTimeout(()=>cb(auth.currentUser), 0); return ()=>{}; },
    setPersistence: () => Promise.resolve(),
    async signInWithEmailAndPassword(){ auth.currentUser = fakeUser; authL.forEach(f=>f(fakeUser)); return { user: fakeUser }; },
    async signOut(){ auth.currentUser = null; authL.forEach(f=>f(null)); },
    sendPasswordResetEmail: () => Promise.resolve(),
  };
  auth.currentUser = fakeUser;
  const firebase = {
    apps: [], initializeApp(c, n){ const a = {name:n||"[DEFAULT]"}; firebase.apps.push(a); return a; },
    auth: Object.assign(() => auth, { Auth:{ Persistence:{ LOCAL:"local" } }, EmailAuthProvider:{ credential:(e,p)=>({e,p}) } }),
    firestore: Object.assign(() => db, { FieldValue: FV, Timestamp: { now: ()=>new TS(Date.now()), fromMillis: ms=>new TS(ms), fromDate: d=>new TS(d.getTime()) } }),
  };
  window.firebase = firebase;
  window.__DEMO = { set: (path, data) => { DB[path] = applyPatch(undefined, data, false); }, TS, DB };
})();
