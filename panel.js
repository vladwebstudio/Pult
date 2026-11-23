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
  css.textContent = `.tp{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:900;display:flex;align-items:center;gap:12px;padding:8px 10px 8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:999px;box-shadow:var(--sh-lg);font:500 13px var(--font-sans);color:var(--text)}
.tp__tag{background:#FEF3C7;color:#92400E;border-radius:999px;padding:3px 10px;font-weight:700;font-size:11px;letter-spacing:.06em}
.tp__m{color:var(--text-muted);font-variant-numeric:tabular-nums}
.tp button{border:0;border-radius:999px;padding:8px 14px;font:600 13px var(--font-sans);cursor:pointer}
.tp .p{background:var(--brand);color:#fff}.tp .s{background:var(--brand-soft);color:var(--brand)}
.tpm{position:fixed;inset:0;z-index:950;background:rgba(10,14,30,.5);display:flex;align-items:center;justify-content:center}
.tpm__b{width:460px;max-width:92vw;background:var(--surface);color:var(--text);border-radius:var(--r-xl);padding:22px;box-shadow:var(--sh-lg);font:14px var(--font-sans)}
.tpm__b h3{margin:0 0 14px;font-size:18px}.tpm__b label{display:block;font-size:12px;color:var(--text-muted);margin:10px 0 4px}
.tpm__b input[type=text],.tpm__b textarea{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg);color:var(--text);font:14px var(--font-sans)}
.tpm__b textarea{min-height:90px;resize:vertical}.tpm__n{font-size:12px;color:var(--text-faint);margin-top:10px}.tpm__e{color:var(--danger);font-size:13px;margin-top:8px}
.tpm__r{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.tpm__r button{border:0;border-radius:999px;padding:9px 16px;font:600 13px var(--font-sans);cursor:pointer}`;
  document.head.appendChild(css);
  const today = ()=>new Date().toISOString().slice(0,10);
  const bar = document.createElement("div"); bar.className="tp"; bar.style.display="none"; document.body.appendChild(bar);
  let db = null, N = 0, SPEND = 0;
  async function refresh(){
    const [cs, sp] = await Promise.all([db.collection("calls").get(), db.collection("settings").doc("testSpend").get()]);
    N = cs.size; const s = sp.exists ? sp.data() : {}; SPEND = s.d===today() ? (s.v||0) : 0; paint();
  }
  function paint(){
    bar.style.display="flex";
    bar.innerHTML = '<span class="tp__m">Розмов: '+N+' з '+LIMIT+'</span><span class="tp__m">ШІ сьогодні: '+SPEND.toFixed(2)+' / '+DAY_CAP.toFixed(2)+' $</span>';
    const a = document.createElement("button"); a.className="p"; a.textContent="+ Додати розмову"; a.onclick=openAdd;
    const b = document.createElement("button"); b.className="s"; b.textContent="Посилання клієнту"; b.onclick=share;
    bar.append(a,b);
  }
  function modal(inner){ const m=document.createElement("div"); m.className="tpm"; m.innerHTML='<div class="tpm__b">'+inner+'</div>'; m.onclick=e=>{ if(e.target===m) m.remove(); }; document.body.appendChild(m); return m; }
  async function saveCall(id, pack){
    await db.collection("calls").doc(id).set(Object.assign({}, pack.call, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    await db.collection("calls").doc(id).collection("chunks").doc("c001").set(pack.chunk);
    await db.collection("calls").doc(id).collection("analysis").doc("main").set(pack.analysis);
  }
  function openAdd(){
    const m = modal('<h3>Додати розмову клієнта</h3><label>Ім’я клієнта</label><input type="text" id="tpN" placeholder="Напр. Олена, коуч">'+
      '<label>Запис розмови (аудіо)</label><input type="file" id="tpF" accept="audio/*,video/*">'+
      '<label>Скрипт для цього розбору (разово)</label><textarea id="tpS" placeholder="Вставте скрипт клієнта або залиште порожнім"></textarea>'+
      '<div class="tpm__n">Поки розбір шаблонний: файл не завантажується. Справжня транскрипція і ШІ-оцінка підключаться через сервер.</div><div class="tpm__e" id="tpE"></div>'+
      '<div class="tpm__r"><button class="s" id="tpC">Скасувати</button><button class="p" id="tpOk">Розібрати</button></div>');
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
