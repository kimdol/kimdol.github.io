import * as THREE from './vendor/three/three.module.js';

// A real world-space journey. Scroll controls the camera, not the size of DOM cards.
const work=document.querySelector('#journey');
const items=window.portfolioContent?.()||[];
if(!items.length)document.addEventListener('portfolio:render',()=>start(window.portfolioContent()),{once:true});
else start(items);

function start(projects){
  if(!work||!projects.length)return;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{return;}
  document.body.classList.add('portal-cinema');
  const sequence=document.createElement('section');sequence.className='portal-sequence';sequence.id='screening';sequence.setAttribute('aria-label','3D 프로젝트 여행');
  sequence.innerHTML='<div class="portal-stage"><div class="portal-vignette" aria-hidden="true"></div><div class="portal-lens" aria-hidden="true"></div><a class="portal-skip" href="#about">소개로 건너뛰기 ↓</a><div class="portal-caption"><div class="portal-project"><h3></h3><div class="portal-links"></div></div><button class="portal-open" type="button">프로젝트 보기 ↗</button></div><nav class="portal-navigation" aria-label="상영작 선택"><button class="portal-prev" aria-label="이전 작품">←</button><div class="portal-dots"></div><button class="portal-next" aria-label="다음 작품">→</button></nav><div class="portal-scroll-cue" aria-hidden="true">스크롤해 진입하세요 <span>↓</span></div></div>';
  work.querySelector('.portal-host').append(sequence);
  const entry=document.querySelector('.explore-link');
  if(entry){entry.href='#screening';entry.innerHTML='<span class="circle-arrow">↓</span> 3D 상영관 입장';}
  const stage=sequence.querySelector('.portal-stage');stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const title=sequence.querySelector('h3'),open=sequence.querySelector('.portal-open');
  let selected=0;
  const dots=sequence.querySelector('.portal-dots');
  projects.forEach((p,i)=>{const b=document.createElement('button');b.className='portal-dot';b.setAttribute('aria-label',p.title+' 장면으로 이동');b.title=p.title;b.addEventListener('click',()=>jump(i));dots.append(b);});
  const journeyLength=projects.length+.85;
  function jump(index){const i=(index+projects.length)%projects.length,rect=sequence.getBoundingClientRect();scrollTo({top:rect.top+scrollY+(i+.48)/journeyLength*(rect.height-innerHeight),behavior:'smooth'});}
  sequence.querySelector('.portal-prev').addEventListener('click',()=>jump(selected-1));
  sequence.querySelector('.portal-next').addEventListener('click',()=>jump(selected+1));
  open.addEventListener('click',()=>{if(stage.dataset.phase==='continuing')document.querySelector('#work').scrollIntoView({behavior:disabled()?'instant':'smooth'});else window.openProject(projects[selected].id,open);});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x030608);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x030608,.008);
  const camera=new THREE.PerspectiveCamera(62,1,.12,420);
  scene.add(new THREE.HemisphereLight(0xd5edff,0x273217,2.6));
  const sun=new THREE.DirectionalLight(0xdaf0ff,3.2);sun.position.set(5,15,12);scene.add(sun);
  const metal=new THREE.MeshStandardMaterial({color:0x293745,metalness:.6,roughness:.38});
  const dark=new THREE.MeshStandardMaterial({color:0x0b141d,metalness:.45,roughness:.55});
  const lime=new THREE.MeshBasicMaterial({color:0xc9ff54});
  const cold=new THREE.MeshBasicMaterial({color:0x385d69});
  const world=new THREE.Group();scene.add(world);
  const reactiveLight=new THREE.PointLight(0x9fffe0,80,55,2);scene.add(reactiveLight);
  const wave=new THREE.Mesh(new THREE.TorusGeometry(7.2,.06,6,100),new THREE.MeshBasicMaterial({color:0xaaffdd,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(wave);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,1000),dark);floor.rotation.x=-Math.PI/2;floor.position.set(0,-8,-400);world.add(floor);
  const roof=floor.clone();roof.rotation.x=Math.PI/2;roof.position.y=11;world.add(roof);
  // Physical ribs, rails and panels make the gate passage visibly three-dimensional.
  const ribGeo=new THREE.BoxGeometry(.55,18,.8),ribs=new THREE.InstancedMesh(ribGeo,metal,64);
  const dummy=new THREE.Object3D();let ri=0;
  for(let i=0;i<32;i++)for(const side of [-1,1]){dummy.position.set(side*13,1,-i*10+16);dummy.rotation.set(0,0,side*.13);dummy.updateMatrix();ribs.setMatrixAt(ri++,dummy.matrix);}world.add(ribs);
  const railGeo=new THREE.BoxGeometry(.08,.08,325);
  const rails=[];
  for(const x of [-11,-7,7,11]){const rail=new THREE.Mesh(railGeo,x===-7||x===7?lime:cold);rail.position.set(x,-7.8,-125);world.add(rail);rails.push(rail);}
  const roofRailGeo=new THREE.BoxGeometry(.12,.12,325);
  for(const x of [-11,11]){const rail=new THREE.Mesh(roofRailGeo,cold);rail.position.set(x,9.6,-125);world.add(rail);rails.push(rail);}
  const ties=new THREE.InstancedMesh(new THREE.BoxGeometry(26,.12,.2),cold,50);
  for(let i=0;i<50;i++){dummy.position.set(0,-7.7,20-i*6);dummy.rotation.set(0,0,0);dummy.updateMatrix();ties.setMatrixAt(i,dummy.matrix);}world.add(ties);

  const texLoader=new THREE.TextureLoader();
  const portalGeo=new THREE.TorusGeometry(7.7,.48,8,64);
  const innerGeo=new THREE.TorusGeometry(7.05,.065,6,96);
  const panelGeo=new THREE.PlaneGeometry(10,5.8);
  const gates=[];
  const glowGeo=new THREE.PlaneGeometry(24,24);
  const glowShader={vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 tint;uniform float tick;void main(){vec2 p=vUv-.5;float r=length(p);float ring=exp(-abs(r-.302)*100.);float halo=exp(-abs(r-.302)*17.)*.16;float angle=atan(p.y,p.x);float arc=pow(max(0.,sin(angle*9.+tick*.6)),18.)*.7*exp(-abs(r-.302)*70.);gl_FragColor=vec4(tint,(ring+halo+arc)*.78);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide};
  projects.forEach((p,i)=>{
    const group=new THREE.Group();group.position.set(i%2===0?-2.8:2.8,0,-30-i*48);
    const color=new THREE.Color(p.accent||'#d5ff52');
    const ring=new THREE.Mesh(portalGeo,metal);group.add(ring);
    const inner=new THREE.Mesh(innerGeo,new THREE.MeshBasicMaterial({color}));inner.position.z=.15;group.add(inner);
    const outer=new THREE.Mesh(new THREE.TorusGeometry(8.35,.09,6,12),new THREE.MeshBasicMaterial({color:0x4c727a}));outer.rotation.z=Math.PI/12;group.add(outer);
    const glowMat=new THREE.ShaderMaterial({...glowShader,uniforms:{tint:{value:color},tick:{value:0}}});
    const glow=new THREE.Mesh(glowGeo,glowMat);glow.position.z=.25;group.add(glow);
    const membraneMat=new THREE.ShaderMaterial({uniforms:{tick:{value:0},tint:{value:color},surge:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float tick;uniform vec3 tint;uniform float surge;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;float a=atan(p.y,p.x);float wobble=sin(a*5.+r*10.-tick*1.3)*.18+sin(p.x*9.+p.y*7.+tick*.6)*.08;float threads=pow(max(0.,sin(a*7.+r*26.-tick*2.+wobble*8.)),12.);float ripples=pow(max(0.,sin(r*42.-tick*2.5+wobble*5.)),18.);float edge=1.-smoothstep(.87,1.,r);float core=pow(1.-r,2.);vec3 c=mix(tint,vec3(.7,.9,1.),threads*.45+core*.15);float alpha=(.10+threads*.46+ripples*.16+core*.07)*edge*(.5+surge*.8);gl_FragColor=vec4(c,alpha);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const membrane=new THREE.Mesh(new THREE.PlaneGeometry(14,14),membraneMat);membrane.position.z=-2.1;group.add(membrane);
    const bands=new THREE.Group();
    for(let k=0;k<2;k++){const band=new THREE.Mesh(new THREE.TorusGeometry(8.65+k*.25,.045,5,100),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));band.rotation.set(k?.42:-.42,k?-.32:.32,0);bands.add(band);}group.add(bands);
    const screenMat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true});
    const reveal={value:0},holoTint={value:color};
    screenMat.onBeforeCompile=shader=>{shader.uniforms.holoReveal=reveal;shader.uniforms.holoTint=holoTint;shader.vertexShader='varying vec2 vHoloUV;\n'+shader.vertexShader.replace('void main() {','void main() { vHoloUV=uv;');shader.fragmentShader='varying vec2 vHoloUV;uniform float holoReveal;uniform vec3 holoTint;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','if(vHoloUV.y>holoReveal)discard;float band=max(0.,1.-abs(vHoloUV.y-holoReveal)*65.)*step(holoReveal,.99);outgoingLight+=holoTint*band*1.4;\n#include <opaque_fragment>');};
    const screen=new THREE.Mesh(panelGeo,screenMat);screen.position.z=-1.6;group.add(screen);
    const hp=[],huv=[],seeds=[];const cols=innerWidth<700?56:88,rows=32;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){hp.push((x/(cols-1)-.5)*10,(y/(rows-1)-.5)*5.8,-1.5);huv.push(x/(cols-1),y/(rows-1));seeds.push(Math.random());}
    const holoGeo=new THREE.BufferGeometry();holoGeo.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));holoGeo.setAttribute('uv',new THREE.Float32BufferAttribute(huv,2));holoGeo.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,1));
    const placeholder=new THREE.DataTexture(new Uint8Array([210,255,220,255]),1,1);placeholder.needsUpdate=true;
    const holoMat=new THREE.ShaderMaterial({uniforms:{image:{value:placeholder},assemble:reveal,tint:holoTint,fade:{value:1},tick:{value:0}},vertexShader:'attribute float seed;uniform float assemble;uniform float tick;varying vec2 vUv;varying float vSeed;void main(){vUv=uv;vSeed=seed;float loose=1.-assemble;vec3 p=position;p.x+=sin(seed*53.+tick*.3)*loose*7.;p.y+=cos(seed*79.+tick*.2)*loose*6.;p.z+=loose*(seed*16.-5.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(30./max(1.,-mv.z),1.4,4.);}',fragmentShader:'uniform sampler2D image;uniform vec3 tint;uniform float fade;varying vec2 vUv;varying float vSeed;void main(){if(length(gl_PointCoord-.5)>.5)discard;vec3 c=texture2D(image,vUv).rgb;gl_FragColor=vec4(mix(tint,c,.65),fade*(.45+vSeed*.55));}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const hologram=new THREE.Points(holoGeo,holoMat);hologram.frustumCulled=false;group.add(hologram);
    texLoader.load(p.image,texture=>{holoMat.uniforms.image.value=texture;texture.colorSpace=THREE.SRGBColorSpace;screenMat.map=texture;screenMat.needsUpdate=true;wake();},undefined,()=>{});
    const frame=new THREE.Mesh(new THREE.BoxGeometry(10.3,6.1,.28),dark);frame.position.z=-1.85;group.add(frame);
    const frameEdges=new THREE.LineSegments(new THREE.EdgesGeometry(frame.geometry),new THREE.LineBasicMaterial({color}));frameEdges.position.copy(frame.position);group.add(frameEdges);
    const segments=new THREE.InstancedMesh(new THREE.BoxGeometry(.19,.7,.23),new THREE.MeshBasicMaterial({color}),36);
    for(let j=0;j<36;j++){const a=j/36*Math.PI*2;dummy.position.set(Math.cos(a)*7.7,Math.sin(a)*7.7,.5);dummy.rotation.set(0,0,a-Math.PI/2);dummy.updateMatrix();segments.setMatrixAt(j,dummy.matrix);}group.add(segments);
    const shards=new THREE.Group();
    for(let j=0;j<9;j++){const a=j/9*Math.PI*2;const m=new THREE.Mesh(new THREE.OctahedronGeometry(.15+(j%3)*.08),j%3===0?new THREE.MeshBasicMaterial({color}):metal);m.position.set(Math.cos(a)*9.8,Math.sin(a)*9.8,.5);shards.add(m);}group.add(shards);
    const arcGeo=new THREE.BufferGeometry();arcGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(65*3),3).setUsage(THREE.DynamicDrawUsage));
    const arc=new THREE.Line(arcGeo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.4,blending:THREE.AdditiveBlending}));group.add(arc);
    const sparkPositions=[];for(let j=0;j<100;j++){const a=j/100*Math.PI*2,r=7.1+Math.random()*.5;sparkPositions.push(Math.cos(a)*r,Math.sin(a)*r,Math.random()*1.5);}
    const sparkGeo=new THREE.BufferGeometry();sparkGeo.setAttribute('position',new THREE.Float32BufferAttribute(sparkPositions,3));
    const sparks=new THREE.Points(sparkGeo,new THREE.PointsMaterial({color,size:.08,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));group.add(sparks);
    world.add(group);gates.push({group,ring,outer,glowMat,segments,shards,screenMat,screen,frame,frameEdges,reveal,holoMat,arc,arcGeo,sparks,color,membraneMat,membrane,bands});
  });
  // Repeat real tunnel architecture beyond the last exhibition; there is no end wall.
  const horizon=new THREE.Group();world.add(horizon);
  const horizonRings=[];
  for(let i=0;i<9;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(7.7,.12,6,72),new THREE.MeshBasicMaterial({color:0x79b8ad,transparent:true,opacity:.32}));
    ring.position.set(0,0,-30-projects.length*48-i*40);horizon.add(ring);horizonRings.push(ring);
  }
  // One GPU draw call for the star streak field. Depth and streak length react to rush speed.
  const starCount=innerWidth<700?170:360,positions=new Float32Array(starCount*6),stars=[];
  for(let i=0;i<starCount;i++)stars.push({x:(Math.random()-.5)*35,y:(Math.random()-.5)*25,z:20-Math.random()*290});
  const streakGeo=new THREE.BufferGeometry();streakGeo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const streaks=new THREE.LineSegments(streakGeo,new THREE.LineBasicMaterial({color:0x90cabb,transparent:true,opacity:.5,blending:THREE.AdditiveBlending}));streaks.frustumCulled=false;world.add(streaks);
  let visible=false,raf=0,last=0,currentP=0,targetP=0,px=0,py=0,lastSelected=-1,contextLost=false,cruise=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const disabled=()=>contextLost||reduced.matches||document.body.classList.contains('motion-off');
  const paused=()=>document.hidden||document.body.classList.contains('dialog-open');
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const mix=THREE.MathUtils.lerp;
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  function sample(p){
    const v=p*journeyLength;
    if(v>=projects.length){
      const tail=clamp((v-projects.length)/.85),gate=gates.at(-1).group.position;
      const z=gate.z-6-tail*70;
      return {index:projects.length-1,t:1,x:mix(gate.x,0,smooth(tail)),z,lookX:0,lookZ:z-30,rush:mix(1,.16,smooth(tail)),tail};
    }
    const index=Math.floor(v),t=v-index;
    const gate=gates[index].group.position;
    let distance;
    if(t<.38)distance=mix(42,16,1-Math.pow(1-t/.38,3));
    else if(t<.65)distance=mix(16,14,(t-.38)/.27);
    else distance=mix(14,-6,Math.pow((t-.65)/.35,2.2));
    const previous=index?gates[index-1].group.position.x:0;
    const x=mix(previous,gate.x,smooth(t/.33))+Math.sin(clamp((t-.38)/.27)*Math.PI)*2.0;
    const next=gates[index+1]?.group.position||new THREE.Vector3(0,0,gate.z-48);
    const turn=smooth((t-.65)/.35),z=gate.z+distance;
    // The look target always stays ahead of the camera, including after crossing.
    return {index,t,x,z,lookX:mix(gate.x,next.x,turn),lookZ:z-24,rush:clamp((t-.65)/.35),tail:0};
  }
  function updateTarget(){const rect=sequence.getBoundingClientRect();targetP=clamp(-rect.top/Math.max(1,rect.height-innerHeight));wake();}
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,w<700?1.25:1.5));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();updateTarget();}
  function draw(now){
    raf=0;if(!visible||disabled()||paused())return;
    const mobile=stage.clientWidth<700;if(now-last<(mobile?33:22)){raf=requestAnimationFrame(draw);return;}
    const dt=Math.min((now-last)/1000,.05)||.03;last=now;
    currentP=mix(currentP,targetP,1-Math.exp(-dt*9));if(Math.abs(currentP-targetP)<.00001)currentP=targetP;
    const s=sample(currentP);selected=s.index;
    cruise=s.tail>0?cruise+dt*2.8*smooth(s.tail):0;
    const drift=cruise*smooth(s.tail);
    camera.position.set(s.x+px*.25,.3+py*.18,s.z-drift);
    camera.lookAt(s.lookX,0,s.lookZ-drift);camera.rotateZ(Math.sin(s.t*Math.PI)*(.025+s.rush*.02));
    const wrap=(v,n)=>((v%n)+n)%n;
    floor.position.z=roof.position.z=camera.position.z-350;
    rails.forEach(rail=>rail.position.z=camera.position.z-140);
    ri=0;for(let i=0;i<32;i++)for(const side of [-1,1]){dummy.position.set(side*13,1,camera.position.z+20-wrap(camera.position.z+20-(-i*10+16),320));dummy.rotation.set(0,0,side*.13);dummy.updateMatrix();ribs.setMatrixAt(ri++,dummy.matrix);}ribs.instanceMatrix.needsUpdate=true;
    for(let i=0;i<50;i++){dummy.position.set(0,-7.7,camera.position.z+10-wrap(camera.position.z+10-(20-i*6),300));dummy.rotation.set(0,0,0);dummy.updateMatrix();ties.setMatrixAt(i,dummy.matrix);}ties.instanceMatrix.needsUpdate=true;
    horizonRings.forEach((ring,i)=>{ring.position.z=camera.position.z-40-wrap(camera.position.z-40-(-30-projects.length*48-i*40),360);ring.rotation.z=now*.00003;});
    camera.fov=mobile?mix(78,88,s.rush):mix(60,82,s.rush);camera.updateProjectionMatrix();
    if(selected!==lastSelected){const p=projects[selected];title.textContent=p.title;stage.dataset.project=p.id;sequence.querySelector('.portal-links').innerHTML=window.portfolioDestinations(p);[...dots.children].forEach((b,i)=>b.setAttribute('aria-current',String(i===selected)));lastSelected=selected;}
    const continuing=s.tail>0;
    if(continuing){title.textContent='The journey continues.';sequence.querySelector('.portal-links').innerHTML='<span class="portal-ongoing">다음 세계를 향해, 계속.</span>';open.textContent='프로젝트 다시 보기 ↑';}
    else if(stage.dataset.phase==='continuing'){title.textContent=projects[selected].title;sequence.querySelector('.portal-links').innerHTML=window.portfolioDestinations(projects[selected]);open.textContent='프로젝트 보기 ↗';}
    const pulse=clamp((s.t-.78)/.22),energy=Math.sin(pulse*Math.PI);
    wave.position.copy(gates[selected].group.position);wave.position.z+=.8;wave.scale.setScalar(1+pulse*1.8);wave.material.opacity=energy*.75;wave.material.color.copy(gates[selected].color);
    reactiveLight.position.copy(camera.position);reactiveLight.position.z-=4;reactiveLight.color.copy(gates[selected].color);reactiveLight.intensity=65+s.rush*170+energy*100;
    sequence.style.setProperty('--cross-flare',(energy*.5).toFixed(3));
    stage.dataset.membrane='active';
    stage.dataset.hologram=gates[selected].reveal.value<.99?'assembling':'formed';
    stage.dataset.phase=continuing?'continuing':s.t<.38?'push-in':s.t<.65?'slow-motion':'portal-crossing';
    stage.dataset.cameraZ=camera.position.z.toFixed(2);stage.dataset.lookZ=(s.lookZ-drift).toFixed(2);stage.dataset.progress=currentP.toFixed(4);
    sequence.style.setProperty('--portal-rush',s.rush.toFixed(3));sequence.style.setProperty('--portal-intro',clamp(1-currentP*13).toFixed(3));
    const clock=now*.001;
    gates.forEach((g,i)=>{
      g.glowMat.uniforms.tick.value=clock;
      g.membraneMat.uniforms.tick.value=clock;g.membraneMat.uniforms.surge.value=i===selected?.45+s.rush*.55:.1;
      g.membrane.rotation.z=clock*.025;
      g.bands.rotation.z=clock*.045;g.bands.rotation.y=Math.sin(clock*.25+i)*.1;
      g.bands.scale.setScalar(i===selected?1+energy*.16:1);
      const depth=camera.position.z-g.group.position.z;
      const formation=smooth((42-depth)/25);g.reveal.value=formation;g.holoMat.uniforms.tick.value=clock;g.holoMat.uniforms.fade.value=(1-smooth((formation-.8)/.2))*clamp((depth-2)/5);
      g.sparks.rotation.z=clock*.11;g.sparks.scale.setScalar(i===selected?1+energy*.22:1);
      g.arc.material.opacity=i===selected?.25+s.rush*.65:.08;
      const ap=g.arcGeo.attributes.position.array;for(let j=0;j<65;j++){const a=j/64*Math.PI*2,r=7.05+Math.sin(a*13+clock*7)*.055+Math.sin(a*29-clock*5)*.03;ap[j*3]=Math.cos(a)*r;ap[j*3+1]=Math.sin(a)*r;ap[j*3+2]=.5;}g.arcGeo.attributes.position.needsUpdate=true;
      g.outer.rotation.z=clock*.08*(i%2?1:-1);
      g.segments.rotation.z=-clock*.055;
      g.shards.children.forEach((shard,j)=>{shard.rotation.x=clock*.3+j;shard.rotation.y=clock*.2;});
      // Only the frame directly in the camera path dissolves as the camera enters it.
      const distance=g.group.position.z-camera.position.z;
      g.screenMat.opacity=clamp((-distance-1)/5);
      g.frame.visible=g.frameEdges.visible=distance < -3;
    });
    stars.forEach((star,i)=>{const a=i*6,z=camera.position.z+12-wrap(camera.position.z+12-star.z,290);positions[a]=star.x;positions[a+1]=star.y;positions[a+2]=z;positions[a+3]=star.x;positions[a+4]=star.y;positions[a+5]=z+(.15+s.rush*5);});streakGeo.attributes.position.needsUpdate=true;
    renderer.render(scene,camera);raf=requestAnimationFrame(draw);
  }
  function wake(){if(!raf&&visible&&!disabled()&&!paused()){last=performance.now()-34;raf=requestAnimationFrame(draw);}}
  function motion(){document.body.classList.toggle('portal-enabled',!disabled());if(entry){entry.href=disabled()?'#work':'#screening';entry.innerHTML=`<span class="circle-arrow">↓</span> ${disabled()?'작품 보기':'3D 상영관 입장'}`;}sequence.classList.toggle('portal-disabled',disabled());if(disabled()){if(raf)cancelAnimationFrame(raf);raf=0;}else{resize();wake();}}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake();},{threshold:0}).observe(sequence);
  sequence.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=stage.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;},{passive:true});
  sequence.addEventListener('pointerleave',()=>{px=py=0;});
  addEventListener('scroll',updateTarget,{passive:true});addEventListener('resize',resize,{passive:true});
  document.addEventListener('portfolio:motion',motion);document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',motion);
  new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;motion();});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;motion();wake();});
  resize();motion();
  if(location.hash==='#screening'&&!disabled())sequence.scrollIntoView({behavior:'instant',block:'start'});
  if(location.hash==='#journey'&&!disabled())work.scrollIntoView({behavior:'instant',block:'start'});
}
