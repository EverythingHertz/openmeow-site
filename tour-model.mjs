export const clamp = (n, lo=0, hi=1) => Math.min(hi, Math.max(lo, n));
export const progressAt = (y, range) => range > 0 ? clamp(y / range) : 0;
export const chooseMode = ({saveData=false, reduced=false}) =>
  reduced ? 'reading' : saveData ? 'world' : 'video';
export const damp = (current, target, seconds) => current + (target-current) * (1-Math.exp(-seconds/0.075));
export const seekTime = (target, duration) => Number.isFinite(duration) && duration > 0
  ? clamp(target, 0, Math.max(0,duration-0.04)) : null;
export const COPY = [
  { eyebrow:'Overture', title:'Every system needs a conductor.', body:'The baton is up. Keep scrolling.' },
  { eyebrow:'Move-in day', title:'Your agent staff, installed.', body:'Every floor a system. Every desk a specialist. Lights on.' },
  { eyebrow:'Execution', title:'Tool calls, on the record.', body:'The toolsmith logs every call, so you never wonder what actually ran.' },
  { eyebrow:'Cost', title:'Every token, weighed.', body:'The kibble budget balances itself — and shows its work.' },
  { eyebrow:'Evals', title:'Nothing ships un-judged.', body:'The approval gate holds until the gavel comes down.' },
  { eyebrow:'Memory', title:'Secrets stay vaulted.', body:'Keys, prompts, state — locked up tighter than the phantom mouse.' },
  { eyebrow:'Observability', title:'The whole system, watched.', body:'From up here, you can see every trace land.' }
];
export const SEGMENTS = [
  {img:0,w:.45}, {v:0,dir:1,w:.8}, {v:0,hold:true,w:.35,card:0},
  {v:1,dir:1,w:1.3}, {img:2,w:.5,card:1},
  {v:2,dir:1,w:.85}, {v:2,hold:true,w:.45,card:2}, {v:2,dir:-1,w:.65},
  {v:3,dir:1,w:.85}, {v:3,hold:true,w:.45,card:3}, {v:3,dir:-1,w:.65},
  {v:4,dir:1,w:.85}, {v:4,hold:true,w:.45,card:4}, {v:4,dir:-1,w:.65},
  {v:5,dir:1,w:.85}, {v:5,hold:true,w:.45,card:5}, {v:5,dir:-1,w:.65},
  {v:6,dir:1,w:1}, {v:6,hold:true,w:.55,card:6}, {v:6,hold:true,w:.45}
];
const total=SEGMENTS.reduce((sum,s)=>sum+s.w,0);
let sum=0;
export const BOUNDS=SEGMENTS.map(s=>{const a=sum/total; sum+=s.w; return {a,b:sum/total};});
export const STOPS=[
  {label:'Empty shell',seg:0}, {label:'Overture',seg:2}, {label:'Build-out',seg:3},
  {label:'The tower',seg:4}, {label:'Tool Calls',seg:6}, {label:'Kibble Budget',seg:9},
  {label:'Approval Gate',seg:12}, {label:'Phantom Vault',seg:15}, {label:'Rooftop',seg:18},
  {label:'Coming soon',seg:19}
];
export function sceneAt(progress) {
  const p=clamp(progress);
  let index=0;
  BOUNDS.forEach((b,i)=>{if(p>=b.a) index=i;});
  const seg=SEGMENTS[index], bound=BOUNDS[index];
  const local=clamp((p-bound.a)/(bound.b-bound.a));
  let from=seg.img ?? seg.v+1, to=from;
  if(seg.dir) {
    from=seg.v<2 ? seg.v : 2; to=seg.v+1;
    if(seg.dir<0) [from,to]=[to,from];
  }
  const t=clamp((local-.08)/.8);
  return {index,seg,local,from,to,mix:t*t*(3-2*t)};
}
export function cameraAt(scene, imageIndex) {
  // Hold motion returns to the shared resting pose with zero velocity at either end.
  const pulse=Math.sin(Math.PI*scene.local)**2;
  const scale=scene.from===scene.to ? 1.03+pulse*.015 : imageIndex===scene.to ? 1.09-scene.mix*.06 : 1.03+scene.mix*.065;
  const y=scene.from===scene.to?pulse*.8:0;
  return {scale,y};
}
