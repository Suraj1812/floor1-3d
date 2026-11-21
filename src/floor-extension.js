/* Additional first-floor spaces. The original back-room geometry stays in app.js. */
window.buildFloorExtension = function (T, model, {box,cylinder,sphere,tube,mat,plaster,oak,cream,metal,glass,tile,chrome,linen}) {
  const extension = new T.Group(); extension.name='front-stairs-bathroom-balcony'; model.add(extension);
  // Front-up plan: the service block is on the sketch's right side.
  extension.scale.x=-1;
  const roofs=new T.Group(), envelope=new T.Group(),lowWalls=new T.Group(); extension.add(roofs,envelope,lowWalls);
  const stone=mat('#c9c2b4'), sage=mat('#859689'), dark=mat('#303936'), white=mat('#f5f3ee',.22), grout=mat('#a79f93');
  const barriers=[];
  function wall(w,d,x,z,parent=envelope,height=8.8,y=height/2){
    box(w,height,d,x,y,z,plaster,parent);
    box(w,.6,d,x,.3,z,plaster,lowWalls);
    if(height>6) barriers.push({x,z,w,d});
    box(w,.18,d+.02,x,.15,z,cream,parent);
  }
  function label(text,x,z){
    const c=document.createElement('canvas');c.width=768;c.height=128;const q=c.getContext('2d');
    q.fillStyle='#eee9df';q.fillRect(0,0,768,128);q.fillStyle='#35483f';q.font='500 44px sans-serif';q.textAlign='center';q.fillText(text,384,80);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const p=new T.Mesh(new T.PlaneGeometry(3.5,.58),new T.MeshBasicMaterial({map:texture}));p.scale.x=-1;p.rotation.x=-Math.PI/2;p.rotation.z=Math.PI;p.position.set(x,.045,z);extension.add(p);
  }
  // 14 ft circulation/service zone, 12 ft front room, 4 ft balcony.
  box(12.5,.35,30.2,0,-.22,21.2,stone,extension);
  box(12,.1,26,0,-.025,19.2,tile,extension);
  for(let z=6.2;z<32.3;z+=2)box(12,.004,.012,0,.032,z,grout,extension);
  for(let x=-6;x<=6;x+=2)box(.012,.004,26,x,.032,19.2,grout,extension);
  wall(.18,26.2,-6.1,19.2);wall(.18,26.2,6.1,19.2);
  box(4.5,.18,14.2,-3.85,8.9,13.2,cream,roofs);box(7.5,.18,6,2.25,8.9,17.2,cream,roofs);box(12.2,.18,12,0,8.9,26.2,cream,roofs);
  // Left-side corridor lines up with the existing bedroom door.
  wall(.16,.8,-1.5,8.8);wall(.16,1.2,-1.5,13.5);wall(.16,3,-1.5,18.7);
  box(.16,1.7,3,-1.5,7.95,10.8,plaster,envelope);
  box(.16,1.7,5,-1.5,7.95,16.7,plaster,envelope);
  wall(7.5,.16,2.25,14.2);
  // U-shaped stair: lower entrance landing and two flights to the next floor.
  const stairStone=mat('#b4b0a7'), rail=mat('#414b47',.35);
  for(let i=0;i<8;i++){
    box(2.9,(i+1)*.5625,.6,.1,(i+1)*.28125,8.7+i*.6,stairStone,extension);
    box(2.9,(i+1)*.5625,.6,4.1,4.5+(i+1)*.28125,12.9-i*.6,stairStone,extension);
  }
  box(7,.25,1.15,2.1,4.4,13.55,stairStone,extension);
  for(let i=0;i<9;i++){
    const z=8.4+i*.6;
    cylinder(.025,3,1.63,1.5+i*.5625,z,rail,extension);
    cylinder(.025,3,2.57,10.5-i*.5625,z,rail,extension);
  }
  tube([[1.63,3,8.4],[1.63,7.5,13.2],[2.57,7.5,13.2],[2.57,12,8.4]],.045,rail,extension);
  // Ground-to-first entry is represented below the landing, behind the open gate.
  for(let i=0;i<7;i++)box(2.8,.2,.65,.1,-.25-i*.5,8.1-i*.65,stairStone,extension);
  const gate=new T.Group();gate.position.set(-1.4,0,8.4);gate.rotation.y=-1.2;extension.add(gate);
  for(let x=0;x<2.8;x+=.26)box(.035,3,.045,x,1.5,0,rail,gate);
  for(const y of [.15,2.9])box(2.8,.045,.045,1.4,y,0,rail,gate);
  label('STAIRS  /  UP & DOWN',-3.9,10.8);
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
  box(2.2,2.2,.06,4.8,4.1,14.32,metal,extension);box(2.05,2.05,.02,4.8,4.1,14.27,glass,extension);
  label('WC',-.05,18);label('WASH + SHOWER',3.9,16.4);
  // Front room: a quiet lounge, dining/work table, media wall and balcony opening.
  wall(.4,.18,-5.8,20.2);box(3,1.7,.18,-4.1,7.95,20.2,plaster,envelope);wall(1.1,.18,-2.05,20.2); // The entrance aligns with the passage.
  // Solid sides frame a broad open sliding-door bay.
  wall(2,.18,-5,32.2);wall(2,.18,5,32.2);box(8,1.6,.18,0,8,32.2,plaster,envelope);
  for(const x of [-4,4])box(.08,7.2,.13,x,3.6,32.2,metal,extension);
  box(2.5,7,.04,2.7,3.6,32.2,glass,extension);box(8,.07,.16,0,.08,32.2,metal,extension);
  box(7,.035,6,-.3,.065,26.9,linen,extension);
  box(2.7,.45,6.6,-4.25,.65,26.3,sage,extension,.13);
  box(.4,1.8,6.7,-5.35,1.55,26.3,sage,extension,.1);
  for(const z of [24.2,26.3,28.4])box(2.1,.35,1.95,-4.15,1.06,z,sage,extension,.11);
  for(const z of [22.9,29.7])box(2.7,1.5,.4,-4.25,1.2,z,sage,extension,.1);
  cylinder(1.3,.12,-.8,1.45,26.8,oak,extension);cylinder(.4,1.4,-.8,.7,26.8,dark,extension);
  box(.18,3.6,5.5,5.8,4.8,26.6,oak,extension);box(.12,2.6,4.5,5.65,4.9,26.6,dark,extension);
  box(1.1,.65,5.5,5.35,.8,26.6,oak,extension,.04);
  box(3.3,.15,2.5,2.8,2.5,22.1,oak,extension,.05);
  for(const x of [1.4,4.2])for(const z of [21.1,23.1])box(.1,2.4,.1,x,1.2,z,metal,extension);
  for(const x of [1.6,4]){box(1.1,.15,1.2,x,1.4,24.1,sage,extension,.04);box(1.1,1.3,.1,x,2,24.7,sage,extension);for(const z of [23.65,24.55])for(const dx of [-.4,.4])box(.06,1.4,.06,x+dx,.7,z,metal,extension);}
  label('FRONT ROOM',0,30.5);
  // Simple empty balcony with flooring and a continuous guardrail.
  const deck=mat('#95836b');
  for(let z=32.35;z<36.25;z+=.25)box(12,.08,.23,0,.04,z,deck,extension);
  for(const x of [-6,6]){box(.055,.09,4,x,3.3,34.2,rail,extension);for(let z=32.2;z<36.3;z+=.5)cylinder(.025,3.3,x,1.65,z,rail,extension);}
  box(12,.09,.055,0,3.3,36.2,rail,extension);for(let x=-6;x<=6;x+=.5)cylinder(.025,3.3,x,1.65,36.2,rail,extension);
  label('BALCONY',-2.7,34.2);
  for(const z of [10,17,25,30]){const light=new T.PointLight('#fff0d5',28,14,2);light.position.set(-2,7.4,z);extension.add(light);}
  return {barriers:barriers.map(b=>({...b,x:-b.x})),update(interior){roofs.visible=interior;envelope.visible=interior;lowWalls.visible=!interior;}};
};
