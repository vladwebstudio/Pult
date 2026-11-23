/* Режим клієнта (?view=КОД): лише копія розбору з бази, без входу. Решта системи недоступна. */
(function(){
  const D = window.__DEMO, TS = D.TS, set = D.set, pack = window.__SHARED_PACK;
  window.__VIEWONLY = true; document.documentElement.classList.add("is-client-view");
  if (!pack){ document.addEventListener("DOMContentLoaded", ()=>{ document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:Inter,sans-serif">Посилання недійсне або застаріло.</div>'; }); return; }
  const id = pack.id;
  set("users/viewer@local", { email:"viewer@local", name:"Клієнт", role:"developer", status:"active" });
  set("calls/"+id, Object.assign({}, pack.call, { updatedAt:new TS(Date.now()) }));
  set("calls/"+id+"/chunks/c001", pack.chunk); set("calls/"+id+"/analysis/main", pack.analysis);
  const h = "#/calls/"+id; if (location.hash!==h) location.hash = h;
  window.addEventListener("hashchange", ()=>{ if (location.hash!==h) location.hash = h; });
})();
