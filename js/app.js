/* ============================ أدوات ============================ */
const $ = (s,r=document)=>r.querySelector(s);
function h(tag,attrs={},...kids){
  const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if(v===false||v==null) continue;
    if(k==='class') e.className=v;
    else if(k.startsWith('on')) e.addEventListener(k.slice(2),v);
    else if(k==='text') e.textContent=v;
    else e.setAttribute(k,v===true?'':v);
  }
  for(const k of kids.flat()){ if(k==null||k===false) continue; e.append(k.nodeType?k:document.createTextNode(k)); }
  return e;
}
const LS={
  get(k,d=null){try{const v=localStorage.getItem('ashari.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem('ashari.'+k,JSON.stringify(v));}catch(e){toast('تعذّر الحفظ في المتصفح');}}
};
let toastT; function toast(m){ document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=h('div',{class:'toast',role:'status',text:m}); document.body.append(t); clearTimeout(toastT); toastT=setTimeout(()=>t.remove(),2400); }

/* تقسيم النص إلى أبيات: كل سطر بيت، والشطران يُفصَل بينهما بـ  |  أو  *  أو  …
   وإن لم يوجد فاصل فكل سطرين متتاليين بيتٌ واحد. */
function parseLines(text){
  const out=[]; let pending=null;
  for(let raw of String(text).split(/\r?\n/)){
    const line=raw.trim(); if(!line) continue;
    const parts=line.split(/\s*(?:\||\*|#|…|\.{3})\s*/).filter(Boolean);
    if(parts.length>=2){ if(pending!==null){out.push(pending+' | ');pending=null;} out.push(parts[0]+' | '+parts.slice(1).join(' ')); }
    else if(pending!==null){ out.push(pending+' | '+line); pending=null; }
    else pending=line;
  }
  if(pending!==null) out.push(pending+' | ');
  return out;
}
const splitBayt=l=>{const i=l.indexOf('|'); return i<0?[l.trim(),'']:[l.slice(0,i).trim(),l.slice(i+1).trim()];};

/* ============================ التخزين ============================ */
const state={poems:[],cloud:false,user:null,ready:false,fontId:LS.get('font','naskh'),scale:LS.get('scale',1),customFonts:[],readOnlySeed:false};
let db=null,auth=null;

function loadLocal(){
  let p=LS.get('poems',null);
  if(!Array.isArray(p)){ p=JSON.parse(JSON.stringify(SEED)); LS.set('poems',p); }
  state.poems=p;
}
function saveLocal(){ LS.set('poems',state.poems); }
const canEdit=()=> state.cloud ? !!state.user : true;

async function initCloud(){
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s);});
  try{
    const v='10.12.2', base=`https://www.gstatic.com/firebasejs/${v}/`;
    await load(base+'firebase-app-compat.js');
    await Promise.all([load(base+'firebase-auth-compat.js'),load(base+'firebase-firestore-compat.js')]);
    firebase.initializeApp(FIREBASE_CONFIG);
    db=firebase.firestore(); auth=firebase.auth();
    state.cloud=true;
    auth.onAuthStateChanged(u=>{state.user=u;render();});
    db.collection('poems').onSnapshot(snap=>{
      const arr=[]; snap.forEach(d=>arr.push({id:d.id,...d.data()}));
      arr.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      state.readOnlySeed = arr.length===0;
      state.poems = arr.length? arr : JSON.parse(JSON.stringify(SEED));
      state.ready=true; render();
    },err=>{ console.error(err); toast('تعذّر تحميل القصائد من السحابة'); state.cloud=false; loadLocal(); state.ready=true; render(); });
  }catch(e){
    console.error(e); toast('تعذّر الاتصال بـ Firebase — الوضع المحلي'); state.cloud=false; loadLocal(); state.ready=true; render();
  }
}
async function savePoem(p){
  if(state.cloud){
    const data={title:p.title,note:p.note||'',lines:p.lines,meaning:p.meaning||'',font:p.font||'',createdAt:p.createdAt};
    if(p.id && !String(p.id).startsWith('seed-')) await db.collection('poems').doc(p.id).set(data);
    else { const r=await db.collection('poems').add(data); p.id=r.id; }
  }else{
    const i=state.poems.findIndex(x=>x.id===p.id);
    if(i>=0) state.poems[i]=p; else state.poems.unshift(p);
    saveLocal();
  }
  return p;
}
async function removePoem(id){
  if(state.cloud){ await db.collection('poems').doc(id).delete(); }
  else { state.poems=state.poems.filter(p=>p.id!==id); saveLocal(); }
}
async function seedCloud(){
  for(const s of SEED){ await db.collection('poems').add({title:s.title,note:s.note,lines:s.lines,meaning:s.meaning,createdAt:s.createdAt}); }
  toast('تم رفع القصيدتين');
}

/* ============================ الخطوط المخصّصة (IndexedDB) ============================ */
const idb={
  open(){return new Promise((res,rej)=>{const r=indexedDB.open('ashari',1);r.onupgradeneeded=()=>r.result.createObjectStore('fonts',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});},
  async all(){const d=await this.open();return new Promise((res,rej)=>{const q=d.transaction('fonts').objectStore('fonts').getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});},
  async put(o){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction('fonts','readwrite');t.objectStore('fonts').put(o);t.oncomplete=res;t.onerror=()=>rej(t.error);});},
  async del(id){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction('fonts','readwrite');t.objectStore('fonts').delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error);});}
};
async function registerCustom(f){
  const fam='ashari-custom-'+f.id;
  const face=new FontFace(fam,await f.blob.arrayBuffer());
  await face.load(); document.fonts.add(face);
  return {id:'c-'+f.id,rawId:f.id,label:f.name,family:fam,lh:2.1,w:400,custom:true};
}
async function loadCustomFonts(){
  try{ const all=await idb.all(); state.customFonts=[]; for(const f of all){ try{ state.customFonts.push(await registerCustom(f)); }catch(e){console.warn('font failed',e);} } }catch(e){}
}
const allFonts=()=>[...FONTS,...state.customFonts];
// a poem may carry its own script (built-in fonts only, so every visitor can see it)
const fontOf=p=>(p&&p.font)?(FONTS.find(x=>x.id===p.font)||null):null;
const fontStyle=p=>{const f=fontOf(p); return f?`--poem-font:'${f.family}','Amiri','Noto Naskh Arabic',serif;--poem-lh:${f.lh};--poem-weight:${f.w}`:'';};

/* ============================ الواجهة ============================ */
function applyFont(){
  const f=allFonts().find(x=>x.id===state.fontId)||FONTS[0];
  const r=document.documentElement.style;
  r.setProperty('--poem-font',`'${f.family}','Amiri','Noto Naskh Arabic',serif`);
  r.setProperty('--poem-lh',f.lh); r.setProperty('--poem-weight',f.w);
  r.setProperty('--scale',state.scale);
}
function renderChips(){
  const box=$('#chips'); box.replaceChildren();
  for(const f of allFonts()){
    const c=h('button',{class:'chip',type:'button','aria-pressed':f.id===state.fontId,title:f.label,
      style:`font-family:'${f.family}','Amiri',serif`,onclick:()=>{state.fontId=f.id;LS.set('font',f.id);applyFont();renderChips();}},f.label);
    if(f.custom){ c.append(h('span',{class:'x',title:'حذف الخط',onclick:async e=>{
      e.stopPropagation(); if(!confirm('حذف هذا الخط من متصفحك؟')) return;
      await idb.del(f.rawId); state.customFonts=state.customFonts.filter(x=>x.id!==f.id);
      if(state.fontId===f.id){state.fontId='naskh';LS.set('font','naskh');} applyFont(); renderChips(); }},'✕')); }
    box.append(c);
  }
  box.append(h('button',{class:'chip',type:'button',title:'ارفع ملف خط (ttf / otf / woff)',onclick:()=>$('#fontfile').click(),style:'font-family:system-ui;font-size:16px'},'＋ خط'));
}
function renderTools(){
  const t=$('#tools'); t.replaceChildren();
  t.append(h('span',{class:'sz'},
    h('button',{class:'btn',type:'button',title:'تصغير',onclick:()=>setScale(-0.1)},'أ−'),
    h('button',{class:'btn',type:'button',title:'تكبير',onclick:()=>setScale(0.1)},'أ+')));
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  t.append(h('button',{class:'btn',type:'button',title:'الوضع الليلي / النهاري',onclick:toggleTheme},dark?'☀ نهاري':'☾ ليلي'));
  if(canEdit()) t.append(h('a',{class:'btn primary',href:'#/new',style:'text-decoration:none'},'＋ قصيدة جديدة'));
  if(state.cloud){
    if(state.user) t.append(h('button',{class:'btn',type:'button',onclick:()=>auth.signOut()},'خروج'));
    else t.append(h('button',{class:'btn',type:'button',onclick:()=>$('#login').showModal()},'دخول'));
  }else if(canEdit()){
    t.append(h('button',{class:'btn',type:'button',onclick:exportJSON},'تصدير'));
    t.append(h('button',{class:'btn',type:'button',onclick:()=>$('#importfile').click()},'استيراد'));
  }
}
function setScale(d){ state.scale=Math.min(1.8,Math.max(0.7,Math.round((state.scale+d)*10)/10)); LS.set('scale',state.scale); applyFont(); }
function toggleTheme(){ const n=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',n); try{localStorage.setItem('ashari.theme',n);}catch(e){} renderTools(); }

function renderFoot(){
  const f=$('#foot'); f.replaceChildren();
  f.append(h('small',{},'* الديواني والثلث الأصليان غير متوفرين كخطوط مجانية على الويب؛ هذا أقرب خط متاح. ارفع خطّك الخاص بزر «＋ خط».'));
  f.append(h('small',{},state.cloud?'القصائد محفوظة في السحابة ويراها كل الزوّار.':'الوضع المحلي: القصائد محفوظة في هذا المتصفح فقط — استخدم «تصدير» للنسخ الاحتياطي.'));
}

function exportJSON(){
  const blob=new Blob([JSON.stringify(state.poems,null,2)],{type:'application/json'});
  const a=h('a',{href:URL.createObjectURL(blob),download:'ashari-poems.json'}); document.body.append(a); a.click(); a.remove();
}

// number of abyat, with correct Arabic grammar (بيت واحد / بيتان / ٣ أبيات / ١١ بيتًا)
function baytCount(n){ if(n===1) return 'بيت واحد'; if(n===2) return 'بيتان'; if(n>=3&&n<=10) return n+' أبيات'; return n+' بيتًا'; }

function sheet(p){
  const wrap=h('div',{class:'sheet',style:fontStyle(p)});
  for(const l of p.lines){ const [a,b]=splitBayt(l);
    wrap.append(h('div',{class:'bayt'},h('span',{class:'h h1'},a),h('span',{class:'orn'},'❦'),h('span',{class:'h h2'},b))); }
  wrap.append(h('div',{class:'sig'},WATERMARK_TEXT));
  return wrap;
}

function viewList(){
  const app=$('#app'); app.replaceChildren();
  if(state.cloud && state.user && state.readOnlySeed){
    app.append(h('div',{class:'actions'},h('button',{class:'btn primary',onclick:seedCloud},'رفع القصيدتين الأوليين إلى السحابة')));
  }
  if(!state.poems.length){ app.append(h('p',{class:'empty'},'لا توجد قصائد بعد.')); return; }
  const g=h('div',{class:'grid'});
  for(const p of state.poems){
    const first=splitBayt(p.lines[0]||'')[0];
    g.append(h('a',{class:'card',href:'#/p/'+encodeURIComponent(p.id),style:fontStyle(p)},
      h('h2',{},p.title),
      h('div',{class:'meta'},baytCount(p.lines.length)),
      h('div',{class:'first'},first)));
  }
  app.append(g);
}

/* ============================ تحميل القصيدة كصورة (مع علامة مائية) ============================ */
const WATERMARK_TEXT='✒️ أبو الفرج';
async function downloadPoemImage(p){
  try{
    const cs=getComputedStyle(document.documentElement);
    const C=n=>cs.getPropertyValue(n).trim();
    const f=fontOf(p)||allFonts().find(x=>x.id===state.fontId)||FONTS[0];
    const fam=`"${f.family}","Amiri","Noto Naskh Arabic",serif`;
    const bayts=p.lines.map(splitBayt);
    const allText=p.title+bayts.map(b=>b[0]+b[1]).join('')+WATERMARK_TEXT;
    try{ await Promise.all([document.fonts.load(`40px ${fam}`,allText),document.fonts.load(`700 40px ${fam}`,allText),document.fonts.ready]); }catch(e){}

    const W=1080, PAD=70, GAP=60, S=2;
    const m=document.createElement('canvas').getContext('2d'); m.direction='rtl';
    const widest=(size,hs)=>{ m.font=`${f.w||400} ${size}px ${fam}`; let w=0; for(const b of bayts) for(const t of hs(b)) w=Math.max(w,m.measureText(t).width); return w; };

    // اختر تخطيطًا: شطران جنبًا إلى جنب، وإن ضاق المكان فالشطر تحت الشطر
    const colW=(W-2*PAD-GAP)/2; let size=46, stacked=false;
    while(size>30 && widest(size,b=>[b[0],b[1]])>colW-10) size-=2;
    if(widest(size,b=>[b[0],b[1]])>colW-10){ stacked=true; size=44; while(size>26 && widest(size,b=>[b[0],b[1]])>W-2*PAD-20) size-=2; }

    const lh=size*1.85, titleSize=64, topH=PAD+titleSize*1.9;
    const rowH=stacked?lh*2+22:lh+10;
    const footH=130;
    const H=Math.ceil(topH+bayts.length*rowH+footH+PAD*0.4);

    const cv=document.createElement('canvas'); cv.width=W*S; cv.height=H*S;
    const g=cv.getContext('2d'); g.scale(S,S); g.direction='rtl'; g.textBaseline='middle'; g.textAlign='center';

    g.fillStyle=C('--bg')||'#f6eedc'; g.fillRect(0,0,W,H);
    g.fillStyle=C('--card')||'#fffaf0'; g.strokeStyle=C('--line')||'#d9c9a3'; g.lineWidth=2;
    const r=26, x0=26,y0=26,w0=W-52,h0=H-52;
    g.beginPath(); g.moveTo(x0+r,y0); g.arcTo(x0+w0,y0,x0+w0,y0+h0,r); g.arcTo(x0+w0,y0+h0,x0,y0+h0,r); g.arcTo(x0,y0+h0,x0,y0,r); g.arcTo(x0,y0,x0+w0,y0,r); g.closePath(); g.fill(); g.stroke();

    // علامة مائية خفيفة في وسط الصورة
    g.save(); g.translate(W/2,(topH+H-footH)/2); g.rotate(-Math.PI/9);
    g.globalAlpha=.07; g.fillStyle=C('--gold')||'#9a6f1f'; g.font=`700 110px ${fam}`; g.fillText(WATERMARK_TEXT,0,0); g.restore();

    // العنوان
    g.fillStyle=C('--gold')||'#9a6f1f'; g.font=`700 ${titleSize}px ${fam}`; g.fillText(p.title,W/2,PAD+titleSize*.9);
    g.strokeStyle=C('--line')||'#d9c9a3'; g.beginPath(); g.moveTo(W/2-120,topH-28); g.lineTo(W/2+120,topH-28); g.stroke();

    // الأبيات
    g.fillStyle=C('--ink')||'#1c1814'; g.font=`${f.w||400} ${size}px ${fam}`;
    let y=topH+rowH/2-6;
    for(const [a,b] of bayts){
      if(stacked){ g.fillText(a,W/2,y-lh/2); g.fillText(b,W/2,y+lh/2); }
      else{
        g.fillText(a,W/2+GAP/2+colW/2,y);
        g.fillText(b,W/2-GAP/2-colW/2,y);
        g.save(); g.fillStyle=C('--gold')||'#9a6f1f'; g.font=`${size*.5}px system-ui,serif`; g.fillText('❦',W/2,y); g.restore();
      }
      y+=rowH;
    }

    // العلامة المائية السفلية
    g.strokeStyle=C('--line')||'#d9c9a3'; g.beginPath(); g.moveTo(PAD,H-footH+8); g.lineTo(W-PAD,H-footH+8); g.stroke();
    g.fillStyle=C('--gold')||'#9a6f1f'; g.font=`700 44px ${fam}`; g.fillText(WATERMARK_TEXT,W/2,H-footH/2-4);

    const blob=await new Promise(res=>cv.toBlob(res,'image/png'));
    if(!blob) throw new Error('blob');
    const name=(p.title||'poem').replace(/[\\/:*?"<>|]+/g,' ').trim()+' - أبو الفرج.png';
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name;
    document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    toast('تم تحميل الصورة');
  }catch(e){ console.error(e); toast('تعذّر إنشاء الصورة'); }
}

function viewPoem(id){
  const app=$('#app'); app.replaceChildren();
  const i=state.poems.findIndex(p=>p.id===id);
  if(i<0){ app.append(h('p',{class:'empty'},'لم أجد هذه القصيدة.'),h('p',{class:'empty'},h('a',{href:'#/'},'← كل القصائد'))); return; }
  const p=state.poems[i];
  document.title=p.title+' — أَشْعَارِي';
  app.append(h('a',{class:'back',href:'#/'},'← كُلُّ القَصَائِد'));
  app.append(h('div',{class:'poemhead',style:fontStyle(p)},h('h1',{},p.title),h('div',{class:'note'},baytCount(p.lines.length))));
  app.append(sheet(p));
  const act=h('div',{class:'actions'},
    h('button',{class:'btn',type:'button',onclick:async()=>{
      const txt=p.title+'\n\n'+p.lines.map(l=>{const [a,b]=splitBayt(l);return a+'      '+b;}).join('\n');
      try{await navigator.clipboard.writeText(txt);toast('تم النسخ');}catch(e){prompt('انسخ النص:',txt);} }},'نسخ القصيدة'),
    h('button',{class:'btn primary',type:'button',onclick:()=>downloadPoemImage(p)},'تحميل كصورة'));
  if(canEdit() && !(state.readOnlySeed)){
    act.append(h('a',{class:'btn',href:'#/edit/'+encodeURIComponent(p.id),style:'text-decoration:none'},'تعديل'));
    act.append(h('button',{class:'btn danger',type:'button',onclick:async()=>{
      if(!confirm('حذف «'+p.title+'» نهائيًا؟')) return;
      try{await removePoem(p.id);toast('تم الحذف');location.hash='#/';}catch(e){toast('تعذّر الحذف');} }},'حذف'));
  }
  app.append(act);
  if(p.meaning){
    app.append(h('details',{class:'meaning'},h('summary',{},'المعنى · Meaning'),h('p',{dir:'auto'},p.meaning)));
  }
  const nav=h('div',{class:'nav'});
  const prev=state.poems[i-1], next=state.poems[i+1];
  nav.append(prev?h('a',{class:'btn',href:'#/p/'+encodeURIComponent(prev.id),style:'text-decoration:none'},'→ '+prev.title):h('span'));
  nav.append(next?h('a',{class:'btn',href:'#/p/'+encodeURIComponent(next.id),style:'text-decoration:none'},next.title+' ←'):h('span'));
  app.append(nav);
}

function viewEditor(id){
  const app=$('#app'); app.replaceChildren();
  if(!canEdit()){
    app.append(h('p',{class:'empty'},'سجّل الدخول أولًا لإضافة قصيدة.'),
      state.cloud?h('p',{class:'empty'},h('button',{class:'btn primary',onclick:()=>$('#login').showModal()},'دخول')):null);
    return;
  }
  const old=id?state.poems.find(p=>p.id===id):null;
  const title=h('input',{type:'text',required:true,placeholder:'مثال: إِلَى اللهِ أَرْفَعُ حِكَايَتِي',value:old?old.title:''});
  const body=h('textarea',{required:true,placeholder:'أَخْفِي هَوَاكِ وَفِي الْأَحْشَاءِ أُشْعِلُهُ | كَأَنَّ قَلْبِيَ يَخْشَى الْبَوْحَ يَحْمِلُهُ\nمُنْذُ الْبِدَايَةِ وَالْأَيَّامُ شَاهِدَةٌ | عَلَى فُؤَادٍ غَدَا ذِكْرَاكِ يَشْغَلُهُ'});
  body.value=old?old.lines.join('\n'):'';
  const meaning=h('textarea',{class:'small',dir:'auto',placeholder:'اختياري — شرح المعنى بأي لغة'});
  meaning.value=old?old.meaning||'':'';
  const fontSel=h('select',{},h('option',{value:''},'حسب اختيار الزائر (الافتراضي)'),...FONTS.map(f=>h('option',{value:f.id},f.label)));
  fontSel.value=(old&&old.font&&FONTS.some(x=>x.id===old.font))?old.font:'';
  const count=h('div',{class:'hint'});
  const upd=()=>{count.textContent='عدد الأبيات: '+parseLines(body.value).length;}; body.addEventListener('input',upd); upd();
  const f=h('form',{class:'ed',onsubmit:async e=>{
    e.preventDefault();
    const lines=parseLines(body.value);
    if(!title.value.trim()||!lines.length){toast('اكتب العنوان والأبيات');return;}
    const p={id:old?old.id:'p'+Date.now(),createdAt:old?old.createdAt:Date.now(),title:title.value.trim(),note:old?(old.note||''):'',lines,meaning:meaning.value.trim(),font:fontSel.value};
    try{ await savePoem(p); toast('تم الحفظ'); location.hash='#/p/'+encodeURIComponent(p.id); }
    catch(err){ console.error(err); toast('تعذّر الحفظ — تأكد من تسجيل الدخول'); }
  }},
    h('label',{},'عنوان القصيدة',title),
    h('label',{},'الأبيات',body),
    h('div',{class:'hint'},'اكتب كل بيت في سطر، وافصل بين الشطرين بـ ',h('code',{},' | '),' أو ',h('code',{},' * '),' أو ',h('code',{},' # '),'. وإن لم تضع فاصلًا فكل سطرين متتاليين يصيران بيتًا واحدًا. ضع الحركات كما تريدها تمامًا.'),
    count,
    h('label',{},'المعنى (اختياري)',meaning),
    h('label',{},'خط هذه القصيدة (اختياري)',fontSel),
    h('div',{class:'actions',style:'margin:0'},
      h('button',{class:'btn primary',type:'submit'},old?'حفظ التعديل':'نشر القصيدة'),
      h('a',{class:'btn',href:old?'#/p/'+encodeURIComponent(old.id):'#/',style:'text-decoration:none'},'إلغاء')));
  app.append(h('a',{class:'back',href:'#/'},'← كُلُّ القَصَائِد'),h('div',{class:'poemhead'},h('h1',{style:'font-size:34px'},old?'تعديل القصيدة':'قصيدة جديدة')),f);
}

function render(){
  document.title='أَشْعَارِي';
  renderTools(); renderChips(); renderFoot(); applyFont();
  if(!state.ready){ $('#app').replaceChildren(h('p',{class:'empty'},'… جارٍ التحميل')); return; }
  const hash=location.hash||'#/';
  const m=hash.match(/^#\/(p|edit)\/(.+)$/);
  if(m){ const id=decodeURIComponent(m[2]); return m[1]==='p'?viewPoem(id):viewEditor(id); }
  if(hash==='#/new') return viewEditor(null);
  viewList();
}

/* ============================ تشغيل ============================ */
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
$('#fontfile').addEventListener('change',async e=>{
  const file=e.target.files[0]; e.target.value=''; if(!file) return;
  const name=prompt('اسم الخط كما تريد أن يظهر:',file.name.replace(/\.[^.]+$/,'')); if(!name) return;
  try{
    const rec={id:String(Date.now()),name,blob:file}; await idb.put(rec);
    const f=await registerCustom(rec); state.customFonts.push(f); state.fontId=f.id; LS.set('font',f.id);
    applyFont(); renderChips(); toast('تمت إضافة الخط');
  }catch(err){ console.error(err); toast('تعذّر قراءة ملف الخط'); }
});
$('#importfile').addEventListener('change',async e=>{
  const file=e.target.files[0]; e.target.value=''; if(!file) return;
  try{
    const arr=JSON.parse(await file.text()); if(!Array.isArray(arr)) throw 0;
    const ids=new Set(state.poems.map(p=>p.id)); let n=0;
    if(state.cloud && !state.user){ toast('سجّل الدخول أولًا'); return; }
    for(const p of arr){ if(p&&p.title&&Array.isArray(p.lines)){
      const q={createdAt:Date.now()+n,...p}; if(ids.has(q.id)||String(q.id||'').startsWith('seed-')) q.id='p'+Date.now()+'_'+n;
      if(state.cloud){ delete q.id; await savePoem(q); } else { state.poems.push(q); }
      n++; } }
    if(!state.cloud){ state.poems.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); saveLocal(); render(); }
    toast('تم استيراد '+n+' قصيدة');
  }catch(err){ toast('ملف غير صالح'); }
});
$('#logincancel').addEventListener('click',()=>$('#login').close());
$('#loginform').addEventListener('submit',async e=>{
  if(e.submitter&&e.submitter.value!=='ok') return;
  try{ await auth.signInWithEmailAndPassword($('#em').value,$('#pw').value); $('#pw').value=''; toast('أهلًا بك'); }
  catch(err){ e.preventDefault(); toast('بيانات الدخول غير صحيحة'); $('#login').showModal(); }
});

(async function start(){
  await loadCustomFonts();
  applyFont(); renderChips(); renderTools(); renderFoot();
  if(FIREBASE_CONFIG){ await initCloud(); }
  else { loadLocal(); state.ready=true; render(); }
})();
