// Classic script supports both file:// and static HTTP hosting.
const $ = id => document.getElementById(id);
const ui = $('experience'), video = $('approach');
let THREE, renderer, scene, camera, envelope, flap, letter, rig, dust;
let state = 'welcome', busy = false, initialized = false, zoom = 1;
let rotation = {x:0,y:0}, tweens = [], muted = true, audioContext;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
function notice(message) { $('notice').textContent=message; $('notice').hidden=false; }
function setState(next) {
  state=next; ui.dataset.state=next;
  $('welcome').hidden=next!=='welcome'; $('skip').hidden=next!=='playing';
  $('video-progress').hidden=next!=='playing';
  $('hotspot').hidden=next!=='ready'; $('guide').hidden=['welcome','playing'].includes(next);
  $('actions').hidden=!['held','opened','inspect'].includes(next);
  $('primary-action').hidden=next==='inspect'; $('zoom-controls').hidden=next!=='inspect'; $('read').hidden=next!=='inspect';
  $('replay').hidden=['welcome','playing'].includes(next); $('footer-note').hidden=!$('replay').hidden;
  const labels={ready:['01 / THE ARRIVAL','A message, waiting for you.','Click the envelope to pick it up.'],held:['02 / THE ENVELOPE','The seal is still unbroken.','Drag to turn the envelope. Click the seal to open it.'],opened:['02 / THE ENVELOPE','Something has been kept for you.','Click the exposed letter to pull it out.'],inspect:['03 / THE LETTER','Every secret leaves a trace.','Drag to rotate · Scroll or pinch to zoom · R to reset']};
  if(labels[next]) ['chapter','instruction','hint'].forEach((id,i)=>$(id).textContent=labels[next][i]);
  $('primary-action').innerHTML=next==='opened'?'Pull out the letter <span>↗</span>':'Break the seal <span>↗</span>';
  document.querySelectorAll('#steps li').forEach((el,i)=>el.classList.toggle('active',i===(next==='inspect'?2:['held','opened'].includes(next)?1:0)));
}
function animate(duration, update) {
  return new Promise(resolve=>tweens.push({start:performance.now(),duration:reducedMotion?Math.min(duration,180):duration,update,resolve}));
}
function paperTexture(isLetter=false, reverse=false) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=isLetter?1280:768;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  let seed=1904;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle=isLetter?'#cfb989':'#ab8958';ctx.fillRect(0,0,w,h);
  for(let i=0;i<13000;i++){
    const x=random()*w,y=random()*h,r=random()*18+1;
    ctx.fillStyle=random()>.46?`rgba(63,36,15,${random()*.045})`:`rgba(255,235,182,${random()*.085})`;
    ctx.beginPath();ctx.ellipse(x,y,r,r*.45,random()*3,0,Math.PI*2);ctx.fill();
  }
  for(let i=0;i<90000;i++){ctx.fillStyle=random()>.5?'#3925110a':'#fff3d010';ctx.fillRect(random()*w,random()*h,1,1);}
  const edge=ctx.createRadialGradient(w*.5,h*.48,w*.15,w*.5,h*.5,w*.7);edge.addColorStop(0,'#49210b00');edge.addColorStop(1,'#49210b66');ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
  if(isLetter){
    for(const y of [h*.48,h*.73]){ctx.fillStyle='#4b321921';ctx.fillRect(0,y,w,3);ctx.fillStyle='#fff5da50';ctx.fillRect(0,y+3,w,2);}
    ctx.fillStyle='#4b32191a';ctx.fillRect(w*.5,0,2,h);ctx.fillStyle='#fff5da40';ctx.fillRect(w*.5+2,0,2,h);
    if(!reverse){
      ctx.save();ctx.translate(730,180);ctx.rotate(-.065);ctx.strokeStyle='#883e2f';ctx.lineWidth=5;ctx.strokeRect(-135,-53,270,86);ctx.fillStyle='#883e2f';ctx.textAlign='center';ctx.font='bold 60px Georgia';ctx.fillText('TAJNE',0,10);ctx.restore();
      ctx.fillStyle='#332d23';ctx.textAlign='center';ctx.font='bold 39px monospace';ctx.fillText('AKTA SPRAWY 1904',w/2,335);
      ctx.strokeStyle='#51432d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(228,357);ctx.lineTo(796,357);ctx.stroke();
      ctx.textAlign='left';ctx.font='bold 34px monospace';ctx.fillText('SPRAWA:',135,465);
      ctx.textAlign='center';ctx.font='bold 53px monospace';ctx.fillText('INNOWACYJNE',w/2,550);ctx.fillText('GRY MIEJSKIE',w/2,618);
      ctx.font='bold 39px monospace';ctx.fillText('HUB KULTURALNY 2027',w/2,735);
      ctx.font='18px monospace';ctx.fillStyle='#665238';ctx.fillText('•  ARCHIWUM  /  1904  •',w/2,1160);
    }
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();return texture;
}
function polygon(points, material, z=0) {
  const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  const geometry=new THREE.ShapeGeometry(shape);const pos=geometry.attributes.position;const uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+2)/4,(pos.getY(i)+1.4)/2.8);
  const mesh=new THREE.Mesh(geometry,material);mesh.position.z=z;return mesh;
}
async function init() {
  if(initialized) return; THREE=window.ArchiveThree;
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  $('scene').appendChild(renderer.domElement);
  renderer.domElement.tabIndex=0;
  renderer.domElement.setAttribute('aria-label','3D inspection. Drag or use arrow keys to rotate. Plus and minus zoom the letter.');
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-5,5,3.5,-3.5,.1,100);camera.position.z=12;
  scene.add(new THREE.AmbientLight(0xffefda,1.45));const key=new THREE.DirectionalLight(0xffdfac,2.15);key.position.set(-3,5,7);scene.add(key);const fill=new THREE.DirectionalLight(0xa5bfce,.6);fill.position.set(4,0,-3);scene.add(fill);
  rig=new THREE.Group();scene.add(rig);envelope=new THREE.Group();rig.add(envelope);
  const paper=paperTexture();const mat=new THREE.MeshStandardMaterial({map:paper,color:0xcdbba3,roughness:.95,side:THREE.DoubleSide});
  const dark=mat.clone();dark.color.set(0x76614a);
  const sidePaper=mat.clone();sidePaper.color.set(0xa8957c);
  const flapPaper=mat.clone();flapPaper.color.set(0xddc8aa);
  const back=new THREE.Mesh(new THREE.BoxGeometry(4,2.8,.045),mat);back.position.z=-.085;envelope.add(back);
  envelope.add(polygon([[-2,-1.4],[2,-1.4],[2,1.4],[-2,1.4]],dark,-.052));
  const letterFront=paperTexture(true),letterBack=paperTexture(true,true);
  letter=new THREE.Group();envelope.add(letter);letter.position.set(0,0,-.005);letter.visible=false;
  const letterGeometry=new THREE.PlaneGeometry(3.56,3.95,24,32);
  const p=letterGeometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);
    // Slightly irregular cut edges and shallow creases catch light while turning.
    if(Math.abs(x)>1.77)p.setX(i,x+.009*Math.sin(y*48)+.005*Math.cos(y*89));
    if(Math.abs(y)>1.97)p.setY(i,y+.012*Math.sin(x*39));
    p.setZ(i,.02*Math.sin(x*7+y*3)+.013*Math.cos(y*9)+.025*Math.exp(-Math.abs(y)*16));
  }
  letterGeometry.computeVertexNormals();
  const front=new THREE.Mesh(letterGeometry,new THREE.MeshStandardMaterial({map:letterFront,roughness:1,side:THREE.FrontSide}));
  const rear=new THREE.Mesh(letterGeometry.clone(),new THREE.MeshStandardMaterial({map:letterBack,roughness:1,side:THREE.BackSide}));rear.position.z=-.008;letter.add(front,rear);letter.scale.set(.96,.63,1);
  envelope.add(polygon([[-2,1.4],[-2,-1.4],[.45,-.1]],sidePaper,.045));
  envelope.add(polygon([[2,1.4],[-.45,-.1],[2,-1.4]],sidePaper,.052));
  envelope.add(polygon([[-2,-1.4],[2,-1.4],[1.83,-.95],[0,.05],[-1.85,-.99]],mat,.07));
  const seamMaterial=new THREE.LineBasicMaterial({color:0x63482c,transparent:true,opacity:.48});
  for(const coords of [[-2,-1.4,0,.05,2,-1.4],[-2,1.4,0,-.35,2,1.4]]){
    const vertices=[];for(let i=0;i<coords.length;i+=2)vertices.push(new THREE.Vector3(coords[i],coords[i+1],.078));envelope.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices),seamMaterial));
  }
  flap=new THREE.Group();flap.position.set(0,1.4,.11);envelope.add(flap);
  flap.add(polygon([[-2,0],[-1.87,-.3],[0,-1.58],[1.87,-.3],[2,0]],flapPaper));
  const edgeLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.98,-.01,.007),new THREE.Vector3(-1.86,-.3,.007),new THREE.Vector3(0,-1.59,.007),new THREE.Vector3(1.86,-.3,.007),new THREE.Vector3(1.98,-.01,.007)]),seamMaterial);flap.add(edgeLine);
  const sealTexture=await new THREE.TextureLoader().loadAsync(window.ArchiveSeal);sealTexture.colorSpace=THREE.SRGBColorSpace;
  const seal=new THREE.Mesh(new THREE.CylinderGeometry(.43,.42,.065,48),new THREE.MeshStandardMaterial({color:0x4c1710,roughness:.35}));seal.rotation.x=Math.PI/2;seal.position.set(0,-1.47,.045);flap.add(seal);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96),new THREE.MeshBasicMaterial({map:sealTexture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));face.position.set(0,-1.47,.085);flap.add(face);
  const dustGeometry=new THREE.BufferGeometry();const positions=new Float32Array(100*3);for(let i=0;i<positions.length;i+=3){positions[i]=(Math.random()-.5)*15;positions[i+1]=(Math.random()-.5)*10;positions[i+2]=-2-Math.random()*3;}dustGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xd3ba85,size:.013,transparent:true,opacity:.24}));scene.add(dust);
  initialized=true;resize();installPointerControls();renderer.setAnimationLoop(frame);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();notice('The 3D context was interrupted. Reload the page to restore the scene.');});
}
function resize() {
  const w=innerWidth,h=innerHeight;
  // Match the clickable area to the video's object-fit: cover crop.
  const scale=Math.max(w/1280,h/720),ox=(w-1280*scale)/2,oy=(h-720*scale)/2;
  Object.assign($('hotspot').style,{left:`${ox+283*scale}px`,top:`${oy+103*scale}px`,width:`${699*scale}px`,height:`${534*scale}px`});
  if(!initialized)return;const height=Math.max(6.9,4.8/(w/h));camera.left=-height*w/h/2;camera.right=-camera.left;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();renderer.setSize(w,h);
  rig.position.y=0;
}
function frame(time) {
  for(const tween of [...tweens]){const t=clamp((time-tween.start)/tween.duration,0,1);tween.update(t*t*(3-2*t));if(t===1){tweens.splice(tweens.indexOf(tween),1);tween.resolve();}}
  if(!busy){const obj=state==='inspect'?letter:envelope;obj.rotation.x+=(rotation.x-obj.rotation.x)*.14;obj.rotation.y+=(rotation.y-obj.rotation.y)*.14;}
  if(!reducedMotion)dust.rotation.z=time*.000009;
  if(['held','opened','inspect'].includes(state))renderer.render(scene,camera);
}
function rustle(seal=false) {
  if(muted)return;try{audioContext ||= new AudioContext();audioContext.resume();const len=seal?.17:.5;const buffer=audioContext.createBuffer(1,audioContext.sampleRate*len,audioContext.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/samples.length,2);const source=audioContext.createBufferSource();source.buffer=buffer;const filter=audioContext.createBiquadFilter();filter.type='bandpass';filter.frequency.value=seal?650:1800;const gain=audioContext.createGain();gain.gain.value=.13;source.connect(filter).connect(gain).connect(audioContext.destination);source.start();}catch{ /* Sound is optional. */ }
}
function updateZoom(){if(!initialized||state!=='inspect')return;letter.scale.set(.9*zoom,.9*zoom,1);$('zoom-value').textContent=`${Math.round(zoom*100)}%`;}
function changeZoom(amount){if(busy||state!=='inspect')return;zoom=clamp(zoom*amount,.65,1.8);updateZoom();}
function resetView(){if(busy)return;rotation={x:0,y:0};zoom=1;updateZoom();}
function installPointerControls(){
  const canvas=renderer.domElement,raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pointers=new Map();let down=null,pinchDistance=0;
  function hit(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(state==='inspect'?letter:envelope,true).length>0;}
  canvas.addEventListener('pointerdown',e=>{if(busy||!['held','opened','inspect'].includes(state))return;const selected=hit(e);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(pointers.size===1)down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,selected};else{if(down)down.moved=true;const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}});
  canvas.addEventListener('pointermove',e=>{
    if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>=2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)changeZoom(d/pinchDistance);pinchDistance=d;return;}
    if(!down){canvas.style.cursor=!busy&&hit(e)?'grab':'default';return;}
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
    if(down.selected && down.moved && !busy){rotation.y+=(e.clientX-down.lastX)*.008;rotation.x+=(e.clientY-down.lastY)*.008;canvas.style.cursor='grabbing';}
    down.lastX=e.clientX;down.lastY=e.clientY;
  });
  function release(e){pointers.delete(e.pointerId);if(down&&!down.moved&&down.selected&&e.type==='pointerup')advance();down=null;pinchDistance=0;canvas.style.cursor='grab';}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>{down=null;});
  canvas.addEventListener('wheel',e=>{if(state==='inspect'){e.preventDefault();changeZoom(Math.exp(-e.deltaY*.001));}},{passive:false});
}

