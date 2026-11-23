/* Спільні утиліти тесту: тиха аудіодоріжка та шаблонний розбір для демо. */
(function(){
  function wav(sec){
    const sr=8000,n=sr*sec,buf=new ArrayBuffer(44+n),v=new DataView(buf),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    w(0,"RIFF");v.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,sr,true);v.setUint32(28,sr,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,"data");v.setUint32(40,n,true);
    new Uint8Array(buf,44).fill(128);return URL.createObjectURL(new Blob([buf],{type:"audio/wav"}));
  }

  window.__silentWav = wav;
  // шаблонний «розбір» для нових розмов (у справжній системі тут транскрипція + ШІ)
  window.__makeTestCall = function(id, client, scriptName, durationSec){
    const dur = durationSec || 840;
    const call = { managerEmail:"vlad@demo.local", status:"done", title:"Тест · "+client, client:client, startedAt:new Date().toISOString(), durationSec:dur, score:58, source:"manual",
      audioReady:true, transcriptReady:true, summaryShort:"Шаблонний розбір для демо.", scriptVersion:scriptName||"" };
    const lines = [["00:20","Добрий день! Дякую, що знайшли час для розмови."],["01:10","Розкажіть, що саме зараз не влаштовує у ваших продажах?"],["02:30","Клієнти довго думають і потім зникають."],
      ["04:00","Давайте розкажу про наш формат роботи і що ви отримаєте."],["06:20","Звучить цікаво, але це для мене дорого."],["06:45","Ми можемо зробити знижку, якщо вирішите сьогодні."],
      ["08:30","Мені треба порадитись з партнером."],["09:00","Добре, подумайте і напишіть мені."],["11:40","Тоді до зв'язку, гарного дня."]];
    const chunk = { n:1, text: lines.map(l=>"["+l[0]+"] "+l[1]).join("\n") };
    const analysis = { v:2, format:"sales", score:58, outcome:"follow_up",
      summary:"Клієнт назвав проблему — клієнти зникають після розмови. На етапі ціни сказав «дорого» і хоче порадитись з партнером. Заперечення не відпрацьоване, наступного кроку з датою немає.",
      payment:{ v:2, status:"none", note:"Оплату й бронь не обговорювали." }, agreements:[], nextSteps:["Узгодити дату наступної розмови","Надіслати розрахунок окупності"],
      pains:[{text:"Клієнти зникають після розмови", t:"02:30"}], objections:[{text:"Дорого", t:"06:20"},{text:"Порадитись з партнером", t:"08:30"}],
      client:{ readiness:null, profile:"Клієнт: "+client+". Розбір створено за скриптом: "+(scriptName||"стандартний")+"." },
      criteria:[{name:"Контакт і онбординг",score:85,weight:10,comment:"Тепле привітання [00:20]."},{name:"Виявлення потреб",score:65,weight:25,comment:"Біль названо [02:30], але не уточнено масштаб."},
        {name:"Презентація під потреби",score:60,weight:20,comment:"Загальна презентація без привʼязки до болю [04:00]."},{name:"Робота із запереченнями",score:35,weight:25,comment:"На «дорого» запропоновано знижку замість уточнення [06:45]."},
        {name:"Закриття на бронь",score:45,weight:20,comment:"Без дати наступного кроку [09:00]."}],
      weaknesses:[{id:"w1",severity:"critical",criterion:"Робота із запереченнями",title:"Знижка замість уточнення заперечення",ts:"06:45",body:"На «дорого» одразу запропоновано знижку, не з'ясувавши, що саме здається дорогим.",say:"«Що саме здається дорогим — сума чи те, що ви отримаєте? Давайте звіримо з вашою ціллю.»"},
        {id:"w2",severity:"warn",criterion:"Закриття на бронь",title:"Відпустили клієнта без дати",ts:"09:00",body:"Розмова закінчилась без конкретного наступного кроку.",say:"«Давайте у четвер о 17:00 повернемось до цього, я підготую розрахунок.»"}] };
    return { call, chunk, analysis };
  };

})();
