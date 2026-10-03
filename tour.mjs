import {clamp,progressAt,chooseMode,damp,seekTime,COPY,BOUNDS,STOPS,sceneAt,cameraAt} from './tour-model.mjs';

const root=document.documentElement;
const track=document.getElementById('track');
const stage=document.getElementById('stage');
const world=document.getElementById('world');
const intro=document.getElementById('intro');
const finale=document.getElementById('finale');
const rail=document.getElementById('rail');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const touch=matchMedia('(any-pointer: coarse)');
const connection=navigator.connection;
const durations=[8.04,10.04,8.04,8.04,8.04,8.04,8.04];
let mode='', frameId=0, previousTime=0, range=1, target=0, position=0, stop=0;
let portrait=innerHeight>innerWidth, lastWidth=innerWidth, lastHeight=innerHeight;
let lastCard=-2, lastStop=-1, activeVideo=-1, lastGoodImage=0;
const images=new Map(), videos=new Map();

function wake() {
  if(!frameId && mode!=='reading' && !document.hidden) frameId=requestAnimationFrame(render);
}
function imageSource(index) { return `media/${portrait?'portrait':'landscape'}-${index}.webp`; }
function ensureImage(index) {
  if(images.has(index)) return images.get(index);
  const img=new Image(); img.className='scene'; img.alt=''; img.decoding='async';
  img.addEventListener('load',wake);
  img.addEventListener('error',()=>{img.dataset.failed='true';});
  img.src=imageSource(index); world.append(img); images.set(index,img);
  return img;
}
function clearVideos() {
  activeVideo=-1;
  videos.forEach(v=>{v.pause();v.removeAttribute('src');v.load();v.remove();});
  videos.clear();
}
function ensureVideo(index) {
  if(videos.has(index)) return videos.get(index);
  const video=document.createElement('video');
  video.className='tour-video'; video.muted=true; video.defaultMuted=true;
  video.playsInline=true; video.preload='auto'; video.disableRemotePlayback=true;
  video.setAttribute('aria-hidden','true');
  // Native byte-range loading starts playback without a full-file blob download.
  video.src=`media/desktop-${index}.mp4`;
  ['loadeddata','loadedmetadata','seeked'].forEach(event=>video.addEventListener(event,wake));
  video.addEventListener('error',()=>{video.dataset.failed='true';video.style.opacity='0';wake();});
  world.append(video); videos.set(index,video);
  return video;
}
function useVideo(index) {
  if(index===activeVideo) return;
  activeVideo=index;
  // Keep the current clip and its neighbor; release other decoder surfaces.
  videos.forEach((v,i)=>{
    if(i!==index && i!==index+1) {v.removeAttribute('src');v.load();v.remove();videos.delete(i);}
  });
  if(index>=0) {ensureVideo(index);if(index<6) ensureVideo(index+1);}
}
const cards=COPY.map(c=>{
  const card=document.createElement('section'); card.className='card';
  card.setAttribute('aria-hidden','true');
  card.innerHTML=`<div class="eyebrow">${c.eyebrow}</div><h2>${c.title}</h2><p>${c.body}</p>`;
  document.getElementById('cards').append(card); return card;
});
function goTo(index) {
  const b=BOUNDS[STOPS[clamp(index,0,STOPS.length-1)].seg];
  const p=index===0?0:(b.a+b.b)/2;
  scrollTo({top:p*range,behavior:motion.matches?'instant':'smooth'});
}
const buttons=STOPS.map((s,i)=>{
  const b=document.createElement('button'); b.type='button'; b.title=s.label;
  b.setAttribute('aria-label',s.label); b.innerHTML='<span></span>';
  b.addEventListener('click',()=>goTo(i)); rail.append(b); return b;
});
const prev=document.getElementById('previous');
const next=document.getElementById('next');
prev.addEventListener('click',()=>goTo(stop-1));
next.addEventListener('click',()=>goTo(stop+1));
document.getElementById('begin').addEventListener('click',()=>goTo(1));

function setMode() {
  const nextMode=chooseMode({width:innerWidth,coarse:touch.matches,saveData:connection?.saveData,reduced:motion.matches});
  if(nextMode===mode) return false;
  mode=nextMode; root.dataset.mode=mode;
  root.classList.toggle('tour',mode!=='reading');
  clearVideos();
  if(mode==='reading' && frameId) {cancelAnimationFrame(frameId);frameId=0;}
  return true;
}
function measure() {
  range=Math.max(1,track.offsetHeight-stage.offsetHeight);
  target=progressAt(scrollY,range);
}
function resize() {
  const p=progressAt(scrollY,range), changed=setMode();
  const rotated=(innerHeight>innerWidth)!==portrait;
  if(rotated) {
    portrait=innerHeight>innerWidth;
    images.forEach((img,i)=>{img.src=imageSource(i);});
  }
  // Ignore mobile toolbar-only height changes. svh keeps the scroll world stable.
  const structural=changed || rotated || innerWidth!==lastWidth || Math.abs(innerHeight-lastHeight)>150;
  lastWidth=innerWidth; lastHeight=innerHeight;
  measure();
  if(structural && mode!=='reading') {
    scrollTo({top:p*range,behavior:'instant'});target=p;position=p;
  }
  previousTime=0;wake();
}
function renderWorld(scene) {
  const a=ensureImage(scene.from), b=ensureImage(scene.to);
  if(scene.to<7) ensureImage(scene.to+1);
  const aReady=a.complete&&a.naturalWidth>0, bReady=b.complete&&b.naturalWidth>0;
  let weights=new Map();
  if(aReady&&bReady) weights=new Map([[scene.from,1],[scene.to,scene.from===scene.to?1:scene.mix]]);
  else if(aReady) weights.set(scene.from,1);
  else if(bReady) weights.set(scene.to,1);
  else weights.set(lastGoodImage,1);
  if(bReady&&scene.mix>.5) lastGoodImage=scene.to; else if(aReady) lastGoodImage=scene.from;
  // Explicit stacking is necessary when reversing from a higher numbered floor.
  images.forEach((img,i)=>{
    const alpha=weights.get(i)||0;
    img.style.opacity=String(alpha); img.style.zIndex=i===scene.to?'2':'1';
    const camera=cameraAt(scene,i);
    img.style.transform=alpha>0?`translate3d(0,${camera.y}%,0) scale(${camera.scale})`:'none';
    img.style.willChange=alpha>0?'transform, opacity':'auto';
  });
}
let paradeBuilt=false;
function buildParade() {
  if(paradeBuilt) return;
  paradeBuilt=true;
  const groups=[['b-detective','c-chef','b-scribe','c-professor','c-librarian','b-ops'],['b-scientist','b-dev','c-judge','b-artist','c-guard','c-toolsmith']];
  document.querySelectorAll('.ptrack').forEach((row,i)=>{
    [...groups[i],...groups[i]].forEach(name=>{
      const img=new Image();img.src=`${name}.webp`;img.alt='';img.decoding='async';row.append(img);
    });
  });
}
function render(now) {
  frameId=0;
  if(mode==='reading'||document.hidden) return;
  const delta=previousTime?Math.min((now-previousTime)/1000,.05):1/60;
  previousTime=now;
  position=mode==='world'?target:damp(position,target,delta);
  const moving=Math.abs(target-position)>.00002;
  if(!moving) position=target;
  const scene=sceneAt(position);
  renderWorld(scene);
  if(mode==='video') {
    const index=scene.seg.v??-1;
    useVideo(index<0 ? (scene.index===0?0:1) : index);
    videos.forEach((video,i)=>{if(i!==index) video.style.opacity='0';});
    if(index>=0) {
      const video=ensureVideo(index);
      const duration=video.duration||durations[index];
      const time=seekTime(scene.seg.hold?duration:(scene.seg.dir===1?scene.local:1-scene.local)*duration,duration);
      if(video.readyState>=1 && !video.seeking && !video.dataset.failed && Math.abs(video.currentTime-time)>1/48) {
        try {video.currentTime=time;} catch { /* Keep the image visible until media is seekable. */ }
      }
      video.style.opacity=video.readyState>=2&&!video.dataset.failed?'1':'0';
    }
  }
  const card=scene.seg.card??-1;
  if(card!==lastCard) {
    cards.forEach((el,i)=>{el.classList.toggle('on',i===card);el.setAttribute('aria-hidden',String(i!==card));});
    lastCard=card;
  }
  const opening=position<=.008;
  intro.classList.toggle('off',!opening);intro.inert=!opening;intro.setAttribute('aria-hidden',String(!opening));
  const ending=scene.index===19;
  finale.classList.toggle('on',ending);finale.setAttribute('aria-hidden',String(!ending));
  document.getElementById('hint').classList.toggle('off',position<.012||position>.06);
  if(scene.index>=18) buildParade();
  stop=0;STOPS.forEach((s,i)=>{if(scene.index>=s.seg) stop=i;});
  if(stop!==lastStop) {
    buttons.forEach((b,i)=>{b.classList.toggle('on',i===stop);if(i===stop)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    document.getElementById('chapter').textContent=`${String(stop+1).padStart(2,'0')} / 10 · ${STOPS[stop].label}`;
    prev.disabled=stop===0;next.disabled=stop===STOPS.length-1;lastStop=stop;
  }
  document.getElementById('progress-fill').style.transform=`scaleX(${position})`;
  if(moving) wake();
}
addEventListener('scroll',()=>{target=progressAt(scrollY,range);wake();},{passive:true});
addEventListener('resize',resize,{passive:true});
motion.addEventListener('change',resize);touch.addEventListener('change',resize);
connection?.addEventListener?.('change',resize);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&frameId){cancelAnimationFrame(frameId);frameId=0;}
  else {previousTime=0;measure();wake();}
});
addEventListener('pageshow',()=>{measure();position=target;wake();});
setMode();measure();position=target;ensureImage(0);wake();
