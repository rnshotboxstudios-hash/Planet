import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A little physical world, built from original geometry rather than a background image.
export function createFactoryScene(container, initial = {}) {
  const options = { placed: [], selected: 'inbox', running: false, done: false, onPlace() {}, onSelect() {}, ...initial };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#152c38');
  scene.fog = new THREE.Fog('#152c38', 55, 110);
  const camera = new THREE.OrthographicCamera(-11, 11, 8, -8, .1, 150);
  camera.position.set(18, 16, 23);
  camera.lookAt(0, 1.7, -.4);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute('aria-label', 'An interactive 3D voxel warehouse with work bays, conveyor belts, and collectible-style agents');
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;';
  container.appendChild(renderer.domElement);
  const hemi = new THREE.HemisphereLight(0xf2f6d9, 0x6d7653, 2.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe5b7, 3.5); sun.position.set(-5, 16, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -14; sun.shadow.camera.right = 14; sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -13; sun.shadow.normalBias = .035; sun.shadow.bias = -.0002;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xcde4fd, 1.6); fill.position.set(8, 6, -8); scene.add(fill);

  const world = new THREE.Group(); scene.add(world);
  const mats = new Map(), resources = new Set(), bobs = [], movingCrates = [], toolGroups = new Map(), highlights = [];
  const palette = { dark:'#243d36', green:'#517044', sage:'#a2b786', wood:'#9c7146', cream:'#e4d9b6', stone:'#b7bca6', skin:'#f4caa0', ink:'#1e2a30', metal:'#5d746d', brass:'#d5b268' };
  const material = (color, extra = {}) => {
    const key = `${color}:${JSON.stringify(extra)}`;
    if (!mats.has(key)) { const m = new THREE.MeshStandardMaterial({ color, roughness: .86, ...extra }); mats.set(key,m); resources.add(m); }
    return mats.get(key);
  };
  const geometry = g => { resources.add(g); return g; };
  function mesh(geo, col, x=0,y=0,z=0, parent=world, extra={}) { const m = new THREE.Mesh(geometry(geo), typeof col==='string'?material(col,extra):col); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
  function box(w,h,d,col,x,y,z,parent=world,r=.03) { return mesh(r?new RoundedBoxGeometry(w,h,d,1,r):new THREE.BoxGeometry(w,h,d),col,x,y,z,parent); }
  function cyl(rt,rb,h,col,x,y,z,parent=world,n=8) { return mesh(new THREE.CylinderGeometry(rt,rb,h,n),col,x,y,z,parent); }
  function sphere(r,col,x,y,z,parent=world,s=12) { return mesh(new THREE.SphereGeometry(r,s,8),col,x,y,z,parent); }
  function group(x=0,y=0,z=0,parent=world){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function label(text, { width=2, height=.45, color='#f6ebc9', background='#2a4539', size=80, border='#8da371' } = {}) {
    const c = document.createElement('canvas'); c.width=768;c.height=Math.round(768*height/width); const ctx=c.getContext('2d');
    ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.lineWidth=10;ctx.strokeStyle=border;ctx.strokeRect(6,6,c.width-12,c.height-12);ctx.fillStyle=color;ctx.font=`900 ${size}px Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2, c.width-38);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;resources.add(tex);const m=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});resources.add(m);return new THREE.Mesh(geometry(new THREE.PlaneGeometry(width,height)),m);
  }
  function sign(text,x,y,z,w=2.3,h=.5,parent=world,style={}) {const m=label(text,{width:w,height:h,...style});m.position.set(x,y,z);parent.add(m);return m;}
  function pipe(points,color='#577260',radius=.065,parent=world) {const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.05);return mesh(new THREE.TubeGeometry(curve,24,radius,8,false),color,0,0,0,parent);}
  function bolt(x,y,z,parent=world){const b=cyl(.038,.038,.025,'#b7bead',x,y,z,parent,6);b.rotation.x=Math.PI/2;return b;}
  function crate(x,y,z,size=.65,parent=world,green=false){const g=group(x,y,z,parent);box(size,size,size,green?'#7d9a5a':'#bc9058',0,size/2,0,g,.055);for(const s of [-1,1]){box(size+.025,.065,.05,'#684c32',0,.1*size,size/2,g);box(size+.025,.065,.05,'#684c32',0,.84*size,size/2,g);box(.06,size,.05,'#684c32',s*size*.34,size/2,size/2+.01,g);}box(.17,.2,.018,'#ede3bb',.04,size*.55,size/2+.035,g,.005);return g;}
  function plant(x,y,z,parent=world,scale=1){const g=group(x,y,z,parent);g.scale.setScalar(scale);cyl(.24,.17,.4,'#a26d48',0,.2,0,g);cyl(.29,.29,.12,'#bd8a5a',0,.41,0,g);box(.12,.65,.12,'#577746',0,.72,0,g);for(const [a,b,c]of[[-.2,.83,0],[.2,1,.03],[0,1.18,0]]){const leaf=box(.48,.22,.37,'#6c9854',a,b,c,g,.1);leaf.rotation.z=a>0?.5:-.5;}return g;}
  function outdoorTree(x,z,scale=1){const g=group(x,-.2,z);g.scale.setScalar(scale);box(.35,2,.35,'#785a38',0,.8,0,g,.02);box(1.8,1.2,1.6,'#577f85',0,2.1,0,g,.15);box(1.3,1,1.4,'#699b9a',-.16,2.9,0,g,.12);box(.9,.65,1,'#a5b78c',.15,3.5,0,g,.1);return g;}

  // Exterior is outside the warehouse, behind the windows and the cutaway shell.
  const exterior = box(28,.35,21,'#6c657b',0,-1,-8,world,.5);
  for(const [x,z,s]of[[-10,-8,1.25],[-7,-12,1.15],[-12,0,1.2],[-12,-4,1.1],[11,-7,.95]]) outdoorTree(x,z,s);
  box(11,1.3,4,'#58586f',-2,-.6,-15,world,.5); box(7,2.4,4,'#6c7486',8,-.2,-16,world,.5);
  // The view through the windows belongs to another planet. No landscape lives indoors.
  const gasGiant = sphere(2.1,'#7aa8bf',-2.2,1.3,-12.5,world,32);
  const planetCanvas=document.createElement('canvas');planetCanvas.width=512;planetCanvas.height=256;const pc=planetCanvas.getContext('2d');pc.fillStyle='#72a6ad';pc.fillRect(0,0,512,256);for(let i=0;i<12;i++){pc.fillStyle=['#85b3b7','#5f929e','#9cc3bb','#6897ad'][i%4];pc.beginPath();pc.moveTo(0,i*23);for(let x=0;x<=512;x+=16)pc.lineTo(x,i*23+Math.sin(x*.018+i)*4);pc.lineTo(512,i*23+10);pc.lineTo(0,i*23+10);pc.fill();}const planetTexture=new THREE.CanvasTexture(planetCanvas);planetTexture.colorSpace=THREE.SRGBColorSpace;resources.add(planetTexture);gasGiant.material=material('#ffffff',{map:planetTexture});gasGiant.rotation.z=-.16;
  const giantRing = new THREE.Mesh(geometry(new THREE.RingGeometry(2.55,3.45,64)),material('#c6a68a',{side:THREE.DoubleSide,transparent:true,opacity:.82}));
  giantRing.position.copy(gasGiant.position);giantRing.rotation.set(-.15,.1,-.4);world.add(giantRing);
  const innerRing = new THREE.Mesh(geometry(new THREE.RingGeometry(2.34,2.44,64)),material('#5f8b95',{side:THREE.DoubleSide,transparent:true,opacity:.7}));
  innerRing.position.copy(gasGiant.position);innerRing.rotation.copy(giantRing.rotation);world.add(innerRing);
  // Original bioluminescent alien mushrooms, crystals, floating cuboid rocks.
  for(const [x,z,h]of[[-10,-5,2.4],[-11,3,1.6],[10,-8,2.8],[-5,-11,2.1],[6,-13,1.6]]){
    cyl(.12,.2,h,'#b3a6bd',x,h/2-.7,z);cyl(h*.53,h*.65,.3,'#827baf',x,h-.65,z,world,8);cyl(h*.43,h*.55,.11,'#a0e3cd',x,h-.83,z,world,8);
    for(const dx of [-.3,.2])sphere(.09,'#d1e9c6',x+dx,h-.47,z+.16,world,8);
  }
  for(const [x,y,z]of[[-10,4,-9],[10,3,-12],[-5,6,-14]]){const rock=box(1.2,.85,1.1,'#73788d',x,y,z,world,.13);rock.rotation.set(.15,.4,.1);box(.9,.16,.8,'#75aaa2',x,y+.48,z,world,.05);}
  for(const [x,z]of[[-10,0],[9,-8],[-7,-10]])for(let i=0;i<3;i++){const crystal=cyl(.02,.18,.9+i*.2,'#83bdc6',x+i*.23,.1,z,world,5);crystal.rotation.z=(i-1)*.22;}
  const starPositions=[];for(let i=0;i<170;i++){const seed=i*2.399963;starPositions.push(Math.sin(seed)*35,7+(i%31)*.6,-17-Math.cos(seed)*10);}
  const starGeo=geometry(new THREE.BufferGeometry());starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const starMat=new THREE.PointsMaterial({color:'#c5eadb',size:.09,sizeAttenuation:true,transparent:true,opacity:.8});resources.add(starMat);world.add(new THREE.Points(starGeo,starMat));
  // Chunky slab with visible earth / masonry foundation.
  box(16.6,.7,11,'#5b5c42',0,-.55,0,world,.18);box(16.45,.28,10.8,'#9b8260',0,-.18,0,world,.1);box(16.6,.18,10.95,'#c6c4a5',0,.03,0,world,.08);
  for(let x=-7.75;x<8;x+=.8)for(let z=-4.8;z<5;z+=.8){const checker=(Math.round(x*10)+Math.round(z*10))%3;box(.776,.055,.776,checker===0?'#a9b29a':checker===1?'#b9bea7':'#b0baa1',x,.15,z,world,.02);}
  // Cutaway room: north wall includes a real wide window opening.
  box(16.6,1.65,.45,'#c0baa2',0,.95,-5.15);box(16.6,1.15,.45,'#d4cdb6',0,5.2,-5.15);
  for(const x of [-7.95,-5.75,4.5,7.95])box(x===-7.95||x===7.95?.7:1,3.25,.45,'#cac3ab',x,3.25,-5.15);
  // right hand wall section for huge workshop sign
  box(3,3.45,.45,'#c0baa2',6.3,3.1,-5.15);
  // Left wall, with inset window cutout.
  box(.45,1.55,10.55,'#aeb59b',-8.13,.95,0);box(.45,1.25,10.55,'#bbc3aa',-8.13,5.16,0);
  box(.45,3.2,2.0,'#bbc3aa',-8.13,3.2,-4.2);box(.45,3.2,3.1,'#b8bfa7',-8.13,3.2,3.7);
  // Masonry seams are thick enough to read at game scale.
  for(const y of [.55,1.05,1.55]){box(16,.025,.025,'#9e9d88',0,y,-4.914,world,0);box(.025,.025,10.1,'#929f87',-7.89,y,0,world,0);}
  for(let i=0;i<11;i++){box(.025,1.5,.025,'#a4a18c',-7+i*1.4,1,-4.9,world,0);box(.025,1.5,.025,'#9aa58f',-7.88,1,-4.8+i*.9,world,0);}
  // Green steel structure, octagonal columns, timber top beams.
  for(const [x,z]of[[-7.95,-5.05],[7.95,-5.05],[-7.95,5.05]]){cyl(.22,.25,5.8,'#425e49',x,2.9,z);cyl(.35,.35,.22,'#344c3d',x,.27,z);cyl(.33,.33,.2,'#73845d',x,5.65,z);}
  box(16.6,.35,.6,'#6e593c',0,5.85,-5.1);box(.6,.35,10.8,'#6e593c',-8.1,5.85,0);
  box(16.45,.08,.66,'#a67d4d',0,6.05,-5.1);box(.66,.08,10.7,'#a67d4d',-8.1,6.05,0);
  // Deep window frames, glass, and warm sun spilling onto floor.
  const glass=material('#afd2c1',{transparent:true,opacity:.12,roughness:.12});
  box(9.5,2.8,.035,glass,-.65,3.23,-5.14,world,0);
  for(const x of [-5.4,-2.25,.9,4.1])box(.13,3.05,.22,'#365548',x,3.23,-4.98);
  for(const y of [1.78,3.3,4.68])box(9.7,.14,.24,'#365548',-.65,y,-4.96);
  box(9.95,.18,.5,'#88714c',-.65,1.72,-4.85);
  box(.035,2.8,4.4,glass,-8.12,3.22,-.65,world,0);
  for(const z of [-2.85,-.65,1.55])box(.22,2.95,.14,'#365548',-7.98,3.22,z);
  for(const y of [1.78,3.3,4.68])box(.24,.14,4.62,'#365548',-7.98,y,-.65);
  box(.5,.18,4.8,'#88714c',-7.87,1.72,-.65);
  // Ceiling trusses and warm pendant lamps, visible without obscuring the room.
  for(const x of [-5.4,-.4,4.4]){
    box(.14,.22,2.9,'#6d6548',x,5.7,-3.8);cyl(.035,.035,1,'#333e35',x,5.12,-2.55);
    cyl(.37,.19,.3,'#4e6f4d',x,4.6,-2.55);cyl(.31,.31,.025,material('#ffdc8a',{emissive:'#edb75e',emissiveIntensity:.6}),x,4.44,-2.55,world,12);
    const light=new THREE.PointLight('#ffe3a3',5,6,2);light.position.set(x,4.2,-2.55);world.add(light);
  }
  // Pipes, gauges, electrical boxes, pennants, room signage.
  pipe([[-7.6,4.9,-4.78],[6.9,4.9,-4.78],[7.25,4.55,-4.78],[7.25,2,-4.78]],'#6b8770',.09);
  pipe([[-7.72,.9,3.8],[-7.72,4.9,3.8],[-7.72,5.1,3.5],[-7.72,5.1,-3]],'#846e4c',.09);
  box(.65,.9,.18,'#4a6552',7.1,1.65,-4.82);box(.4,.28,.04,'#bed99a',7.1,1.85,-4.7);cyl(.06,.06,.025,'#dfb65e',7.1,1.45,-4.7).rotation.x=Math.PI/2;
  sign('PLANET  WORKS',6.25,4.18,-4.88,2.65,.72,world,{size:73});
  sign('IDEAS IN.  AWESOME OUT.',6.25,3.57,-4.87,2.65,.32,world,{size:48,color:'#546747',background:'#ded6b3',border:'#988860'});
  const plaque=sign('FACTORY  01',-7.72,4.83,3.5,2,.43);plaque.rotation.y=Math.PI/2;
  // Storage loft and its octagonal safety posts.
  box(3.1,.2,2.1,'#886b46',-6.15,2.45,-3.5);for(const x of [-7.5,-4.8])for(const z of [-4.3,-2.55])cyl(.07,.07,2.3,'#6f6749',x,1.3,z);
  for(const x of [-7.55,-6.8,-6,-5.2,-4.65]){cyl(.035,.035,.8,'#415b45',x,2.92,-2.48);}
  box(3.05,.065,.065,'#3f5c46',-6.1,3.3,-2.48);box(.065,.065,1.8,'#3f5c46',-4.65,3.3,-3.37);
  crate(-7,2.57,-3.6,.82);crate(-6.1,2.57,-3.7,.65,world,true);crate(-5.4,2.57,-3.8,.58);crate(-7.1,3.4,-3.6,.55,world,true);
  for(let y=.45;y<2.6;y+=.34)box(.65,.065,.075,'#a98a53',-4.7,y,-2.12);
  for(const x of [-5.06,-4.34])box(.075,2.6,.075,'#765c3c',x,1.4,-2.12);
  crate(-7.1,.2,3.6,.9);crate(-6.3,.2,4.05,.66,world,true);crate(-7.2,1.1,3.6,.58);
  // Tall rack with books, boxes and glowing spare parts.
  box(2.1,2.8,.14,'#5d7158',5.75,1.6,-4.52);
  for(const x of [4.68,6.82])box(.12,2.9,.7,'#3d5b47',x,1.65,-4.25);
  for(const y of [.35,1.2,2.1,3])box(2.3,.12,.85,'#826d46',5.75,y,-4.22);
  for(const [x,col,h]of[[4.95,'#a67a59',.5],[5.2,'#7688a5',.55],[5.4,'#c9ad64',.44],[5.6,'#78955b',.6]])box(.18,h,.4,col,x,1.55,-4.12);
  crate(5.9,2.16,-4.23,.47);crate(5.1,.42,-4.2,.58);box(.6,.35,.5,'#a7bf82',6.2,1.43,-4.13);
  plant(-3.8,.2,-4.1,world,.85);plant(7.1,.2,3.9,world,1.1);plant(-7.4,1.82,.9,world,.6);
  // Notice board of achievement badges, not dashboard cards.
  box(1.65,1.25,.14,'#816845',-7.72,3.8,3.4);const board=sign('DREAM / BUILD / REPEAT',-7.62,3.9,3.4,1.45,.9,world,{size:51,background:'#bdaf7b',border:'#6a6142',color:'#3e4e35'});board.rotation.y=Math.PI/2;
  const clock=cyl(.36,.36,.085,'#3b5143',3.4,5.25,-4.87,world,12);clock.rotation.x=Math.PI/2;
  const face=cyl(.29,.29,.095,'#e6d9a9',3.4,5.25,-4.8,world,12);face.rotation.x=Math.PI/2;box(.025,.19,.025,'#354d3c',3.4,5.32,-4.73);box(.15,.025,.025,'#354d3c',3.47,5.25,-4.73);

  // A chunky industrial conveyor carrying mission parcels.
  const belt=group(0,.2,1.38);box(12.8,.3,.95,'#3e5549',0,.35,0,belt,.08);
  box(12.55,.075,.72,'#6a7d68',0,.54,0,belt,.015);
  for(let x=-6.1;x<6.2;x+=.29){const roller=cyl(.08,.08,.74,'#7e8c74',x,.6,0,belt,8);roller.rotation.x=Math.PI/2;}
  for(const x of [-5.8,-3,0,3,5.8])for(const z of [-.33,.33])box(.13,.5,.13,'#394f43',x,.08,z,belt);
  for(const z of [-.49,.49])box(12.8,.12,.1,'#b9b078',0,.63,z,belt);
  for(const x of [-6.47,6.47]){const end=cyl(.24,.24,.95,'#405b49',x,.4,0,belt);end.rotation.x=Math.PI/2;}
  for(let i=0;i<5;i++){const c=crate(-5.4+i*2.4,.87,1.38,.38,world,i%2===0);c.userData.offset=i*2.4;movingCrates.push(c);}
  // Hazard stripes and direction arrows on the floor at each end.
  for(const x of [-6.3,6.3])for(let z=.4;z<2.4;z+=.28){const stripe=box(.45,.016,.12,'#d1b359',x,.2,z,world,0);stripe.rotation.y=-.45;}
  for(const x of [-3.8,-1.8,.2,2.2,4.2]){const arrow=sign('➜',x,.215,2.43,.4,.4,world,{size:250,background:'#aeb89e',border:'#aeb89e',color:'#e4d6a0'});arrow.rotation.x=-Math.PI/2;}

  function character(x,z,color,hair,variant,parent=world,scale=1){
    const g=group(x,.2,z,parent);g.scale.setScalar(scale);
    // Oversized soft octagonal head, tiny body, large black bead eyes.
    box(.48,.59,.36,color,0,.58,0,g,.07);box(.58,.08,.4,'#2f3c32',0,.3,0,g,.035);
    for(const side of [-1,1]){box(.19,.3,.22,'#3d4840',side*.15,.18,0,g,.04);box(.24,.13,.36,'#384336',side*.15,.08,.06,g,.045);box(.17,.46,.2,color,side*.34,.6,0,g,.06);sphere(.105,palette.skin,side*.34,.36,.02,g);}
    const head=group(0,1.18,.015,g);box(.91,.82,.72,palette.skin,0,0,0,head,.17);
    for(const side of [-1,1]){sphere(.095,palette.skin,side*.455,-.08,0,head);const eye=sphere(.115,'#162329',side*.205,-.045,.343,head);eye.scale.set(1,1.15,.42);sphere(.024,'#ffffff',side*.18,-.01,.389,head,8);box(.1,.045,.015,'#d8917e',side*.28,-.2,.36,head,.012);}
    // The hairstyle has chunky anime locks and a swept front fringe.
    box(.96,.28,.78,hair,0,.35,-.025,head,.13);box(.14,.48,.67,hair,-.43,.15,-.05,head,.045);box(.14,.4,.65,hair,.43,.18,-.08,head,.04);
    for(let i=0;i<4;i++){const lock=box(.24,.28,.2,hair,-.34+i*.22,.22,.35,head,.04);lock.rotation.z=(i-1.3)*.17;}
    const smile=pipe([[-.065,-.225,.374],[0,-.245,.388],[.065,-.225,.374]],'#a46a58',.012,head);
    if(variant==='scout'){
      box(.99,.095,.74,'#897348',0,.37,0,head,.045);for(const sx of [-.23,.23]){const rim=cyl(.16,.16,.1,'#9c7d43',sx,.35,.43,head,12);rim.rotation.x=Math.PI/2;const glass=cyl(.115,.115,.112,'#9bbab5',sx,.35,.44,head,12);glass.rotation.x=Math.PI/2;}
      box(.4,.43,.14,'#99734c',0,.58,-.26,g,.055);box(.08,.5,.035,'#d5c98b',-.19,.61,.2,g,.01);
      box(.28,.33,.1,'#476c60',.45,.5,.19,g,.025);
    }else if(variant==='maker'){
      box(.35,.43,.055,'#ddb362',0,.52,.22,g,.04);box(.25,.12,.035,'#a98449',0,.53,.26,g,.02);box(.72,.1,.74,'#c68b5c',0,.2,.02,head,.05);
      box(.16,.38,.13,'#a0784f',.42,.52,.12,g);box(.4,.14,.2,'#74796d',.42,.77,.12,g);
    }else if(variant==='checker'){
      for(const sx of [-.22,.22]){const rim=new THREE.Mesh(geometry(new THREE.TorusGeometry(.16,.022,5,12)),material('#544861'));rim.position.set(sx,-.045,.39);head.add(rim);}box(.12,.025,.025,'#544861',0,-.045,.4,head);
      box(.33,.42,.075,'#e4d9ad',-.42,.47,.2,g,.015);box(.2,.025,.01,'#6b8e57',-.42,.57,.245,g,.005);
    }else if(variant==='overseer'){
      // Lime-haired captain, leaf-shaped pin, headphones, short anime cape.
      box(.13,.28,.3,'#384b3d',-.5,.04,-.03,head,.05);box(.13,.28,.3,'#384b3d',.5,.04,-.03,head,.05);
      const halo=new THREE.Mesh(geometry(new THREE.TorusGeometry(.51,.038,6,16,Math.PI)),material('#6f8755'));halo.position.set(0,.05,-.03);head.add(halo);
      box(.56,.56,.08,'#8ba65a',0,.55,-.24,g,.05);box(.09,.14,.025,'#e1c462',.12,.69,.21,g,.01);
    }
    bobs.push({g,head,baseY:g.position.y,offset:Math.random()*6});return g;
  }
  character(1.15,3.75,'#5e7d55','#a9bb62','overseer',world,1.08);
  const overseerLabel=sign('MOSS  /  OVERSEER',1.15,.24,4.5,2.1,.35,world,{size:67,background:'#586e4c',color:'#f3e7b8',border:'#a6bc72'});overseerLabel.rotation.x=-Math.PI/2;
  // A compact sci-fi service console. All controls belong inside the building.
  const consoleBase=group(6.8,.2,-1.7);box(1.12,1.3,.72,'#3c5b51',0,.7,0,consoleBase,.09);box(.92,.15,.78,'#718b68',0,1.42,0,consoleBase,.035);
  box(.86,.58,.12,'#263e38',0,1.9,-.18,consoleBase,.045);box(.7,.4,.018,material('#65d1c0',{emissive:'#368f80',emissiveIntensity:.42}),0,1.9,-.108,consoleBase,.02);
  for(let i=0;i<3;i++)box(.46-i*.07,.024,.022,'#d5efba',-.04,2.02-i*.11,-.09,consoleBase,.002);
  for(const sx of [-.36,.36])box(.035,.95,.025,material('#8de4c3',{emissive:'#3b9778',emissiveIntensity:.4}),sx,.8,.38,consoleBase,.005);
  box(.15,.06,.18,'#d2b15c',.22,1.53,.15,consoleBase);box(.15,.06,.18,'#83b4a0',-.22,1.53,.15,consoleBase);
  // Fixed bay positions are deliberate and spatial; the pipeline remains clear.
  const bays=[{id:'inbox',x:-5.75,z:3.2,color:'#e0ba65',name:'01  IDEA INBOX'}, {id:'scout',x:-4.3,z:-.15,color:'#81a9bb',name:'02  SCOUT BAY'}, {id:'maker',x:-.85,z:-.45,color:'#d4a666',name:'03  CREATOR BAY'}, {id:'checker',x:2.5,z:-.25,color:'#a995c2',name:'04  CHECK BAY'}, {id:'outbox',x:5.75,z:2.95,color:'#9db968',name:'05  LAUNCH BAY'}];
  const targets=[];
  function pad(bay){const g=group(bay.x,.2,bay.z);g.userData.toolId=bay.id;const disk=cyl(1.08,1.13,.1,'#718169',0,.02,0,g);cyl(.98,.98,.022,'#8d9d79',0,.083,0,g);const ring=new THREE.Mesh(geometry(new THREE.RingGeometry(.98,1.025,8)),material(bay.color,{transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.y=.103;g.add(ring);highlights.push({ring,id:bay.id});const hit=box(1.7,.02,1.7,material('#ffffff',{transparent:true,opacity:0,depthWrite:false}),0,.13,0,g);hit.userData.toolId=bay.id;targets.push(hit);return g;}
  function desk(bay,g){box(1.75,.17,.82,'#99754d',0,.91,-.22,g,.07);box(1.68,.05,.78,'#c9b588',0,1.02,-.22,g,.02);for(const x of [-.7,.7])for(const z of [-.5,.03])box(.12,.75,.12,'#49604a',x,.5,z,g);box(.45,.32,.45,'#697b58',.55,.61,-.2,g,.02);}
  for(const bay of bays){const g=pad(bay);const content=group(0,0,0,g);const ghost=group(0,0,0,g);const crystal=cyl(.2,.2,.62,material(bay.color,{transparent:true,opacity:.35}),0,.7,0,ghost);crystal.rotation.z=.15;const plus=sign('+',0,1.4,.05,.55,.55,ghost,{size:230,background:'#73886b',color:'#e6eccd',border:'#acc090'});const bayText=sign(bay.name,0,.15,.88,1.65,.28,g,{size:62,background:'#3a5042',color:'#e6deb8',border:'#8a9a70'});bayText.rotation.x=-Math.PI/2;
    if(bay.id==='inbox'){
      box(1.2,1.2,.9,'#6b8255',0,.72,0,content,.12);box(1.35,.14,1,'#a9b96c',0,1.37,0,content,.045);box(.8,.11,.06,'#283f36',0,1.1,.48,content);box(.45,.2,.03,'#e8d9a8',0,.65,.48,content,.015);box(.65,.1,.4,'#e7deb9',.02,1.51,0,content,.018);sign('IDEAS',0,.86,.475,.68,.22,content,{size:70});
      const lever=cyl(.045,.045,.5,'#53684c',.7,1.1,0,content);lever.rotation.z=-.3;sphere(.11,'#d8ae4f',.78,1.33,0,content);
    }else if(bay.id==='scout'){
      desk(bay,content);box(.75,.52,.12,'#354b42',-.22,1.39,-.4,content,.055);box(.61,.36,.02,material('#78d8d1',{emissive:'#3a9b98',emissiveIntensity:.35}),-.22,1.4,-.326,content,.025);box(.1,.18,.1,'#50644e',-.22,1.1,-.4,content);box(.45,.035,.18,'#4a6253',-.2,1.06,-.04,content,.01);for(let i=0;i<3;i++)box(.22,.035,.36,['#ddd39f','#8ca56c','#d2b77f'][i],.55,1.055+i*.05,-.3,content,.01);
      character(.38,.43,'#298e95','#58402d','scout',content,.79);
    }else if(bay.id==='maker'){
      desk(bay,content);box(.62,.045,.5,'#a1c4b6',-.3,1.07,-.16,content,.01);for(let i=0;i<3;i++)box(.11,.11,.11,['#c97b60','#8ca659','#e0bd6b'][i],-.5+i*.17,1.17,-.2,content,.02);box(.3,.34,.3,'#be9154',.58,1.2,-.4,content,.03);cyl(.03,.03,.42,'#3d5b4a',.5,1.5,-.4,content);cyl(.03,.03,.48,'#b96346',.62,1.53,-.4,content);
      character(.36,.47,'#d47a41','#5c3a30','maker',content,.8);
    }else if(bay.id==='checker'){
      desk(bay,content);box(.64,.075,.48,'#e4d9ae',-.32,1.085,-.14,content,.02);for(let i=0;i<3;i++)box(.32,.012,.018,'#6c8365',-.32,1.13,-.25+i*.11,content,.002);cyl(.17,.14,.25,'#ac98b0',.58,1.19,-.4,content);character(.36,.47,'#8c64af','#4d3654','checker',content,.8);
    }else{
      box(1.35,.4,1.1,'#546d49',0,.3,0,content,.08);cyl(.56,.62,.16,'#d1bc76',0,.6,0,content);cyl(.39,.43,.09,'#a5bd72',0,.73,0,content);crate(0,.79,0,.62,content,true);for(const x of [-.6,.6]){cyl(.07,.07,1.3,'#546a48',x,.98,-.36,content);sphere(.12,'#d3df9a',x,1.67,-.36,content);}sign('READY TO SHIP',0,.46,.56,1.1,.22,content,{size:70});
    }
    content.traverse(o=>{if(o.isMesh){o.userData.toolId=bay.id;targets.push(o)}});toolGroups.set(bay.id,{content,ghost,g});
  }
  // Front factory threshold reads as a room, not an island.
  box(16.4,.17,.26,'#36533e',0,.16,5.35);for(let i=0;i<10;i++){const stripe=box(.75,.025,.25,i%2?'#576747':'#c9ad58',-7.5+i*1.55,.27,5.33,world,0);stripe.rotation.y=-.12;}
  const floorSign=sign('MAKE SOMETHING THAT MATTERS',-.8,.24,3.05,3.1,.42,world,{size:53,background:'#aab597',border:'#aab597',color:'#dde0ba'});floorSign.rotation.x=-Math.PI/2;

  let zoom=1,disposed=false,frame=0,width=1,height=1;
  function resize(){if(disposed)return;const rect=container.getBoundingClientRect();width=Math.max(rect.width,1);height=Math.max(rect.height,1);renderer.setSize(width,height,false);const aspect=width/height;const halfW=aspect<1.2?11.9:11.5;const halfH=Math.max(7.4,halfW/aspect);camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.zoom=zoom;camera.updateProjectionMatrix();}
  function update(next={}){Object.assign(options,next);const placed=new Set(options.placed);for(const [id,t]of toolGroups){t.content.visible=placed.has(id);t.ghost.visible=!placed.has(id);}for(const h of highlights){h.ring.material.opacity=h.id===options.selected?1:.5;}renderer.domElement.style.cursor=options.selected?'crosshair':'default';}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  let azimuth=Math.atan2(18,23),elevation=.54;
  const defaultAzimuth=azimuth,defaultElevation=elevation;
  function positionCamera(){const radius=33;camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*radius,1.7+Math.sin(elevation)*radius,Math.cos(azimuth)*Math.cos(elevation)*radius-.4);camera.lookAt(0,1.7,-.4);}
  const pointerDown=e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture?.(e.pointerId);};
  const pointerMove=e=>{if(!down)return;const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.lastX=e.clientX;down.lastY=e.clientY;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)down.moved=true;if(down.moved){azimuth=THREE.MathUtils.clamp(azimuth-dx*.0035,defaultAzimuth-.32,defaultAzimuth+.32);elevation=THREE.MathUtils.clamp(elevation+dy*.0025,.38,.74);positionCamera();}};
  const pointerUp=e=>{if(!down)return;const moved=down.moved;down=null;if(moved)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(targets,false).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent}return true});if(hit){const id=hit.object.userData.toolId;if(options.placed.includes(id))options.onSelect(id);else options.onPlace(options.selected||id);}else options.onPlace(options.selected);};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);
  const ro=new ResizeObserver(resize);ro.observe(container);resize();update();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const clockTime=performance.now();
  function animate(){if(disposed)return;const t=(performance.now()-clockTime)/1000;for(const b of bobs){b.g.position.y=b.baseY+(reduced?0:Math.sin(t*1.7+b.offset)*.018);b.head.rotation.y=reduced?0:Math.sin(t*.5+b.offset)*.045;}for(const c of movingCrates){c.visible=options.placed.length>0;c.position.x=options.running?((t*1.5+c.userData.offset)%11.5)-5.75:c.userData.offset-5.4;}for(const h of highlights){if(h.id===options.selected)h.ring.material.opacity=reduced?1:.7+Math.sin(t*3)*.28;}renderer.render(scene,camera);frame=requestAnimationFrame(animate);}
  animate();
  return {update,resetCamera(){azimuth=defaultAzimuth;elevation=defaultElevation;zoom=1;positionCamera();resize();},setZoom(value){zoom=Math.max(.65,Math.min(1.45,value));camera.zoom=zoom;camera.updateProjectionMatrix();},resize,dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);for(const item of resources)item.dispose?.();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
