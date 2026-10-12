  // set theme before first paint
  (function(){try{var t=localStorage.getItem('ashari.theme');
  if(!t){t=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}
  document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
  // keep following the device if the visitor never picked a theme manually
  try{var mq=matchMedia('(prefers-color-scheme: dark)');var fn=function(e){
    if(localStorage.getItem('ashari.theme'))return;
    document.documentElement.setAttribute('data-theme',e.matches?'dark':'light');
    if(typeof renderTools==='function'&&typeof state!=='undefined'&&state.ready){try{renderTools();}catch(_){}}};
    mq.addEventListener?mq.addEventListener('change',fn):mq.addListener(fn);}catch(e){}
