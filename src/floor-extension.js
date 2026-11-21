/* Additional first-floor spaces. The original back-room geometry stays in app.js. */
window.buildFloorExtension = function (T, model, {box,cylinder,sphere,tube,mat,plaster,oak,cream,metal,glass,tile,chrome,linen,screen,createMirror}) {
  const extension = new T.Group(); extension.name='front-stairs-bathroom-balcony'; model.add(extension);
  // Front-up plan: the service block is on the sketch's right side.
  extension.scale.x=-1;
  const roofs=new T.Group(), envelope=new T.Group(),lowWalls=new T.Group(); extension.add(roofs,envelope,lowWalls);
  const stone=mat('#c9c2b4'), sage=mat('#859689'), dark=mat('#303936'), white=mat('#f5f3ee',.22), grout=mat('#a79f93');
  // Local PBR surfaces: do not mutate any of the completed bedroom materials.
  let seed=9127;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  function surface(kind){
    const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');
    q.fillStyle=kind==='fabric'?'#a3a58c':kind==='granite'?'#77736c':kind==='tile'?'#d2c8b5':'#e9e4d9';q.fillRect(0,0,512,512);
    for(let i=0;i<42000;i++){const bright=random()>.5;q.fillStyle=`rgba(${bright?'255,249,231':'59,48,34'},${kind==='granite'?.08+random()*.2:.018+random()*.045})`;const size=kind==='granite'?1+random()*2:1;q.fillRect(random()*512,random()*512,size,size);}
    if(kind==='tile')for(let i=0;i<12;i++){q.beginPath();q.strokeStyle='rgba(118,103,81,.055)';q.lineWidth=.3+random();let y=random()*512;for(let x=0;x<=512;x+=4){y+=Math.sin(x*.013+i)*.7;q.lineTo(x,y);}q.stroke();}
    if(kind==='fabric')for(let i=0;i<512;i+=2){q.fillStyle='rgba(51,48,32,.09)';q.fillRect(i,0,1,512);q.fillStyle='rgba(249,240,207,.13)';q.fillRect(0,i,512,1);}
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;
  }
  const plasterMap=surface('plaster'),floorMap=surface('tile'),graniteMap=surface('granite'),weave=surface('fabric');
  plaster=plaster.clone();plaster.color.set('#eee9dd');plaster.bumpMap=plasterMap;plaster.bumpScale=.007;plaster.roughness=.94;
  tile=tile.clone();tile.color.set('#ffffff');floorMap.repeat.set(6,13);tile.map=floorMap;tile.bumpMap=floorMap;tile.bumpScale=.004;tile.roughness=.42;tile.metalness=0;
  sage.map=weave;sage.bumpMap=weave;sage.bumpScale=.012;sage.roughness=.98;sage.color.set('#ced0bf');
  stone.map=graniteMap;stone.bumpMap=graniteMap;stone.bumpScale=.006;stone.roughness=.48;stone.color.set('#c5c2bb');
  const upholstery=linen.clone();upholstery.map=weave;upholstery.bumpMap=weave;upholstery.bumpScale=.009;upholstery.roughness=.98;
  const teak=oak.clone();teak.color.set('#a28562');teak.roughness=.44;
  const granite=stone.clone();granite.color.set('#8e918a');granite.roughness=.32;
  const warmLight=new T.MeshStandardMaterial({color:'#fff4d5',emissive:'#ffdfaa',emissiveIntensity:1.2,roughness:.45});
  const barriers=[];
  function wall(w,d,x,z,parent=envelope,height=8.8,y=height/2){
    box(w,height,d,x,y,z,plaster,parent);
    box(w,.6,d,x,.3,z,plaster,lowWalls);
    if(height>6) barriers.push({x,z,w,d});
    box(w,.18,d+.02,x,.15,z,cream,parent);
  }
  // 14 ft circulation/service zone, 12 ft front room, 4 ft balcony.
  // Actual open shaft: the descending ground-floor flight must not be covered by a slab.
  function floorSlab(w,h,start,end,y,m){
    const half=w/2;
    box(w,h,8.4-start,0,y,(start+8.4)/2,m,extension);
    box(w,h,end-13.5,0,y,(13.5+end)/2,m,extension);
    box(half+2.55,h,5.1,(2.55-half)/2,y,10.95,m,extension);
    box(half-5.75,h,5.1,(5.75+half)/2,y,10.95,m,extension);
  }
  floorSlab(12.5,.35,6.1,36.3,-.22,stone);
  floorSlab(12,.1,6.2,32.2,-.025,tile);
  for(let z=6.2;z<32.3;z+=2){
    if(z>8.4&&z<13.5){box(8.55,.004,.012,-1.725,.032,z,grout,extension);box(.25,.004,.012,5.875,.032,z,grout,extension);}
    else box(12,.004,.012,0,.032,z,grout,extension);
  }
  for(let x=-6;x<=6;x+=2){
    if(x>2.55&&x<5.75){box(.012,.004,2.2,x,.032,7.3,grout,extension);box(.012,.004,18.7,x,.032,22.85,grout,extension);}
    else box(.012,.004,26,x,.032,19.2,grout,extension);
  }
  wall(.4,26.2,-6.1,19.2);wall(.4,26.2,6.1,19.2);
  // Same exposed gatar-patiya construction throughout, with an opening above the stairs.
  const beamMat=mat('#2c3035',.57),patiyaMat=plaster.clone();patiyaMat.color.set('#bdb7a8');patiyaMat.roughness=.97;patiyaMat.bumpScale=.018;
  function exposedCeiling(w,d,x,z,y=8.9){
    box(w,.12,d,x,y+.04,z,patiyaMat,roofs);
    const nx=Math.ceil(w/1.5),nz=Math.ceil(d/1.5),tw=w/nx,td=d/nz;
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)box(tw-.025,.13,td-.025,x-w/2+tw*(i+.5),y-.09,z-d/2+td*(j+.5),patiyaMat,roofs);
    for(let offset=-d/2+1.5;offset<d/2;offset+=3){
      box(w,.075,.33,x,y-.25,z+offset,beamMat,roofs);
      box(w,.48,.075,x,y-.525,z+offset,beamMat,roofs);
      box(w,.075,.33,x,y-.8,z+offset,beamMat,roofs);
    }
  }
  exposedCeiling(4.5,14.2,-3.85,13.2);
  exposedCeiling(7.5,6,2.25,17.2);
  exposedCeiling(12.2,12,0,26.2);
  // Stairwell ceiling is above the next landing, providing clear headroom.
  exposedCeiling(7.5,8,2.25,10.2,17.9);
  // Left-side corridor lines up with the existing bedroom door.
  wall(.16,.8,-1.5,8.8);wall(.16,1.2,-1.5,13.5);wall(.16,3,-1.5,18.7);
  box(.16,1.7,3,-1.5,7.95,10.8,plaster,envelope);
  box(.16,1.7,5,-1.5,7.95,16.7,plaster,envelope);
  wall(7.5,.16,2.25,14.2);
  // U-shaped stair: lower entrance landing and two flights to the next floor.
  const stairStone=granite, rail=mat('#414b47',.35);
  for(let i=0;i<8;i++){
    box(2.9,(i+1)*.5625,.6,.1,(i+1)*.28125,8.7+i*.6,stairStone,extension,.018);
    box(2.9,(i+1)*.5625,.6,4.1,4.5+(i+1)*.28125,12.9-i*.6,stairStone,extension,.018);
  }
  box(7,.25,1.15,2.1,4.4,13.55,stairStone,extension);
  for(let i=0;i<9;i++){
    const z=8.4+i*.6;
    cylinder(.025,3,1.63,1.5+i*.5625,z,rail,extension);
    cylinder(.025,3,2.57,10.5-i*.5625,z,rail,extension);
  }
  tube([[1.63,3,8.4],[1.63,7.5,13.2],[2.57,7.5,13.2],[2.57,12,8.4]],.045,rail,extension);
  // Ground-to-first staircase: exposed treads descend through the open first-floor slab.
  const groundStairs=new T.Group();groundStairs.name='visible-ground-to-first-stairs';extension.add(groundStairs);
  for(let i=0;i<8;i++){
    const top=-(i+1)*.5625,z=8.7+i*.6;
    box(2.9,.14,.6,4.1,top-.07,z,stairStone,groundStairs,.012);
    box(2.9,.5625,.09,4.1,top+.28125,z-.29,stone,groundStairs);
    const returnTop=-4.5-(i+1)*.5625,returnZ=12.9-i*.6;
    box(2.9,.14,.6,.1,returnTop-.07,returnZ,stairStone,groundStairs,.012);
    box(2.9,.5625,.09,.1,returnTop+.28125,returnZ+.29,stone,groundStairs);
    for(const x of [2.61,5.65])cylinder(.023,2.9,x,top+1.45,z,rail,groundStairs);
  }
  box(7.2,.2,1.15,2.1,-4.6,13.55,stairStone,groundStairs);
  box(3,.2,1.5,.1,-9.1,7.8,stairStone,groundStairs);
  for(const x of [-1.5,5.95])box(.18,9,8,x,-4.5,10.8,plaster,groundStairs);
  box(7.5,9,.18,2.25,-4.5,14.12,plaster,groundStairs);
  for(const x of [2.61,5.65])tube([[x,3,8.4],[x,-1.5,13.2]],.035,rail,groundStairs);
  tube([[1.6,-1.5,13.2],[1.6,-6,8.4]],.035,rail,groundStairs);
  // Guard the sides of the opening while leaving its approach open.
  for(let z=8.7;z<=13.4;z+=.6)cylinder(.022,3.1,5.79,1.55,z,rail,groundStairs);
  tube([[5.79,3.1,8.4],[5.79,3.1,13.5],[2.58,3.1,13.5]],.04,rail,groundStairs);
  const lowerLight=new T.PointLight('#fff0d8',20,12,2);lowerLight.position.set(4,-2.5,11);groundStairs.add(lowerLight);
  const gate=new T.Group();gate.position.set(2.65,0,8.35);gate.rotation.y=-1.4;extension.add(gate);
  for(let x=0;x<2.8;x+=.26)box(.035,3,.045,x,1.5,0,rail,gate);
  for(const y of [.15,2.9])box(2.8,.045,.045,1.4,y,0,rail,gate);
  // Shared wash lobby leads to a private Western WC and enclosed shower.
  wall(.14,.5,1.4,14.45);wall(.14,3,1.4,18.7);box(.14,1.7,2.5,1.4,7.95,15.95,plaster,envelope);wall(7.5,.16,2.25,20.2);
  box(7.3,.06,5.7,2.25,.045,17.2,stone,extension);
  for(const z of [14.5,15.5,16.5,17.5,18.5,19.5])box(7.2,.01,.012,2.25,.081,z,grout,extension);
  // Privacy partition and an open WC door, keeping its approach clear.
  wall(.35,.14,-1.325,17.2);wall(.35,.14,1.225,17.2);
  box(2.2,1.7,.14,-.05,7.95,17.2,plaster,envelope);
  const wcDoor=new T.Group();wcDoor.position.set(-1.15,0,17.2);wcDoor.rotation.y=-1.45;extension.add(wcDoor);
  box(2.15,7,.08,1.075,3.5,0,oak,wcDoor);box(.18,.07,.1,1.9,3.4,-.08,chrome,wcDoor);
  // WC faces the doorway; lid, seat ring, pedestal, cistern and flush plate.
  sphere(.0,.72,19,.46,.65,.66,white,extension);
  sphere(.0,1.25,18.9,.59,.18,.8,white,extension);
  sphere(.0,1.39,18.87,.37,.015,.51,dark,extension);
  const seat=new T.Mesh(new T.TorusGeometry(.43,.075,10,36),white);seat.rotation.x=Math.PI/2;seat.scale.y=1.4;seat.position.set(0,1.42,18.85);extension.add(seat);
  box(1.16,1.6,.48,0,1.95,19.7,white,extension,.08);box(.3,.03,.15,0,2.77,19.7,chrome,extension);
  tube([[-.8,2,19.9],[-.95,1.4,19.6],[-.8,.7,19.3],[-.65,1.8,19.4]],.025,chrome,extension);
  // Shower enclosure entered from the wash area through its open left end.
  box(3.2,.09,2.8,4.3,.13,18.7,white,extension);
  box(.035,6.5,2.8,2.7,3.4,18.7,glass,extension);
  box(1.65,6.5,.035,5.05,3.4,17.3,glass,extension);
  tube([[5.85,3.5,19.5],[5.85,7,19.5],[5.1,7,19.5]],.035,chrome,extension);
  cylinder(.32,.07,5.05,6.95,19.5,chrome,extension);box(.3,.5,.08,5.84,3.6,19.5,chrome,extension);
  box(.4,.015,.4,4.7,.19,19.6,dark,extension);
  box(2.1,1.65,1.2,4.8,1.35,15,oak,extension,.04);
  box(2.3,.12,1.35,4.8,2.25,15,white,extension,.05);
  sphere(4.8,2.35,15,.75,.12,.43,white,extension);tube([[5.1,2.3,14.7],[5.1,2.9,14.7],[4.85,2.9,14.9]],.035,chrome,extension);
  box(2.2,2.2,.06,4.8,4.1,14.32,metal,extension);
  const toiletMirror=createMirror(2.05,2.05,extension);toiletMirror.name='toilet-vanity-live-mirror';toiletMirror.position.set(4.8,4.1,14.358);

  // Front room: a quiet lounge, dining/work table, media wall and balcony opening.
  wall(.4,.18,-5.8,20.2);box(3,1.7,.18,-4.1,7.95,20.2,plaster,envelope);wall(1.1,.18,-2.05,20.2); // The entrance aligns with the passage.
  // Masonry balcony wall: one normal 3 ft timber door and one grilled window.
  // The clear doorway remains centered on the walking route.
  wall(4.5,.45,-3.75,32.2);wall(.3,.45,1.65,32.2);wall(1,.45,5.5,32.2);
  box(3,1.8,.45,0,7.9,32.2,plaster,envelope);
  box(3.2,3,.45,3.4,1.5,32.2,plaster,envelope);box(3.2,1.5,.45,3.4,8.05,32.2,plaster,envelope);
  barriers.push({x:3.4,z:32.2,w:3.2,d:.45});
  for(const x of [-1.53,1.53])box(.13,7.1,.48,x,3.55,32.2,teak,extension,.015);
  box(3.2,.13,.48,0,7.04,32.2,teak,extension,.015);
  const balconyDoor=new T.Group();balconyDoor.position.set(-1.46,0,32.2);balconyDoor.rotation.y=-1.48;extension.add(balconyDoor);
  box(2.92,6.94,.13,1.46,3.5,0,teak,balconyDoor,.025);
  for(const x of [.78,2.13])for(const y of [1.82,5.08]){
    box(1.12,2.82,.028,x,y,-.083,teak,balconyDoor,.018);
    for(const dx of [-.59,.59])box(.035,2.9,.045,x+dx,y,-.11,oak,balconyDoor);
    for(const dy of [-1.45,1.45])box(1.21,.035,.045,x,y+dy,-.11,oak,balconyDoor);
  }
  for(const y of [.7,3.5,6.3])cylinder(.025,.2,.03,y,0,chrome,balconyDoor);
  box(.1,.42,.05,2.65,3.4,-.13,metal,balconyDoor,.012);box(.35,.06,.09,2.51,3.48,-.18,metal,balconyDoor,.012);
  // Limited clear glazing, deep reveals and a practical powder-coated MS grille.
  const clearGlass=glass.clone();clearGlass.color.set('#dae2dc');clearGlass.opacity=.13;clearGlass.roughness=.12;
  for(const x of [1.83,3.4,4.97])box(.08,4.2,.24,x,5.15,32.18,teak,extension);
  for(const y of [3.05,7.25])box(3.25,.09,.26,3.4,y,32.18,teak,extension);
  box(3.05,4.05,.025,3.4,5.15,32.3,clearGlass,extension).castShadow=false;
  box(3.55,.09,.8,3.4,2.99,32.17,granite,extension,.012);
  for(let x=1.95;x<4.95;x+=.35)box(.035,4.05,.035,x,5.15,32.42,metal,extension);
  for(const y of [3.2,4.6,6,7.1])box(3.05,.035,.035,3.4,y,32.42,metal,extension);
  for(const x of [3.26,3.54])box(.035,.3,.07,x,5.05,31.99,metal,extension,.01);
  // Chajja over the opening, with a drip edge and plaster soffit.
  box(12.4,.22,1.6,0,7.65,32.85,plaster,extension,.02);
  box(12.25,.08,.06,0,7.51,33.52,stone,extension);
  // Simple cotton curtains on the window; no glass partitions inside the room.
  const curtain=upholstery.clone();curtain.color.set('#e8dfcb');curtain.side=T.DoubleSide;
  for(const x of [1.95,4.9]){
    const geo=new T.PlaneGeometry(.5,4.9,20,30),p=geo.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*64)*.065);geo.computeVertexNormals();
    const drape=new T.Mesh(geo,curtain);drape.position.set(x,4.9,31.72);drape.castShadow=true;drape.receiveShadow=true;extension.add(drape);
  }
  const curtainRod=cylinder(.025,3.9,3.4,7.43,31.73,metal,extension);curtainRod.rotation.z=Math.PI/2;
  box(7,.035,6,-.3,.065,26.9,upholstery,extension);
  box(2.7,.45,6.6,-4.25,.65,26.3,sage,extension,.13);
  box(.4,1.8,6.7,-5.35,1.55,26.3,sage,extension,.1);
  for(const z of [24.2,26.3,28.4])box(2.1,.35,1.95,-4.15,1.06,z,sage,extension,.11);
  for(const z of [22.9,29.7])box(2.7,1.5,.4,-4.25,1.2,z,sage,extension,.1);
  cylinder(1.3,.12,-.8,1.45,26.8,teak,extension,.025);cylinder(.4,1.4,-.8,.7,26.8,dark,extension);
  box(.18,3.6,5.5,5.8,4.8,26.6,oak,extension);box(.12,2.6,4.5,5.65,4.9,26.6,dark,extension,.025);
  const tvScreen=screen.clone();tvScreen.emissiveIntensity=.22;box(.015,2.4,4.25,5.58,4.9,26.6,tvScreen,extension).castShadow=false;
  box(1.1,.65,5.5,5.35,.8,26.6,oak,extension,.04);
  box(3.3,.15,2.5,2.8,2.5,22.1,oak,extension,.05);
  for(const x of [1.4,4.2])for(const z of [21.1,23.1])box(.1,2.4,.1,x,1.2,z,metal,extension);
  for(const x of [1.6,4]){box(1.1,.15,1.2,x,1.4,24.1,sage,extension,.04);box(1.1,1.3,.1,x,2,24.7,sage,extension);for(const z of [23.65,24.55])for(const dx of [-.4,.4])box(.06,1.4,.06,x+dx,.7,z,metal,extension);}
  for(const z of [23.6,25.4,27.2,29])for(const x of [-5.05,-3.35])cylinder(.055,.38,x,.2,z,teak,extension);
  for(const z of [24.2,26.3,28.4]){
    const cushion=box(.36,1.25,1.84,-5.02,1.92,z,sage,extension,.1);cushion.rotation.z=-.12;
    tube([[-5.19,1.25,z-.84],[-3.23,1.25,z-.84],[-3.23,1.25,z+.84],[-5.19,1.25,z+.84],[-5.19,1.25,z-.84]],.009,upholstery,extension);
  }
  for(const z of [24.2,28.1]){const pillow=box(.45,.85,.85,-4.7,1.68,z,upholstery,extension,.1);pillow.rotation.x=.2;pillow.rotation.z=-.2;}
  // Switch plates, sockets, skirting and a modest wall light.
  for(const [x,z] of [[-2,31.94],[-1.9,20.35]]){
    box(.55,.4,.035,x,4.1,z,cream,extension,.015);
    for(const dx of [-.15,.03,.19])box(.09,.18,.02,x+dx,4.1,z-.03,white,extension,.008);
  }
  box(.035,.42,.7,5.87,1.4,25.5,cream,extension,.012);
  for(const z of [25.33,25.47,25.68])box(.02,.06,.025,5.84,1.4,z,dark,extension);
  for(const x of [-5.87,5.87])box(.055,.28,11.7,x,.15,26.2,granite,extension);
  box(1.2,.18,.35,0,7.7,20.6,warmLight,extension,.025);
  // A conventional three-blade ceiling fan, suspended below the exposed girders.
  const fanMetal=mat('#d7d0bd',.38),fanTrim=mat('#918875',.42);
  const frontFan=new T.Group();frontFan.name='front-room-working-ceiling-fan';frontFan.position.set(0,0,26.4);extension.add(frontFan);
  cylinder(.27,.16,0,8.75,0,fanMetal,frontFan);cylinder(.045,1.5,0,8.04,0,fanTrim,frontFan);
  cylinder(.34,.3,0,7.2,0,fanMetal,frontFan);cylinder(.25,.08,0,7.01,0,fanTrim,frontFan);
  const ceilingRotor=new T.Group();ceilingRotor.position.y=7.12;frontFan.add(ceilingRotor);
  for(let i=0;i<3;i++){
    const bladePivot=new T.Group();bladePivot.rotation.y=i*Math.PI*2/3;ceilingRotor.add(bladePivot);
    const shape=new T.Shape();shape.moveTo(.24,-.1);shape.lineTo(1.9,-.22);shape.quadraticCurveTo(2.4,-.26,2.45,-.06);shape.lineTo(2.42,.17);shape.quadraticCurveTo(2.2,.26,1.9,.19);shape.lineTo(.24,.1);shape.closePath();
    const blade=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.028,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:2,steps:1}),fanMetal);blade.rotation.x=Math.PI/2;blade.rotation.y=.04;blade.castShadow=true;blade.receiveShadow=true;bladePivot.add(blade);
    box(.65,.06,.13,.5,.025,0,fanTrim,bladePivot,.012);
  }
  // Simple empty balcony with flooring and a continuous guardrail.
  const deck=tile.clone(),deckMap=floorMap.clone();deckMap.repeat.set(6,2);deck.map=deckMap;deck.bumpMap=deckMap;deck.color.set('#b7b4a8');deck.roughness=.86;
  box(12,.08,4,0,.04,34.2,deck,extension);
  for(let x=-6;x<=6;x+=2)box(.012,.006,4,x,.085,34.2,grout,extension);
  for(const z of [32.2,34.2,36.2])box(12,.006,.012,0,.085,z,grout,extension);
  for(const x of [-6,6]){box(.055,.09,4,x,3.3,34.2,rail,extension);for(let z=32.2;z<36.3;z+=.5)cylinder(.025,3.3,x,1.65,z,rail,extension);}
  box(12,.09,.055,0,3.3,36.2,rail,extension);for(let x=-6;x<=6;x+=.5)cylinder(.025,3.3,x,1.65,36.2,rail,extension);

  // A restrained neighboring roofscape replaces the blank exterior in front views.
  // It is hidden in the finished bedroom and in the floor-plan view.
  const outdoors=new T.Group();extension.add(outdoors);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=32;skyCanvas.height=512;const skyPaint=skyCanvas.getContext('2d');
  const skyGradient=skyPaint.createLinearGradient(0,0,0,512);skyGradient.addColorStop(0,'#9ab9cb');skyGradient.addColorStop(.5,'#cbd4d1');skyGradient.addColorStop(1,'#e6dfcf');skyPaint.fillStyle=skyGradient;skyPaint.fillRect(0,0,32,512);
  const skyTexture=new T.CanvasTexture(skyCanvas);skyTexture.colorSpace=T.SRGBColorSpace;
  const skyMaterial=new T.MeshBasicMaterial({map:skyTexture,side:T.DoubleSide});
  box(160,80,.1,0,17,76,skyMaterial,outdoors).castShadow=false;
  const road=mat('#9d998e',.98);box(100,.15,100,0,-10.8,35,road,outdoors);
  for(const [x,z,w,h,color] of [[-19,48,13,15,'#cec4ac'],[0,57,17,12,'#d1cdc1'],[20,49,14,17,'#b5bdb6']]){
    const facade=plaster.clone();facade.color.set(color);box(w,h,12,x,-10.6+h/2,z,facade,outdoors);
    const top=-10.6+h;box(w+.4,.25,12.4,x,top,z,stone,outdoors);
    for(const dx of [-w/2,w/2])box(.22,2.1,12,x+dx,top+1.1,z,facade,outdoors);
    box(w,2.1,.22,x,top+1.1,z-6,facade,outdoors);
    cylinder(1.25,2.8,x+2,top+1.5,z+1,dark,outdoors);cylinder(1.3,.1,x+2,top+2.93,z+1,dark,outdoors);
    for(let wx=x-w/2+2;wx<x+w/2-1;wx+=4)for(let y=-7.7;y<top-2;y+=5){
      box(2.3,2.8,.08,wx,y,z-6.05,dark,outdoors);box(2.6,.1,.65,wx,y+1.5,z-6.25,stone,outdoors);
      for(const dx of [-.65,0,.65])box(.025,2.7,.035,wx+dx,y,z-6.12,metal,outdoors);
    }
  }
  const lights=[];
  for(const z of [10,17,25,30]){const light=new T.PointLight('#fff0dd',8,13,2);light.position.set(-2,7.4,z);extension.add(light);lights.push(light);}
  const daylight=new T.DirectionalLight('#fff0db',2.5);daylight.position.set(-4,12,40);daylight.target.position.set(0,1,25);daylight.castShadow=true;
  daylight.shadow.mapSize.set(2048,2048);Object.assign(daylight.shadow.camera,{left:-9,right:9,top:10,bottom:-10,near:1,far:45});daylight.shadow.normalBias=.025;daylight.shadow.bias=-.00015;daylight.shadow.radius=3;
  extension.add(daylight,daylight.target);
  return {animate(dt){ceilingRotor.rotation.y=(ceilingRotor.rotation.y+dt*13)%(Math.PI*2);},barriers:barriers.map(b=>({...b,x:-b.x})),update(interior,evening,cameraZ){outdoors.visible=interior&&cameraZ>20.3;skyMaterial.color.set(evening?'#8e8c9c':'#ffffff');roofs.visible=interior;envelope.visible=interior;lowWalls.visible=!interior;daylight.intensity=evening?.12:2.5;lights.forEach(light=>light.intensity=evening?17:6);warmLight.emissiveIntensity=evening?1.4:.3;}};
};
