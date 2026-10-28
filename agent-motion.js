// Original ambient choreography. It never changes workflow progress or earnings.
export function createWalker(home, route, { delay=0, speed=.95, rest=7 }={}) {
  return {home:{...home},position:{...home},route:route.map(p=>({...p})),index:0,wait:delay,speed,rest,walking:false,action:'working',heading:0,steps:0};
}
export function advanceWalker(w, dt) {
  if(!Number.isFinite(dt)||dt<=0)return w;
  w.walking=false;
  if(w.wait>0){w.wait=Math.max(0,w.wait-dt);return w;}
  const target=w.route[w.index];if(!target)return w;
  const dx=target.x-w.position.x,dz=target.z-w.position.z,d=Math.hypot(dx,dz);
  if(d<.025){w.position={x:target.x,z:target.z};w.action=target.action||'looking';w.wait=target.wait||0;w.index++;if(w.index===w.route.length){w.index=0;w.wait+=w.rest;w.action='working';}return w;}
  const step=Math.min(w.speed*dt,d);w.position.x+=dx/d*step;w.position.z+=dz/d*step;w.heading=Math.atan2(dx,dz);w.steps+=step;w.walking=true;w.action='walking';return w;
}
export function workerRoute(x,z,neighborX){const side=x+.92;return [
 {x,z:.58},{x:side,z:.58},{x:side,z:-2.4},
 {x:neighborX,z:-2.4,wait:2.4,action:'visiting'},
 {x:neighborX,z:-2.7,wait:1.8,action:'looking'},
 {x:side,z:-2.7},{x:side,z:.58},{x,z:.58},{x,z,wait:4,action:'working'}
];}
