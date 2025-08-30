'use strict';

/* =========================================================
   Nauka Tarota — app.js (v4, IndexedDB + blob: URL)
   ========================================================= */

/* --- wersje cache tylko dla /img (fallback). Użytkownikowe obrazy są w IndexedDB --- */
const STATIC_CACHE = 'tarot-static-v9';
const IMG_CACHE    = 'tarot-img-v7';

/* --- ścieżka bazowa (działa w podfolderze) --- */
const BASE = location.pathname.replace(/[^/]+$/, '');
const pathJoin = (p) => (BASE + p).replace(/\/{2,}/g, '/');

/* --- DOM helpers --- */
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ----------------- 78 KART ----------------- */
const DEFAULT_CARDS = [
  // Arkana Wielkie (22)
  {id:'maj-0', name:'Głupiec (0)', suit:'Arkana Wielkie', number:0, keywords:['początek','spontaniczność','zaufanie','ryzyko'], reversed:['lekkomyślność','zwątpienie','blokada'], description:'Nowy start i skok w nieznane z wiarą w drogę.'},
  {id:'maj-1', name:'Mag (I)', suit:'Arkana Wielkie', number:1, keywords:['sprawczość','manifestacja','skupienie','narzędzia'], reversed:['manipulacja','rozproszenie','niewykorzystany potencjał'], description:'Umiejętność przekuwania zamiarów w działanie.'},
  {id:'maj-2', name:'Kapłanka (II)', suit:'Arkana Wielkie', number:2, keywords:['intuicja','tajemnica','cisza','podświadomość'], reversed:['brak kontaktu z intuicją','sekrety','chaos wewnętrzny'], description:'Zaufaj wewnętrznemu głosowi i obserwuj.'},
  {id:'maj-3', name:'Cesarzowa (III)', suit:'Arkana Wielkie', number:3, keywords:['obfitość','opieka','kreatywność','natura'], reversed:['nadopiekuńczość','zastój twórczy','rozrzutność'], description:'Wzrost i pielęgnowanie tego, co ważne.'},
  {id:'maj-4', name:'Cesarz (IV)', suit:'Arkana Wielkie', number:4, keywords:['struktura','autorytet','granice','strategia'], reversed:['sztywność','kontrola','bunt wobec zasad'], description:'Porządek i ramy dają moc działania.'},
  {id:'maj-5', name:'Kapłan (V)', suit:'Arkana Wielkie', number:5, keywords:['nauka','tradycja','mentor','rytuał'], reversed:['dogmatyzm','kwestionowanie tradycji','nietypowe ścieżki'], description:'Mądrość przekazywana w strukturze.'},
  {id:'maj-6', name:'Kochankowie (VI)', suit:'Arkana Wielkie', number:6, keywords:['relacja','wybór','harmonia','wartości'], reversed:['dysonans','niezgodność wartości','wahanie'], description:'Decyzja zgodna z sercem i wartościami.'},
  {id:'maj-7', name:'Rydwan (VII)', suit:'Arkana Wielkie', number:7, keywords:['determinacja','ruch','kontrola','zwycięstwo'], reversed:['chaos','brak kierunku','hamulce'], description:'Skup siły i jedź obranym kursem.'},
  {id:'maj-8', name:'Siła (VIII)', suit:'Arkana Wielkie', number:8, keywords:['odwaga','łagodna moc','opanowanie','zaufanie sobie'], reversed:['słabość','frustracja','samo-wątpliwość'], description:'Moc płynąca z łagodności i serca.'},
  {id:'maj-9', name:'Pustelnik (IX)', suit:'Arkana Wielkie', number:9, keywords:['samotność','poszukiwanie','refleksja','latarnia'], reversed:['izolacja','zagubienie','odcięcie od innych'], description:'Czas na wewnętrzny wgląd i ciszę.'},
  {id:'maj-10', name:'Koło Fortuny (X)', suit:'Arkana Wielkie', number:10, keywords:['cykle','los','zmiana','przełom'], reversed:['opór wobec zmian','pech','zastój'], description:'Rzeczy się obracają — szykuj się na zmianę.'},
  {id:'maj-11', name:'Sprawiedliwość (XI)', suit:'Arkana Wielkie', number:11, keywords:['prawda','równowaga','decyzja','odpowiedzialność'], reversed:['niesprawiedliwość','stronniczość','brak klarowności'], description:'Konsekwencje działań i uczciwość.'},
  {id:'maj-12', name:'Wisielec (XII)', suit:'Arkana Wielkie', number:12, keywords:['perspektywa','zawieszenie','poświęcenie','odpuszczenie'], reversed:['zawieszenie bez sensu','opór','utknięcie'], description:'Spojrzenie z innej strony przynosi sens.'},
  {id:'maj-13', name:'Śmierć (XIII)', suit:'Arkana Wielkie', number:13, keywords:['zakończenie','transformacja','przemiana','reset'], reversed:['ciągnięcie przeszłości','lęk przed zmianą','zastój'], description:'Koniec etapu, początek odnowy.'},
  {id:'maj-14', name:'Umiarkowanie (XIV)', suit:'Arkana Wielkie', number:14, keywords:['równowaga','alchemia','cierpliwość','harmonia'], reversed:['skrajności','brak umiaru','rozchwianie'], description:'Mieszaj w odpowiednich proporcjach.'},
  {id:'maj-15', name:'Diabeł (XV)', suit:'Arkana Wielkie', number:15, keywords:['uwikłanie','cienie','nałóg','materia'], reversed:['wyzwolenie','uświadomienie','zerwany łańcuch'], description:'Zobacz, co Cię zniewala, i nazwij to.'},
  {id:'maj-16', name:'Wieża (XVI)', suit:'Arkana Wielkie', number:16, keywords:['nagły wstrząs','prawda','rozpad','przebudzenie'], reversed:['opóźnione tąpnięcie','opór','strach przed zmianą'], description:'Runie to, co fałszywe — pojawi się prawda.'},
  {id:'maj-17', name:'Gwiazda (XVII)', suit:'Arkana Wielkie', number:17, keywords:['nadzieja','uzdrowienie','inspiracja','spokój'], reversed:['zwątpienie','wyczerpanie','brak wiary'], description:'Zaufaj procesowi — światło jest przed Tobą.'},
  {id:'maj-18', name:'Księżyc (XVIII)', suit:'Arkana Wielkie', number:18, keywords:['intuicja','lęki','iluzja','noc podświadomości'], reversed:['odsłonięcie','wyjście z lęku','klarowność'], description:'Poruszaj się po omacku, ufając czuciu.'},
  {id:'maj-19', name:'Słońce (XIX)', suit:'Arkana Wielkie', number:19, keywords:['radość','witalność','jasność','sukces'], reversed:['przesada','pycha','przygaszenie'], description:'Ciepło, sukces i prosta radość życia.'},
  {id:'maj-20', name:'Sąd Ostateczny (XX)', suit:'Arkana Wielkie', number:20, keywords:['przebudzenie','rozliczenie','powołanie','decyzja'], reversed:['srogość wobec siebie','zastój','przegapienie wezwania'], description:'Usłysz wezwanie i odpowiedz świadomie.'},
  {id:'maj-21', name:'Świat (XXI)', suit:'Arkana Wielkie', number:21, keywords:['domknięcie','całość','integracja','podróż'], reversed:['niedomknięty cykl','zwłoka','rozproszenie'], description:'Pełnia i zakończenie cyklu.'},

  // Buławy (14)
  {id:'bul-ace', name:'As Buław', suit:'Buławy', number:1, keywords:['inspiracja','start','energia','pasja'], reversed:['wypalenie','blokada','opóźnienie'], description:'Iskra działania i nowy impuls.'},
  {id:'bul-2', name:'Dwójka Buław', suit:'Buławy', number:2, keywords:['plan','wybór','wizja'], reversed:['wahanie','lęk przed światem','brak planu'], description:'Planowanie dalszej drogi i horyzontów.'},
  {id:'bul-3', name:'Trójka Buław', suit:'Buławy', number:3, keywords:['ekspansja','perspektywy','oczekiwanie'], reversed:['opóźnienia','brak wsparcia','krótki horyzont'], description:'Ruszają perspektywy — czekasz na wyniki.'},
  {id:'bul-4', name:'Czwórka Buław', suit:'Buławy', number:4, keywords:['świętowanie','stabilizacja','dom'], reversed:['brak wspólnoty','niestabilność','spór domowy'], description:'Ugruntowanie i małe święto postępów.'},
  {id:'bul-5', name:'Piątka Buław', suit:'Buławy', number:5, keywords:['konflikt','rywalizacja','tarcia'], reversed:['unika konfliktu','bierność','rozproszenie'], description:'Zdrowa rywalizacja lub przepychanki.'},
  {id:'bul-6', name:'Szóstka Buław', suit:'Buławy', number:6, keywords:['zwycięstwo','uznanie','postęp'], reversed:['pycha','brak uznania','spadek formy'], description:'Wygrana i zauważony sukces.'},
  {id:'bul-7', name:'Siódemka Buław', suit:'Buławy', number:7, keywords:['obrona','wyzwanie','wytrwałość'], reversed:['ustępowanie','zmęczenie','presja'], description:'Stań mocno i broń pozycji.'},
  {id:'bul-8', name:'Ósemka Buław', suit:'Buławy', number:8, keywords:['szybkość','ruch','wiadomości'], reversed:['opóźnienie','chaos','spóźnienie'], description:'Sprawy przyspieszają — lecą strzały.'},
  {id:'bul-9', name:'Dziewiątka Buław', suit:'Buławy', number:9, keywords:['wytrzymałość','granice','ostrożność'], reversed:['paranoja','poddaństwo','przemęczenie'], description:'Ostatni wysiłek — trzymaj granice.'},
  {id:'bul-10', name:'Dziesiątka Buław', suit:'Buławy', number:10, keywords:['przeciążenie','odpowiedzialność','finisz'], reversed:['zrzucenie ciężaru','odmowa','przytłoczenie'], description:'Za dużo na plecach — blisko mety.'},
  {id:'bul-page', name:'Paź Buław', suit:'Buławy', number:null, keywords:['ciekawość','nauka','iskra'], reversed:['rozproszenie','niedojrzałość','brak kierunku'], description:'Młodzieńcza iskra i chęć próbowania.'},
  {id:'bul-knight', name:'Rycerz Buław', suit:'Buławy', number:null, keywords:['działanie','pośpiech','ryzyko'], reversed:['pochopność','niestałość','przesada'], description:'Naprzód z ogniem i odwagą.'},
  {id:'bul-queen', name:'Królowa Buław', suit:'Buławy', number:null, keywords:['charyzma','ciepło','kreatywność'], reversed:['zazdrość','dominacja','gaśnięcie ognia'], description:'Magnetyzm, pewność siebie i kreatywna moc.'},
  {id:'bul-king', name:'Król Buław', suit:'Buławy', number:null, keywords:['przywództwo','wizja','przedsiębiorczość'], reversed:['despotyzm','niecierpliwość','przypalenie'], description:'Wizjoner, który porywa do działania.'},

  // Kielichy (14)
  {id:'kiel-ace', name:'As Kielichów', suit:'Kielichy', number:1, keywords:['miłość','otwartość','uzdrowienie','przepływ'], reversed:['zablokowane emocje','wypalenie','nadwrażliwość'], description:'Źródło uczuć i uzdrawiający przepływ.'},
  {id:'kiel-2', name:'Dwójka Kielichów', suit:'Kielichy', number:2, keywords:['partnerstwo','więź','zgoda'], reversed:['dysharmonia','nierówność','chłód'], description:'Spotkanie serc i porozumienie.'},
  {id:'kiel-3', name:'Trójka Kielichów', suit:'Kielichy', number:3, keywords:['radość','przyjaźń','wspólnota'], reversed:['plotki','nadmiar zabawy','rozłam'], description:'Świętowanie w gronie bliskich.'},
  {id:'kiel-4', name:'Czwórka Kielichów', suit:'Kielichy', number:4, keywords:['apatia','znudzenie','introspekcja'], reversed:['przebudzenie','nowa ciekawość','otwarcie'], description:'Zatrzymanie, by zobaczyć, czego chcesz.'},
  {id:'kiel-5', name:'Piątka Kielichów', suit:'Kielichy', number:5, keywords:['żal','strata','rozczarowanie'], reversed:['akceptacja','uzdrowienie','perspektywa'], description:'Smutek po stracie i nauka akceptacji.'},
  {id:'kiel-6', name:'Szóstka Kielichów', suit:'Kielichy', number:6, keywords:['nostalgia','wspomnienia','niewinność'], reversed:['utknięcie w przeszłości','naiwność','idealizacja'], description:'Ciepłe wspomnienia i prostota serca.'},
  {id:'kiel-7', name:'Siódemka Kielichów', suit:'Kielichy', number:7, keywords:['wybory','fantazje','iluzje'], reversed:['klarowność','priorytety','realizm'], description:'Wiele opcji — łatwo się zagubić.'},
  {id:'kiel-8', name:'Ósemka Kielichów', suit:'Kielichy', number:8, keywords:['odejście','poszukiwanie','zmiana'], reversed:['utknięcie','strach przed odejściem','wracanie'], description:'Odejście, by znaleźć pełnię.'},
  {id:'kiel-9', name:'Dziewiątka Kielichów', suit:'Kielichy', number:9, keywords:['spełnienie','satysfakcja','wdzięczność'], reversed:['nadmiar','pusta przyjemność','rozpusta'], description:'Życzenia się spełniają — doceniaj.'},
  {id:'kiel-10', name:'Dziesiątka Kielichów', suit:'Kielichy', number:10, keywords:['rodzina','harmonia','szczęście'], reversed:['pęknięcia w relacji','pozór','brak wsparcia'], description:'Pełnia emocjonalnego spełnienia.'},
  {id:'kiel-page', name:'Paź Kielichów', suit:'Kielichy', number:null, keywords:['wrażliwość','wiadomość','intuicja'], reversed:['niedojrzałość','huśtawka uczuć','marzycielstwo'], description:'Delikatny impuls serca i wyobraźni.'},
  {id:'kiel-knight', name:'Rycerz Kielichów', suit:'Kielichy', number:null, keywords:['romantyzm','podróż','ideały'], reversed:['ucieczka w fantazje','niestałość','zawód'], description:'Posłaniec uczuć, ruch serca naprzód.'},
  {id:'kiel-queen', name:'Królowa Kielichów', suit:'Kielichy', number:null, keywords:['empatia','opieka','uzdrawianie'], reversed:['nadwrażliwość','zlew granic','nastrojowość'], description:'Dojrzała, wspierająca obecność emocjonalna.'},
  {id:'kiel-king', name:'Król Kielichów', suit:'Kielichy', number:null, keywords:['dojrzałość emocjonalna','równowaga','dyplomacja'], reversed:['tłumienie uczuć','manipulacja','chłód'], description:'Spokój serca i mądra empatia.'},

  // Miecze (14)
  {id:'mie-ace', name:'As Mieczy', suit:'Miecze', number:1, keywords:['prawda','klarowność','decyzja'], reversed:['mętlik','półprawdy','zwłoka'], description:'Przebłysk zrozumienia i cięcie iluzji.'},
  {id:'mie-2', name:'Dwójka Mieczy', suit:'Miecze', number:2, keywords:['rozterka','blokada','kompromis'], reversed:['odblokowanie','wybór','wypłynięcie emocji'], description:'Skrzyżowane miecze — czas rozwiązać węzeł.'},
  {id:'mie-3', name:'Trójka Mieczy', suit:'Miecze', number:3, keywords:['ból','pęknięte serce','smutek'], reversed:['gojenie','akceptacja','zrozumienie'], description:'Bolesna prawda prowadzi do oczyszczenia.'},
  {id:'mie-4', name:'Czwórka Mieczy', suit:'Miecze', number:4, keywords:['odpoczynek','regeneracja','pauza'], reversed:['niepokój','nadmierna bierność','bezsenność'], description:'Zatrzymaj się i odzyskaj siły.'},
  {id:'mie-5', name:'Piątka Mieczy', suit:'Miecze', number:5, keywords:['konflikt','wygrana kosztem','napięcie'], reversed:['pojednanie','odpuszczenie','nauka na błędach'], description:'Czy ta wygrana jest tego warta?'},
  {id:'mie-6', name:'Szóstka Mieczy', suit:'Miecze', number:6, keywords:['przejście','podróż','ulga'], reversed:['trudne odejście','ciągnięcie bagażu','opóźnienie'], description:'Odpływasz ku spokojniejszym wodom.'},
  {id:'mie-7', name:'Siódemka Mieczy', suit:'Miecze', number:7, keywords:['strategia','spryt','sekret'], reversed:['ujawnienie','konsekwencje','szczerość'], description:'Działaj mądrze, nie zawsze wprost.'},
  {id:'mie-8', name:'Ósemka Mieczy', suit:'Miecze', number:8, keywords:['ograniczenie','lęk','paraliż'], reversed:['uwolnienie','zobaczenie wyjścia','odwaga'], description:'Więzienie z własnych myśli — klucz masz Ty.'},
  {id:'mie-9', name:'Dziewiątka Mieczy', suit:'Miecze', number:9, keywords:['zmartwienia','koszmary','lęk'], reversed:['ulga','rozmowa','wsparcie'], description:'Nocne myśli wyolbrzymiają — szukaj wsparcia.'},
  {id:'mie-10', name:'Dziesiątka Mieczy', suit:'Miecze', number:10, keywords:['zakończenie','upadek','dno'], reversed:['wstanie','regeneracja','domknięcie'], description:'Koniec trudnego cyklu — świt za horyzontem.'},
  {id:'mie-page', name:'Paź Mieczy', suit:'Miecze', number:null, keywords:['ciekawość','obserwacja','wiadomość'], reversed:['plotki','impulsywność','niepokój'], description:'Głód wiedzy i baczna obserwacja.'},
  {id:'mie-knight', name:'Rycerz Mieczy', suit:'Miecze', number:null, keywords:['pośpiech','walka','determinacja'], reversed:['agresja','chaos','głupie ryzyko'], description:'Szaleńczy pęd za ideą.'},
  {id:'mie-queen', name:'Królowa Mieczy', suit:'Miecze', number:null, keywords:['niezależność','szczerość','wgląd'], reversed:['chłód','krytycyzm','odcięcie'], description:'Jasny umysł i szczera komunikacja.'},
  {id:'mie-king', name:'Król Mieczy', suit:'Miecze', number:null, keywords:['autorytet','logika','prawo'], reversed:['sztywność','nadużycie władzy','bezduszność'], description:'Rozum, zasady i obiektywizm.'},

  // Pentakle (14)
  {id:'pen-ace', name:'As Pentakli', suit:'Pentakle', number:1, keywords:['szansa materialna','zasoby','nasiono'], reversed:['zmarnowana okazja','opóźnienie','brak fundamentu'], description:'Praktyczny start i namacalna okazja.'},
  {id:'pen-2', name:'Dwójka Pentakli', suit:'Pentakle', number:2, keywords:['balans','żonglowanie','adaptacja'], reversed:['przeciążenie','chaos','brak priorytetów'], description:'Utrzymuj równowagę w sprawach.'},
  {id:'pen-3', name:'Trójka Pentakli', suit:'Pentakle', number:3, keywords:['współpraca','rzemiosło','jakość'], reversed:['brak standardów','rozjazd w zespole','fuszerka'], description:'Dobra robota dzięki współpracy.'},
  {id:'pen-4', name:'Czwórka Pentakli', suit:'Pentakle', number:4, keywords:['kontrola','oszczędność','przywiązanie'], reversed:['puszczenie','szczodrość','odprężenie'], description:'Trzymanie kurczowo zasobów i pozycji.'},
  {id:'pen-5', name:'Piątka Pentakli', suit:'Pentakle', number:5, keywords:['niedostatek','wykluczenie','próba'], reversed:['pomoc','wyjście z kryzysu','solidarność'], description:'Chłód i brak — rozejrzyj się po wsparcie.'},
  {id:'pen-6', name:'Szóstka Pentakli', suit:'Pentakle', number:6, keywords:['hojność','wymiana','wsparcie'], reversed:['nierówność','uzależnienie','warunkowość'], description:'Dawanie i branie w równowadze.'},
  {id:'pen-7', name:'Siódemka Pentakli', suit:'Pentakle', number:7, keywords:['cierpliwość','ocena','wzrost'], reversed:['niecierpliwość','rezygnacja','zła inwestycja'], description:'Czekanie na plony i przegląd działań.'},
  {id:'pen-8', name:'Ósemka Pentakli', suit:'Pentakle', number:8, keywords:['nauka','praktyka','mistrzostwo'], reversed:['monotonia','bylejakość','brak nauki'], description:'Szlif umiejętności i skupienie.'},
  {id:'pen-9', name:'Dziewiątka Pentakli', suit:'Pentakle', number:9, keywords:['niezależność','luksus','ogród'], reversed:['uzależnienie','przesada','samotność'], description:'Owoc pracy — samowystarczalność.'},
  {id:'pen-10', name:'Dziesiątka Pentakli', suit:'Pentakle', number:10, keywords:['rodzina','dziedzictwo','trwałość'], reversed:['spory majątkowe','kruchość fundamentów','brak wsparcia'], description:'Stabilne zaplecze i wielopokoleniowość.'},
  {id:'pen-page', name:'Paź Pentakli', suit:'Pentakle', number:null, keywords:['nauka','oferta','praktyczność'], reversed:['rozproszenie','brak planu','zaniedbanie'], description:'Pierwsze kroki w materii i nauce.'},
  {id:'pen-knight', name:'Rycerz Pentakli', suit:'Pentakle', number:null, keywords:['systematyczność','praca','solidność'], reversed:['opór przed zmianą','powolność','upór'], description:'Sumienne, konsekwentne działanie.'},
  {id:'pen-queen', name:'Królowa Pentakli', suit:'Pentakle', number:null, keywords:['troska','gospodarność','stabilność'], reversed:['przesadna kontrola','materializm','przemęczenie'], description:'Ciepło, bezpieczeństwo i praktyczność.'},
  {id:'pen-king', name:'Król Pentakli', suit:'Pentakle', number:null, keywords:['bezpieczeństwo','przedsiębiorczość','obfitość'], reversed:['upór','chciwość','sztywność'], description:'Doświadczony budowniczy stabilnych struktur.'}
];
let cards = DEFAULT_CARDS;
/* ----------------- STAN ----------------- */
const state = { currentLearnCard:null, currentLearnReversed:false, stats: loadStats() };
const imageMap = {}; // id -> blob: URL (z IndexedDB)

/* ----------------- UTIL ----------------- */
function shuffle(a){ const x=a.slice(); for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]];} return x; }
function pickRandomCard(ex=[]){ const pool=cards.filter(c=>!ex.includes(c.id)); const card=pool[Math.floor(Math.random()*pool.length)]; return {card,reversed:Math.random()<0.5}; }
function fmtOrientation(rev){ return rev ? '<span class="rotate">⤾</span> odwrócona' : 'prosta'; }

/* ----------------- IndexedDB: user images ----------------- */
function openUserDB(){
  return new Promise((res,rej)=>{
    const req = indexedDB.open('tarot-user', 1);
    req.onupgradeneeded = ()=>{ const db=req.result; if(!db.objectStoreNames.contains('images')) db.createObjectStore('images',{keyPath:'id'}); };
    req.onsuccess = ()=> res(req.result);
    req.onerror   = ()=> rej(req.error);
  });
}
function idb(req){ return new Promise((res,rej)=>{ req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); }); }

async function saveBlobAsUserImage(cardId, blob, contentType){
  const db = await openUserDB();
  const tx = db.transaction('images','readwrite');
  await idb(tx.objectStore('images').put({ id:cardId, type: contentType || blob.type || 'image/png', blob }));
  await new Promise(r=> tx.oncomplete=r);
  if (imageMap[cardId]) { try{ URL.revokeObjectURL(imageMap[cardId]); }catch{} }
  imageMap[cardId] = URL.createObjectURL(new Blob([blob], {type: contentType || blob.type || 'image/png'}));
}
async function restoreUserImages(){
  try {
    const db  = await openUserDB();
    const all = await idb(db.transaction('images').objectStore('images').getAll());
    for (const row of (all||[])){
      imageMap[row.id] = URL.createObjectURL(new Blob([row.blob], {type: row.type || row.blob?.type || 'image/*'}));
    }
  }catch(e){ console.warn('restoreUserImages', e); }
}
async function listUserImages(){
  const db = await openUserDB();
  const store = db.transaction('images').objectStore('images');
  const keys = await idb(store.getAllKeys ? store.getAllKeys() : store.getAll());
  return Array.isArray(keys) && (typeof keys[0] === 'string' || typeof keys[0] === 'number')
    ? keys
    : (keys||[]).map(r=>r.id);
}
async function removeUserImage(id){
  const db = await openUserDB();
  const tx = db.transaction('images','readwrite');
  await idb(tx.objectStore('images').delete(id));
  await new Promise(r=> tx.oncomplete=r);
  if (imageMap[id]){ try{ URL.revokeObjectURL(imageMap[id]); }catch{}; delete imageMap[id]; }
  if (state.currentLearnCard?.id === id && $('#learnImg')){ setFallbackImage($('#learnImg'), id); updateLearnUI(); }
}
async function clearAllUserImages(){
  const db = await openUserDB();
  const tx = db.transaction('images','readwrite');
  await idb(tx.objectStore('images').clear());
  await new Promise(r=> tx.oncomplete=r);
  for (const url of Object.values(imageMap)) try{ URL.revokeObjectURL(url); }catch{}
  Object.keys(imageMap).forEach(k=> delete imageMap[k]);
}

/* ----------------- Nazwy → ID (PL/EN, rzymskie, 0-leading) ----------------- */
function romanToInt(str){
  const map = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let s=(str||'').toUpperCase(), i=0, res=0;
  while(i<s.length){ if(i+1<s.length && map[s.slice(i,i+2)]){res+=map[s.slice(i,i+2)]; i+=2;} else {res+=map[s[i]]||0; i++;} }
  return res || null;
}
const suitSyn = { bulawy:'bul', wands:'bul', wand:'bul',
  kielichy:'kiel', kielich:'kiel', kielichow:'kiel', puchary:'kiel', cups:'kiel', cup:'kiel',
  miecze:'mie', miecz:'mie', swords:'mie', sword:'mie',
  denary:'pen', pentakle:'pen', pentakl:'pen', pentacles:'pen', coins:'pen', coin:'pen', monety:'pen', moneta:'pen' };
const rankSyn = { a:'ace', as:'ace', ace:'ace',
  '1':'ace','01':'ace','2':'2','02':'2','3':'3','03':'3','4':'4','04':'4','5':'5','05':'5',
  '6':'6','06':'6','7':'7','07':'7','8':'8','08':'8','9':'9','09':'9','10':'10',
  paz:'page', page:'page', valet:'page', giermek:'page', walet:'page',
  rycerz:'knight', knight:'knight',
  krolowa:'queen', queen:'queen',
  krol:'king', king:'king' };
const MAJOR_NAMES = [
  [0,'glupiec','fool'],[1,'mag','magician'],[2,'kaplanka','high-priestess'],[3,'cesarzowa','empress'],
  [4,'cesarz','emperor'],[5,'kaplan','hierophant'],[6,'kochankowie','lovers'],[7,'rydwan','chariot'],
  [8,'sila','strength'],[9,'pustelnik','hermit'],[10,'kolo-fortuny','wheel-of-fortune'],[11,'sprawiedliwosc','justice'],
  [12,'wisielec','hanged-man'],[13,'smierc','death'],[14,'umiarkowanie','temperance'],[15,'diabel','devil'],
  [16,'wieza','tower'],[17,'gwiazda','star'],[18,'ksiezyc','moon'],[19,'slonce','sun'],
  [20,'sad-ostateczny','judgement'],[21,'swiat','world']
];
const majorNameToId = new Map(); for (const [id,pl,en] of MAJOR_NAMES){ majorNameToId.set(pl,id); majorNameToId.set(en,id); }
function normSlug(s){
  return (s||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function autoMatchCardIdFromFilename(filename){
  const stem = normSlug(filename.replace(/\.[^.]+$/,''));
  const parts = stem.split('-');

  // MINOR: suit + rank
  let suit=null, rank=null;
  for (const p of parts){ if (suitSyn[p]) suit = suitSyn[p]; if (rankSyn[p]) rank = rankSyn[p]; }
  if (suit && rank) return `${suit}-${rank}`;

  // MAJOR: arabskie (0..21, zera wiodące OK)
  for (const p of parts){
    if (/^(0|[0-1]?\d|2[0-1])$/.test(p)){ const no = parseInt(p,10); if (no>=0 && no<=21) return `maj-${no}`; }
  }
  // MAJOR: rzymskie
  const joined = parts.join('-');
  const m = joined.match(/\b(m|cm|d|cd|c|xc|l|xl|x|ix|v|iv|i)+\b/i);
  if (m){ const val = romanToInt(m[0]); if (val!==null && val>=0 && val<=21) return `maj-${val}`; }

  // MAJOR: nazwy (PL/EN)
  const flat = joined.replace(/-/g,'');
  for (const [name,id] of majorNameToId.entries()){
    if (flat.includes(name.replace(/-/g,''))) return `maj-${id}`;
  }

  // fallback: jeśli nazwa zawiera dosłownie nasze ID
  for (const c of cards) if (stem.includes(normSlug(c.id))) return c.id;

  return null;
}

/* ----------------- Statystyki ----------------- */
function loadStats(){ try{ return JSON.parse(localStorage.getItem('tarotStats')||'{}'); }catch{ return {}; } }
function saveStats(){ localStorage.setItem('tarotStats', JSON.stringify(state.stats)); }
function bumpStat(id, ok){ const s=state.stats[id]||{ok:0,tries:0}; s.tries++; if(ok)s.ok++; state.stats[id]=s; saveStats(); renderStats(); }
function markLearned(id){ const s=state.stats[id]||{ok:0,tries:0}; s.ok++; s.tries++; state.stats[id]=s; saveStats(); renderStats(); }

/* ----------------- Obrazy: fallback z /img + z IDB ----------------- */
function setFallbackImage(imgEl, cardId){
  imgEl.onerror = null;
  imgEl.src = pathJoin(`img/${cardId}.jpg`);
  imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = pathJoin(`img/${cardId}.png`); };
}
function getImageFor(card, imgEl){
  if (imageMap[card.id]) { imgEl.src = imageMap[card.id]; return; }
  setFallbackImage(imgEl, card.id);
}

/* ----------------- UI: nawigacja ----------------- */
$$('.tab').forEach(btn=>{
  btn?.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    $$('main section').forEach(s=>s.classList.remove('active'));
    $('#'+btn.dataset.tab)?.classList.add('active');
  });
});
/* ===== Więcej o karcie (akordeon) ===== */
function renderLearnMore(card){
  const wrap = document.getElementById('learnMore');
  if (!wrap) return;
  const m = card && card.more ? card.more : {};
  let html = '';

  // Korespondencje
  if (m.correspondences){
    const kv = m.correspondences;
    const label = {element:'Żywioł', planet:'Planeta', zodiac:'Zodiak', numerology:'Numerologia'};
    let rows = '';
    ['element','planet','zodiac','numerology'].forEach(k=>{
      if (kv[k]) rows += `<div><b>${label[k]}:</b></div><div>${kv[k]}</div>`;
    });
    if (rows) html += `<details><summary>Korespondencje</summary><div class="kv" style="margin-top:8px">${rows}</div></details>`;
  }

  // Znaczenia – obszary
  if (m.meanings){
    const lab = {love:'Miłość/Relacje', career:'Praca', finance:'Finanse', health:'Zdrowie', advice:'Rada', yesno:'Tak/Nie', timing:'Timing'};
    let out = '';
    ['love','career','finance','health','advice','yesno','timing'].forEach(k=>{
      if (m.meanings[k]) out += `<p><b>${lab[k]}:</b> ${m.meanings[k]}</p>`;
    });
    if (out) html += `<details><summary>Znaczenia — obszary</summary>${out}</details>`;
  }

  if (Array.isArray(m.imagery) && m.imagery.length)
    html += `<details><summary>Symbolika na ilustracji</summary><ul>${m.imagery.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;

  if (Array.isArray(m.questions) && m.questions.length)
    html += `<details><summary>Pytania do refleksji</summary><ul>${m.questions.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;

  if (Array.isArray(m.affirmations) && m.affirmations.length)
    html += `<details><summary>Afirmacje</summary><ul>${m.affirmations.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;

  if (m.notes) html += `<details><summary>Notatki</summary><p>${m.notes}</p></details>`;

  wrap.style.display = html ? 'block' : 'none';
  wrap.innerHTML = html;
}
/* ----------------- Nauka ----------------- */
function updateLearnUI(){
  const card = state.currentLearnCard; const rev = state.currentLearnReversed;
  if (!card) return;
  $('#learnImg')?.classList.toggle('reversed', rev);
  $('#learnTitle') && ($('#learnTitle').innerHTML = `${card.name} <span class="pill">${fmtOrientation(rev)}</span>`);
  $('#learnMeta')  && ($('#learnMeta').textContent = `${card.suit} • nr ${card.number ?? '—'}`);
  $('#learnDesc')  && ($('#learnDesc').textContent = card.description);
  const kws = rev ? card.reversed : card.keywords;
  $('#learnKeywords') && ($('#learnKeywords').innerHTML = kws.map(k=>`<span class="pill">${k}</span>`).join(''));
renderLearnMore(state.currentLearnCard);  
}
function renderLearn({card,reversed}){ state.currentLearnCard=card; state.currentLearnReversed=reversed; $('#learnImg')&&getImageFor(card,$('#learnImg')); updateLearnUI(); }
$('#btnLearnRandom')?.addEventListener('click', ()=> renderLearn(pickRandomCard()));
$('#btnLearnSave')?.addEventListener('click', ()=>{ if(!state.currentLearnCard) return; markLearned(state.currentLearnCard.id); renderLearn(pickRandomCard([state.currentLearnCard.id])); });
$('#btnFlip')?.addEventListener('click', ()=>{ if(!state.currentLearnCard) return; state.currentLearnReversed=!state.currentLearnReversed; updateLearnUI(); });
if ($('#learnImg')){ $('#learnImg').style.cursor='pointer'; $('#learnImg').addEventListener('click', ()=>{ if(!state.currentLearnCard)return; state.currentLearnReversed=!state.currentLearnReversed; updateLearnUI(); }); }

/* ----------------- Losowanie ----------------- */
$('#btnDraw')?.addEventListener('click', ()=>{
  const {card,reversed} = pickRandomCard();
  const id = `img-${Date.now()}`;
  $('#drawResult') && ($('#drawResult').innerHTML = `
    <div class="row">
      <img id="${id}" class="tarot-img ${reversed?'reversed':''}" alt="${card.name}">
      <div class="grow card">
        <h3 style="margin:0 0 6px">${card.name} <span class="pill">${fmtOrientation(reversed)}</span></h3>
        <div class="muted">${card.suit} • nr ${card.number ?? '—'}</div>
        <p class="mt-10">${card.description}</p>
        <div>${(reversed?card.reversed:card.keywords).map(k=>`<span class="pill">${k}</span>`).join('')}</div>
      </div>
    </div>`);
  const el = document.getElementById(id); el && getImageFor(card, el);
});

/* ----------------- Rozkład 3 kart ----------------- */
$('#btnSpread')?.addEventListener('click', ()=>{
  const a = pickRandomCard(); const b = pickRandomCard([a.card.id]); const c = pickRandomCard([a.card.id,b.card.id]);
  const slots = [
    {img:'#spPastImg',  t:'#spPast',   p:'#spPastTxt',   pick:a, hint:'Co ukształtowało obecną sytuację?'},
    {img:'#spNowImg',   t:'#spNow',    p:'#spNowTxt',    pick:b, hint:'Jaki jest stan „tu i teraz”?'},
    {img:'#spFutureImg',t:'#spFuture', p:'#spFutureTxt', pick:c, hint:'Jaki kierunek/rezultat jest możliwy?'}
  ];
  slots.forEach(({img,t,p,pick,hint})=>{
    const {card,reversed}=pick; const el=$(img);
    el && (getImageFor(card, el), el.classList.toggle('reversed', reversed));
    $(t) && ($(t).innerHTML = `${card.name} • <b>${fmtOrientation(reversed)}</b>`);
    const kws=(reversed?card.reversed:card.keywords).slice(0,3);
    $(p) && ($(p).innerHTML = `${card.description}<br><span class="muted">Słowa kluczowe: ${kws.join(', ')}</span><br><span class="muted">${hint}</span>`);
  });
});

/* ----------------- Quiz ----------------- */
function nextQuiz(){
  const {card,reversed} = pickRandomCard();
  const kws=(reversed?card.reversed:card.keywords);
  $('#quizPrompt') && ($('#quizPrompt').textContent = `Słowa kluczowe: ${shuffle(kws).slice(0,Math.min(3,kws.length)).join(' • ')}`);
  const opts = shuffle([card, ...shuffle(cards.filter(c=>c.id!==card.id)).slice(0,3)]);
  const ul = $('#quizOptions'); if (!ul) return; ul.innerHTML='';
  opts.forEach(opt=>{
    const li=document.createElement('li'); li.textContent=opt.name;
    li.addEventListener('click', ()=>{
      $$('#quizOptions li').forEach(x=>x.style.pointerEvents='none');
      if (opt.id===card.id){ li.classList.add('correct'); bumpStat(card.id,true); }
      else { li.classList.add('wrong'); Array.from(ul.children).forEach(x=>{ if (x.textContent===card.name) x.classList.add('correct'); }); bumpStat(card.id,false); }
    });
    ul.appendChild(li);
  });
}
$('#btnQuizNext')?.addEventListener('click', ()=>{ $$('#quizOptions li').forEach(x=>x.style.pointerEvents='auto'); nextQuiz(); });

/* ----------------- Statystyki ----------------- */
function renderStats(){
  const tbody = $('#statTable tbody'); if (!tbody) return;
  tbody.innerHTML = cards.map(c=>{
    const s = state.stats[c.id] || {ok:0,tries:0};
    const rate = s.tries ? Math.round(100*s.ok/s.tries)+'%' : '—';
    return `<tr><td>${c.name}</td><td>${s.ok}</td><td>${s.tries}</td><td>${rate}</td></tr>`;
  }).join('');
}
$('#btnResetStats')?.addEventListener('click', ()=>{ if (confirm('Na pewno usunąć statystyki?')){ state.stats={}; saveStats(); renderStats(); } });

/* ====== Opisy kart: eksport / import / override z pamięci ====== */
const CARD_TEXTS_KEY = 'tarotCardTextsOverride'; // localStorage

// dopasowanie po ID; potem po nazwie; a na końcu "fuzzy":
// szukamy w aktualnej bazie kart ID zaczynających się od prefiksu koloru
// i zawierających JAKIKOLWIEK synonim rangi (as/a/ace/0/1, ryc/rycerz/knight/12, krol/krolowa/queen/king/13/14, itd.)
function applyCardTextsData(data, {persist=false} = {}){
  if (!data || !Array.isArray(data.cards)) return 0;

  const map = new Map(cards.map(c => [c.id, {...c}]));

  const norm = s => (s||'')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'');

  // indeks po nazwie (gdy nazwy się pokrywają – szybkie dopasowanie)
  const nameIndex = new Map();
  for (const c of map.values()) nameIndex.set(norm(c.name), c.id);

  // aliasy/synonimy nazw kolorów
  const suitAlias = new Map([
    ['bul', ['buławy','bulawy','buław','bulaw','wands','kije','pałki','palki']],
    ['kiel',['kielichy','kielichów','kielichow','kielich','cups','puchary','puch']],
    ['mie', ['miecze','mieczy','miecz','swords']],
    // u Ciebie w plikach jest "denary" → też mapujemy
    ['pen', ['pentakle','pentakli','pentakl','monety','monet','moneta','denary','denar','den','coins','pentacles']]
  ]);
  const suitFrom = (suit,name) => {
    const t = (suit||name||'').toLowerCase();
    for (const [pref, arr] of suitAlias) if (arr.some(a => t.includes(a))) return pref;
    return null;
  };

  // ranga z nazwy (tekst)
  const rankFromName = name => {
    const s = (name||'').toLowerCase();
    if (s.startsWith('as') || s === 'a') return 'as';
    if (s.startsWith('paź') || s.startsWith('paz')) return 'paz';
    if (s.startsWith('rycerz')) return 'rycerz';
    if (s.startsWith('królowa') || s.startsWith('krolowa')) return 'krolowa';
    if (s.startsWith('król') || s.startsWith('krol')) return 'krol';
    return null;
  };

  // synonimy rang – użyjemy do fuzzy-match w ID
  const rankSyns = r => {
    const x = String(r||'').toLowerCase();
    if (x==='1' || x==='as' || x==='a') return ['as','a','1','0','ace']; // dodaj też '0' – niektóre talie tak oznaczają Asa
    if (x==='paz' || x==='page' || x==='walet' || x==='giermek') return ['paz','page','walet','giermek','11'];
    if (x==='ryc' || x==='rycerz' || x==='knight') return ['ryc','rycerz','knight','12','ry'];
    if (x==='krolowa' || x==='królowa' || x==='queen' || x==='dama') return ['krolowa','królowa','queen','dama','13','q'];
    if (x==='krol' || x==='król' || x==='king') return ['krol','król','king','14','k'];
    // jeśli przyszła liczba 2..10 – dopasujemy po samej liczbie
    return [x];
  };

  // rozbij ID na [suit, rank] jeśli się da
  const splitId = id => {
    const m = String(id||'').match(/^([a-z]+)-([a-z0-9]+)$/);
    return m ? {s: m[1], r: m[2]} : null;
  };

  // dla koloru znajdź wszystkie ID w bazie, które "pasują rangą"
  const fuzzyFindId = (pref, r) => {
    if (!pref || !r) return null;
    const syns = rankSyns(r);
    // kandydaci = wszystkie id z danym prefiksem koloru
    const keys = Array.from(map.keys()).filter(k => k.startsWith(pref + '-'));
    // najpierw próbuj exact 'pref-r', potem zawierające któryś z synonimów po myślniku
    for (const guess of syns.map(rr => `${pref}-${rr}`)){
      if (map.has(guess)) return guess;
    }
    for (const k of keys){
      const tail = k.slice((pref+'-').length);
      if (syns.some(syn => tail.includes(syn))) return k;
    }
    // dodatkowo: liczby 11–14 i 1/0 na dworskie/asa
    const rn = Number(r);
    if (!Number.isNaN(rn)){
      const tryNum = `${pref}-${rn}`;
      if (map.has(tryNum)) return tryNum;
      if (rn===1 && map.has(`${pref}-as`)) return `${pref}-as`;
      if (rn===1 && map.has(`${pref}-0`))  return `${pref}-0`;
    }
    return null;
  };

  let applied = 0;
  const skipped = [];

  for (const ov of data.cards){
    if (!ov) continue;
    let id = null;

    // 1) dokładne ID
    if (ov.id && map.has(ov.id)) id = ov.id;

    // 2) aliasy ID → rozbij i użyj fuzzy na bazie
    if (!id && ov.id){
      const p = splitId(ov.id);
      if (p){
        // aliasy koloru w ID (np. pen/den/mon) i rangi (as/a/1/0 itd.) ogarniemy fuzzy
        id = fuzzyFindId(p.s, p.r);
      }
    }

    // 3) po nazwie (jeśli nazwy identyczne)
    if (!id && ov.name){
      const byName = nameIndex.get(norm(ov.name));
      if (byName) id = byName;
    }

    // 4) heurystyka: suit z nazwy/opisu + ranga z nazwy
    if (!id){
      const pref = suitFrom(ov.suit, ov.name);
      const rnk  = rankFromName(ov.name);
      if (pref && rnk){
        id = fuzzyFindId(pref, rnk);
      }
    }

    if (!id){ skipped.push(ov.id || ov.name || '?'); continue; }

    const base = map.get(id);
    map.set(id, {
      ...base,
      name:        ov.name        ?? base.name,
      suit:        ov.suit        ?? base.suit,
      number:      (ov.number !== undefined ? ov.number : base.number),
      description: ov.description ?? base.description,
      keywords:    Array.isArray(ov.keywords) ? ov.keywords : base.keywords,
      reversed:    Array.isArray(ov.reversed) ? ov.reversed : base.reversed,
      more:        ov.more ? { ...(base.more||{}), ...ov.more } : (base.more || undefined)
    });
    applied++;
  }

  cards = Array.from(map.values());

  if (persist){
    try{
      localStorage.setItem(CARD_TEXTS_KEY, JSON.stringify({
        version: data.version || 1,
        lang: data.lang || 'pl',
        cards: data.cards
      }));
    }catch(e){}
  }

  window._lastImportSkipped = skipped; // do "Pokaż pominięte"
  return applied;
}
// 1) Start: najpierw override z pamięci, potem (jeśli brak) plik /data/cards.pl.json
async function loadCardTextsFromJson(){
  // override w localStorage?
  try{
    const raw = localStorage.getItem(CARD_TEXTS_KEY);
    if (raw){
      const data = JSON.parse(raw);
      const n = applyCardTextsData(data, {persist:false});
      if (n) { console.log(`Załadowano własne opisy z pamięci: ${n}`); return; }
    }
  }catch{}

  // plik w /data (jeśli istnieje)
  try{
    const res = await fetch(pathJoin('data/cards.pl.json'), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const n = applyCardTextsData(data, {persist:false});
    if (n) console.log(`Załadowano opisy z data/cards.pl.json: ${n}`);
  }catch(err){
    console.warn('Nie udało się wczytać data/cards.pl.json', err);
  }
}

// 2) Eksport – zapisuje bieżącą bazę do pliku JSON
function exportCardsJson(){
  const payload = {
    version: 1,
    lang: 'pl',
    generatedAt: new Date().toISOString(),
    cards: cards.map(c => ({
      id: c.id,
      name: c.name,
      suit: c.suit,
      number: c.number,
      description: c.description,
      keywords: c.keywords,
      reversed: c.reversed,
more: c.more || undefined
    }))
  };
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.href = url; a.download = `cards.pl.${ts}.json`;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 100);
}

// Import – przyjmie wrapper .cards, tablicę lub pojedynczą kartę + pokaże konkretny błąd
async function importCardsJson(file){
  try{
    const text = await file.text();

    // 1) parse z jasnym komunikatem
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      alert('Plik nie jest poprawnym JSON-em:\n' + (e.message || e));
      return;
    }

    // 2) normalizacja wejścia
    let cardsArr = [];
    if (raw && Array.isArray(raw.cards))      cardsArr = raw.cards;
    else if (Array.isArray(raw))              cardsArr = raw;
    else if (raw && typeof raw === 'object' && (raw.id || raw.name || raw.description || raw.more))
      cardsArr = [raw];
    else {
      alert('Ten plik nie wygląda na opisy kart — brak tablicy lub pola "cards".');
      return;
    }

    // 3) merge + zapis override
    const data = { version: Number(raw.version || 1), lang: raw.lang || 'pl', cards: cardsArr };
    const n = applyCardTextsData(data, {persist:true});
// RAPORT: co się nie dopasowało (np. inne ID/nazwa)
const skipped = window._lastImportSkipped || [];
const extra = skipped.length ? `\nPominięto: ${skipped.length} (szczegóły w konsoli).` : '';
console.warn('Pominięte podczas importu:', skipped);

    // 4) odśwież aktualnie widoczną kartę
    if (state?.currentLearnCard) updateLearnUI();

alert(`Zaimportowano opisy: ${n} kart.${extra}`);


    alert(`Zaimportowano opisy: ${n} kart. Zapisano w pamięci tej aplikacji.`);
  }catch(err){
    alert('Nie udało się wczytać pliku JSON:\n' + (err.message || err));
  }
}

// 4) Wyczyść własne opisy (powrót do domyślnych/pliku z data/)
function clearCustomCardTexts(){
  try{ localStorage.removeItem(CARD_TEXTS_KEY); }catch{}
  // wróć do domyślnych i ewentualnego pliku w /data
  cards = DEFAULT_CARDS;
  loadCardTextsFromJson()
    .then(()=>{
      renderStats?.();
      if (state?.currentLearnCard){
        const id = state.currentLearnCard.id;
        state.currentLearnCard = cards.find(c=>c.id===id) || cards[0];
        updateLearnUI?.();
      }
      alert('Usunięto własne opisy. Załadowano domyślne (i plik z /data, jeśli istnieje).');
    })
    .catch(()=>{
      alert('Usunięto własne opisy. (Nie udało się ponownie wczytać pliku /data).');
    });
}

/* — listenery przycisków JSON (sekcja „Obrazy”) — */
$('#btnExportCardsJson')?.addEventListener('click', exportCardsJson);
$('#btnImportCardsJson')?.addEventListener('click', ()=> $('#jsonCardsPicker')?.click());
$('#jsonCardsPicker')?.addEventListener('change', (e)=>{
  const file = e.target.files?.[0]; if (!file) return;
  importCardsJson(file).finally(()=>{ e.target.value=''; });
});
$('#btnClearCustomTexts')?.addEventListener('click', ()=>{
  if (confirm('Usunąć własne opisy z pamięci tej aplikacji?')) clearCustomCardTexts();
});
$('#btnShowImportDetails')?.addEventListener('click', ()=>{
  const skipped = window._lastImportSkipped || [];
  if (!skipped.length) { alert('Brak pominiętych pozycji.'); return; }
  const preview = skipped.slice(0, 50).join(', ');
  alert(`Pominięto ${skipped.length} pozycji:\n${preview}${skipped.length>50?'\n…':''}`);
});
/* ----------------- Precache /img (fallback) ----------------- */
async function precacheAllImages(){
  if (!('caches' in window)) { alert('Brak wsparcia Cache API.'); return; }
  const cache = await caches.open(IMG_CACHE);
  let ok=0;
  for (const c of cards){
    for (const ext of ['jpg','png']){
      const url = pathJoin(`img/${c.id}.${ext}`);
      try { await cache.add(url); ok++; break; } catch {}
    }
  }
  alert(`Dodano do cache: ${ok} plików z /img.`);
}
$('#btnPrecacheAll')?.addEventListener('click', precacheAllImages);

/* ----------------- Import: pojedyncze pliki ----------------- */
$('#imgPicker')?.addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files || []);
  const grid = $('#imgGrid'); grid && (grid.innerHTML='');
  for (const file of files){
    const url = URL.createObjectURL(file);
    const guessId = autoMatchCardIdFromFilename(file.name);

    const wrap=document.createElement('div'); wrap.className='thumb';
    const img =document.createElement('img'); img.src=url; img.alt=file.name;
    const label=document.createElement('div'); label.className='muted'; label.textContent=file.name;

    const sel=document.createElement('select');
    sel.innerHTML = `<option value="">— wybierz kartę —</option>` + cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
    if (guessId) sel.value=guessId;

    const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Zapisz w pamięci';
    btn.addEventListener('click', async ()=>{
      const id = sel.value; if (!id) { alert('Wybierz kartę.'); return; }
      await saveBlobAsUserImage(id, file, file.type);
      btn.textContent='Zapisano ✓';
      if (state.currentLearnCard?.id===id && $('#learnImg')){ getImageFor(state.currentLearnCard,$('#learnImg')); updateLearnUI(); }
      renderUserCacheList();
    });

    wrap.appendChild(img); wrap.appendChild(label); wrap.appendChild(sel); wrap.appendChild(btn);
    grid && grid.appendChild(wrap);
  }
});

/* ----------------- Import: ZIP → IndexedDB (pomija śmieci) ----------------- */
$('#zipPicker')?.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0]; if (!file) return;
  if (!window.JSZip){ alert('Brak JSZip (vendor/jszip.min.js).'); e.target.value=''; return; }

  const isJunk = (name) => /(^|\/)(__macosx\/|\.ds_store$|thumbs\.db$|desktop\.ini$|\.appledouble\/|^\.|\/\._)/i.test(name);
  const mimeByExt = (base) => {
    const ext = base.toLowerCase().split('.').pop();
    return ext==='jpg'||ext==='jpeg' ? 'image/jpeg'
         : ext==='webp' ? 'image/webp'
         : ext==='gif'  ? 'image/gif'
         : 'image/png';
  };

  try{
    const zip = await JSZip.loadAsync(file);
    let saved=0, skipped=0;
    const names = Object.keys(zip.files).sort();
    for (const name of names){
      const entry = zip.files[name];
      if (entry.dir) { skipped++; continue; }
      if (isJunk(name)) { skipped++; continue; }
      const base = name.split('/').pop();
      if (!/\.(png|jpe?g|webp|gif)$/i.test(base)) { skipped++; continue; }
      const id = autoMatchCardIdFromFilename(base);
      if (!id) { skipped++; continue; }
      const blob = await entry.async('blob');
      await saveBlobAsUserImage(id, blob, mimeByExt(base));
      saved++;
    }
    alert(`Zapisano w pamięci: ${saved} plików z ZIP. Pomięto: ${skipped}.`);
    renderUserCacheList();
  }catch(err){
    console.error(err);
    alert('Nie udało się wczytać ZIP.');
  }finally{ e.target.value=''; }
});

/* ----------------- Lista / usuwanie (miniatury) ----------------- */
async function renderUserCacheList(){
  const wrap = $('#userCacheList'); if (!wrap) return;
  wrap.innerHTML='';
  const ids = (await listUserImages()).sort();
  if (!ids.length){ wrap.innerHTML = '<div class="muted">Brak zapisanych obrazów.</div>'; return; }
  for (const id of ids){
    const box=document.createElement('div'); box.className='thumb';
    const img=document.createElement('img'); img.alt=id;
    if (imageMap[id]) img.src=imageMap[id]; else setFallbackImage(img, id);
    const cap=document.createElement('div'); cap.className='muted'; cap.textContent=id;
    const del=document.createElement('button'); del.className='btn'; del.textContent='Usuń';
    del.addEventListener('click', async ()=>{ if(!confirm(`Usunąć obraz „${id}”?`))return; await removeUserImage(id); renderUserCacheList(); });
    box.appendChild(img); box.appendChild(cap); box.appendChild(del);
    wrap.appendChild(box);
  }
}
$('#btnCheckCache')?.addEventListener('click', async ()=>{
  const ids = await listUserImages();
  alert(`W pamięci PWA: ${ids.length} obrazów.`);
  renderUserCacheList();
});
$('#btnClearAll')?.addEventListener('click', async ()=>{
  if (!confirm('Na pewno usunąć WSZYSTKIE zapisane obrazy?')) return;
  await clearAllUserImages();
  renderUserCacheList();
  alert('Usunięto wszystkie obrazy.');
});
/* ===== Edytor karty (modal) ===== */

// helpers
function splitTags(str){
  return (str||'')
    .split(/[,\n]/g)
    .map(s=>s.trim())
    .filter(Boolean);
}

function getOverrideData(){
  try{ return JSON.parse(localStorage.getItem(CARD_TEXTS_KEY) || '{"version":1,"lang":"pl","cards":[]}'); }
  catch{ return {version:1, lang:'pl', cards:[]}; }
}

function upsertOverrideCard(payload){
  const data = getOverrideData();
  const i = data.cards.findIndex(x => x.id === payload.id);
  if (i>=0) data.cards[i] = { ...data.cards[i], ...payload };
  else data.cards.push(payload);
  // zastosuj w aplikacji + zapisz
  applyCardTextsData(data, {persist:true});
}

// otwórz modal i wypełnij danymi bieżącej karty
function openEditCardDialog(){
  const card = state.currentLearnCard;
  if (!card){ alert('Brak karty do edycji.'); return; }

  const m  = document.getElementById('editCardModal');
  const $i = id => document.getElementById(id);

  // pobierz ewentualny istniejący override dla tej karty
  const ov = getOverrideData().cards.find(c => c.id === card.id) || {};

  $i('edName').value = ov.name ?? card.name ?? '';
  $i('edSuit').value = ov.suit ?? card.suit ?? '';
  $i('edNum').value  = (ov.number ?? card.number ?? '') === null ? '' : (ov.number ?? card.number ?? '');
  $i('edDesc').value = ov.description ?? card.description ?? '';
  $i('edKw').value   = (ov.keywords ?? card.keywords ?? []).join(', ');
  $i('edRev').value  = (ov.reversed ?? card.reversed ?? []).join(', ');

  m.classList.add('show');
  m.setAttribute('aria-hidden','false');
}

function closeEditCardDialog(){
  const m = document.getElementById('editCardModal');
  if (!m) return;
  m.classList.remove('show');
  m.setAttribute('aria-hidden','true');
}

// zapisz z formularza
async function saveEditCardDialog(){
  const card = state.currentLearnCard;
  if (!card) return;

  const name = document.getElementById('edName').value.trim();
  const suit = document.getElementById('edSuit').value.trim();
  const numV = document.getElementById('edNum').value.trim();
  const desc = document.getElementById('edDesc').value.trim();
  const kw   = splitTags(document.getElementById('edKw').value);
  const rev  = splitTags(document.getElementById('edRev').value);

  const number = numV === '' ? null : (isNaN(parseInt(numV,10)) ? null : parseInt(numV,10));

  const payload = {
    id: card.id,
    name: name || card.name,
    suit: suit || card.suit,
    number: number,
    description: desc || card.description,
    keywords: kw.length ? kw : card.keywords,
    reversed: rev.length ? rev : card.reversed
  };

  upsertOverrideCard(payload);     // nadpisz i odśwież widok
  closeEditCardDialog();
  alert('Zapisano zmiany tej karty.');
}

// listenery
document.getElementById('btnEditCard')?.addEventListener('click', openEditCardDialog);
document.getElementById('editCardSave')?.addEventListener('click', saveEditCardDialog);
document.getElementById('editCardCancel')?.addEventListener('click', closeEditCardDialog);
document.getElementById('editCardModal')?.addEventListener('click', (e)=>{ if (e.target.id==='editCardModal') closeEditCardDialog(); });
/* ----------------- START ----------------- */
async function init(){
  await restoreUserImages();
  await loadCardTextsFromJson();   // <— wczytaj opisy (override / plik)
  renderStats();
  renderLearn(pickRandomCard());
  nextQuiz();
  renderUserCacheList();
}
document.addEventListener('DOMContentLoaded', init);
/* ====== Tap-to-zoom (bez #learnImg, żeby nie kolidować z odwracaniem) ====== */
function openZoom(src){
  const ov = document.getElementById('zoomOverlay');
  const zi = document.getElementById('zoomImg');
  if (!ov || !zi) return;
  zi.src = src;
  ov.classList.add('show');
  ov.setAttribute('aria-hidden','false');
}
function closeZoom(){
  const ov = document.getElementById('zoomOverlay');
  const zi = document.getElementById('zoomImg');
  if (!ov || !zi) return;
  ov.classList.remove('show');
  ov.setAttribute('aria-hidden','true');
  // czyścimy źródło po animacji
  setTimeout(()=>{ zi.src=''; }, 200);
}

// Klik w obraz (poza #learnImg) -> zoom
document.addEventListener('click', (e)=>{
  const t = e.target;
  if (!(t instanceof Element)) return;
  if (t.matches('.tarot-img') && t.id !== 'learnImg') {
    // jeśli obraz ma src blob:/http:/, bierzemy bieżący
    openZoom(t.currentSrc || t.src);
  }
});

// Klik w tło overlay'a lub ESC -> zamknij
document.getElementById('zoomOverlay')?.addEventListener('click', closeZoom);
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeZoom(); });
document.addEventListener('DOMContentLoaded', init);