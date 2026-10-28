import {createHash,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
// Durable step outputs: completed work survives a refresh/server restart.
// Failed calls are never cached, and concurrent identical requests share one execution.
export function createExecutionStore(directory){
 const pending=new Map();
 return {async execute(input,run){
  const id=createHash('sha256').update(JSON.stringify({version:1,input})).digest('hex');
  if(pending.has(id))return pending.get(id);
  const task=(async()=>{await mkdir(directory,{recursive:true,mode:0o700});const file=join(directory,id+'.json');
   const valid=a=>a&&['title','content','nextStep'].every(k=>typeof a[k]==='string'&&a[k].trim().length>0);
   try{const saved=JSON.parse(await readFile(file,'utf8'));if(valid(saved.artifact))return {...saved,cached:true};}catch(e){if(e.code!=='ENOENT'&&!(e instanceof SyntaxError))throw e;}
   const artifact=await run();if(!valid(artifact))throw new Error('The tool returned an incomplete result. The step can be retried.');
   const result={id,artifact,completedAt:new Date().toISOString()};const temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(result),{mode:0o600});await rename(temp,file);return {...result,cached:false};})();
  pending.set(id,task);try{return await task;}finally{pending.delete(id);}
 }};
}
