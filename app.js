(() => {
 'use strict';
 const cfg=window.WEDDING,params=new URLSearchParams(location.search),still=params.has('still');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const [year,month,day]=cfg.date.split('-').map(Number);
 const weekday='星期'+'日一二三四五六'[new Date(Date.UTC(year,month-1,day)).getUTCDay()];
 const bind=(key,value)=>document.querySelectorAll(`[data-${key}]`).forEach(el=>el.textContent=value);
 const dotted=`${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`;
 Object.entries({bride:cfg.bride,groom:cfg.groom,year,month:String(month).padStart(2,'0'),day:String(day).padStart(2,'0'),'dotted-date':dotted,'full-date':cfg.lunarDate||`${year}年${month}月${day}日 ${weekday}`,'solar-date':`${year}年${month}月${day}日 ${weekday}`,'lunar-date':cfg.lunarDate||'',venue:cfg.venue,address:cfg.address||'具体分店与详细地址待补充'}).forEach(([key,value])=>bind(key,value));
 const link=document.getElementById('navigate');
 if(cfg.address){
  const query=encodeURIComponent(cfg.address.replace(/\s*[一二三四五六七八九十\d、，,及和]+楼$/, ''));
  const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const destination=cfg.navigationUrl||(apple?`https://maps.apple.com/?q=${query}`:`https://uri.amap.com/search?keyword=${query}&city=${encodeURIComponent('潮州市')}&callnative=1`);
  if(/^https:\/\//.test(destination)){
   for(const el of [link,document.getElementById('map-open')]){el.href=destination;el.removeAttribute('aria-disabled');}
   link.textContent='导航到婚礼现场 ↗';
  }
 }
 const cal=document.getElementById('calendar');cal.setAttribute('aria-label',`${year}年${month}月，${day}日婚礼`);
 ['一','二','三','四','五','六','日'].forEach(s=>{const el=document.createElement('span');el.className='weekday';el.textContent=s;cal.appendChild(el);});
 const offset=(new Date(Date.UTC(year,month-1,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(year,month,0)).getUTCDate();
 for(let i=0;i<Math.ceil((offset+days)/7)*7;i++){const n=i-offset+1,el=document.createElement('span');el.className='day';if(n>0&&n<=days){el.textContent=n;if(n===day){el.classList.add('chosen');el.setAttribute('aria-label',`${month}月${day}日，婚期`);}}cal.appendChild(el);}
 const target=Date.parse(cfg.countdownTarget),countdown=document.getElementById('countdown'),countStatus=document.getElementById('countdown-status');
 let previousState='';
 function tick(){const now=Date.now(),n=Math.max(0,Math.ceil((target-now)/1000));const values={days:Math.floor(n/86400),hours:Math.floor(n/3600)%24,minutes:Math.floor(n/60)%60,seconds:n%60};Object.entries(values).forEach(([key,value])=>{document.querySelector(`[data-unit="${key}"]`).textContent=key==='days'?value:String(value).padStart(2,'0');});const state=now<target?'距离婚礼':now<target+86400000?'就是今天，婚礼见！':'感谢你见证我们的喜悦。';if(state!==previousState){countStatus.textContent=state;countdown.setAttribute('aria-label',state);previousState=state;}}
 tick();setInterval(tick,1000);
 if(still)document.body.classList.add('still');
 if(!still&&!reduced.matches&&'IntersectionObserver' in window){document.body.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px 35px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
 document.querySelectorAll('.petals').forEach((container,index)=>{for(let i=0;i<14;i++){const flake=document.createElement('i');const seed=i+index*4;flake.style.cssText=`--left:${(seed*29)%100}%;--size:${4+seed%6}px;--duration:${7+seed%6}s;--delay:-${seed%10}s;--drift:${(seed%2?1:-1)*(15+seed%30)}px`;container.appendChild(flake);}});
 const auto=document.getElementById('autoplay'),music=document.getElementById('music'),audio=document.getElementById('audio'),back=document.getElementById('back-top');
 let playing=cfg.autoScroll!==false&&!still&&!reduced.matches,lastTime=0,nextStart=performance.now()+(cfg.scrollStartDelay||3200),holdSince=0,y=scrollY;
 function updateControls(){auto.setAttribute('aria-pressed',String(playing));auto.setAttribute('aria-label',playing?'暂停自动滚动':'开始自动滚动');auto.textContent=playing?'Ⅱ':'▷';document.body.classList.toggle('paused',!playing||document.hidden);}
 function stop(){if(playing){playing=false;updateControls();}lastTime=0;}
 function start(){if(reduced.matches){document.getElementById('status').textContent='已开启减少动态效果，请手动滑动浏览。';return;}playing=true;lastTime=0;y=scrollY;holdSince=0;nextStart=performance.now()+300;updateControls();}
 auto.onclick=()=>playing?stop():start();
 function animate(now){
  if(!playing||document.hidden||now<nextStart){lastTime=0;requestAnimationFrame(animate);return;}
  const delta=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
  const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  if(scrollY>=max-2){if(!holdSince)holdSince=now;if(now-holdSince>=2800){window.scrollTo({top:0,behavior:'instant'});y=0;holdSince=0;nextStart=now+1800;}}
  else{holdSince=0;y=Math.min(max,y+delta*(cfg.scrollSpeed||82));window.scrollTo({top:y,behavior:'instant'});}
  requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);updateControls();
 window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',e=>{if(!e.target.closest('.floating-tools'))stop();},{passive:true});
 window.addEventListener('pointerdown',e=>{if(!e.target.closest('.floating-tools'))stop();},{passive:true});
 window.addEventListener('keydown',e=>{if(e.target.closest('button,a,input,textarea'))return;if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.code))stop();if(e.code==='Space'){e.preventDefault();playing?stop():start();}});
 window.addEventListener('scroll',()=>{back.hidden=scrollY<600;},{passive:true});
 back.onclick=()=>{stop();window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});};
 music.onclick=async()=>{if(audio.paused){try{await audio.play();music.setAttribute('aria-pressed','true');music.setAttribute('aria-label','暂停配乐');}catch{document.getElementById('status').textContent='配乐暂时无法播放，请再次点击。';}}else{audio.pause();music.setAttribute('aria-pressed','false');music.setAttribute('aria-label','播放配乐');}};
 document.addEventListener('visibilitychange',()=>{lastTime=0;y=scrollY;updateControls();if(document.hidden){audio.pause();music.setAttribute('aria-pressed','false');music.setAttribute('aria-label','播放配乐');}});
 reduced.addEventListener('change',()=>{if(reduced.matches){stop();document.body.classList.remove('js-motion');}});
 window.addEventListener('resize',()=>{y=scrollY;lastTime=0;});
 document.documentElement.dataset.ready='true';
})();
