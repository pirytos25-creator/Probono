// Diegetic controller: clicks on the world advance the character's filmed actions.
const opening = document.createElement('video');
opening.id='opening';opening.src='generated_video (2).mp4';opening.preload='auto';opening.playsInline=true;opening.muted=true;
$('stage').insertBefore(opening,$('inspection-backdrop'));
const worldAction=document.createElement('button');
worldAction.id='world-action';worldAction.setAttribute('aria-label','Podejdź do wejścia');worldAction.title='';$('stage').appendChild(worldAction);
const cursor=document.createElement('div');cursor.id='world-cursor';cursor.setAttribute('aria-hidden','true');ui.appendChild(cursor);
const pauseMenu=document.createElement('dialog');pauseMenu.id='pause-menu';pauseMenu.innerHTML='<p class="eyebrow">PAUZA</p><h2>Zapieczętowane archiwum</h2><p>Klikaj przedmioty w świecie, aby postać wykonała kolejny ruch.</p><p>Przeciągnij kopertę lub list, aby obrócić. Kółko myszy i gest szczypania przybliżają list.</p><button id="resume-game" class="primary">Wróć do gry</button> <button id="restart-game" class="secondary">Zacznij od początku</button><p class="pause-tip">R — wyprostuj przedmiot · M — dźwięk · Esc — pauza</p>';ui.appendChild(pauseMenu);
let activeClip=null,stopAt=0,afterClip=null,clipToken=0,dragStart=null;
let targetBox=[425,250,420,445];
function placeTarget(box=targetBox){
 targetBox=box;const s=Math.max(innerWidth/1280,innerHeight/720),x=(innerWidth-1280*s)/2,y=(innerHeight-720*s)/2;
 Object.assign(worldAction.style,{left:`${x+box[0]*s}px`,top:`${y+box[1]*s}px`,width:`${box[2]*s}px`,height:`${box[3]*s}px`});
}
function worldState(next,box,label){
 setState(next);busy=false;worldAction.hidden=next==='inspect';worldAction.setAttribute('aria-label',label||'Obejrzyj list');placeTarget(box);ui.classList.remove('moving');
}
function observeClip(token){
 if(token!==clipToken||!activeClip)return;
 if(activeClip.currentTime>=stopAt || activeClip.ended){
  activeClip.pause();activeClip=null;const callback=afterClip;afterClip=null;callback?.();return;
 }
 requestAnimationFrame(()=>observeClip(token));
}
async function playTo(clip,end,callback){
 busy=true;worldAction.hidden=true;cursor.classList.remove('over');ui.classList.add('moving');
 activeClip=clip;stopAt=end;afterClip=callback;const token=++clipToken;
 clip.muted=muted;
 try{await clip.play();observeClip(token);}catch(e){busy=false;activeClip=null;ui.classList.remove('moving');worldAction.hidden=false;notice('Nie udało się odtworzyć filmu. Kliknij ponownie. '+e.message);}
}
async function begin(){
 if(busy)return;busy=true;
 try{await init();$('notice').hidden=true;setState('playing');await playTo(video,6.65,()=>worldState('waypoint',[520,335,220,185],'Podejdź do koperty na ścianie'));}
 catch(e){busy=false;notice('Nie udało się włączyć sceny 3D. Sprawdź obsługę WebGL w przeglądarce. '+e.message);}
}
async function advance(){
 if(busy||pauseMenu.open)return;
 if(state==='welcome'){await begin();return;}
 if(state==='waypoint'){await playTo(video,13.2,()=>worldState('reach',[275,100,715,530],'Sięgnij po kopertę'));return;}
 if(state==='reach'){
  await playTo(video,20.0,()=>worldState('held',[275,100,715,530],'Otwórz pieczęć; przeciągnij, aby obrócić kopertę'));return;
 }
 if(state==='held'){
  // The actual reference performance supplies the hands and flap movement.
  busy=true;ui.classList.remove('live-object');rotation={x:0,y:0};
  opening.style.opacity='1';video.style.opacity='0';
  await playTo(opening,6.7,()=>worldState('opened',[390,245,475,305],'Chwyć i wyciągnij list'));return;
 }
 if(state==='opened'){
  await playTo(opening,14.96,()=>worldState('letter-held',[300,90,650,560],'Obejrzyj list; przeciągnij, aby obrócić'));
 }
}
async function inspectObject(kind){
 if(busy)return;
 await init();rotation={x:0,y:0};zoom=1;
 if(kind==='letter'){
  rig.add(letter);letter.visible=true;letter.position.set(0,.08,1);letter.rotation.set(0,0,0);letter.scale.set(.9,.9,1);envelope.visible=false;setState('inspect');updateZoom();
 }else{
  envelope.visible=true;envelope.position.set(0,0,0);envelope.rotation.set(0,0,0);envelope.scale.setScalar(1.1);letter.visible=false;flap.rotation.x=0;setState('held');
 }
 ui.classList.add('live-object');worldAction.hidden=true;resize();
}
worldAction.addEventListener('pointerdown',e=>{
 if(busy)return;dragStart={x:e.clientX,y:e.clientY,moved:false};worldAction.setPointerCapture(e.pointerId);
});
worldAction.addEventListener('pointermove',e=>{
 if(!dragStart)return;
 if(Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>7 && ['held','letter-held'].includes(state)){
  if(!dragStart.moved){dragStart.moved=true;inspectObject(state==='letter-held'?'letter':'envelope');}
  rotation.y=(e.clientX-dragStart.x)*.008;rotation.x=(e.clientY-dragStart.y)*.008;
 }
});
worldAction.addEventListener('pointerup',()=>{const moved=dragStart?.moved;dragStart=null;if(!moved){if(state==='letter-held')inspectObject('letter');else advance();}});
worldAction.addEventListener('pointercancel',()=>{dragStart=null;});
worldAction.addEventListener('click',e=>{if(e.detail===0){state==='letter-held'?inspectObject('letter'):advance();}});
addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.classList.toggle('over',!busy&&(e.target===worldAction || e.target===renderer?.domElement));});
function replay(){
 ++clipToken;activeClip=null;afterClip=null;busy=false;video.pause();opening.pause();video.currentTime=0;opening.currentTime=0;video.style.opacity='1';opening.style.opacity='0';ui.classList.remove('live-object','moving');rotation={x:0,y:0};zoom=1;
 if(initialized){envelope.add(letter);letter.visible=false;letter.position.set(0,0,-.005);letter.scale.set(.96,.63,1);letter.rotation.set(0,0,0);envelope.visible=true;envelope.position.set(0,0,0);envelope.rotation.set(0,0,0);envelope.scale.setScalar(1);flap.rotation.x=0;}
 $('notice').hidden=true;worldState('welcome',[425,250,420,445],'Podejdź do wejścia');video.load();
}
function pauseGame(){if(pauseMenu.open){pauseMenu.close();return;}activeClip?.pause();pauseMenu.showModal();}
pauseMenu.addEventListener('close',()=>{if(activeClip)activeClip.play().catch(()=>{});});
$('resume-game').onclick=()=>pauseMenu.close();$('restart-game').onclick=()=>{replay();pauseMenu.close();};
addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();pauseGame();return;}
 if(pauseMenu.open)return;
 if(e.key.toLowerCase()==='m'){muted=!muted;video.muted=muted;opening.muted=muted;}
 if(e.key==='Enter'&&!e.target.matches('button')){state==='letter-held'?inspectObject('letter'):advance();}
 if(e.key.toLowerCase()==='r')resetView();
 if(['held','inspect'].includes(state)&&!busy){
  if(e.key.startsWith('Arrow'))e.preventDefault();
  if(e.key==='ArrowLeft')rotation.y-=.15;if(e.key==='ArrowRight')rotation.y+=.15;if(e.key==='ArrowUp')rotation.x-=.15;if(e.key==='ArrowDown')rotation.x+=.15;
  if(['+','='].includes(e.key))changeZoom(1.12);if(e.key==='-')changeZoom(1/1.12);
 }
});
for(const clip of [video,opening])clip.addEventListener('error',()=>notice('Nie można wczytać filmu. Pliki MP4 muszą znajdować się w tym samym folderze co index.html.'));
addEventListener('resize',()=>{resize();placeTarget();});resize();placeTarget();
