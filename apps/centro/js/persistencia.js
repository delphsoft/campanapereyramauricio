
/* ---------- persistencia y equipo ---------- */
var DBX=null,UID=null,ISADMIN=false,CANW=true,TM={},DBERR='',DLX=null;
function status(){var e=$('dbst');if(!e)return;
 if(!DBX){e.textContent='Solo en este navegador';e.title='Los datos se guardan en este navegador. Para trabajar en equipo hay que abrir la página con una cuenta.'}
 else if(!CANW){e.textContent='Equipo: solo lectura';e.title='Tu nivel de acceso no permite cambiar datos compartidos.'}
 else{e.textContent=DBERR?'Equipo: error al guardar':'Equipo en línea';e.title=DBERR||'Los cambios se comparten con quienes tienen acceso.'}}
function clean(o){return JSON.parse(JSON.stringify(o))}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function dberr(e){DBERR=(e&&e.message)||'error';status();setTimeout(function(){DBERR='';status()},6000)}
function persist(k){
 if(k==='plan'){LS.set('cmd_muni',ST2);LS.set('cmd_cand',CAND);LS.set('cmd_fisc',FISC)}
 if(k==='zonas')LS.set('cmd_zonas',zobj());
 if(k==='kpi')LS.set('cmd_kpi',KP);
 if(k==='misc'){LS.set('cmd_edate',ELDATE);LS.set('cmd_links',LINKS);LS.set('cmd_tope',TOPE);LS.set('cmd_esc',ESC)}
 if(k==='ct'){LS.set('cmd_ct',MYCT);LS.set('cmd_capn',CAPN)}
 if(!DBX||(!CANW&&k!=='ct'))return;
 clearTimeout(TM[k]);TM[k]=setTimeout(function(){dbw(k)},700)}
function dbw(k){var r;
 if(k==='plan')r=DBX.doc('cfg/plan').set(clean({muni:ST2,cand:CAND,fisc:FISC}));
 else if(k==='zonas')r=DBX.doc('cfg/zonas').set(clean({z:zobj()}));
 else if(k==='kpi')r=DBX.doc('cfg/kpi').set(clean({kp:KP}));
 else if(k==='misc')r=DBX.doc('cfg/misc').set(clean({edate:ELDATE,links:LINKS,tope:TOPE,esc:ESC}));
 else if(k==='ct'&&UID)r=DBX.doc('contactos/'+UID).set(clean({cap:CAPN,items:MYCT}));
 if(r)r.catch(dberr)}
function persistAct(a){LS.set('cmd_acts',ACT);if(DBX&&CANW)DBX.doc('acts/'+a.id).set(clean(a)).catch(dberr)}
function persistDelAct(id){LS.set('cmd_acts',ACT);if(DBX&&CANW)DBX.doc('acts/'+id).delete().catch(dberr)}
function persistPt(p){LS.set('cmd_pts',PTS);if(DBX&&CANW)DBX.doc('puntos/'+p.id).set(clean(p)).catch(dberr)}
function persistDelPt(id){LS.set('cmd_pts',PTS);if(DBX&&CANW)DBX.doc('puntos/'+id).delete().catch(dberr)}
function busy(el){var a=document.activeElement;return !!(a&&el&&el.contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))}
function refresh(){retarget();recolor();ecount();
 if(!busy($('act')))renderAct();if(!busy($('est')))renderEst();if(!busy($('con')))renderCon();if(!busy($('ele')))renderEle();if(!busy($('pre')))renderPre();if(!$('v-mun').hidden&&!busy($('mun')))renderMun();
 if($('drawer').classList.contains('open')&&!busy($('db')))drawer();buildPins()}
async function initDb(){
 status();
 var env=await getEnv();            /* backend.js: Claude (artefacto), Supabase o ninguno */
 if(!env||!env.db){status();return}
 DBX=env.db;DLX=env.downloads||null;UID=env.uid;ISADMIN=!!env.isEditor;CANW=env.canWrite!==false;
 status();
 function sub(path,fn){try{DBX.doc(path).onSnapshot(function(s){if(!s.exists||s.metadata.hasPendingWrites)return;fn(s.data())},dberr)}catch(e){dberr(e)}}
 sub('cfg/plan',function(d){var ch=false;if(d.muni&&!same(d.muni,ST2)){ST2=d.muni;ch=true}if(d.cand&&!same(d.cand,CAND)){CAND=d.cand;ch=true}if(d.fisc&&!same(d.fisc,FISC)){FISC=d.fisc;ch=true}if(ch)refresh()});
 sub('cfg/zonas',function(d){var ch=false;if(d.z){Z.forEach(function(z){var s=d.z[z.id];if(s&&(s.m!==z.m||s.d!==z.d||s.e!==z.e)){z.m=s.m;z.d=s.d;z.e=s.e;ch=true}})}if(ch)refresh()});
 sub('cfg/kpi',function(d){if(d.kp&&!same(d.kp,KP)){KP=d.kp;refresh()}});
 sub('cfg/misc',function(d){var ch=false;if(d.edate!=null&&d.edate!==ELDATE){ELDATE=d.edate;ch=true}if(d.links&&!same(d.links,LINKS)){LINKS=d.links;ch=true}if(d.tope!=null&&d.tope!==TOPE){TOPE=d.tope;ch=true}if(d.esc&&!same(d.esc,ESC)){ESC=d.esc;ch=true}if(ch)refresh()});
 try{DBX.collection('acts').onSnapshot(function(s){var L=s.docs.map(function(x){return Object.assign({},x.data(),{id:x.id})});if(!same(L,ACT)){ACT=L;LS.set('cmd_acts',ACT);refresh()}},dberr)}catch(e){dberr(e)}
 try{DBX.collection('puntos').onSnapshot(function(s){var L=s.docs.map(function(x){return Object.assign({},x.data(),{id:x.id})});if(!same(L,PTS)){PTS=L;LS.set('cmd_pts',PTS);refresh()}},dberr)}catch(e){dberr(e)}
 var first=true;
 try{DBX.collection('contactos').onSnapshot(function(s){ALLCT={};s.docs.forEach(function(x){ALLCT[x.id]=x.data()});
  if(UID&&ALLCT[UID]){var it=ALLCT[UID].items||[];if(!same(it,MYCT)){MYCT=it;LS.set('cmd_ct',MYCT)}if(ALLCT[UID].cap)CAPN=ALLCT[UID].cap}
  else if(UID&&first&&MYCT.length)persist('ct');
  first=false;refresh()},dberr)}catch(e){dberr(e)}}
