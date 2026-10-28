// Internal coordination foundation; service adapters supply actual execution.
export const ROLE_KITS={
 scout:['research-desk','communications','web-research'],
 artist:['art-workstation','image-generation'],
 video:['render-workstation','video-production'],
 builder:['build-workstation','product-packaging'],
 reviewer:['review-desk','quality-check'],
 promoter:['communications','channel-discovery','authorized-posting'],
 scaler:['analytics-desk','verified-sales','scaling-policy']
};
export function createBlueprint(goal){
 if(typeof goal!=='string'||!goal.trim()||goal.length>2000)throw new Error('A mission is required.');
 const production=/video|film|animation/i.test(goal)?'video':'artist';
 const roles=['scout',production,'builder','reviewer','promoter','scaler'];
 const world={goal,manager:'Galactus',architect:'Architect',rooms:[{id:'production',name:'Discovery & Production',width:6,depth:6},{id:'growth',name:'Review & Growth',width:6,depth:6}],agents:[],events:[],status:'planned'};
 for(const role of roles)provision(world,role);
 arrange(world);return world;
}
function event(world,owner,action,message){world.events.push({owner,action,message});}
function provision(world,role){
 if(!ROLE_KITS[role])throw new Error('Unknown specialist role.');
 let agent=world.agents.find(a=>a.role===role);
 if(!agent){agent={id:role,role,room:['reviewer','promoter','scaler'].includes(role)?'growth':'production',equipment:[],capabilities:[]};world.agents.push(agent);event(world,'Galactus','add-agent',`I added a ${role} so the team has the right specialist.`);}
 for(const item of ROLE_KITS[role]){if(!agent.equipment.includes(item)){agent.equipment.push(item);event(world,'Architect','equip',`I equipped the ${role} with ${item}.`);}if(!agent.capabilities.includes(item))agent.capabilities.push(item);}
 return agent;
}
// Layout/equipment are model manifests until the room renderer consumes this plan.
function arrange(world){for(const room of world.rooms){const agents=world.agents.filter(a=>a.room===room.id);room.width=Math.max(6,Math.min(3,agents.length)*3+2);room.depth=Math.max(6,Math.ceil(agents.length/3)*3+3);agents.forEach((a,i)=>{a.bay={x:2+(i%3)*3,z:2+Math.floor(i/3)*3};a.inboxConnected=true;a.handoffConnected=true;});}event(world,'Architect','layout',"I arranged the bays and handoffs with room to work.");}
function layoutOkay(world){return world.agents.every(a=>{const r=world.rooms.find(r=>r.id===a.room);return r&&a.bay&&Number.isFinite(a.bay.x)&&Number.isFinite(a.bay.z)&&a.bay.x>=1&&a.bay.x<=r.width-1&&a.bay.z>=1&&a.bay.z<=r.depth-1&&a.inboxConnected&&a.handoffConnected&&!world.agents.some(b=>b!==a&&b.room===a.room&&b.bay&&Math.hypot(b.bay.x-a.bay.x,b.bay.z-a.bay.z)<2);});}
export async function executeWithGalactus(world,step,adapters,{repairBudget=3}={}){
 if(!ROLE_KITS[step.role]||!ROLE_KITS[step.role].includes(step.capability))throw new Error('Unsupported role or capability.');
 if(!Number.isInteger(repairBudget)||repairBudget<0||repairBudget>5)throw new Error('Invalid repair budget.');
 let repairs=0;world.status='preflight';
 // Provisioning and spatial repair never depend on a student dispatch choice.
 const agent=provision(world,step.role);if(!layoutOkay(world))arrange(world);
 const adapter=adapters[step.capability];
 if(typeof adapter!=='function'){world.status='managed-hold';event(world,'Galactus','connection-needed','Your project is saved. This tool needs an administrator connection before I can use it.');return{status:world.status,reason:'adapter-unavailable'};}
 while(true){
  world.status='working';
  try{const artifact=await adapter({goal:world.goal,step,agent,world});if(!artifact||typeof artifact.content!=='string'||!artifact.content.trim())throw Object.assign(new Error('Incomplete tool output'),{code:'TRANSIENT'});world.status='complete';event(world,'Galactus','verified','This step returned a usable result. The team can continue.');return{status:'complete',artifact,repairs};}
  catch(error){
   const repairable=['EQUIPMENT','LAYOUT','NEEDS_SPECIALIST','TRANSIENT'].includes(error.code);
   if(!repairable||repairs>=repairBudget){world.status='managed-hold';event(world,'Galactus','managed-hold','I kept your completed work. I could not verify a fix within this run’s repair budget.');return{status:world.status,reason:error.code||'tool-failure',repairs};}
   if(error.code==='NEEDS_SPECIALIST'&&!ROLE_KITS[error.role]){world.status='managed-hold';return{status:world.status,reason:'unsupported-specialist',repairs};}
   repairs++;world.status='repairing';
   if(error.code==='NEEDS_SPECIALIST'){provision(world,error.role);arrange(world);}
   else if(error.code==='EQUIPMENT'){agent.equipment=[];agent.capabilities=[];provision(world,step.role);}
   else if(error.code==='LAYOUT')arrange(world);
   else event(world,'Galactus','retry','The service had a temporary failure. I am retrying this step.');
   event(world,'Galactus','verify-repair','The repair is in place. I will check it by running the affected step again.');
  }
 }
}
