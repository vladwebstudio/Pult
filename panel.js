/* Панель власника тестового простору (справжня база) + режим клієнта. */
(function(){
  if (window.__VIEWONLY){
    const st = document.createElement("style");
    st.textContent = ".navbar,.cv-back{display:none !important} body:before{content:'Розбір дзвінка · лише перегляд';display:block;text-align:center;padding:10px;font:600 13px Inter,sans-serif;background:var(--brand-soft,#EEF);color:var(--brand,#6366F1)}"+
      ".cv-chat.is-locked{position:relative;overflow:hidden}.cv-chat.is-locked>*:not(.cv-chat__lock){opacity:.35;pointer-events:none;filter:blur(1.5px);user-select:none}"+
      ".cv-chat__lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:16px;font:600 14px Inter,sans-serif;color:var(--text)}"+
      ".cv-chat__lock small{font-weight:500;color:var(--text-muted);font-size:12.5px}";
    document.head.appendChild(st);
    const lock = ()=>{ document.querySelectorAll(".cv-chat:not(.is-locked)").forEach(c=>{ c.classList.add("is-locked");
      c.querySelectorAll("textarea,input,button").forEach(x=>x.disabled=true);
      const o=document.createElement("div"); o.className="cv-chat__lock"; o.innerHTML="<span style='font-size:22px'>🔒</span><span>Чат із ШІ недоступний</span><small>Відкриється після підключення</small>"; c.appendChild(o); }); };
    new MutationObserver(lock).observe(document.body,{childList:true,subtree:true}); lock();
    return;
  }
  const LIMIT = 3, DAY_CAP = 2.0, COST = 0.35;
  const css = document.createElement("style");
  css.textContent = `
.tp{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:900;display:flex;align-items:center;gap:6px;padding:6px;background:color-mix(in srgb,var(--surface) 86%,transparent);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:999px;box-shadow:var(--sh-lg);transition:transform .3s var(--ease),opacity .25s}
.tp.is-min{transform:translate(-50%,0) scale(1)}
.tp button{border:0;border-radius:999px;padding:10px 18px;font:600 13px var(--font-sans);cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s,color .15s}
.tp .p{background:var(--brand);color:#fff}.tp .p:hover{transform:translateY(-1px);box-shadow:0 6px 16px color-mix(in srgb,var(--brand) 38%,transparent)}
.tp .s{background:transparent;color:var(--text)}.tp .s:hover{background:var(--brand-soft);color:var(--brand)}
.tp .h{width:36px;height:36px;padding:0;background:transparent;color:var(--text-muted);font-size:15px}.tp .h:hover{background:var(--surface-2);color:var(--text)}
.tp__w{display:flex;align-items:center;gap:6px;max-width:520px;overflow:hidden;transition:max-width .3s var(--ease),opacity .2s}
.tp.is-min .tp__w{max-width:0;opacity:0;pointer-events:none}.tp.is-min .h{transform:rotate(180deg)}
.tpm{position:fixed;inset:0;z-index:950;background:rgba(10,14,30,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;animation:tpf .15s}
.tpm__b{width:480px;max-width:92vw;background:var(--surface);color:var(--text);border-radius:22px;padding:26px;box-shadow:var(--sh-lg);font:14px var(--font-sans);animation:tpp .2s var(--ease)}
@keyframes tpf{from{opacity:0}}@keyframes tpp{from{opacity:0;transform:translateY(10px) scale(.98)}}
.tpm__b h3{margin:0 0 6px;font-size:20px;letter-spacing:-.02em}.tpm__sub{color:var(--text-muted);font-size:13px;margin-bottom:14px}
.tpm__b label{display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin:14px 0 5px}
.tpm__b input[type=text],.tpm__b textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:14px var(--font-sans);outline:none;transition:border-color .15s,box-shadow .15s}
.tpm__b input[type=text]:hover,.tpm__b textarea:hover{border-color:var(--border-strong)}
.tpm__b input[type=text]:focus,.tpm__b textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 20%,transparent)}
.tpm__b textarea{min-height:84px;resize:vertical}
.dz{display:flex;align-items:center;gap:14px;padding:16px;border:2px dashed var(--border-strong);border-radius:16px;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}
.dz:hover,.dz.over{border-color:var(--brand);background:var(--brand-soft)}.dz.over{transform:scale(1.01)}
.dz.has{border-style:solid;border-color:color-mix(in srgb,#22C55E 60%,var(--border));background:color-mix(in srgb,#22C55E 8%,var(--surface))}
.dz__i{width:42px;height:42px;border-radius:12px;background:var(--brand-soft);color:var(--brand);display:flex;align-items:center;justify-content:center;font-size:20px;flex:none}
.dz.has .dz__i{background:color-mix(in srgb,#22C55E 18%,var(--surface));color:#15803D}
.dz b{display:block;font-size:14px}.dz small{color:var(--text-muted);font-size:12px}
.dz input{display:none}
.tpm__n{font-size:12px;color:var(--text-faint);margin-top:12px}.tpm__e{color:var(--danger);font-size:13px;margin-top:8px;min-height:16px}
.tpm__r{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.tpm__r button{border:0;border-radius:999px;padding:10px 18px;font:600 13px var(--font-sans);cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s}
.tpm__r .p{background:var(--brand);color:#fff}.tpm__r .p:hover{transform:translateY(-1px);box-shadow:0 6px 16px color-mix(in srgb,var(--brand) 35%,transparent)}.tpm__r .s{background:var(--brand-soft);color:var(--brand)}.tpm__r .s:hover{filter:brightness(.97)}`;
  document.head.appendChild(css);
  const today = ()=>new Date().toISOString().slice(0,10);
  const bar = document.createElement("div"); bar.className="tp"; bar.style.display="none"; document.body.appendChild(bar);
  let db = null, N = 0, SPEND = 0;
  const MIN_KEY="tpMin";
  async function refresh(){
    const [cs, sp] = await Promise.all([db.collection("calls").get(), db.collection("settings").doc("testSpend").get()]);
    N = cs.size; const s = sp.exists ? sp.data() : {}; SPEND = s.d===today() ? (s.v||0) : 0; paint();
  }
  function paint(){
    bar.style.display="flex";
    let min=false; try{ min=localStorage.getItem(MIN_KEY)==="1"; }catch(_){}
    bar.classList.toggle("is-min",min);
    bar.replaceChildren();
    const w=document.createElement("div"); w.className="tp__w";
    const a = document.createElement("button"); a.className="p"; a.textContent="+ Додати розмову"; a.onclick=openAdd;
    const b = document.createElement("button"); b.className="s"; b.textContent="Посилання клієнту"; b.onclick=share;
    const h = document.createElement("button"); h.className="h"; h.title="Сховати / показати меню"; h.textContent="‹"; h.style.transform=min?"rotate(180deg)":"";
    h.onclick=()=>{ const m=!bar.classList.contains("is-min"); bar.classList.toggle("is-min",m); h.style.transform=m?"rotate(180deg)":""; try{ localStorage.setItem(MIN_KEY,m?"1":"0"); }catch(_){} };
    w.append(a,b); bar.append(h,w);
  }
  function modal(inner){ const m=document.createElement("div"); m.className="tpm"; m.innerHTML='<div class="tpm__b">'+inner+'</div>'; m.onclick=e=>{ if(e.target===m) m.remove(); }; document.body.appendChild(m); return m; }
  async function saveCall(id, pack){
    await db.collection("calls").doc(id).set(Object.assign({}, pack.call, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    await db.collection("calls").doc(id).collection("chunks").doc("c001").set(pack.chunk);
    await db.collection("calls").doc(id).collection("analysis").doc("main").set(pack.analysis);
  }
  function openAdd(){
    const m = modal('<h3>Додати розмову клієнта</h3><div class="tpm__sub">Розбір з’явиться в цьому просторі, а клієнту піде лише посилання.</div>'+
      '<label>Ім’я клієнта</label><input type="text" id="tpN" placeholder="Напр. Олена, коуч">'+
      '<label>Запис розмови</label><label class="dz" id="tpDz"><span class="dz__i">♪</span><span><b id="tpFn">Обери файл або перетягни сюди</b><small id="tpFs">Аудіо чи відео, до кількох годин</small></span><input type="file" id="tpF" accept="audio/*,video/*"></label>'+
      '<label>Скрипт для цього розбору</label><textarea id="tpS" placeholder="Вставте скрипт клієнта або залиште порожнім"></textarea>'+
      '<div class="tpm__n">Поки розбір шаблонний: файл не завантажується. Справжня транскрипція і оцінка ШІ підключаться через сервер.</div><div class="tpm__e" id="tpE"></div>'+
      '<div class="tpm__r"><button class="s" id="tpC">Скасувати</button><button class="p" id="tpOk">Розібрати</button></div>');
    const dz=m.querySelector("#tpDz"), fi=m.querySelector("#tpF");
    const show=f=>{ if(!f)return; dz.classList.add("has"); m.querySelector("#tpFn").textContent=f.name; m.querySelector("#tpFs").textContent=(f.size/1048576).toFixed(1)+" МБ"; m.querySelector(".dz__i").textContent="✓"; };
    fi.onchange=()=>show(fi.files[0]);
    ["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("over")}));
    ["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("over")}));
    dz.addEventListener("drop",e=>{ const f=e.dataTransfer.files[0]; if(f){ try{ const dt=new DataTransfer(); dt.items.add(f); fi.files=dt.files; }catch(_){} show(f); } });
    m.querySelector("#tpC").onclick=()=>m.remove();
    m.querySelector("#tpOk").onclick=async()=>{
      const err=t=>m.querySelector("#tpE").textContent=t;
      const name=m.querySelector("#tpN").value.trim(); if(!name) return err("Вкажіть ім’я клієнта.");
      if (N >= LIMIT) return err("Ліміт: "+LIMIT+" розмови для цього клієнта вичерпано.");
      if (SPEND+COST > DAY_CAP) return err("Денний ліміт витрат ШІ вичерпано.");
      const f=m.querySelector("#tpF").files[0], sc=m.querySelector("#tpS").value.trim();
      const id="u"+Date.now(); const pack=window.__makeTestCall(id,name,sc?"Власний скрипт":"", 840); pack.id=id; pack.call.fileName=f?f.name:"";
      try{
        await saveCall(id, pack);
        await db.collection("settings").doc("testSpend").set({ d:today(), v:SPEND+COST });
      }catch(e){ return err("Не вдалось зберегти: "+(e.message||e)); }
      m.remove(); location.hash="#/calls/"+id; refresh();
    };
  }
  function curId(){ const m=location.hash.match(/#\/calls\/([^/?]+)/); return m?m[1]:null; }
  async function share(){
    const id=curId(); if(!id) return modal('<h3>Посилання клієнту</h3><div class="tpm__n">Відкрийте розмову, якою хочете поділитися.</div>');
    const ref=db.collection("calls").doc(id);
    const [c,ch,an]=await Promise.all([ref.get(), ref.collection("chunks").doc("c001").get(), ref.collection("analysis").doc("main").get()]);
    if(!c.exists||!an.exists) return modal('<h3>Посилання клієнту</h3><div class="tpm__n">Розбір цієї розмови ще не готовий.</div>');
    const call=c.data(); delete call.updatedAt; delete call.audioUrl;
    const pack={ id, call, chunk: ch.exists?ch.data():{n:1,text:""}, analysis: an.data() };
    const code=Array.from(crypto.getRandomValues(new Uint8Array(18))).map(x=>x.toString(36).padStart(2,"0")).join("").slice(0,24);
    await db.collection("shared").doc(code).set({ pack: JSON.stringify(pack), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    const url=location.origin+location.pathname+"?view="+code;
    const m=modal('<h3>Посилання для клієнта</h3><input type="text" id="tpU" readonly value="'+url+'"><div class="tpm__n">Без логіну. Клієнт бачить лише цей розбір: чат вимкнений, решта системи недоступна. Код довгий і випадковий.</div><div class="tpm__r"><button class="s" id="tpO">Відкрити як клієнт</button><button class="p" id="tpCp">Скопіювати</button></div>');
    m.querySelector("#tpCp").onclick=()=>{ const i=m.querySelector("#tpU"); i.select(); try{ navigator.clipboard.writeText(url); }catch(_){ document.execCommand("copy"); } m.querySelector("#tpCp").textContent="Скопійовано"; };
    m.querySelector("#tpO").onclick=()=>window.open(url,"_blank");
  }
  // приклад-розмова створюється один раз; відкриваємо «Огляд», якщо хеш порожній
  firebase.auth().onAuthStateChanged(async u=>{
    if(!u || (u.email||"").toLowerCase()!==window.PULT_OWNER.toLowerCase()){ bar.style.display="none"; return; }
    db = firebase.firestore();
    try{
      await db.collection("users").doc(window.PULT_OWNER.toLowerCase()).set({ email:window.PULT_OWNER.toLowerCase(), name:"Влад", role:"developer", status:"active", uid:u.uid },{ merge:true });
      const t1 = await db.collection("calls").doc("t1").get();
      if(!t1.exists){ const pack=window.__makeTestCall("t1","Марина (нутриціолог)","Продажі за 3 кроки",780); pack.call.startedAt=new Date(Date.now()-2*3600000).toISOString(); await saveCall("t1", pack); }
      await refresh();
    }catch(e){ console.warn("panel:", e); }
  });
})();
