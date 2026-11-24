/* Статичне демо: копія Алекси на замороженому наборі даних (demo-data-*.js). Жодної бази, нічого не зберігається.
   Дати зсуваються так, щоб остання розмова завжди була «сьогодні». */
(function(){
  /* окремі ключі localStorage, щоб демо не плутало тест і хаб */
  try{ const P="demo:", g=Storage.prototype.getItem, s=Storage.prototype.setItem, r=Storage.prototype.removeItem, keep=k=>k==="alexa_theme";
    Storage.prototype.getItem=function(k){return g.call(this,keep(k)?k:P+k)};
    Storage.prototype.setItem=function(k,v){return s.call(this,keep(k)?k:P+k,v)};
    Storage.prototype.removeItem=function(k){return r.call(this,keep(k)?k:P+k)};
    if(localStorage.getItem("alexa_period_overview")==null) localStorage.setItem("alexa_period_overview","all");
  }catch(_){}
  const D=window.__DEMO, TS=D.TS, E={};
  (window.__DEMO_PARTS||[]).forEach(p=>Object.assign(E,p));
  let last=0; Object.keys(E).forEach(k=>{ if(/^calls\/[^/]+$/.test(k)&&E[k].startedAt){ const t=Date.parse(E[k].startedAt); if(t>last)last=t; } });
  const DAY=864e5, delta=last?Math.max(0,Math.floor((Date.now()-last)/DAY))*DAY:0;
  const isoRx=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/, dRx=/^\d{4}-\d\d-\d\d$/;
  const rev=v=>{
    if(v==null)return v;
    if(typeof v==="string"){
      if(isoRx.test(v)){ const o=new Date(Date.parse(v)+delta).toISOString(); return /\.\d+Z$/.test(v)?o:o.replace(/\.\d{3}Z$/,"Z"); }
      if(dRx.test(v)){ return new Date(Date.parse(v+"T12:00:00Z")+delta).toISOString().slice(0,10); }
      return v;
    }
    if(typeof v!=="object")return v;
    if("__ts" in v)return new TS(v.__ts+delta);
    if(Array.isArray(v))return v.map(rev);
    const o={}; Object.keys(v).forEach(k=>o[k]=rev(v[k])); return o;
  };
  /* у демо лише завершені розмови: без «в ефірі», скасованих і порожніх */
  const skip=new Set(); Object.keys(E).forEach(k=>{ if(/^calls\/[^/]+$/.test(k)){ const st=E[k].status; if(st!=="done"&&st!=="no_show") skip.add(k); } });
  /* витрати ШІ: найновіший місяць стає поточним */
  const um=Object.keys(E).filter(k=>/^usage\/\d{4}-\d\d$/.test(k)).sort(), now=new Date(), ym=(d)=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"), rk={};
  um.forEach((k,i)=>{ rk[k]="usage/"+ym(new Date(now.getFullYear(),now.getMonth()-(um.length-1-i),1)); });
  Object.keys(E).forEach(k=>{ const top=k.split("/").slice(0,2).join("/"); if(skip.has(top))return; const v=rev(E[k]); if(/^calls\/[^/]+$/.test(k)&&v.videoId){ v.audioReady=false; v.embeddable=true; } D.set(rk[k]||k,v); });
  D.set("users/vlad@demo.local",{email:"vlad@demo.local",name:"Влад",role:"developer",status:"active"});
  /* «сервер» і «воркер» завжди живі */
  const beat=()=>{ try{ const f=firebase.firestore(), t=new TS(Date.now());
    f.collection("health").doc("server").update({checkedAt:t,updatedAt:t,status:"ok",message:"Усе працює"});
    f.collection("health").doc("worker").update({lastBeat:t}); }catch(_){} };
  beat(); setInterval(beat,60000);
  window.__DEMO_STATIC=true;
  document.addEventListener("DOMContentLoaded",()=>{
    const st=document.createElement("style");
    st.textContent=".demo-tag{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9000;padding:8px 16px;border-radius:999px;background:color-mix(in srgb,var(--surface,#fff) 88%,transparent);backdrop-filter:blur(12px);border:1px solid var(--border,#ddd);box-shadow:var(--sh-md,0 6px 20px rgba(0,0,0,.15));font:600 12.5px var(--font-sans,Inter,sans-serif);color:var(--text-muted,#666);white-space:nowrap;pointer-events:none}.demo-tag b{color:var(--brand,#6366F1)}";
    document.head.appendChild(st);
    const t=document.createElement("div"); t.className="demo-tag"; t.innerHTML="<b>Демо-приклад</b> · тестові дані, зміни не зберігаються"; document.body.appendChild(t);
  });
})();
