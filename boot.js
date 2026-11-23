/* Завантажувач: звичайний режим = справжній Firebase; ?view=КОД = публічна копія розбору (без входу). */
(function(){
  function w(src){ document.write('<script src="'+src+'"><\/script>'); }
  var code = new URLSearchParams(location.search).get("view");
  if (code){
    var pack = null;
    try {
      var x = new XMLHttpRequest();
      x.open("GET","https://firestore.googleapis.com/v1/projects/"+FB_CONFIG.projectId+"/databases/(default)/documents/shared/"+encodeURIComponent(code),false);
      x.send();
      if (x.status===200) pack = JSON.parse(JSON.parse(x.responseText).fields.pack.stringValue);
    } catch(e){}
    window.__SHARED_PACK = pack;
    w("fake-firebase.js"); w("view-data.js");
  } else {
    var v="10.14.1"; w("https://www.gstatic.com/firebasejs/"+v+"/firebase-app-compat.js"); w("https://www.gstatic.com/firebasejs/"+v+"/firebase-auth-compat.js"); w("https://www.gstatic.com/firebasejs/"+v+"/firebase-firestore-compat.js");
  }
})();
