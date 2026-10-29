
/* ---------- escena 3D ---------- */
var CX=320,CY=330,sel=null,metric='electores',on={cerrada:1,abierta:1,fuerte:1,sindato:1},drawerTab='Resumen';
var cvs=$('cv'),stage=$('stage'),renderer,scene,camera,groups=[],hover=null,meshes=[],gridH,L1,L2,L3;
var cam={th:-0.28,ph:0.92,r:900,tx:0,ty:0,tz:0},camGoal=null,DEF={th:-0.28,ph:0.92,r:900,tx:0,ty:0,tz:0};
function munOf(o){return o.m?dat(o.m):null}
function kOf(o){var d=munOf(o);return d?d.k:'sindato'}
function ringsOf(d){return d.split('M').filter(Boolean).map(function(seg){return seg.replace('Z','').split('L').map(function(p){return p.trim().split(/\s+/).map(Number)}).filter(function(p){return p.length===2&&!isNaN(p[0])&&!isNaN(p[1])})})}
function area(r){var a=0;for(var i=0;i<r.length;i++){var j=(i+1)%r.length;a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return Math.abs(a/2)}
var munE={};POLY.forEach(function(o){if(o.m)munE[o.m]=(munE[o.m]||0)+o.e});
function targetH(o){
 if(metric==='plano')return 4;
 if(metric==='electores')return 4+o.e/380;
 if(!o.m)return 4;var s=shares()[o.m];return 4+s.p*330*(o.e/munE[o.m])
}
function initScene(){
 if(typeof THREE==='undefined'){stage.insertAdjacentHTML('beforeend','<div style="position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:var(--mute)">No se pudo cargar el motor 3D. Revisá la conexión y recargá la página.</div>');return false}
 renderer=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(38,1,1,6000);
 L1=new THREE.AmbientLight(0xffffff,0.78);scene.add(L1);
 L2=new THREE.DirectionalLight(0xffffff,0.55);L2.position.set(-300,600,400);scene.add(L2);
 L3=new THREE.DirectionalLight(0xffffff,0.2);L3.position.set(400,200,-300);scene.add(L3);
 gridH=new THREE.GridHelper(1400,28,0x888888,0x888888);gridH.position.y=-0.5;gridH.material.transparent=true;gridH.material.opacity=0.12;scene.add(gridH);
 POLY.forEach(function(o){
  var mat=new THREE.MeshLambertMaterial({color:0x888888,transparent:true,opacity:1});
  var g={o:o,mat:mat,cur:0.1,tgt:4,meshes:[],edges:[],m:o.m,rings:ringsOf(o.d)};
  g.rings.forEach(function(r){
   if(r.length<4||area(r)<25)return;
   var sh=new THREE.Shape(r.map(function(p){return new THREE.Vector2(p[0]-CX,-(p[1]-CY))}));
   var geo=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});geo.rotateX(-Math.PI/2);
   var mesh=new THREE.Mesh(geo,mat);mesh.userData.g=g;mesh.scale.y=0.1;
   var el=new THREE.LineSegments(new THREE.EdgesGeometry(geo,35),new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:0.35}));
   mesh.add(el);g.edges.push(el);scene.add(mesh);g.meshes.push(mesh);meshes.push(mesh)});
  groups.push(g)});
 recolor();retarget();
 new ResizeObserver(resize).observe(stage);resize();
 return true}
function recolor(){
 if(!scene)return;
 var bg=cv('bg');scene.background=new THREE.Color(bg);
 var light=document.documentElement.getAttribute('data-theme')==='light'||(!document.documentElement.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme:light)').matches);
 L1.intensity=light?0.85:0.72;
 gridH.material.color=new THREE.Color(light?0x556055:0xaabbaa);
 groups.forEach(function(g){var k=kOf(g.o),c=new THREE.Color(cv(k));
  var isSel=g.m&&g.m===sel,isH=hover===g,on_=on[k];
  g.mat.color.copy(c);
  if(g.m)g.mat.emissive=new THREE.Color(isSel?c:0x000000),g.mat.emissiveIntensity=isSel?0.45:0;
  g.mat.opacity=on_?(g.m?1:0.55):0.14;
  if(isH&&g.m){g.mat.emissive=new THREE.Color(c);g.mat.emissiveIntensity=Math.max(g.mat.emissiveIntensity,0.25)}
  g.edges.forEach(function(e){e.material.color=new THREE.Color(isSel?cv('fg'):(light?0xffffff:0x000000));e.material.opacity=isSel?0.95:0.4})})}
function retarget(){groups.forEach(function(g){var h=targetH(g.o);if(g.m&&g.m===sel)h+=10;if(!on[kOf(g.o)])h=2;g.tgt=h;if(reduce)g.cur=h});}
function resize(){if(!renderer)return;var w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function updateCam(){
 camera.position.set(cam.tx+cam.r*Math.sin(cam.ph)*Math.sin(cam.th),cam.ty+cam.r*Math.cos(cam.ph),cam.tz+cam.r*Math.sin(cam.ph)*Math.cos(cam.th));
 camera.lookAt(cam.tx,cam.ty,cam.tz)}
function flyTo(g,now){camGoal=g;if(reduce||now){Object.assign(cam,g);camGoal=null}}
function ease(){if(!camGoal)return;var k=0.14,done=true;['th','ph','r','tx','ty','tz'].forEach(function(p){var d=camGoal[p]-cam[p];if(Math.abs(d)>0.002*(p==='r'||p==='tx'||p==='tz'?100:1)){cam[p]+=d*k;done=false}else cam[p]=camGoal[p]});if(done)camGoal=null}
var vt=new THREE.Vector3();
function labels(){
 var host=$('labels'),W=stage.clientWidth,H=stage.clientHeight,seen={};
 groups.forEach(function(g){var o=g.o;if(!o.m||seen[o.m])return;var best=null;groups.forEach(function(q){if(q.m===o.m&&(!best||q.o.e>best.o.e))best=q});if(best!==g)return;seen[o.m]=1;
  var d=dat(o.m),big=munE[o.m]>=5000||o.m===sel;
  var el=host.querySelector('[data-n="'+o.m.replace(/"/g,'')+'"]');
  if(!big||!on[d.k]){if(el)el.style.display='none';return}
  if(!el){el=document.createElement('div');el.className='l3';el.dataset.n=o.m;host.appendChild(el)}
  var pc=pendFor(o.m);el.className='l3'+(o.m===sel?' sel':'');
  var html=esc(o.m)+(pc?' <b>'+pc+'</b>':'');if(el._h!==html){el.innerHTML=html;el._h=html}
  vt.set(o.x-CX,g.cur+7,o.y-CY);vt.project(camera);
  if(vt.z>1){el.style.display='none';return}
  el.style.display='flex';el.style.left=((vt.x*0.5+0.5)*W)+'px';el.style.top=((-vt.y*0.5+0.5)*H)+'px'})}
function loop(){
 requestAnimationFrame(loop);
 if(!renderer||document.hidden)return;
 ease();
 groups.forEach(function(g){var d=g.tgt-g.cur;if(Math.abs(d)>0.05){g.cur+=d*0.16}else g.cur=g.tgt;g.meshes.forEach(function(m){m.scale.y=g.cur})});
 pinsUpdate();updateCam();renderer.render(scene,camera);labels()}
/* ---------- interacción ---------- */
var ptrs={},drag=null,pinch=0,ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(ev){var r=cvs.getBoundingClientRect();ndc.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(meshes,false);for(var i=0;i<h.length;i++){var g=h[i].object.userData.g;if(on[kOf(g.o)])return g}return null}
function bindInput(){
 cvs.addEventListener('contextmenu',function(e){e.preventDefault()});
 cvs.addEventListener('pointerdown',function(e){cvs.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};drag={x:e.clientX,y:e.clientY,moved:0,pan:e.shiftKey||e.button===2||e.button===1};camGoal=null;if(Object.keys(ptrs).length===2){var a=Object.keys(ptrs).map(function(k){return ptrs[k]});pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}});
 cvs.addEventListener('pointermove',function(e){
  if(ptrs[e.pointerId]){
   var n=Object.keys(ptrs).length;
   if(n===2){ptrs[e.pointerId]={x:e.clientX,y:e.clientY};var a=Object.keys(ptrs).map(function(k){return ptrs[k]}),dd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch){cam.r=Math.max(250,Math.min(1500,cam.r*pinch/dd))}pinch=dd;if(drag)drag.moved=99;return}
   var dx=e.clientX-ptrs[e.pointerId].x,dy=e.clientY-ptrs[e.pointerId].y;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
   if(drag){drag.moved+=Math.abs(dx)+Math.abs(dy)}
   if(drag&&drag.pan){var s=cam.r*0.0016,cs=Math.cos(cam.th),sn=Math.sin(cam.th);cam.tx+=-dx*s*cs-dy*s*sn;cam.tz+=dx*s*sn-dy*s*cs;cam.tx=Math.max(-420,Math.min(420,cam.tx));cam.tz=Math.max(-420,Math.min(420,cam.tz))}
   else{cam.th-=dx*0.006;cam.ph=Math.max(0.12,Math.min(1.42,cam.ph-dy*0.004))}
   $('tip').style.display='none';return}
  var g=pick(e);if(g!==hover){hover=g;recolor();cvs.classList.toggle('hov',!!(g&&g.m))}
  var tip=$('tip');if(g&&g.m){var r=stage.getBoundingClientRect(),d=dat(g.m);tip.style.display='block';tip.innerHTML='<b>'+esc(g.m)+'</b><br>'+esc(C[d.k])+'<br>'+(d.p?fmt(d.p)+' hab.':'sin población cargada');tip.style.left=Math.min(e.clientX-r.left+14,r.width-250)+'px';tip.style.top=(e.clientY-r.top+14)+'px'}else tip.style.display='none'});
 function up(e){var d=drag;delete ptrs[e.pointerId];if(Object.keys(ptrs).length<2)pinch=0;
  if(d&&d.moved<6&&e.type==='pointerup'){var g=pick(e);if(g&&g.m)select(g.m);else if(!g)closeDrawer()}
  if(!Object.keys(ptrs).length)drag=null}
 cvs.addEventListener('pointerup',up);cvs.addEventListener('pointercancel',up);
 cvs.addEventListener('pointerleave',function(){if(hover){hover=null;recolor();$('tip').style.display='none'}});
 cvs.addEventListener('wheel',function(e){e.preventDefault();camGoal=null;cam.r=Math.max(250,Math.min(1500,cam.r*Math.exp(e.deltaY*0.001)))},{passive:false});
 $('rst').onclick=function(){flyTo(Object.assign({},DEF))};
 $('top').onclick=function(){flyTo({th:0,ph:0.1,r:cam.r,tx:cam.tx,ty:0,tz:cam.tz})};
 $('metric').querySelectorAll('button').forEach(function(b){b.onclick=function(){metric=b.dataset.m;$('metric').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});retarget()}});
 var f=$('flt');Object.keys(C).forEach(function(k){var b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed','true');b.innerHTML='<i style="background:var(--'+k+')"></i>'+C[k]+' ('+D.filter(function(x){return x.k===k}).length+')';b.onclick=function(){on[k]=!on[k];b.setAttribute('aria-pressed',!!on[k]);recolor();retarget()};f.appendChild(b)});
}
function select(n){
 sel=n;var best=null;POLY.forEach(function(o){if(o.m===n&&(!best||o.e>best.e))best=o});
 if(best&&camera){var rr=Math.max(700,Math.min(cam.r,820)),off=window.innerWidth>700?rr*0.2:0;flyTo({th:cam.th,ph:Math.max(0.5,Math.min(cam.ph,0.8)),r:rr,tx:best.x-CX+off*Math.cos(cam.th),ty:0,tz:best.y-CY-off*Math.sin(cam.th)})}
 recolor();retarget();openDrawer(n)}
