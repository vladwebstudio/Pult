/* Мітка «← Пульт» у робочих просторах: повернення в хаб. Бачить лише власник. */
(function(){
  if (window.__VIEWONLY) return;
  const a=document.createElement("a"); a.href="./"; a.textContent="← Пульт";
  a.style.cssText="position:fixed;left:14px;bottom:18px;z-index:900;padding:8px 14px;border-radius:999px;background:var(--surface);color:var(--brand);border:1px solid var(--border);box-shadow:var(--sh-lg);font:600 13px Inter,sans-serif;text-decoration:none";
  document.body.appendChild(a);
})();
