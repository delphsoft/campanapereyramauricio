/* Selección de backend para el equipo. Devuelve {db,uid,isEditor,canWrite,downloads} o null.
   La "db" imita la interfaz doc()/collection()/onSnapshot que usa persistencia.js.
   1) Dentro de Claude (artefacto): window.claude.use('db').
   2) Con Supabase configurado: login por email (OTP) y tablas con RLS.
   3) Sin nada: null -> todo queda en este navegador (localStorage). */
var BK={sb:null,session:null,rol:null};
async function getEnv(){
 var cl=window.claude;
 if(cl&&cl.use){
  var db=null,us=null,dl=null;
  try{db=await cl.use('db');us=await cl.use('user');dl=await cl.use('downloads')}catch(e){}
  if(!db)return null;
  var uid=null,ed=false,cw=null;
  try{if(us){uid=await us.id();ed=!!(us.canEdit&&us.canEdit());cw=us.can?await us.can('data.write'):null}}catch(e){}
  return {db:db,uid:uid,isEditor:ed,canWrite:cw!==false,downloads:dl}}
 var cfg=window.CENTRO_CONFIG||{};
 if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||!window.supabase)return null;
 BK.sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 var r=await BK.sb.auth.getSession();BK.session=r.data&&r.data.session;
 if(!BK.session){BK.session=await loginGate()}
 var pr=await BK.sb.from('profiles').select('rol,activo').eq('id',BK.session.user.id).maybeSingle();
 var p=pr.data;
 if(!p||!p.activo){showGate('Tu cuenta todavía no fue habilitada por el equipo. Pedile acceso a quien administra el centro.',true);return null}
 BK.rol=p.rol;hideGate();
 var ed=p.rol==='admin'||p.rol==='editor';
 return {db:sbDb(BK.sb,BK.session.user.id),uid:BK.session.user.id,isEditor:ed,canWrite:ed,downloads:null}}
function sbDb(sb,uid){
 function P(path){var s=path.split('/');return {t:s[0],id:s[1]}}
 function rows(t,id){var q=sb.from(t).select('id,data');if(id)q=q.eq('id',id);return q}
 function watch(t,load){
  var tm=null,go=function(){clearTimeout(tm);tm=setTimeout(load,150)};
  load();
  sb.channel('rt-'+t+'-'+Math.random().toString(36).slice(2,7)).on('postgres_changes',{event:'*',schema:'public',table:t},go).subscribe()}
 return {
  doc:function(path){var p=P(path);return {
   set:async function(d){var row={id:p.id,data:d};if(p.t==='contactos')row.owner=uid;var r=await sb.from(p.t).upsert(row);if(r.error)throw r.error},
   delete:async function(){var r=await sb.from(p.t).delete().eq('id',p.id);if(r.error)throw r.error},
   onSnapshot:function(fn,err){watch(p.t,async function(){var r=await rows(p.t,p.id);if(r.error){err&&err(r.error);return}var x=r.data&&r.data[0];fn({exists:!!x,data:function(){return x&&x.data},metadata:{hasPendingWrites:false}})})}}},
  collection:function(t){return {onSnapshot:function(fn,err){watch(t,async function(){var r=await rows(t);if(r.error){err&&err(r.error);return}fn({docs:(r.data||[]).map(function(x){return {id:x.id,data:function(){return x.data}}})})})}}}}}
/* ---- pantalla de acceso (cosmética: la protección real es RLS) ---- */
function showGate(msg,noForm){
 var g=document.getElementById('gate');
 if(!g){g=document.createElement('div');g.id='gate';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Acceso al centro de mando');document.body.appendChild(g)}
 g.innerHTML='<div class="gbox"><h1>Centro de mando Colón 2027</h1><p id="gmsg">'+msg+'</p>'+(noForm?'<button class="btn" id="gout">Salir</button>':'<form id="gf"><label for="gm">Email</label><input class="in" id="gm" type="email" required autocomplete="email"><button class="btn pri" type="submit">Enviar enlace de acceso</button></form>')+'</div>';
 g.style.display='grid';return g}
function hideGate(){var g=document.getElementById('gate');if(g)g.style.display='none'}
function loginGate(){return new Promise(function(res){
 var g=showGate('Ingresá con tu email. Te enviamos un enlace para entrar, sin contraseña.');
 BK.sb.auth.onAuthStateChange(function(ev,s){if(s&&s.user){res(s)}});
 g.querySelector('#gf').onsubmit=async function(e){e.preventDefault();var m=g.querySelector('#gm').value.trim();
  var r=await BK.sb.auth.signInWithOtp({email:m,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}});
  g.querySelector('#gmsg').textContent=r.error?'No pudimos enviar el enlace. Revisá el email o pedí acceso al equipo.':'Listo. Abrí el enlace que te llegó a '+m+'.'}})}
