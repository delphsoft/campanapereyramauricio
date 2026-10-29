
/* ---------- actividades ---------- */
var ORD=['pend','curso','hecho'];
function fdate(iso){var t=dms(iso);if(isNaN(t))return '';var d=new Date(t);return d.getUTCDate()+'/'+(d.getUTCMonth()+1)+(d.getUTCFullYear()!==2026?'/'+String(d.getUTCFullYear()).slice(2):'')}
function rng(a){return a.s===a.f?fdate(a.s):fdate(a.s)+' al '+fdate(a.f)}
function actCard(a,compact){
 var i=ORD.indexOf(a.e);
 return '<div class="ac" data-id="'+a.id+'"><button class="t" data-ed="'+a.id+'">'+esc(a.t)+'</button><div class="m"><span><i class="dot" style="background:var(--'+TIPOS[a.tipo]+')"></i> '+esc(a.tipo)+'</span>'+(compact?'':'<span>'+esc(a.m)+'</span>')+'<span>'+rng(a)+'</span>'+(a.r?'<span>'+esc(a.r)+'</span>':'')+(a.c?'<span>$ '+fmt(a.c)+'</span>':'')+(a.sug?'<span class="pill">Sugerida</span>':'')+'</div><div class="acb">'+(compact?'<span class="pill">'+ESTADOS[a.e]+'</span>':'')+(i>0?'<button class="btn" data-mv="'+a.id+'" data-d="-1" aria-label="Pasar a '+ESTADOS[ORD[i-1]]+'">← '+ESTADOS[ORD[i-1]]+'</button>':'')+(i<2?'<button class="btn" data-mv="'+a.id+'" data-d="1" aria-label="Pasar a '+ESTADOS[ORD[i+1]]+'">'+ESTADOS[ORD[i+1]]+' →</button>':'')+'</div></div>'}
function wireCards(root){
 root.querySelectorAll('[data-ed]').forEach(function(b){b.onclick=function(){editAct(b.dataset.ed)}});
 root.querySelectorAll('[data-mv]').forEach(function(b){b.onclick=function(){var a=ACT.filter(function(x){return x.id===b.dataset.mv})[0];a.e=ORD[Math.max(0,Math.min(2,ORD.indexOf(a.e)+(+b.dataset.d)))];changed(a)}})}
function changed(a,delId){if(a)persistAct(a);if(delId)persistDelAct(delId);LS.set('cmd_acts',ACT);renderAct();renderEst();renderPre();if($('drawer').classList.contains('open'))drawer()}
function editAct(id,preset){
 var a=id?ACT.filter(function(x){return x.id===id})[0]:Object.assign({t:'',tipo:'Escucha',m:'La Calera',s:'',f:'',r:'',e:'pend',n:''},preset||{});
 if(!a)return;
 var today=new Date().toISOString().slice(0,10);
 var ed=$('ed');
 ed.innerHTML='<h2 style="font:700 20px var(--fd);margin:0">'+(id?'Editar actividad':'Nueva actividad')+'</h2>'+
 '<div><label for="e_t">Qué se hace</label><input class="in" id="e_t" value="'+esc(a.t)+'"></div>'+
 '<div class="fl"><div><label for="e_tipo">Tipo</label><select class="in" id="e_tipo">'+Object.keys(TIPOS).map(function(k){return '<option'+(k===a.tipo?' selected':'')+'>'+k+'</option>'}).join('')+'</select></div>'+
 '<div><label for="e_m">Municipio</label><select class="in" id="e_m">'+['Todos'].concat(D.map(function(d){return d.n})).map(function(k){return '<option'+(k===a.m?' selected':'')+'>'+esc(k)+'</option>'}).join('')+'</select></div></div>'+
 '<div class="fl"><div><label for="e_s">Inicio</label><input class="in" type="date" id="e_s" value="'+(a.s||today)+'"></div><div><label for="e_f">Fin</label><input class="in" type="date" id="e_f" value="'+(a.f||a.s||today)+'"></div></div>'+
 '<div class="fl"><div><label for="e_r">Responsable</label><input class="in" id="e_r" value="'+esc(a.r)+'"></div><div><label for="e_e">Estado</label><select class="in" id="e_e">'+ORD.map(function(k){return '<option value="'+k+'"'+(k===a.e?' selected':'')+'>'+ESTADOS[k]+'</option>'}).join('')+'</select></div></div>'+
 '<div><label for="e_c">Costo estimado ($)</label><input class="in" type="number" min="0" step="1000" id="e_c" value="'+(a.c||0)+'"></div><div><label for="e_n">Notas</label><textarea class="in" id="e_n" rows="4">'+esc(a.n)+'</textarea></div><div id="e_err" class="warn" style="display:none;border-color:var(--cerrada)"></div>'+
 '<div class="acb" style="margin-top:6px"><button class="btn pri" id="e_ok">Guardar</button><button class="btn" id="e_cx">Cancelar</button>'+(id?'<button class="btn dng" id="e_del">Eliminar</button>':'')+'</div>';
 ed.classList.add('open');$('e_t').focus();
 $('e_cx').onclick=function(){ed.classList.remove('open')};
 $('e_ok').onclick=function(){var t=$('e_t').value.trim(),s=$('e_s').value,f=$('e_f').value,er=$('e_err');
  if(!t){er.textContent='Escribí qué se hace.';er.style.display='block';return}
  if(isNaN(dms(s))||isNaN(dms(f))||dms(f)<dms(s)){er.textContent='Revisá las fechas: el fin no puede ser anterior al inicio.';er.style.display='block';return}
  var o=a;if(!id){o={id:'u'+Date.now()};ACT.push(o)}
  o.t=t;o.tipo=$('e_tipo').value;o.m=$('e_m').value;o.s=s;o.f=f;o.r=$('e_r').value.trim();o.e=$('e_e').value;o.n=$('e_n').value.trim();o.c=Math.max(0,+$('e_c').value||0);
  ed.classList.remove('open');changed(o)};
 var dl=$('e_del');if(dl){var arm=false;dl.onclick=function(){if(!arm){arm=true;dl.textContent='Tocá otra vez para eliminar';return}var did=a.id;ACT.splice(ACT.indexOf(a),1);ed.classList.remove('open');changed(null,did)}}}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){$('ed').classList.remove('open')}});
/* gantt */
var GD0=Date.UTC(2026,10,1),GD1=Date.UTC(2027,6,1),MONTHS=['Nov','Dic','Ene','Feb','Mar','Abr','May','Jun'],DAY=86400000;
function gp(t){return Math.max(0,Math.min(100,(t-GD0)/(GD1-GD0)*100))}
function gantt(rows){
 var h='<div class="gt"><div class="gtin"><div class="gr" style="position:sticky;top:0;z-index:3;background:var(--panel)"><div class="gl">&nbsp;</div><div class="gtk">';
 for(var i=0;i<8;i++){var y=2026+(i<2?0:1),m=(10+i)%12,a=Date.UTC(y,m,1),b=Date.UTC(m===11?y+1:y,(m+1)%12,1);h+='<div class="gm" style="left:'+gp(a)+'%;width:'+(gp(b)-gp(a))+'%">'+MONTHS[i]+(m===0?' '+y:'')+'</div>'}
 h+='</div></div>';
 var now=Date.now();
 rows.forEach(function(r){var s=dms(r.s),f=dms(r.f)+DAY,vis=f>GD0&&s<GD1;
  h+='<div class="gr"><div class="gl" title="'+esc(r.label)+'">'+esc(r.label)+(r.sub?'<small>'+esc(r.sub)+'</small>':'')+'</div><div class="gtk">';
  if(now>GD0&&now<GD1)h+='<div class="today" style="left:'+gp(now)+'%"></div>';
  if(vis){var l=gp(s),w=Math.max(0.7,gp(f)-l);h+='<button class="gb'+(r.done?' hecho':'')+'" data-gid="'+esc(r.id)+'" style="left:'+l+'%;width:'+w+'%;background:'+(r.strip?'repeating-linear-gradient(45deg,var(--'+r.c+') 0 6px,transparent 6px 10px)':'var(--'+r.c+')')+'" title="'+esc(r.label+' · '+r.when)+'" aria-label="'+esc(r.label+' · '+r.when)+'">'+(r.pct!=null?'<i style="display:block;height:100%;width:'+r.pct+'%;background:#0003;border-radius:5px 0 0 5px"></i>':'')+'</button>'}
  h+='</div></div>'});
 return h+'</div></div>'}
var FT='',FM='';
function renderAct(){
 var host=$('act');
 var L=ACT.filter(function(a){return (!FM||a.m===FM)&&(!FT||a.tipo===FT)}).sort(function(a,b){return dms(a.s)-dms(b.s)});
 var cnt={pend:0,curso:0,hecho:0};ACT.forEach(function(a){cnt[a.e]++});
 var h='<h1>Actividades</h1><p class="lead">Todo lo que estamos planificando, en un cronograma y en un tablero. Las marcadas como sugeridas salen del documento de trabajo; cambialas o borralas libremente. Se guardan en este navegador.</p>'+
 '<div class="tb"><div><label for="fm">Municipio</label><select class="in" id="fm"><option value="">Todos</option>'+['Todos'].concat(D.map(function(d){return d.n})).map(function(k){return '<option'+(k===FM?' selected':'')+'>'+esc(k)+'</option>'}).join('')+'</select></div><div><label for="ft">Tipo</label><select class="in" id="ft"><option value="">Todos</option>'+Object.keys(TIPOS).map(function(k){return '<option'+(k===FT?' selected':'')+'>'+k+'</option>'}).join('')+'</select></div><button class="btn pri" id="anew">Nueva actividad</button><span class="pill">'+cnt.pend+' pendientes · '+cnt.curso+' en curso · '+cnt.hecho+' hechas</span></div>';
 if(!ACT.length)h+='<div class="card" style="margin-bottom:14px"><h2>Todavía no hay actividades</h2><p style="color:var(--mute);margin:0 0 10px">Podés cargar las 12 sugeridas del documento de trabajo o crear las tuyas.</p><button class="btn pri" id="sdk">Cargar sugeridas</button></div>';
 h+='<div class="sec" style="margin-top:6px"><h2>Cronograma</h2><p>Cada barra es una actividad. Tocala para editarla. La línea roja es hoy.</p>'+(L.length?gantt(L.map(function(a){return {id:a.id,label:a.t,sub:a.m+' · '+a.tipo,s:a.s,f:a.f,c:TIPOS[a.tipo],done:a.e==='hecho',when:rng(a)}})):'<p>No hay actividades con ese filtro.</p>')+'<div class="cl" style="margin-top:8px">'+Object.keys(TIPOS).map(function(k){return '<span class="chip" style="cursor:default"><i style="background:var(--'+TIPOS[k]+')"></i>'+k+'</span>'}).join('')+'</div></div>';
 h+='<div class="sec"><h2>Tablero</h2><div class="kb">'+ORD.map(function(k){var c=L.filter(function(a){return a.e===k});return '<div class="kc"><h3>'+ESTADOS[k]+' · '+c.length+'</h3>'+(c.length?c.map(function(a){return actCard(a,false)}).join(''):'<span style="color:var(--mute);padding:4px">Sin actividades</span>')+'</div>'}).join('')+'</div></div>';
 host.innerHTML=h;
 $('fm').onchange=function(){FM=this.value;renderAct()};$('ft').onchange=function(){FT=this.value;renderAct()};$('anew').onclick=function(){editAct(null,FM&&FM!=='Todos'?{m:FM}:{})};
 var sdk=$('sdk');if(sdk)sdk.onclick=function(){seed().forEach(function(a){ACT.push(a);persistAct(a)});LS.set('cmd_acts',ACT);renderAct();renderEst()};
 wireCards(host);host.querySelectorAll('.gb').forEach(function(b){b.onclick=function(){editAct(b.dataset.gid)}})}
