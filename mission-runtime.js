import {getRoleProtocol} from './role-protocols.js';
import {getScoutTask} from './scout-tasks.js';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,readdir,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {createBlueprint,maintainBlueprint} from './galactus.js';
export const TOOL_CATALOG=[
 {id:'write_file',description:'Create a real text, CSV, JSON, HTML or Markdown deliverable in the mission outbox.'},
 {id:'create_svg',description:'Create an original SVG vector illustration; not raster image generation.'},
 {id:'read_file',description:'Read an earlier mission file for handoff, revision or review.'},
 {id:'web_search',description:'Search the live web and save cited research through the connected provider.'},
 {id:'image_generation',description:'Requires a separately connected image-production adapter.'},
 {id:'video_generation',description:'Requires a separately connected video-production adapter.'},
 {id:'publish',description:'Requires an authorized publishing/account adapter.'}
];
const roles=new Set(['scout','artist','video','builder','reviewer','promoter','scaler']);
const validName=name=>typeof name==='string'&&name.toLowerCase()!=='state.json'&&/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(name)&&!name.includes('..')&&/\.(md|txt|csv|json|svg|html)$/i.test(name);
export function createMissionRuntime({directory,provider,search,connected=()=>true}){
 const active=new Map();
 const statePath=id=>{if(!/^[a-f0-9-]{36}$/.test(id))throw Object.assign(Error('Unknown mission.'),{status:404});return join(directory,id,'state.json');};
 const persist=async m=>{await mkdir(join(directory,m.id),{recursive:true,mode:0o700});const path=statePath(m.id),temp=path+'.tmp';await writeFile(temp,JSON.stringify(m),{mode:0o600});await rename(temp,path);};
 const log=(m,owner,type,message)=>{m.events.push({at:new Date().toISOString(),owner,type,message});m.events=m.events.slice(-200);};
 async function get(id){try{return JSON.parse(await readFile(statePath(id),'utf8'));}catch(e){if(e.code==='ENOENT')throw Object.assign(Error('Mission not found.'),{status:404});throw e;}}
 async function create({goal,directions={},taskPresetId}){if(typeof goal!=='string'||!goal.trim()||goal.length>180)throw Object.assign(Error('Write a mission in 1–180 characters.'),{status:400});if(!directions||typeof directions!=='object'||Array.isArray(directions)||Object.entries(directions).some(([k,v])=>!roles.has(k)||typeof v!=='string'||v.length>1500))throw Object.assign(Error('Invalid crew directions.'),{status:400});
 if(taskPresetId&&!getScoutTask(taskPresetId))throw Object.assign(Error('Unknown Scout task.'),{status:400});
 const m={id:randomUUID(),taskPresetId,goal,directions,status:'queued',world:createBlueprint(goal),plan:null,step:0,artifacts:[],events:[],createdAt:new Date().toISOString(),objective:/\b(earn|income|revenue|sell|sales|profit|money)\b/i.test(goal)?'verified-sale':'deliverables',earnings:{status:'not-connected',amount:null}};log(m,'Galactus','inbox','Mission saved in the inbox. I will plan the team and tools.');await persist(m);return m;}
 async function run(id){if(active.has(id))return active.get(id);const task=execute(id);active.set(id,task);try{return await task;}finally{active.delete(id);}}
 async function execute(id){const m=await get(id);if(m.status==='complete')return m;
 try{if(!connected()){m.status='managed-hold';log(m,'Galactus','connection-needed','Your mission is saved. The AI service needs an administrator connection before I can plan or execute it.');await persist(m);return m;}
 if(m.taskPresetId&&!m.taskStartedAt){m.taskStartedAt=new Date().toISOString();await persist(m);}
 const checkDeadline=()=>{const preset=getScoutTask(m.taskPresetId);if(preset&&Date.now()-Date.parse(m.taskStartedAt)>preset.limits.durationMinutes*60000)throw Error('The Scout task time budget has expired. Returning preserved findings without further searches.');};
 checkDeadline();
 if(!m.plan){m.status='planning';log(m,'Galactus','planning','I am choosing a task-specific pipeline, not a fixed website recipe.');await persist(m);m.plan=await provider.plan({goal:m.goal,directions:m.directions,tools:TOOL_CATALOG,taskPreset:getScoutTask(m.taskPresetId),windowEnd:m.taskStartedAt});
 if(!m.plan||!Array.isArray(m.plan.steps)||m.plan.steps.length<1||m.plan.steps.length>8||m.plan.steps.some(s=>!roles.has(s.role)||!TOOL_CATALOG.some(t=>t.id===s.tool)||s.tool==='read_file'||typeof s.task!=='string'||!s.task.trim()||s.task.length>2500))throw Error('The planning service returned an invalid pipeline.');
 log(m,'Galactus','team-ready',`I planned ${m.plan.steps.length} task-specific stages.`);await persist(m);}
 while(m.step<m.plan.steps.length){
 checkDeadline();
 const step=m.plan.steps[m.step];
 const protocol=getRoleProtocol(step.role);
 if(protocol){m.roleStartedAt||={};if(!m.roleStartedAt[step.role])m.roleStartedAt[step.role]=new Date().toISOString();if(Date.now()-Date.parse(m.roleStartedAt[step.role])>protocol.limits.durationMinutes*60000)throw Error('The Artist production time budget has expired. Work is preserved for Galactus.');}
 maintainBlueprint(m.world);
 if(!m.world.agents.some(a=>a.role===step.role)){const specialist=createBlueprint(step.role==='video'?'video mission':'creative mission').agents.find(a=>a.role===step.role);m.world.agents.push(specialist);maintainBlueprint(m.world);log(m,'Galactus','specialist-added',`I added a ${step.role} for this stage.`);}
 if(!['write_file','create_svg','web_search'].includes(step.tool)||step.tool==='web_search'&&!search){m.status='managed-hold';log(m,'Galactus','tool-connection',`This mission needs ${step.tool.replaceAll('_',' ')}. An authorized service adapter must be connected; I will not substitute pretend results.`);await persist(m);return m;}
 m.status='working';log(m,step.role,'stage-start',step.task);await persist(m);
 if(step.tool==='web_search'){
 const research=await search({goal:m.goal,task:step.task,directions:m.directions[step.role]||'',taskPreset:getScoutTask(m.taskPresetId),windowEnd:m.taskStartedAt||m.createdAt});if(typeof research.content!=='string'||!research.content.trim()||!Array.isArray(research.sources)||research.sources.length===0)throw Error('Live research did not return verifiable sources.');
 await saveArtifact(m,`research-${m.step+1}.md`,research.content+'\n\nSources\n'+research.sources.map(s=>s.url).join('\n'),step.role);
 }else{
 let useful=false,done=false;let repairs=0;
 for(let turn=0;turn<10;turn++){
 checkDeadline();
 if(protocol&&Date.now()-Date.parse(m.roleStartedAt[step.role])>protocol.limits.durationMinutes*60000)throw Error('The Artist production time budget has expired. Work is preserved for Galactus.');
 let action;try{action=await provider.next({goal:m.goal,directions:m.directions,taskPreset:getScoutTask(m.taskPresetId),step,files:m.artifacts.map(a=>({...a,content:a.content.slice(0,6000)})),history:m.events.slice(-8).map(e=>({...e,message:e.message.slice(0,2000)})),tools:[step.tool,'read_file','complete']});}catch(e){if(e.terminal||repairs++>=2)throw e;log(m,'Galactus','automatic-retry','The model service interrupted this stage. I am retrying while keeping completed files.');continue;}
 if(!action||!['write_file','create_svg','read_file','complete'].includes(action.action))throw Error('Unsupported agent action.');
 if(action.action==='complete'){if(!useful){log(m,'Galactus','repair','This stage has no verified tool result yet. I am asking the agent to perform its assigned work.');continue;}done=true;break;}
 try{if(!validName(action.path))throw Error('Choose a safe filename in the mission outbox.');
 if(action.action==='read_file'){const a=m.artifacts.find(a=>a.name===action.path);if(!a)throw Error('The requested handoff file does not exist.');log(m,step.role,'file-read',`Read ${a.name}: ${a.content.slice(0,14000)}`);if(step.role==='reviewer')useful=true;}
 else{if(action.action!==step.tool)throw Error('Use the tool assigned to this stage.');if(typeof action.content!=='string'||!action.content.trim()||action.content.length>120000)throw Error('Provide complete file content within the output limit.');if(step.tool==='create_svg'&&(!action.path.endsWith('.svg')||!/^\s*<svg[\s>]/i.test(action.content)))throw Error('The art tool must return an actual SVG illustration.');
 if(/<script\b|\bon\w+\s*=|javascript:|<foreignObject\b|<iframe\b/i.test(action.content)&&/\.(svg|html)$/i.test(action.path))throw Error('Remove active scripts and embedded frames from this deliverable.');
 await saveArtifact(m,action.path,action.content,step.role);useful=true;}
 }catch(error){if(repairs++>=2)throw error;log(m,'Galactus','tool-repair',error.message+' I will have the agent correct it automatically.');}
 await persist(m);
 }
 if(!done)throw Error('This stage reached its bounded tool budget without a verified completion.');
 }
 log(m,step.role,'handoff','Stage completed with verified tool activity. Handing work to the next agent.');m.step++;await persist(m);
 }
 if(!m.artifacts.length)throw Error('The mission produced no deliverables.');m.status=m.objective==='verified-sale'?'awaiting-business-outcome':'complete';log(m,'Galactus','outbox',m.objective==='verified-sale'?`${m.artifacts.length} production files are ready. Your income mission remains open until an authorized sale is verified. Sales and earnings are not connected.`:`${m.artifacts.length} real files are ready in your outbox.`);
 }catch(error){m.status='managed-hold';log(m,'Galactus','managed-hold',String(error.message).slice(0,400)+' Completed files are preserved.');}
 await persist(m);return m;
 }
 async function saveArtifact(m,name,content,role){const existing=m.artifacts.find(a=>a.name===name);if(!existing&&m.artifacts.length>=24||m.artifacts.reduce((n,a)=>n+a.content.length,0)+content.length>1000000)throw Error('Mission output budget reached.');const record={name,content,role,createdAt:new Date().toISOString()};await writeFile(join(directory,m.id,name),content,{mode:0o600});if(existing)Object.assign(existing,record);else m.artifacts.push(record);log(m,role,'file-written',`Saved ${name} to the mission outbox.`);await persist(m);}
 return{create,get,run,async list(){await mkdir(directory,{recursive:true});const entries=await readdir(directory);const all=await Promise.all(entries.filter(id=>/^[a-f0-9-]{36}$/.test(id)).map(id=>get(id)));return all.map(({id,goal,status,step,createdAt})=>({id,goal,status,step,createdAt}));}};
}
