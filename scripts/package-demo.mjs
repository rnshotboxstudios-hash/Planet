import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
let html=await readFile(resolve(dist,'index.html'),'utf8');
const script=html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);const style=html.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/);
if(!script||!style)throw Error('Build the application first.');
let js=await readFile(resolve(dist,script[1].replace(/^\//,'')),'utf8');let css=await readFile(resolve(dist,style[1].replace(/^\//,'')),'utf8');
for(const match of [...css.matchAll(/url\(([^)]+)\)/g)]){const name=match[1].replace(/["']/g,'');if(name.startsWith('data:'))continue;const bytes=await readFile(resolve(dist,'assets',basename(name)));const mime=name.endsWith('woff2')?'font/woff2':'font/woff';css=css.replace(match[0],`url(data:${mime};base64,${bytes.toString('base64')})`);}
const favicon=await readFile(resolve(root,'public/favicon.svg'));html=html.replace('href="/favicon.svg"',`href="data:image/svg+xml;base64,${favicon.toString('base64')}"`);
html=html.replace(script[0],'').replace(style[0],()=>`<style>${css}</style>`).replace('</body>',()=>`<script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
await mkdir(resolve(root,'previews/demo'),{recursive:true});await writeFile(resolve(root,'previews/demo/planet-demo.html'),html);console.log('Packaged self-contained Planet browser demo');

const notices=['Planet demo third-party notices',await readFile(resolve(root,'node_modules/three/LICENSE'),'utf8'),await readFile(resolve(root,'node_modules/@fontsource/space-grotesk/LICENSE'),'utf8')].join('\n\n');
await writeFile(resolve(root,'previews/demo/THIRD-PARTY-NOTICES.txt'),notices);
await writeFile(resolve(root,'previews/demo/planet-demo.html'),'<!--\n'+notices.replaceAll('-->','-- >')+'\n-->\n'+html);
