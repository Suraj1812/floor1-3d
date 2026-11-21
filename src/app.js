(() => {
  const root = document.getElementById('room-three-view');
  const stage = root.querySelector('.room-stage');
  try {
    if (!window.THREE) throw new Error('The 3D library could not load.');
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=false;
    let shadowState='';
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.02;
    stage.appendChild(renderer.domElement);
    const scene=new T.Scene();
    const camera=new T.PerspectiveCamera(39,1,.08,400);
    const model=new T.Group(); scene.add(model);
    const mat=(color,roughness=.7)=>new T.MeshStandardMaterial({color,roughness});
    const plaster=mat('#eeeae3'), edge=mat('#554a3e'), tile=mat('#d5c4a9'), seam=mat('#b5a38b');
    const oak=mat('#ae743b'), oakEdge=mat('#704721'), cream=mat('#f2ecdf');
    const graphite=mat('#242b2e'), metal=mat('#50575a',.34), fabric=mat('#a3a2a2');
    const led=new T.MeshStandardMaterial({color:'#ffe0a3',emissive:'#ffb649',emissiveIntensity:2});
    const glass=new T.MeshPhysicalMaterial({color:'#a5d5d9',transparent:true,opacity:.3,roughness:.1,metalness:.1,side:T.DoubleSide});
    // Deterministic, physically scaled surface maps, all generated in code.
    let randomSeed=1406;
    function rand(){randomSeed=(randomSeed*16807)%2147483647;return randomSeed/2147483647;}
    function texture(kind,size=512){
      const c=document.createElement('canvas');c.width=c.height=size;const q=c.getContext('2d');
      q.fillStyle=kind==='wood'?'#b48a5a':kind==='cloth'?'#b5b4ab':kind==='stone'?'#d7c9b5':'#ddd8cc';q.fillRect(0,0,size,size);
      if(kind==='wood'){
        for(let i=0;i<1700;i++){const u=rand()*size;q.strokeStyle=`rgba(${rand()>.5?'63,35,17':'239,199,140'},${.025+rand()*.1})`;q.lineWidth=.3+rand()*1.1;q.beginPath();
          for(let y=0;y<=size;y+=8){const x=u+Math.sin(y*.016+u*.04)*3+Math.sin(y*.046+u)*.8;y?q.lineTo(x,y):q.moveTo(x,y);}q.stroke();}
        for(let i=0;i<4;i++){const x=rand()*size,y=rand()*size;for(let j=0;j<10;j++){q.strokeStyle='rgba(61,37,21,.045)';q.beginPath();q.ellipse(x,y,2+j*1.7,8+j*6,.05,0,Math.PI*2);q.stroke();}}
      }else{
        for(let i=0;i<65000;i++){const v=rand()>.5?'255,255,255':'50,45,39';q.fillStyle=`rgba(${v},${kind==='cloth'?.16:.055})`;q.fillRect(rand()*size,rand()*size,1,kind==='cloth'?3:1);}
        if(kind==='cloth')for(let x=0;x<size;x+=3){q.fillStyle='rgba(35,35,30,.06)';q.fillRect(x,0,1,size);q.fillRect(0,x,size,1);}
        if(kind==='stone')for(let i=0;i<25;i++){q.strokeStyle='rgba(146,124,100,.07)';q.beginPath();let y=rand()*size;for(let x=0;x<size;x+=5){y+=Math.sin(x*.02+i)*1.5;q.lineTo(x,y);}q.stroke();}
      }
      const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
    }
    const woodMap=texture('wood');oak.color.set('#ffffff');oak.map=woodMap;oak.bumpMap=woodMap;oak.bumpScale=.012;oak.roughness=.42;
    const woodDark=woodMap.clone();woodDark.needsUpdate=true;oakEdge.map=woodDark;oakEdge.roughness=.5;
    const plasterMap=texture('plaster');plaster.bumpMap=plasterMap;plaster.bumpScale=.015;plasterMap.repeat.set(3,2);
    const clothMap=texture('cloth');clothMap.repeat.set(2,4);fabric.map=clothMap;fabric.bumpMap=clothMap;fabric.bumpScale=.018;fabric.roughness=.98;
    const stoneMap=texture('stone');stoneMap.repeat.set(6,6);tile.map=stoneMap;tile.bumpMap=stoneMap;tile.bumpScale=.009;tile.roughness=.32;tile.color.set('#ffffff');
    const linen=mat('#e4ded1');linen.map=clothMap;linen.bumpMap=clothMap;linen.bumpScale=.012;
    const chrome=new T.MeshStandardMaterial({color:'#b8bebc',metalness:.88,roughness:.22});
    const meshMaterial=mat('#303735');const meshMap=texture('cloth');meshMap.repeat.set(12,12);meshMaterial.map=meshMap;meshMaterial.bumpMap=meshMap;meshMaterial.bumpScale=.018;
    function box(w,h,d,x,y,z,m,parent=model,round=0){
      let g;
      if(round){
        const r=Math.min(round,w/4,h/4,d/4), s=new T.Shape(), a=-w/2+2*r,b=-h/2+2*r,c=w/2-2*r,e=h/2-2*r;
        s.moveTo(a,b-r);s.lineTo(c,b-r);s.quadraticCurveTo(c+r,b-r,c+r,b);
        s.lineTo(c+r,e);s.quadraticCurveTo(c+r,e+r,c,e+r);s.lineTo(a,e+r);
        s.quadraticCurveTo(a-r,e+r,a-r,e);s.lineTo(a-r,b);s.quadraticCurveTo(a-r,b-r,a,b-r);
        g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:5});g.translate(0,0,-d/2+r);
      }else g=new T.BoxGeometry(w,h,d);
      const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
    }
    function cylinder(r,h,x,y,z,m,parent=model){const mesh=new T.Mesh(new T.CylinderGeometry(r,r,h,32),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    function sphere(x,y,z,sx,sy,sz,m,parent=model){const mesh=new T.Mesh(new T.SphereGeometry(1,32,16),m);mesh.scale.set(sx,sy,sz);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
    function line3(points,m,parent=model){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const o=new T.Line(g,m);parent.add(o);return o;}
    function tube(points,r,m,parent=model){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,32,r,8,false),m);parent.add(mesh);mesh.castShadow=true;return mesh;}
    const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;
    const cq=contactCanvas.getContext('2d'),cg=cq.createRadialGradient(64,64,6,64,64,64);cg.addColorStop(0,'rgba(32,24,16,.6)');cg.addColorStop(.5,'rgba(32,24,16,.18)');cg.addColorStop(1,'rgba(32,24,16,0)');cq.fillStyle=cg;cq.fillRect(0,0,128,128);
    const contactMap=new T.CanvasTexture(contactCanvas);
    function contact(w,d,x,z,opacity=.55,y=.04){const m=new T.MeshBasicMaterial({map:contactMap,transparent:true,opacity,depthWrite:false});const p=new T.Mesh(new T.PlaneGeometry(w,d),m);p.rotation.x=-Math.PI/2;p.position.set(x,y,z);p.renderOrder=1;model.add(p);return p;}
    // Feet are the model's native units; front is positive Z.
    box(12.5,.35,12.5,0,-.22,0,edge);
    box(12,.1,12,0,-.025,0,tile);
    for(let k=-6;k<=6;k+=2){box(.012,.004,12,k,.031,0,seam);box(12,.004,.012,0,.031,k,seam);}
    contact(4.1,7.3,4.35,2.65,.6);contact(3.4,5.8,4.4,-3.4,.4);contact(2.6,2.7,2.35,-3.55,.4);
    contact(1.3,12,-5.8,0,.3);contact(12,1.2,0,-5.8,.3);contact(1.3,12,5.8,0,.3);
    const walls={};
    function wall(name,w,d,x,z){const g=new T.Group();model.add(g);box(w,8.8,d,x,4.4,z,plaster,g);box(w,.16,d+.025,x,.16,z,cream,g);walls[name]=g;return g;}
    const back=wall('back',12.4,.18,0,-6.1), left=wall('left',.18,12,-6.1,0), right=wall('right',.18,12,6.1,0);
    const peachWall=mat('#c3a38f',.93);peachWall.bumpMap=plasterMap;peachWall.bumpScale=.015;
    left.children[0].material=peachWall;
    right.children[0].material=plaster;
    // Full anime-side wall in the reference's warm peach-beige; other walls off-white.
    back.children[0].material=plaster;
    const slat=mat('#ece2d2',.8);slat.map=woodMap;
    for(let z=-5.7;z<-1.35;z+=.15)box(.055,4.55,.075,5.978,5.225,z,slat,right,.012);
    // Front opening assembly: 3 ft door, 5 ft window, 2.5 ft sill.
    const front=new T.Group();model.add(front);walls.front=front;
    box(.25,8.8,.18,-6,4.4,6.1,plaster,front);box(3.15,8.8,.18,-1.3,4.4,6.1,plaster,front);box(.6,8.8,.18,5.8,4.4,6.1,plaster,front);
    box(5.1,2.5,.18,2.85,1.25,6.1,plaster,front);box(5.1,2.2,.18,2.85,7.7,6.1,plaster,front);box(3,1.7,.18,-4.38,7.95,6.1,plaster,front);
    // Removable wall caps keep the plan readable in the dollhouse view.
    const frontLow=new T.Group();model.add(frontLow);box(3.15,.65,.18,-1.3,.325,6.1,plaster,frontLow);box(5.1,.65,.18,2.85,.325,6.1,plaster,frontLow);
    const frame=mat('#dee3dd');
    const windowAssembly=new T.Group();model.add(windowAssembly);
    box(5.1,.1,.22,2.85,2.55,6.08,frame,windowAssembly);box(5.1,.1,.22,2.85,6.55,6.08,frame,windowAssembly);
    for(const x of [.3,2.85,5.4])box(.07,4,.15,x,4.55,6.08,frame,windowAssembly);
    box(4.95,3.9,.025,2.85,4.55,6.09,glass,windowAssembly).castShadow=false;
    box(5.3,.09,.45,2.85,2.49,6.03,cream,windowAssembly);
    for(const x of [2.69,3.02])box(.045,.32,.08,x,4.4,5.97,chrome,windowAssembly,.015);
    const curtains=new T.Group();model.add(curtains);
    const rod=cylinder(.035,5.8,2.85,7,5.65,metal,curtains);rod.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const g=new T.PlaneGeometry(.72,6.5,24,48),pos=g.attributes.position;
      for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,Math.sin(x*45)*(.075+.025*Math.cos(y))+.02*Math.sin(y*5+x*8));}g.computeVertexNormals();
      const curtainMat=linen.clone();curtainMat.side=T.DoubleSide;const drape=new T.Mesh(g,curtainMat);drape.position.set(2.85+side*2.65,3.68,5.63);drape.castShadow=true;drape.receiveShadow=true;curtains.add(drape);
      for(let i=0;i<5;i++){const ring=new T.Mesh(new T.TorusGeometry(.055,.012,6,16),chrome);ring.position.set(2.85+side*2.65-.28+i*.14,6.99,5.65);curtains.add(ring);}
    }
    const door=new T.Group();door.position.set(-5.85,0,6);door.rotation.y=1.1;model.add(door);
    box(2.95,6.8,.12,1.475,3.4,0,oak,door,.045);
    box(.09,.35,.12,2.62,3.3,-.11,metal,door);box(.3,.06,.09,2.52,3.4,-.19,metal,door);
    for(const y of [.7,3.4,6.1]){const hinge=cylinder(.035,.22,.02,y,0,chrome,door);}
    for(const y of [2,5.1]){box(2.35,2.1,.018,1.475,y,-.071,oakEdge,door,.03);box(2.26,2.01,.025,1.475,y,-.087,oak,door,.025);}
    for(const x of [-5.9,-2.88])box(.13,7.1,.24,x,3.55,6.08,oakEdge,front);box(3.15,.13,.24,-4.39,7.1,6.08,oakEdge,front);
    box(2.95,.04,.35,-4.38,.035,6,oakEdge);
    // Compact wardrobe fits the solid wall between door and window.
    const wardrobe=new T.Group();wardrobe.name='wardrobe-between-door-and-window';model.add(wardrobe);
    const cupboardFace=mat('#c4bbaa',.74);
    box(2.62,.16,1.62,-1.3,.08,5.05,graphite,wardrobe,.015);
    box(2.8,7.1,1.8,-1.3,3.65,5.05,oak,wardrobe,.025);
    for(const x of [-1.9925,-.6075])box(1.355,6.92,.065,x,3.65,4.115,cupboardFace,wardrobe,.015);
    for(const x of [-1.39,-1.21])box(.035,.85,.065,x,3.55,4.055,graphite,wardrobe,.012);
    box(2.87,.075,1.85,-1.3,7.235,5.05,oak,wardrobe,.015);
    contact(3.2,2.2,-1.3,5.05,.5);
    // Bedside storage under the free section of window, to the left of the bed.
    const bedside=new T.Group();bedside.name='window-bedside-drawer-lamp-charging';model.add(bedside);
    box(1.86,.12,1.34,1.55,.08,5.15,graphite,bedside,.015);
    box(2,1.48,1.5,1.55,.88,5.15,oak,bedside,.025);
    box(2.07,.09,1.57,1.55,1.665,5.15,oak,bedside,.025);
    for(const y of [.52,1.2]){
      box(1.88,.62,.055,1.55,y,4.377,cupboardFace,bedside,.014);
      box(.48,.025,.055,1.55,y+.12,4.327,graphite,bedside,.01);
    }
    contact(2.3,1.9,1.55,5.15,.5);
    // A compact warm bedside lamp, with a fabric shade.
    cylinder(.22,.045,1.98,1.73,5.25,metal,bedside);
    cylinder(.025,.46,1.98,1.98,5.25,graphite,bedside);
    const shadeMat=new T.MeshStandardMaterial({color:'#ece0c8',roughness:.94,side:T.DoubleSide,emissive:'#ffcf85',emissiveIntensity:.22});
    shadeMat.map=clothMap;
    const shade=new T.Mesh(new T.CylinderGeometry(.23,.35,.38,48,1,true),shadeMat);shade.position.set(1.98,2.3,5.25);shade.castShadow=true;bedside.add(shade);
    sphere(1.98,2.27,5.25,.075,.1,.075,led,bedside);
    const bedsideLight=new T.PointLight('#ffdaa0',8,7,2);bedsideLight.position.set(1.98,2.22,5.25);scene.add(bedsideLight);
    // Charging outlet above cabinet, with a charger, USB port and cable to phone.
    box(.56,.32,.045,1.0,2.1,5.97,cream,bedside,.018);
    for(const x of [.84,.96])box(.024,.045,.014,x,2.12,5.939,graphite,bedside);
    box(.025,.03,.014,.9,2.19,5.939,graphite,bedside);
    box(.1,.035,.015,1.16,2.1,5.938,graphite,bedside,.008);
    box(.1,.027,.012,1.16,2.17,5.938,graphite,bedside,.006);
    box(.13,.15,.15,.9,2.08,5.86,cream,bedside,.02);
    box(.31,.028,.6,1.04,1.725,5.03,graphite,bedside,.013);
    box(.275,.006,.52,1.04,1.743,5.03,mat('#19292e',.25),bedside,.002);
    tube([[.9,2.02,5.8],[.89,1.84,5.64],[.85,1.72,5.37],[1.04,1.745,5.31]],.008,cream,bedside);
    // Work desk: 5 by 2.5 ft, right wall at the back.
    box(2.5,.17,5,4.7,2.5,-3.45,oak,model,.05);
    for(const z of [-5.65,-1.25])for(const x of [3.65,5.75])box(.12,2.45,.12,x,1.22,z,oakEdge);
    box(.85,1.15,1.15,5.25,1.87,-1.75,oak,model,.03);
    for(const y of [1.55,1.95,2.3])box(.34,.025,.04,5.25,y,-1.16,metal);
    box(.55,.04,.8,5.22,2.62,-3.65,metal,model,.03);box(.07,.65,.13,5.47,2.96,-3.65,metal);
    box(.13,1.33,2.3,5.45,3.65,-3.65,graphite,model,.04);
    const screen=new T.MeshStandardMaterial({color:'#285c78',emissive:'#173f63',emissiveIntensity:.5,roughness:.3});
    const displayCanvas=document.createElement('canvas');displayCanvas.width=768;displayCanvas.height=432;const dq=displayCanvas.getContext('2d');
    const dg=dq.createLinearGradient(0,0,768,432);dg.addColorStop(0,'#101f39');dg.addColorStop(.45,'#245a6b');dg.addColorStop(1,'#a68169');dq.fillStyle=dg;dq.fillRect(0,0,768,432);
    for(let i=0;i<8;i++){dq.strokeStyle=`rgba(184,221,222,${.05+i*.013})`;dq.lineWidth=15;dq.beginPath();dq.moveTo(-60,380+i*25);dq.bezierCurveTo(300,420-i*30,430,-80+i*20,860,40+i*32);dq.stroke();}
    dq.fillStyle='rgba(14,24,36,.65)';dq.fillRect(0,407,768,25);for(let i=0;i<7;i++){dq.fillStyle=['#a0c3ce','#b0bdc4','#d5c5aa'][i%3];dq.fillRect(270+i*31,414,14,12);}
    const displayMap=new T.CanvasTexture(displayCanvas);displayMap.colorSpace=T.SRGBColorSpace;screen.color.set('#ffffff');screen.map=displayMap;screen.emissiveMap=displayMap;screen.emissive.set('#ffffff');screen.emissiveIntensity=.35;
    box(.015,1.18,2.12,5.365,3.66,-3.65,screen);
    box(.62,.045,1.35,4.25,2.62,-3.65,graphite,model,.025);
    for(let i=0;i<5;i++)for(let j=0;j<11;j++)box(.075,.016,.082,4.02+i*.095,2.65,-4.18+j*.106,cream);
    sphere(4.23,2.66,-2.57,.16,.055,.24,cream);
    // Raised aluminum laptop stand with an open, angled laptop.
    const laptopStand=new T.Group();laptopStand.name='laptop-on-raised-holder';laptopStand.position.set(4.85,2.59,-1.9);laptopStand.rotation.y=-Math.PI/2;model.add(laptopStand);
    box(.87,.035,.62,0,.025,0,metal,laptopStand,.012);
    for(const x of [-.34,.34]){
      const strut=box(.055,.4,.065,x,.235,-.03,metal,laptopStand,.01);strut.rotation.x=-.32;
      box(.065,.025,.48,x,.434,.02,metal,laptopStand,.008);
      box(.07,.07,.055,x,.43,.26,graphite,laptopStand,.008);
    }
    const laptopBase=new T.Group();laptopBase.position.y=.47;laptopBase.rotation.x=.12;laptopStand.add(laptopBase);
    box(1.14,.035,.78,0,0,0,metal,laptopBase,.012);
    box(.99,.008,.38,0,.023,-.08,graphite,laptopBase,.005);
    for(let row=0;row<5;row++)for(let col=0;col<12;col++)box(.061,.008,.048,-.435+col*.079,.032,-.224+row*.067,cream,laptopBase,.002);
    box(.3,.005,.16,0,.025,.225,graphite,laptopBase,.004);
    const laptopLid=new T.Group();laptopLid.position.set(0,.015,-.35);laptopLid.rotation.x=-.18;laptopBase.add(laptopLid);
    box(1.14,.77,.035,0,.385,0,metal,laptopLid,.01);
    box(1.08,.71,.012,0,.385,.024,graphite,laptopLid,.004);
    const laptopFace=new T.Mesh(new T.PlaneGeometry(1.015,.64),screen);laptopFace.position.set(0,.39,.032);laptopLid.add(laptopFace);
    sphere(0,.748,.038,.009,.009,.005,graphite,laptopLid);
    for(const z of [-.2,-.05,.11])box(.012,.012,.055,-.577,.004,z,graphite,laptopBase);
    tube([[5.34,2.98,-1.95],[5.62,2.9,-2.05],[5.72,2.35,-2.7],[5.92,.5,-4]],.012,graphite);
    const deskMat=mat('#424744');deskMat.map=clothMap;box(1.3,.018,2.25,4.15,2.596,-3.5,deskMat,model,.006);
    tube([[5.44,3.1,-3.6],[5.65,2.65,-3.9],[5.75,2,-4.2],[5.8,.35,-4.2],[5.96,.25,-4]],.018,graphite);
    box(.03,.32,.58,5.98,.52,-4,cream);for(const z of [-4.16,-3.86])for(const y of [.47,.56])box(.015,.025,.018,5.955,y,z,graphite);
    box(.035,.35,.35,-2.5,4,5.98,cream,front,.02);box(.015,.19,.12,-2.5,4,5.95,frame,front,.01);
    cylinder(.1,.34,5.55,2.77,-2.3,graphite);for(let i=0;i<4;i++){const pencil=cylinder(.009,.45,5.55+(i%2)*.045,3.03,-2.3+Math.floor(i/2)*.045,oak);pencil.rotation.z=(i-2)*.09;}
    // Detailed desktop PC tower at the far end of the desk; no RGB lighting.
    const pc=new T.Group();pc.name='desktop-cpu-tower';pc.position.set(4.92,2.64,-5.25);model.add(pc);
    box(1.3,1.66,.75,0,.87,0,graphite,pc,.035);
    for(const x of [-.49,.49])for(const z of [-.27,.27])box(.11,.055,.1,x,.01,z,metal,pc,.008);
    const grille=mat('#171d20',.9);grille.map=meshMap;grille.bumpMap=meshMap;grille.bumpScale=.008;
    box(.025,1.43,.65,-.665,.85,0,grille,pc,.006);
    for(const y of [.48,1.14]){
      const fanHub=cylinder(.22,.025,-.688,y,0,metal,pc);fanHub.rotation.z=Math.PI/2;
      const guard=new T.Mesh(new T.TorusGeometry(.232,.018,8,40),graphite);guard.rotation.y=Math.PI/2;guard.position.set(-.708,y,0);pc.add(guard);
      for(let j=0;j<7;j++){const a=j*Math.PI*2/7;const blade=sphere(-.707,y+Math.cos(a)*.13,Math.sin(a)*.13,.012,.12,.04,graphite,pc);blade.rotation.x=a+.4;}
      sphere(-.73,y,0,.015,.055,.055,metal,pc);
    }
    // Side window and visible motherboard, GPU, RAM and cooling hardware.
    box(1.12,1.43,.018,0,.9,.366,metal,pc,.006);
    const motherboard=mat('#26332d');box(.92,1.09,.025,.04,.98,.394,motherboard,pc);
    box(.4,.09,.18,-.1,.65,.42,graphite,pc,.006);
    for(const x of [-.2,.12]){const f=cylinder(.085,.018,x,.65,.523,metal,pc);f.rotation.x=Math.PI/2;}
    box(.28,.3,.08,.08,1.2,.44,metal,pc,.008);
    for(let j=0;j<9;j++)box(.26,.012,.1,.08,1.07+j*.031,.45,graphite,pc);
    for(const x of [.32,.39])box(.035,.44,.05,x,1.16,.42,graphite,pc);
    box(.85,.2,.15,0,.29,.4,graphite,pc,.008);
    const pcGlass=new T.MeshPhysicalMaterial({color:'#8caaa9',transparent:true,opacity:.22,roughness:.12,metalness:.05,side:T.DoubleSide,depthWrite:false});
    box(1.14,1.44,.012,0,.9,.55,pcGlass,pc).castShadow=false;
    for(const x of [-.55,.55])for(const y of [.2,1.6])sphere(x,y,.564,.025,.025,.012,chrome,pc);
    for(let j=0;j<17;j++)box(.65,.009,.012,.18,1.708,-.23+j*.028,metal,pc);
    sphere(-.46,1.72,-.21,.045,.009,.045,chrome,pc);
    for(const z of [-.05,.12])box(.012,.025,.065,-.684,1.58,z,metal,pc,.003);
    sphere(-.687,1.6,.27,.012,.018,.018,cream,pc);
    tube([[5.58,2.88,-5.25],[5.8,2.75,-5.25],[5.81,1.3,-4.7],[5.94,.5,-4]],.018,graphite);
    // Keyboard legends, mouse controls, soundbar and a tidy cable tray.
    const keyCanvas=document.createElement('canvas');keyCanvas.width=350;keyCanvas.height=768;const kq=keyCanvas.getContext('2d');
    const keyRows=['1234567890-','QWERTYUIOP[','ASDFGHJKL;\'','ZXCVBNM,./ ','CTRL ALT   '];
    kq.font='20px sans-serif';kq.textAlign='center';kq.textBaseline='middle';kq.fillStyle='#3d4343';
    for(let row=0;row<5;row++)for(let col=0;col<11;col++){kq.save();kq.translate(42+row*55,76+col*59);kq.rotate(Math.PI/2);kq.fillText(keyRows[row][col]||'',0,0);kq.restore();}
    const keyTex=new T.CanvasTexture(keyCanvas);keyTex.colorSpace=T.SRGBColorSpace;
    const legends=new T.Mesh(new T.PlaneGeometry(.6,1.32),new T.MeshBasicMaterial({map:keyTex,transparent:true,depthWrite:false}));legends.rotation.x=-Math.PI/2;legends.position.set(4.25,2.667,-3.65);model.add(legends);
    box(.014,.025,.11,4.23,2.715,-2.61,graphite,model,.004);
    line3([[4.23,2.71,-2.8],[4.23,2.715,-2.63]],new T.LineBasicMaterial({color:'#5c6262'}));
    tube([[4.45,2.65,-3.65],[4.8,2.62,-3.8],[5.7,2.6,-4.4],[5.75,2.4,-5.1]],.009,graphite);
    box(.2,.14,1.25,4.93,2.69,-3.65,graphite,model,.025);
    box(.012,.1,1.1,4.824,2.69,-3.65,grille,model,.004);
    box(1.5,.12,3.6,5,2.28,-3.55,graphite,model,.015);
    for(const z of [-4.8,-3.9,-3.0])box(.05,.05,.22,5,2.35,z,metal);
    // Additional 43-inch TV-style display on a hinged wall bracket.
    const tvMount=new T.Group();tvMount.name='large-tilting-tv-wall-mount';tvMount.position.set(5.91,5.85,-3.55);tvMount.rotation.y=-Math.PI/2;model.add(tvMount);
    box(.72,.7,.065,0,0,0,graphite,tvMount,.012);
    for(const x of [-.25,.25])box(.055,.58,.24,x,0,.14,metal,tvMount,.006);
    const tvPivot=new T.Group();tvPivot.position.z=.43;tvMount.add(tvPivot);
    const tvBody=box(3.15,1.8,.12,0,0,0,graphite,tvPivot,.025);
    box(1.18,.65,.14,0,0,-.1,graphite,tvPivot,.025);
    const tvCanvas=document.createElement('canvas');tvCanvas.width=1280;tvCanvas.height=720;const tq=tvCanvas.getContext('2d');
    const tg=tq.createLinearGradient(0,0,1280,720);tg.addColorStop(0,'#142a30');tg.addColorStop(1,'#11151b');tq.fillStyle=tg;tq.fillRect(0,0,1280,720);
    tq.fillStyle='#e8eeeb';tq.font='28px sans-serif';tq.fillText('Home    Movies    Shows    Apps',58,65);tq.font='22px sans-serif';tq.fillText('21:30',1150,65);
    tq.font='48px sans-serif';tq.fillText('Your evening. Your screen.',58,153);tq.font='24px sans-serif';tq.fillStyle='#aebfbd';tq.fillText('Continue watching',58,218);
    for(let i=0;i<3;i++){const x=58+i*394;const grad=tq.createLinearGradient(x,250,x+365,470);grad.addColorStop(0,['#3a6669','#675949','#4b5774'][i]);grad.addColorStop(1,'#18212a');tq.fillStyle=grad;tq.fillRect(x,250,365,225);tq.fillStyle=['#c7b193','#d4bd9a','#c2c4cb'][i];tq.beginPath();tq.arc(x+275,309,34,0,Math.PI*2);tq.fill();tq.fillStyle='#243136';tq.beginPath();tq.moveTo(x,475);tq.lineTo(x+160,330);tq.lineTo(x+280,475);tq.fill();tq.fillStyle='#f3f1e9';tq.font='26px sans-serif';tq.fillText(['WANDER','STORIES','AFTER HOURS'][i],x+20,445);}
    tq.fillStyle='#cdd4d1';tq.font='24px sans-serif';tq.fillText('Your apps',58,540);
    for(let i=0;i<5;i++){const x=58+i*239;tq.fillStyle=['#433a3a','#384650','#46413c','#3c4942','#42414e'][i];tq.fillRect(x,566,216,92);tq.fillStyle='#eeefeb';tq.font='25px sans-serif';tq.fillText(['YouTube','Netflix','Prime Video','Music','Apps'][i],x+21,621);}
    const tvTex=new T.CanvasTexture(tvCanvas);tvTex.colorSpace=T.SRGBColorSpace;tvTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const tvScreen=new T.Mesh(new T.PlaneGeometry(3.04,1.71),new T.MeshStandardMaterial({map:tvTex,emissiveMap:tvTex,emissive:'#ffffff',emissiveIntensity:.55,roughness:.22}));tvScreen.position.z=.065;tvPivot.add(tvScreen);
    sphere(0,-.885,.066,.018,.008,.008,cream,tvPivot);
    for(let i=0;i<13;i++)box(.18,.008,.016,-1.2+i*.18,-.91,-.01,metal,tvPivot);
    tube([[5.86,5.7,-3.55],[5.94,4.8,-3.55],[5.94,3.2,-4.8],[5.65,2.7,-5.25]],.013,graphite);
    // TV remote beside the keyboard.
    box(.3,.035,.1,3.85,2.64,-2.28,graphite,model,.025);
    for(let i=0;i<5;i++)sphere(3.75+i*.045,2.663,-2.28,.013,.006,.018,cream);
    // Ergonomic chair faces right, toward monitor.
    const chair=new T.Group();chair.position.set(2.35,0,-3.55);model.add(chair);
    cylinder(.12,1.3,0,.83,0,metal,chair);box(1.45,.23,1.55,0,1.57,0,graphite,chair,.09);
    box(.19,1.55,1.4,-.65,2.42,0,graphite,chair,.07);box(.22,.37,.76,-.65,3.45,0,graphite,chair,.07);
    box(.035,1.3,1.15,-.535,2.46,0,meshMaterial,chair,.015);
    box(.15,.28,.95,-.48,2.03,0,graphite,chair,.055);
    for(const z of [-.8,.8]){box(.08,.53,.08,.07,1.95,z,metal,chair);box(.8,.12,.14,.07,2.2,z,graphite,chair,.03);}
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const leg=box(1.05,.08,.1,Math.cos(a)*.47,.29,Math.sin(a)*.47,metal,chair);leg.rotation.y=-a;sphere(Math.cos(a)*.94,.18,Math.sin(a)*.94,.12,.13,.12,graphite,chair);}
    // Wall fan centered over the gap between desk end (-0.95 ft) and bed foot (-0.6 ft).
    const fanWallZ=(-.95-.6)/2;
    const fanMount=new T.Group();fanMount.name='wall-fan-mount';model.add(fanMount);
    box(.15,.8,.48,5.94,5.88,fanWallZ,cream,fanMount,.045);
    for(const y of [5.58,6.18])sphere(5.853,y,fanWallZ,.012,.025,.025,chrome,fanMount);
    tube([[5.87,5.84,fanWallZ],[5.5,5.84,fanWallZ],[5.3,6.13,fanWallZ]],.065,cream,fanMount);
    cylinder(.12,.13,5.3,6.15,fanWallZ,metal,fanMount);
    const fanYaw=new T.Group();fanYaw.name='wall-fan-oscillation';fanYaw.position.set(5.3,6.24,fanWallZ);fanYaw.rotation.y=-Math.PI/2;model.add(fanYaw);
    const fan=new T.Group();fan.name='wall-fan-head';fan.rotation.x=.16;fanYaw.add(fan);
    const motor=cylinder(.17,.36,0,0,-.2,cream,fan);motor.rotation.x=Math.PI/2;
    const wire=new T.LineBasicMaterial({color:'#928c7b'});
    for(const side of [-1,1]){
      for(let r=.15;r<.68;r+=.07){const pts=[],depth=side*.16*Math.sqrt(1-r*r/(.68*.68));for(let j=0;j<=64;j++){const a=j/64*Math.PI*2;pts.push([Math.cos(a)*r,Math.sin(a)*r,depth]);}line3(pts,wire,fan);}
      for(let j=0;j<24;j++){const a=j*Math.PI/12,pts=[];for(let k=0;k<=10;k++){const r=k*.067;pts.push([Math.cos(a)*r,Math.sin(a)*r,side*.16*Math.sqrt(Math.max(0,1-r*r/(.68*.68)))]);}line3(pts,wire,fan);}
    }
    const rim=new T.Mesh(new T.TorusGeometry(.67,.018,8,64),chrome);fan.add(rim);
    const fanRotor=new T.Group();fanRotor.name='wall-fan-blades';fan.add(fanRotor);
    const bladeMat=mat('#c1c5bd',.4);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const b=sphere(Math.cos(a)*.28,Math.sin(a)*.28,0,.31,.125,.025,bladeMat,fanRotor);b.rotation.z=a+.65;}
    sphere(0,0,.17,.13,.13,.065,cream,fan);
    tube([[5.96,5.55,fanWallZ],[5.97,4.4,fanWallZ],[5.97,2.2,fanWallZ],[5.97,.55,-4.1]],.012,cream);
    for(const z of [fanWallZ+.07,fanWallZ-.07]){tube([[5.8,5.68,z],[5.8,5.05,z]],.007,graphite);sphere(5.8,5.01,z,.024,.06,.024,cream);}
    // The three prints have moved from above the bed to the blank wall below the AC.
    const bedArt=new T.Group();bedArt.name='three-neutral-artworks-below-ac';bedArt.position.set(0,4.9,-5.965);model.add(bedArt);
    const bedArtReverse=[];
    function neutralPrint(index){
      const c=document.createElement('canvas');c.width=480;c.height=680;const q=c.getContext('2d');
      q.fillStyle='#eae1d3';q.fillRect(0,0,480,680);
      for(let i=0;i<17000;i++){q.fillStyle=i%2?'rgba(75,58,42,.045)':'rgba(255,255,255,.13)';q.fillRect(rand()*480,rand()*680,1,2);}
      if(index===0){
        q.fillStyle='#b49b7e';q.beginPath();q.arc(240,245,125,Math.PI,0);q.lineTo(365,575);q.lineTo(115,575);q.closePath();q.fill();
        q.strokeStyle='#3f3d37';q.lineWidth=4;
        for(let k=0;k<8;k++){q.beginPath();q.arc(240,294,104-k*11,Math.PI,0);q.lineTo(344-k*11,575);q.moveTo(136+k*11,294);q.lineTo(136+k*11,575);q.stroke();}
      }else if(index===1){
        q.fillStyle='#ac9275';q.beginPath();q.arc(305,210,80,0,Math.PI*2);q.fill();
        const colors=['#c5b39b','#9a8c79','#5d5e56'];
        for(let i=0;i<3;i++){q.fillStyle=colors[i];q.beginPath();q.moveTo(0,390+i*65);q.bezierCurveTo(130,280+i*105,300,560-i*22,480,335+i*95);q.lineTo(480,680);q.lineTo(0,680);q.closePath();q.fill();}
      }else{
        q.fillStyle='#cab8a0';q.beginPath();q.ellipse(248,345,141,217,-.15,0,Math.PI*2);q.fill();
        q.strokeStyle='#42463e';q.lineWidth=5;q.lineCap='round';q.beginPath();q.moveTo(186,575);q.bezierCurveTo(205,450,287,335,250,165);q.stroke();
        for(let i=0;i<6;i++){const y=225+i*52,x=250-(y-225)*.15;for(const side of [-1,1]){q.save();q.translate(x,y);q.rotate(side*.7);q.fillStyle=i%2?'#777b69':'#555c4e';q.beginPath();q.ellipse(side*28,-14,42,12,side*.2,0,Math.PI*2);q.fill();q.restore();}}
      }
      const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
    }
    for(let i=0;i<3;i++){
      const x=(i-1)*1.55;
      box(1.29,1.88,.065,x,0,0,graphite,bedArt,.008);
      box(1.2,1.79,.01,x,0,.039,cream,bedArt);
      const print=new T.Mesh(new T.PlaneGeometry(1.08,1.53),new T.MeshStandardMaterial({map:neutralPrint(i),roughness:.94}));print.position.set(x,0,.046);bedArt.add(print);
      const reverse=print.clone();reverse.position.z=-.036;reverse.rotation.y=Math.PI;bedArt.add(reverse);bedArtReverse.push(reverse);
    }
    // Single bed with head at front window.
    box(3,.5,6.5,4.45,.43,2.65,oak,model,.065);
    for(const x of [3.1,5.8])for(const z of [-.35,5.65])box(.16,.3,.16,x,.15,z,oakEdge);
    box(2.92,.48,6.3,4.45,.88,2.65,cream,model,.15);
    box(3,1.9,.16,4.45,1.2,5.88,oak,model,.07);
    box(2.98,.12,4.55,4.45,1.12,1.79,fabric,model,.025);
    function quiltHeight(x,z){return .018*Math.cos((x+z)*18)*Math.cos((x-z)*18)+.02*Math.sin(z*7+x*5)+.017*Math.sin(x*20+z*3);}
    const stitch=new T.LineBasicMaterial({color:'#a2a195',transparent:true,opacity:.55});
    for(let k=-10;k<20;k++){
      const intercept=k*.35, pts=[];
      for(let j=0;j<=100;j++){const x=2.99+j*2.92/100,z=x-4.45+intercept;if(z>=-.46&&z<=4.03)pts.push([x,1.265+quiltHeight(x-4.45,z-1.79),z]);}if(pts.length>1)line3(pts,stitch);
    }
    for(let k=-10;k<20;k++){
      const pts=[];for(let j=0;j<=100;j++){const x=2.99+j*2.92/100,z=-x+4.45+k*.35;if(z>=-.46&&z<=4.03)pts.push([x,1.265+quiltHeight(x-4.45,z-1.79),z]);}if(pts.length>1)line3(pts,stitch);
    }
    box(2.96,.16,.55,4.45,1.26,3.72,fabric,model,.05);
    const pillowGeo=new T.SphereGeometry(1,64,32),pp=pillowGeo.attributes.position;
    for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i),power=v=>Math.sign(v)*Math.pow(Math.abs(v),.42);pp.setXYZ(i,power(x)*1.05,power(y)*.18+.013*Math.sin(x*18+z*9),power(z)*.56);}pillowGeo.computeVertexNormals();
    const pillow=new T.Mesh(pillowGeo,linen);pillow.position.set(4.45,1.28,5.03);pillow.rotation.y=-.04;pillow.castShadow=true;pillow.receiveShadow=true;model.add(pillow);
    const pillowSeam=[];for(let j=0;j<=120;j++){const a=j/120*Math.PI*2;pillowSeam.push([4.45+Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.4)*1.055,1.28,5.03+Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.4)*.56]);}tube(pillowSeam,.008,cream);
    // Sculpted duvet surface: small quilt loft and relaxed fabric folds.
    const duvetGeo=new T.PlaneGeometry(2.98,4.55,72,100);duvetGeo.rotateX(-Math.PI/2);const dp=duvetGeo.attributes.position;
    for(let i=0;i<dp.count;i++){const x=dp.getX(i),z=dp.getZ(i);dp.setY(i,quiltHeight(x,z));}duvetGeo.computeVertexNormals();
    const duvet=new T.Mesh(duvetGeo,fabric);duvet.position.set(4.45,1.26,1.79);duvet.receiveShadow=true;duvet.castShadow=true;model.add(duvet);
    for(const side of [-1,1]){const g=new T.PlaneGeometry(.3,4.55,12,64);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),u=x+.15;a.setX(i,side*(1.49+u*.35));a.setY(i,-u*1.8+.018*Math.sin(a.getZ(i)*8));}g.computeVertexNormals();const sideMat=fabric.clone();sideMat.side=T.DoubleSide;const m=new T.Mesh(g,sideMat);m.position.set(4.45,1.26,1.79);m.receiveShadow=true;m.castShadow=true;model.add(m);}
    for(const z of [1.4,3.8])box(2.6,.08,.025,4.45,.48,z,oakEdge);
    // Rug with a procedural woven surface, no external image assets.
    const weave=document.createElement('canvas');weave.width=256;weave.height=256;
    const ctx=weave.getContext('2d');ctx.fillStyle='#b4a38b';ctx.fillRect(0,0,256,256);
    let seed=31;for(let i=0;i<18000;i++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;const y=seed%256;ctx.fillStyle=i%2?'#c1b39c':'#a6967e';ctx.fillRect(x,y,1,2);}
    const rugTex=new T.CanvasTexture(weave);rugTex.wrapS=rugTex.wrapT=T.RepeatWrapping;rugTex.repeat.set(4,5);rugTex.colorSpace=T.SRGBColorSpace;
    const rugMaterial=new T.MeshStandardMaterial({map:rugTex,bumpMap:rugTex,bumpScale:.025,roughness:1});
    box(4.8,.035,5.4,-.7,.07,1.65,rugMaterial,model,.008);
    for(const z of [-1.08,4.38])for(let i=0;i<65;i++)box(.014,.012,.09,-3.03+i*.073,.064,z,linen);
    // The user's own photograph is placed directly on the left wall.
    // Crop only the doorway/outer trim; preserve the photographed decor itself.
    const animeWall=new T.Group();animeWall.name='user-reference-anime-wall';animeWall.position.set(-5.97,5.25,-1.05);animeWall.rotation.y=Math.PI/2;model.add(animeWall);
    const referenceTexture=new T.Texture();referenceTexture.colorSpace=T.SRGBColorSpace;referenceTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    referenceTexture.repeat.set(1572/1672,1);referenceTexture.offset.set(28/1672,0);
    const referenceMat=new T.MeshBasicMaterial({map:referenceTexture,toneMapped:false});
    const referenceWidth=8.94,referenceHeight=referenceWidth*941/1572;
    box(referenceWidth,referenceHeight,.025,0,0,.015,peachWall,animeWall);
    const referenceFace=new T.Mesh(new T.PlaneGeometry(referenceWidth,referenceHeight),referenceMat);referenceFace.position.z=.03;animeWall.add(referenceFace);
    const reverseReferenceFace=referenceFace.clone();reverseReferenceFace.position.z=-.015;reverseReferenceFace.rotation.y=Math.PI;animeWall.add(reverseReferenceFace);
    const animeReverseFaces=[reverseReferenceFace];
    // One connected L sectional: three seats along anime wall, one return at AC wall.
    const sofa=new T.Group();sofa.name='connected-l-sofa-three-plus-one';sofa.position.set(-4.65,0,-2.65);sofa.rotation.y=Math.PI/2;model.add(sofa);
    // Neutral grayscale weave keeps upholstery colors free of the earlier yellow-green cast.
    const neutralWeave=document.createElement('canvas');neutralWeave.width=neutralWeave.height=512;const nwq=neutralWeave.getContext('2d');nwq.drawImage(clothMap.image,0,0,512,512);
    const weavePixels=nwq.getImageData(0,0,512,512);for(let i=0;i<weavePixels.data.length;i+=4){const v=Math.round(weavePixels.data[i]*.2126+weavePixels.data[i+1]*.7152+weavePixels.data[i+2]*.0722);weavePixels.data[i]=weavePixels.data[i+1]=weavePixels.data[i+2]=v;}nwq.putImageData(weavePixels,0,0);
    const neutralWeaveMap=new T.CanvasTexture(neutralWeave);neutralWeaveMap.wrapS=neutralWeaveMap.wrapT=T.RepeatWrapping;neutralWeaveMap.repeat.set(2,3);neutralWeaveMap.colorSpace=T.SRGBColorSpace;neutralWeaveMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const sofaPalettes={dustyBlue:{label:'Dusty blue',color:'#92a5ad'},charcoal:{label:'Charcoal grey',color:'#55575b'},navy:{label:'Midnight navy',color:'#354658'},camel:{label:'Camel',color:'#b78a5a'},terracotta:{label:'Terracotta',color:'#aa6f5a'}};
    const sofaFabric=mat(sofaPalettes.dustyBlue.color,.87);sofaFabric.map=neutralWeaveMap;sofaFabric.bumpMap=neutralWeaveMap;sofaFabric.bumpScale=.009;
    const sofaPiping=mat('#484a4e',.94);
    for(const x of [-2.84,2.84])for(const z of [-.98,.98])cylinder(.065,.48,x,.24,z,oakEdge,sofa);
    box(6.5,.5,2.55,0,.7,0,sofaFabric,sofa,.13);
    box(6.3,1.58,.38,0,1.76,-1.08,sofaFabric,sofa,.12);
    box(.42,1.66,2.6,-3.04,1.18,0,sofaFabric,sofa,.12);
    for(const x of [-1.88,0,1.88]){
      box(1.81,.38,1.92,x,1.14,.21,sofaFabric,sofa,.13);
      const cushion=box(1.83,1.29,.4,x,1.98,-.79,sofaFabric,sofa,.12);cushion.rotation.x=-.13;
      const edgeLoop=[];
      for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;edgeLoop.push([x+Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.22)*.87,1.338,.21+Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.22)*.925]);}
      tube(edgeLoop,.007,sofaPiping,sofa);
    }
    const pillowMat=mat('#b57b62',.98);pillowMat.map=neutralWeaveMap;pillowMat.bumpMap=neutralWeaveMap;pillowMat.bumpScale=.012;
    for(const [x,angle,m] of [[-2.02,-.2,pillowMat],[2.02,.2,linen]]){
      const pillow=box(.79,.79,.24,x,1.72,-.29,m,sofa,.11);pillow.rotation.z=angle;pillow.rotation.x=-.18;
    }
    // A relaxed woven throw across one arm, with a draped front edge.
    const throwMat=mat('#929298',1);throwMat.map=neutralWeaveMap;throwMat.bumpMap=neutralWeaveMap;throwMat.bumpScale=.014;throwMat.side=T.DoubleSide;
    const throwGeo=new T.PlaneGeometry(1,2.05,24,50);throwGeo.rotateX(-Math.PI/2);const throwPos=throwGeo.attributes.position;
    for(let i=0;i<throwPos.count;i++){const x=throwPos.getX(i),z=throwPos.getZ(i);throwPos.setY(i,.03*Math.sin(x*24+z*3)-Math.max(0,z-.63)*2.1);}
    throwGeo.computeVertexNormals();const throwBlanket=new T.Mesh(throwGeo,throwMat);throwBlanket.position.set(1.93,1.37,.3);throwBlanket.receiveShadow=true;throwBlanket.castShadow=true;sofa.add(throwBlanket);
    // The corner has an uninterrupted seat junction; no arm separates the return.
    const sofaReturn=new T.Group();sofaReturn.name='integrated-one-seat-return-under-ac';sofaReturn.position.set(2,0,2.34);sofaReturn.rotation.y=-Math.PI/2;sofa.add(sofaReturn);
    box(2.1,.5,2.55,0,.7,0,sofaFabric,sofaReturn,.13);
    box(4.67,1.58,.38,-1.295,1.76,-1.08,sofaFabric,sofaReturn,.12);
    box(.42,1.66,2.6,.84,1.18,0,sofaFabric,sofaReturn,.12);
    box(1.69,.38,1.92,-.18,1.14,.21,sofaFabric,sofaReturn,.13);
    const returnBack=box(1.7,1.29,.4,-.18,1.98,-.79,sofaFabric,sofaReturn,.12);returnBack.rotation.x=-.13;
    const cornerBack=box(2.38,1.29,.4,-2.27,1.98,-.79,sofaFabric,sofaReturn,.12);cornerBack.rotation.x=-.13;
    for(const x of [-.78,.76])for(const z of [-.98,.98])cylinder(.065,.48,x,.24,z,oakEdge,sofaReturn);
    const returnPiping=[];
    for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;returnPiping.push([-.18+Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.22)*.81,1.338,.21+Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.22)*.925]);}
    tube(returnPiping,.007,sofaPiping,sofaReturn);
    contact(3.1,7.15,-4.65,-2.65,.6);contact(2.55,3.1,-2.31,-4.65,.6);
    const referenceImage=new Image();referenceImage.onload=()=>{referenceTexture.image=referenceImage;referenceTexture.needsUpdate=true;draw();};referenceImage.onerror=()=>{const e=root.querySelector('.room-error');e.hidden=false;e.textContent='Anime wall image could not load.';};referenceImage.src=root.querySelector('.anime-reference-source').src;
    box(3.15,.95,.75,0,7.12,-5.65,cream,back,.15);
    box(2.7,.12,.025,0,6.88,-5.255,graphite,back,.015);
    box(.5,.025,.015,.85,7.2,-5.26,screen,back);
    for(let i=0;i<6;i++)box(2.58,.018,.06,0,6.87+i*.025,-5.23,metal,back);
    box(2.96,.012,.012,0,7.14,-5.265,frame,back);box(.06,.018,.012,1.2,6.98,-5.26,led,back);
    const lampBase=cylinder(.22,.04,3.75,2.64,-1.3,metal);sphere(3.75,2.93,-1.3,.23,.25,.23,led);
    const floorExtension=window.buildFloorExtension(T,model,{box,cylinder,sphere,tube,mat,plaster,oak,cream,metal,glass,tile,chrome,linen,screen});
    const ambient=new T.HemisphereLight('#e8f2ff','#a59a87',.7);scene.add(ambient);
    const sun=new T.DirectionalLight('#fff1d6',2.6);sun.position.set(-3,11,12);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.normalBias=.018;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
    const fill=new T.PointLight('#ffc675',32,18,2);fill.position.set(0,7,-4.5);scene.add(fill);
    const ledFill=new T.PointLight('#ffd395',10,9,2);ledFill.position.set(3.75,2.93,-1.3);scene.add(ledFill);
    // Gatar-patiya construction: exposed I-section girders with slab infill.
    // Dimensions and orientation are a visual assumption, not a structural plan.
    const ceiling=new T.Group();ceiling.name='exposed-gatar-patiya-ceiling';model.add(ceiling);
    const beamMat=mat('#2c3035',.57),slabMat=mat('#c0bbae',.97);slabMat.bumpMap=plasterMap;slabMat.bumpScale=.03;
    box(12.2,.12,12.2,0,8.94,0,slabMat,ceiling);
    for(let z=-5.25;z<6;z+=1.5)for(let x=-5.25;x<6;x+=1.5)box(1.475,.13,1.475,x,8.81,z,slabMat,ceiling);
    for(const z of [-4.5,-1.5,1.5,4.5]){
      box(12.1,.075,.33,0,8.65,z,beamMat,ceiling);
      box(12.1,.48,.075,0,8.375,z,beamMat,ceiling);
      box(12.1,.075,.33,0,8.1,z,beamMat,ceiling);
    }
    // Exposed ceiling has no strip lights, track lights or downlights.
    // Soft reflection environment provides highlights on wood, glass and metal.
    const envScene=new T.Scene();envScene.background=new T.Color('#bcb7ac');
    const envRoom=new T.Mesh(new T.BoxGeometry(30,20,30),new T.MeshBasicMaterial({color:'#c9c6bc',side:T.BackSide}));envScene.add(envRoom);
    for(const p of [[-8,6,4],[6,7,-5],[0,10,0]]){const panel=new T.Mesh(new T.PlaneGeometry(9,6),new T.MeshBasicMaterial({color:'#fff4df',side:T.DoubleSide}));panel.position.set(...p);panel.lookAt(0,0,0);envScene.add(panel);}
    const pmrem=new T.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(envScene,.05);scene.environment=envTarget.texture;pmrem.dispose();
    const shadow=new T.Mesh(new T.PlaneGeometry(12.6,12.6),new T.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.41;shadow.receiveShadow=true;scene.add(shadow);
    // Depth-aware ambient occlusion and a restrained HDR glow, rendered locally.
    const renderTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true});
    renderTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
    const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
    const postMat=new T.ShaderMaterial({
      uniforms:{image:{value:renderTarget.texture},depth:{value:renderTarget.depthTexture},inverseProjection:{value:camera.projectionMatrixInverse},resolution:{value:new T.Vector2(1,1)}},
      vertexShader:'varying vec2 uvOut;void main(){uvOut=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:`
        uniform sampler2D image;uniform sampler2D depth;uniform mat4 inverseProjection;uniform vec2 resolution;varying vec2 uvOut;
        vec3 viewPosition(vec2 uv,float d){vec4 p=inverseProjection*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
        void main(){
          vec4 base=texture2D(image,uvOut);float d=texture2D(depth,uvOut).r;float ao=0.;
          if(d<.99999&&base.a>.01){
            vec3 p=viewPosition(uvOut,d);vec3 n=normalize(cross(dFdx(p),dFdy(p)));if(dot(n,-p)<0.)n=-n;
            float radius=1.3;float screenRadius=clamp(55./max(2.,-p.z),.9,11.);float spin=.4;
            for(int i=0;i<24;i++){
              float f=float(i);float a=f*2.399963+spin;float r=sqrt((f+.5)/24.);vec2 uv=uvOut+vec2(cos(a),sin(a))*r*screenRadius*8./resolution;
              if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.){float sd=texture2D(depth,uv).r;if(sd<.99999){vec3 delta=viewPosition(uv,sd)-p;float len=length(delta);ao+=max(0.,dot(n,delta/max(len,.001))-.12)*smoothstep(radius,0.,len);}}
            }
          }
          vec3 color=base.rgb*(1.-min(.65,ao*.17));
          vec3 glow=vec3(0.);for(int i=0;i<8;i++){float a=float(i)*.785398;vec3 c=texture2D(image,uvOut+vec2(cos(a),sin(a))*3./resolution).rgb;glow+=max(c-vec3(1.5),vec3(0.));}
          gl_FragColor=vec4(color+glow*.012,base.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,depthTest:false,depthWrite:false,transparent:true
    });
    postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMat));
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let fanRunning=!reducedMotion.matches,fanTime=0;
    let tvTilt=Number.isFinite(roomState?.widgetState?.privateContent?.tvTilt)?Math.max(0,Math.min(25,roomState.widgetState.privateContent.tvTilt)):12;
    let sofaColor=Object.hasOwn(sofaPalettes,roomState?.widgetState?.privateContent?.sofaColor)?roomState.widgetState.privateContent.sofaColor:'dustyBlue';
    let theta=-.5,phi=.99,distance=25.5,view='inside',evening=true,insideYaw=2.35,insidePitch=.03;
    function restore(state){const s=state?.privateContent;if(s?.version===2&&Number.isFinite(s.theta)&&Number.isFinite(s.phi)&&Number.isFinite(s.distance)){theta=s.theta;phi=Math.max(.025,Math.min(1.42,s.phi));distance=Math.max(15,Math.min(34,s.distance));view=['room','top','inside','gallery','ceiling','storage'].includes(s.view)?s.view:'inside';evening=!!s.evening;insideYaw=Number.isFinite(s.insideYaw)?s.insideYaw:2.35;insidePitch=Number.isFinite(s.insidePitch)?s.insidePitch:.03;}}
    restore(roomState?.widgetState);
    if(roomState?.widgetState?.privateContent?.roomStyleVersion!==2){view='inside';evening=false;insideYaw=2.35;insidePitch=.03;distance=25.5;}
    if(roomState?.widgetState?.privateContent?.furnitureVersion!==1){view='storage';insideYaw=.15;insidePitch=-.18;distance=25.5;}
    if(roomState?.widgetState?.privateContent?.paletteVersion!==1){view='inside';insideYaw=2.35;insidePitch=.03;distance=25.5;}
    if(roomState?.widgetState?.privateContent?.bedArtVersion!==1){view='inside';insideYaw=1.05;insidePitch=-.04;distance=25.5;}
    if(roomState?.widgetState?.privateContent?.workstationVersion!==1){view='inside';insideYaw=2.35;insidePitch=-.13;distance=25.5;}
    if(roomState?.widgetState?.privateContent?.sofaVersion!==2){view='gallery';insideYaw=-2.15;insidePitch=-.28;distance=34;}
    if(roomState?.widgetState?.privateContent?.sofaFinishVersion!==2){view='gallery';insideYaw=-2.15;insidePitch=-.28;distance=34;sofaColor='dustyBlue';}
    if(typeof roomState?.widgetState?.privateContent?.fanRunning==='boolean')fanRunning=roomState.widgetState.privateContent.fanRunning&&!reducedMotion.matches;
    const walkPosition=new T.Vector3(0,5.25,0);
    view='inside';insideYaw=0;insidePitch=0;distance=34;
    function draw(){
      const inside=view==='inside',gallery=view==='gallery',ceilingView=view==='ceiling',storage=view==='storage',interior=inside||gallery||ceilingView||storage;
      sofaFabric.color.set(sofaPalettes[sofaColor].color);sofaPiping.color.copy(sofaFabric.color).multiplyScalar(.8);root.querySelector('[data-sofa-color]').value=sofaColor;
      tvPivot.rotation.x=T.MathUtils.degToRad(tvTilt);
      root.querySelector('[data-tv-angle]').textContent=tvTilt+'°';root.querySelector('[data-tv-tilt]').value=tvTilt;
      door.visible=!gallery;
      camera.fov=gallery?T.MathUtils.radToDeg(2*Math.atan(Math.max(4.7,5.6/camera.aspect)*(distance/25.5)/5.97)):interior?60+(distance-15)*2:39;camera.updateProjectionMatrix();
      camera.up.set(0,view==='top'?0:1,view==='top'?1:0);
      if(interior){camera.position.copy(inside?walkPosition:new T.Vector3(0,5.25,0));camera.lookAt(camera.position.x+Math.sin(insideYaw)*Math.cos(insidePitch),camera.position.y+Math.sin(insidePitch),camera.position.z+Math.cos(insideYaw)*Math.cos(insidePitch));}
      else{const fit=Math.max(1, .92/camera.aspect),radius=distance*3.7;camera.position.set(radius*fit*Math.sin(phi)*Math.sin(theta),2.4+radius*fit*Math.cos(phi),15+radius*fit*Math.sin(phi)*Math.cos(theta));camera.lookAt(0,2.4,15);}
      walls.left.visible=interior||camera.position.x>.8;walls.right.visible=interior||camera.position.x<-.8;walls.back.visible=interior||camera.position.z>.8;
      animeReverseFaces.forEach(art=>art.visible=!walls.left.visible);
      bedArtReverse.forEach(art=>art.visible=!walls.back.visible);
      front.visible=interior||camera.position.z<-.8;frontLow.visible=!front.visible;curtains.visible=front.visible;ceiling.visible=interior;
      windowAssembly.visible=true;floorExtension.update(interior,evening,walkPosition.z);
      root.querySelector('.walk-controls').hidden=!inside;
      const zone=(Math.abs(walkPosition.x)>6.3||walkPosition.z>36.3||walkPosition.z< -6.3)?'Outside':walkPosition.z<6.2?'Back room':walkPosition.z<20.2?(walkPosition.x>1.5||walkPosition.z<8.4?'Passage':walkPosition.z<14.2?'Stairs':walkPosition.x> -1.4?'Toilet':'Wash & shower'):walkPosition.z<32.2?'Front room':walkPosition.z<36.3?'Balcony':'Outside';
      sun.intensity=evening?.08:2.8;ambient.intensity=evening?.38:.8;fill.intensity=evening?8:10;ledFill.intensity=evening?18:6;
      bedsideLight.intensity=evening?8:3;shadeMat.emissiveIntensity=evening?.45:.14;
      renderer.toneMappingExposure=evening?1.12:1.02;
      const lightButton=root.querySelector('[data-light]');lightButton.setAttribute('aria-pressed',String(evening));lightButton.setAttribute('aria-label',evening?'Switch to daylight':'Switch to evening lighting');lightButton.title=evening?'Daylight':'Evening lighting';lightButton.querySelector('use').setAttribute('href',evening?'#icon-moon':'#icon-sun');
      const fanButton=root.querySelector('[data-fan]');fanButton.setAttribute('aria-pressed',String(fanRunning));fanButton.setAttribute('aria-label',fanRunning?'Turn fans off':'Turn fans on');fanButton.title=fanRunning?'Fan on':'Fan off';
      root.querySelector('[data-zoom]').value=Math.round((34-distance)/19*100);
      root.querySelector('[data-view-select]').value=inside?({ 'Front room':'front',Stairs:'stairs',Toilet:'wash','Wash & shower':'wash',Balcony:'balcony' }[zone]||'inside'):view;
      root.querySelector('[data-zoom-step="1"]').disabled=distance<=15;
      root.querySelector('[data-zoom-step="-1"]').disabled=distance>=34;
      const nextShadowState=[view,evening,walls.left.visible,walls.right.visible,walls.back.visible,front.visible].join();
      if(nextShadowState!==shadowState){renderer.shadowMap.needsUpdate=true;shadowState=nextShadowState;}
      renderer.setRenderTarget(renderTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
    }
    function save(){roomState?.setWidgetState({modelContent:{roomSize:'12 × 12 ft back room; approximate full-floor extension',view,camera:interiorView()?'walkthrough, eye level':'whole-floor overview',ceiling:'exposed gatar-patiya, no ceiling lights',lighting:evening?'warm desk and bedside lamps':'daylight and warm lamps',wallColors:{animeSideWall:'full wall warm peach-beige matching reference',otherWalls:'warm off-white'},sofaColor:sofaPalettes[sofaColor].label,sofa:'One connected L-shaped fabric sectional: three seats along anime wall plus one integrated seat returning along AC wall; no arm between sections; clear of door swing',workstation:{pc:'desktop tower with mesh intake fans, side window, motherboard and GPU; no RGB',laptop:'open on raised aluminum holder',displays:'main monitor plus 43-inch TV-style screen on tilting wall mount',tvTiltDegrees:tvTilt,details:'keyboard legends, mouse wheel, soundbar, remote, USB ports and cable tray'},storage:{wardrobe:'between door and window, 2.8 ft wide × 1.8 ft deep',bedside:'two drawers beneath window beside bed, lamp, charging socket and USB ports'},wallDecor:'Anime wall photo raised above sofa; three slim black-framed neutral prints below AC on back wall; natural wood slats; no RGB',fan:{type:'wall-mounted oscillating',position:'on right wall between bed and desk',running:fanRunning}},privateContent:{version:2,decorVersion:1,roomStyleVersion:2,furnitureVersion:1,paletteVersion:1,bedArtVersion:1,workstationVersion:1,sofaVersion:2,sofaFinishVersion:2,sofaColor,tvTilt,theta,phi,distance,view,evening,insideYaw,insidePitch,fanRunning}})?.catch(()=>{});}
    function interiorView(){return ['inside','gallery','ceiling','storage'].includes(view);}
    const resize=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);const size=renderer.getDrawingBufferSize(new T.Vector2());renderTarget.setSize(size.x,size.y);postMat.uniforms.resolution.value.copy(size);camera.aspect=w/h;camera.updateProjectionMatrix();draw();});resize.observe(stage);
    root.querySelector('[data-view-select]').addEventListener('change',e=>{view=e.target.value;phi=view==='top'?.025:.99;theta=view==='top'?0:-.5;distance=34;if(view==='inside'){walkPosition.set(0,5.25,0);insideYaw=0;insidePitch=0;}if(['front','stairs','wash','balcony'].includes(view)){const presets={front:[0,22.8,0],stairs:[-3.9,7.45,0],wash:[0,16,-0.45],balcony:[0,34,0]};const [x,z,yaw]=presets[view];walkPosition.set(x,5.25,z);insideYaw=yaw;insidePitch=e.target.value==='wash'?-.35:e.target.value==='balcony'?-.6:e.target.value==='stairs'?-.55:e.target.value==='front'?-.15:0;view='inside';distance=34;}if(view==='gallery'){walkPosition.set(0,5.25,0);insideYaw=-2.15;insidePitch=-.28;distance=34;}if(view==='ceiling'){insideYaw=2.35;insidePitch=.78;}if(view==='storage'){insideYaw=.15;insidePitch=-.18;}draw();save();});
    root.querySelectorAll('[data-turn]').forEach(b=>b.addEventListener('click',()=>{if(interiorView()){insideYaw-=Number(b.dataset.turn)*.3;view='inside';}else{theta+=Number(b.dataset.turn)*.3;}draw();save();}));
    root.querySelector('[data-light]').addEventListener('click',()=>{evening=!evening;draw();save();});
    root.querySelector('[data-fan]').addEventListener('click',()=>{fanRunning=!fanRunning;draw();save();});
    root.querySelector('[data-zoom]').addEventListener('input',e=>{distance=34-Number(e.target.value)/100*19;draw();});root.querySelector('[data-zoom]').addEventListener('change',save);
    root.querySelectorAll('[data-zoom-step]').forEach(button=>button.addEventListener('click',()=>{distance=Math.max(15,Math.min(34,distance-Number(button.dataset.zoomStep)*1.5));draw();save();}));
    root.querySelector('[data-tv-tilt]').addEventListener('input',e=>{tvTilt=Number(e.target.value);draw();});root.querySelector('[data-tv-tilt]').addEventListener('change',save);
    root.querySelector('[data-sofa-color]').addEventListener('change',e=>{sofaColor=e.target.value;walkPosition.set(0,5.25,0);view='gallery';insideYaw=-2.15;insidePitch=-.28;distance=34;draw();save();});
    const options=root.querySelector('.room-options');
    document.addEventListener('pointerdown',e=>{if(options.open&&!options.contains(e.target))options.open=false;});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&options.open){options.open=false;options.querySelector('summary').focus();}});
    // Camera-relative movement: joystick, keyboard, and drag-to-look work together.
    const movement={x:0,y:0},keys=new Set(),joystick=root.querySelector('[data-joystick]'),knob=root.querySelector('.joystick-knob');
    let stickPointer=null;
    function stopMovement(){movement.x=movement.y=0;keys.clear();stickPointer=null;knob.style.transform='translate(0px,0px)';}
    function moveStick(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const scale=Math.min(1,40/Math.max(1,Math.hypot(dx,dy)));movement.x=dx*scale/40;movement.y=-dy*scale/40;knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;}
    joystick.addEventListener('pointerdown',e=>{stickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveStick(e);});
    joystick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,stopMovement);
    const movementKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];
    window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName))return;if(movementKeys.includes(e.code)&&view==='inside'){e.preventDefault();keys.add(e.code);}});
    window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',stopMovement);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement();});
    // Wall collision includes clear doorways. Outside remains explorable at floor level.
    const bedroomBarriers=[{x:-6.1,z:0,w:.18,d:12},{x:6.1,z:0,w:.18,d:12},{x:0,z:-6.1,w:12.4,d:.18},
      {x:-6,z:6.1,w:.25,d:.18},{x:-1.3,z:6.1,w:3.15,d:.18},{x:3.15,z:6.1,w:5.7,d:.18}];
    const barriers=[...bedroomBarriers,...floorExtension.barriers];
    function blocked(x,z){return barriers.some(b=>Math.abs(x-b.x)<b.w/2+.18&&Math.abs(z-b.z)<b.d/2+.18);}
    function walk(dt){
      if(view!=='inside')return false;
      let side=movement.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
      let forward=movement.y+(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
      const magnitude=Math.hypot(side,forward);if(magnitude<.08)return false;
      const step=dt*4.5/Math.max(1,magnitude);side*=step;forward*=step;
      const x=T.MathUtils.clamp(walkPosition.x+Math.sin(insideYaw)*forward-Math.cos(insideYaw)*side,-18,18);
      const z=T.MathUtils.clamp(walkPosition.z+Math.cos(insideYaw)*forward+Math.sin(insideYaw)*side,-15,48);
      if(!blocked(x,walkPosition.z))walkPosition.x=x;if(!blocked(walkPosition.x,z))walkPosition.z=z;
      // Follow the flight approached from the current landing, including the visible lower stair.
      let elevation=0;const {x:px,z:pz}=walkPosition,eye=walkPosition.y;
      if(pz>=8.4&&pz<=13.9&&px<=1.4&&px>=-5.65){
        const lower=eye<3||(px< -2.55&&eye<7.5);
        if(pz>13.2)elevation=lower?-4.5:4.5;
        else if(px> -1.65)elevation=lower?-4.5-T.MathUtils.clamp((13.2-pz)/4.8*4.5,0,4.5):T.MathUtils.clamp((pz-8.4)/4.8*4.5,0,4.5);
        else if(px< -2.55)elevation=lower?-T.MathUtils.clamp((pz-8.4)/4.8*4.5,0,4.5):4.5+T.MathUtils.clamp((13.2-pz)/4.8*4.5,0,4.5);
      }
      walkPosition.y=5.25+elevation;return true;
    }
    const pointers=new Map();let previousPinch=0;
    stage.addEventListener('pointerdown',e=>{stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);previousPinch=0;});
    stage.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(previousPinch&&d>0)distance=Math.max(15,Math.min(34,distance*previousPinch/d));previousPinch=d;}else if(interiorView()){view='inside';insideYaw-=(e.clientX-old[0])*.005;insidePitch=Math.max(-1.1,Math.min(1.4,insidePitch+(e.clientY-old[1])*.004));}else{theta-=(e.clientX-old[0])*.007;phi=Math.max(.025,Math.min(1.42,phi+(e.clientY-old[1])*.005));if(view!=='top')view='room';}draw();});
    function up(e){pointers.delete(e.pointerId);previousPinch=0;save();}stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
    let wheelTimer;stage.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(15,Math.min(34,distance+e.deltaY*.015));draw();clearTimeout(wheelTimer);wheelTimer=setTimeout(save,250);},{passive:false});
    window.addEventListener('floor1:state',e=>{if(e.detail?.globals?.widgetState){restore(e.detail.globals.widgetState);const saved=e.detail.globals.widgetState.privateContent;const running=saved?.fanRunning;if(typeof running==='boolean')fanRunning=running&&!reducedMotion.matches;if(Number.isFinite(saved?.tvTilt))tvTilt=Math.max(0,Math.min(25,saved.tvTilt));if(Object.hasOwn(sofaPalettes,saved?.sofaColor))sofaColor=saved.sofaColor;draw();}});
    reducedMotion.addEventListener('change',e=>{if(e.matches){fanRunning=false;draw();}});
    // Animate only the requested moving fan, and pause when off-screen.
    let inView=true,lastFrame=0;
    const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;});visibilityObserver.observe(stage);
    function animateFan(now){
      if(!root.isConnected){visibilityObserver.disconnect();resize.disconnect();return;}
      if(now-lastFrame>=1000/24){const dt=Math.min((now-lastFrame)/1000,.1);lastFrame=now;
        if(inView&&!document.hidden){const moving=walk(dt);if(fanRunning){floorExtension.animate(dt);fanTime+=dt;fanRotor.rotation.z=(fanRotor.rotation.z+dt*24)%(Math.PI*2);fanYaw.rotation.y=-Math.PI/2+Math.sin(fanTime*.72)*.58;}if(moving||fanRunning)draw();}
      }
      requestAnimationFrame(animateFan);
    }
    requestAnimationFrame(animateFan);
    draw();
  }catch(error){const el=root.querySelector('.room-error');el.hidden=false;el.textContent='3D view could not start: '+error.message;}
})();
