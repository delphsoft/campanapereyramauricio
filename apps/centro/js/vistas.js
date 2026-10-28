/* ---------- gráficos y utilidades de vistas ---------- */
var TCOL=['','var(--cerrada)','var(--abierta)','var(--sindato)','var(--fuerte)','var(--ok)'];
function tbar(n){var N=n.reduce(function(a,b){return a+b},0);return '<div class="tc" title="De 1 (en contra) a 5 (voto seguro)">'+n.map(function(v,i){return '<i style="width:'+(N?v/N*100:0)+'%;background:'+TCOL[i+1]+'"></i>'}).join('')+'</div>'}
function sugM(n){var N=n.reduce(function(a,b){return a+b},0);if(N<5)return null;return Math.max(1,Math.min(5,Math.round(1+4*(n[1]+n[2]+n[3])/N)))}
function money(v){return '$ '+fmt(v)}
function csvCell(v){v=String(v==null?'':v);return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCSV(rows){return rows.map(function(r){return r.map(csvCell).join(',')}).join('\n')}
function saveFile(name,text,msgEl){
 var done=function(m){if(msgEl)msgEl.textContent=m};
 var blob=new Blob(['\ufeff'+text],{type:'text/csv'});
 if(DLX){DLX.save({filename:name,data:blob}).then(function(){done('Archivo listo')},function(e){done(e&&e.code==='declined'?'Descarga cancelada':'No se pudo guardar el archivo')})}
 else{var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);done('Archivo listo')}}
function copyText(t,msgEl){var m=function(s){if(msgEl)msgEl.textContent=s};try{navigator.clipboard.writeText(t).then(function(){m('Copiado: pegalo en una planilla')},function(){m('No se pudo copiar')})}catch(e){m('No se pudo copiar')}}
function allContacts(){
 var L=[];
 if(DBX&&ISADMIN){Object.keys(ALLCT).forEach(function(u){(ALLCT[u].items||[]).forEach(function(c){L.push(Object.assign({cap:ALLCT[u].cap||'(sin nombre)'},c))})});if(UID&&!ALLCT[UID])MYCT.forEach(function(c){L.push(Object.assign({cap:CAPN},c))})}
 else MYCT.forEach(function(c){L.push(Object.assign({cap:CAPN},c))});
 return L}
function zoneName(id){var z=Z.filter(function(q){return q.id===id})[0];return z?z.n:(id||'')}

/* ---------- contactos ---------- */
function renderCon(){
 var host=$('con'),L=allContacts(),mine=MYCT;
 var priv=DBX?(ISADMIN?'Ves los contactos de todos los capitanes. Cada capitán ve solo los suyos.':'Ves solo tus contactos. Los editores del equipo ven los de todos.'):'Los contactos quedan solo en este navegador. Abriendo la página con tu cuenta se comparten con el equipo.';
 var h='<h1>Contactos</h1><p class="lead">Lo que encuentran los capitanes en el puerta a puerta. Es información personal de vecinos: cargá solo lo necesario y con su consentimiento. '+priv+'</p>';
 h+='<div class="card"><form id="cf" class="fm"><div><label for="c_cap">Tu nombre (capitán)</label><input class="in" id="c_cap" value="'+esc(CAPN)+'"></div><div><label for="c_n">Nombre del vecino</label><input class="in" id="c_n" required></div><div><label for="c_m">Municipio</label><select class="in" id="c_m">'+D.map(function(d){return '<option'+(d.n==='La Calera'?' selected':'')+'>'+esc(d.n)+'</option>'}).join('')+'</select></div><div><label for="c_z">Zona de La Calera</label><select class="in" id="c_z"><option value="">Otra o no aplica</option>'+Z.map(function(z){return '<option value="'+z.id+'">'+esc(z.n)+'</option>'}).join('')+'</select></div><div><label for="c_b">Barrio o calle</label><input class="in" id="c_b"></div><div><label for="c_t">Tema principal</label><select class="in" id="c_t"><option>Agua</option><option>Peaje</option><option>Salud</option><option>Calles y desagües</option><option>Seguridad</option><option>Otro</option></select></div><div><label for="c_k">Temperatura</label><select class="in" id="c_k"><option value="1">1 en contra</option><option value="2">2 inclinado en contra</option><option value="3" selected>3 indeciso</option><option value="4">4 inclinado a favor</option><option value="5">5 voto seguro</option></select></div><div><label for="c_w">WhatsApp</label><input class="in" id="c_w" inputmode="tel"></div><div><button class="btn pri" type="submit">Agregar contacto</button></div></form></div>';
 var byM={};L.forEach(function(c){var a=byM[c.m]=byM[c.m]||[0,0,0,0,0];a[c.k-1]++});
 var zs=Z.map(function(z){var n=[0,0,0,0,0];L.forEach(function(c){if(c.m==='La Calera'&&c.z===z.id)n[c.k-1]++});return {z:z,n:n}});
 h+='<div class="sec"><h2>Resumen</h2><p>Total: <b>'+L.length+'</b> contactos. La barra va de en contra (rojo) a voto seguro (verde).</p><div class="grid g2"><div class="card"><h2>Por municipio</h2>'+(Object.keys(byM).length?'<div class="tw"><table><thead><tr><th>Municipio</th><th>Contactos</th><th>Temperatura</th></tr></thead><tbody>'+Object.keys(byM).sort().map(function(m){var n=byM[m];return '<tr><td>'+esc(m)+'</td><td>'+n.reduce(function(a,b){return a+b},0)+'</td><td>'+tbar(n)+'</td></tr>'}).join('')+'</tbody></table></div>':'<span style="color:var(--mute)">Todavía no hay contactos.</span>')+'</div><div class="card"><h2>Zonas de La Calera</h2><div class="tw"><table><thead><tr><th>Zona</th><th>Contactos</th><th>Temperatura</th><th>Margen sugerido</th></tr></thead><tbody>'+zs.map(function(x){var N=x.n.reduce(function(a,b){return a+b},0),s=sugM(x.n);return '<tr><td>'+esc(x.z.n.split(',')[0].split(' (')[0])+'</td><td>'+N+'</td><td>'+tbar(x.n)+'</td><td>'+(s==null?'faltan datos':s)+'</td></tr>'}).join('')+'</tbody></table></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px"><button class="btn" id="capm">Actualizar margen de las zonas</button><span class="pc" id="cmsg"></span></div><p class="pc" style="margin:8px 0 0">El margen sugerido necesita al menos 5 contactos por zona. Sube cuando hay más indecisos e inclinados.</p></div></div></div>';
 if(DBX&&ISADMIN){var caps={};L.forEach(function(c){caps[c.cap]=(caps[c.cap]||0)+1});h+='<div class="sec"><h2>Por capitán</h2><div class="card">'+(Object.keys(caps).length?Object.keys(caps).map(function(k){return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line)"><span>'+esc(k)+'</span><b>'+caps[k]+'</b></div>'}).join(''):'<span style="color:var(--mute)">Todavía no hay contactos.</span>')+'</div></div>'}
 h+='<div class="sec"><h2>Mis contactos ('+mine.length+')</h2><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn" id="ccp">Copiar</button><button class="btn" id="cdl">Descargar CSV</button><button class="btn dng" id="cclr">Borrar mis contactos</button><span class="pc" id="cmsg2" style="align-self:center"></span></div><div class="gt"><div class="tw"><table><thead><tr><th>Nombre</th><th>Municipio</th><th>Zona o barrio</th><th>Tema</th><th>Temp.</th><th>WhatsApp</th><th></th></tr></thead><tbody>'+(mine.length?mine.slice().reverse().map(function(c){return '<tr><td>'+esc(c.n)+'</td><td>'+esc(c.m)+'</td><td>'+esc([zoneName(c.z).split(',')[0],c.b].filter(Boolean).join(' · '))+'</td><td>'+esc(c.t)+'</td><td><b style="color:'+TCOL[c.k]+'">'+c.k+'</b></td><td>'+esc(c.w)+'</td><td><button class="btn" data-cx="'+c.id+'" aria-label="Quitar">×</button></td></tr>'}).join(''):'<tr><td colspan="7" style="color:var(--mute)">Todavía no cargaste contactos.</td></tr>')+'</tbody></table></div></div></div>';
 host.innerHTML=h;
 $('cf').onsubmit=function(e){e.preventDefault();CAPN=$('c_cap').value.trim();MYCT.push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),n:$('c_n').value.trim(),m:$('c_m').value,z:$('c_z').value,b:$('c_b').value.trim(),t:$('c_t').value,k:+$('c_k').value,w:$('c_w').value.trim(),d:new Date().toISOString().slice(0,10)});persist('ct');renderCon();renderEst();var n=$('c_n');if(n)n.focus()};
 $('c_cap').onchange=function(){CAPN=this.value.trim();persist('ct')};
 $('capm').onclick=function(){var k=0;zs.forEach(function(x){var s=sugM(x.n);if(s!=null){x.z.m=s;k++}});saveZ();retarget();$('cmsg').textContent=k?('Margen actualizado en '+k+' zonas'):'Todavía no hay zonas con 5 contactos o más'};
 host.querySelectorAll('[data-cx]').forEach(function(b){b.onclick=function(){MYCT=MYCT.filter(function(c){return c.id!==b.dataset.cx});persist('ct');renderCon();renderEst()}});
 var rows=function(){return [['Nombre','Municipio','Zona','Barrio','Tema','Temperatura','WhatsApp','Capitán','Fecha']].concat(mine.map(function(c){return [c.n,c.m,zoneName(c.z),c.b,c.t,c.k,c.w,CAPN,c.d||'']}))};
 $('ccp').onclick=function(){copyText(rows().map(function(r){return r.join('\t')}).join('\n'),$('cmsg2'))};
 $('cdl').onclick=function(){saveFile('contactos.csv',toCSV(rows()),$('cmsg2'))};
 var arm=false;$('cclr').onclick=function(){var m=$('cmsg2');if(!arm){arm=true;m.textContent='Tocá otra vez para borrar todos tus contactos';return}MYCT=[];persist('ct');renderCon();renderEst()}}

/* ---------- elección: escenarios y fiscalización ---------- */
var V23=7725,P23=32.6,R23=31.09;
function renderEle(){
 var host=$('ele'),em=ESC.pad*ESC.par/100,need=em*ESC.obj/100,sec2=em*(R23+ESC.seg)/100;
 var h='<h1>Elección</h1><p class="lead">Cuántos votos hacen falta y quién cubre cada mesa. Los porcentajes son sobre votos emitidos, una aproximación hasta tener el escrutinio por mesa.</p>';
 h+='<div class="sec" style="margin-top:0"><h2>Escenarios de votos en La Calera</h2><p>Ajustá el padrón, la participación y la meta. En 2023 Rambaldi sacó 32,6 % (unos 7.725 votos), Morán 31,09 % y Facundo Rufeil 27,01 %.</p><div class="grid g2"><div class="card"><div class="rg"><label for="s_pad">Padrón de electores</label><b>'+fmt(ESC.pad)+'</b><input id="s_pad" data-f="pad" type="range" min="30000" max="45000" step="500" value="'+ESC.pad+'"></div><div class="rg"><label for="s_par">Participación</label><b>'+ESC.par+' %</b><input id="s_par" data-f="par" type="range" min="45" max="85" step="1" value="'+ESC.par+'"></div><div class="rg"><label for="s_obj">Meta de votos (porcentaje)</label><b>'+ESC.obj+' %</b><input id="s_obj" data-f="obj" type="range" min="28" max="50" step="0.5" value="'+ESC.obj+'"></div><div class="rg"><label for="s_seg">Colchón sobre el segundo si repite 31,09 %</label><b>'+ESC.seg+' pts</b><input id="s_seg" data-f="seg" type="range" min="0" max="8" step="0.5" value="'+ESC.seg+'"></div><p class="pc" style="margin:8px 0 0">La participación de 2023 no está cargada: el 64 % es una estimación a partir de los 7.725 votos y el 32,6 %.</p></div><div class="card"><h2>Resultado</h2><div class="kv" style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px"><span style="color:var(--mute)">Votos emitidos</span><b>'+fmt(em)+'</b><span style="color:var(--mute)">Votos para llegar al '+ESC.obj+' %</span><b>'+fmt(need)+'</b><span style="color:var(--mute)">Contra los 7.725 de 2023</span><b>'+(need>=V23?'+':'')+fmt(need-V23)+'</b><span style="color:var(--mute)">Votos con colchón de '+ESC.seg+' pts</span><b>'+fmt(sec2)+'</b><span style="color:var(--mute)">Votos por mesa (108 mesas)</span><b>'+Math.round(need/108)+'</b></div></div></div>';
 var pars=[55,60,65,70,75],objs=[33,35,37,40];
 h+='<div class="card" style="margin-top:14px"><h2>Votos necesarios según participación y meta</h2><div class="tw"><table><thead><tr><th>Participación</th>'+objs.map(function(o){return '<th>'+o+' %</th>'}).join('')+'</tr></thead><tbody>'+pars.map(function(p){return '<tr><td>'+p+' %</td>'+objs.map(function(o){return '<td>'+fmt(ESC.pad*p/100*o/100)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></div>';
 var tz=Z.reduce(function(a,z){return a+z.e},0);
 h+='<div class="card" style="margin-top:14px"><h2>Cuántos votos hay que sacar en cada zona</h2><p class="pc" style="margin-top:0">Reparto proporcional al padrón estimado de cada zona, para la meta elegida. Sirve como referencia, no como pronóstico.</p>'+hbar(Z.map(function(z){return {l:z.n,v:need*z.e/tz,c:z.c==='C'?'var(--sindato)':'var(--abierta)',hl:true}}),function(v){return fmt(v)})+'</div></div>';
 // fiscalización
 var ms=Object.keys(SCH).length?['La Calera'].concat(D.map(function(d){return d.n}).filter(function(n){return n!=='La Calera'&&sch(n).length})):['La Calera'];
 var fm=window.__fm||'La Calera';if(ms.indexOf(fm)<0)fm='La Calera';
 var rows=FISC[fm]||sch(fm).map(function(s){return {n:s.n,me:s.me,as:0,su:0,fg:''}});
 var tm=rows.reduce(function(a,r){return a+r.me},0),ta=rows.reduce(function(a,r){return a+r.as},0),ts=rows.reduce(function(a,r){return a+r.su},0);
 h+='<div class="sec"><h2>Fiscalización de mesas</h2><p>Un fiscal por mesa más suplentes. Las escuelas y mesas vienen del archivo de la Cámara Electoral, de una elección anterior a 2023: corregilas cuando tengas el listado actual.</p><div class="tb"><div><label for="fmun">Municipio</label><select class="in" id="fmun">'+ms.map(function(m){return '<option'+(m===fm?' selected':'')+'>'+esc(m)+'</option>'}).join('')+'</select></div><span class="pill">'+tm+' mesas · '+ta+' fiscales · '+ts+' suplentes</span><span class="pill" style="'+(tm-ta>0?'color:var(--cerrada)':'')+'">'+(tm-ta>0?'faltan '+(tm-ta)+' fiscales':'cobertura completa')+'</span></div><div class="gt"><div class="tw"><table><thead><tr><th>Escuela</th><th>Mesas</th><th>Fiscales de mesa</th><th>Suplentes</th><th>Fiscal general</th><th>Cobertura</th><th></th></tr></thead><tbody>'+rows.map(function(r,i){var p=r.me?Math.min(100,Math.round(r.as/r.me*100)):0;return '<tr><td>'+esc(r.n)+'</td><td><input class="in" style="width:70px" type="number" min="0" data-r="'+i+'" data-f="me" value="'+r.me+'" aria-label="Mesas"></td><td><input class="in" style="width:70px" type="number" min="0" data-r="'+i+'" data-f="as" value="'+r.as+'" aria-label="Fiscales de mesa"></td><td><input class="in" style="width:70px" type="number" min="0" data-r="'+i+'" data-f="su" value="'+r.su+'" aria-label="Suplentes"></td><td><input class="in" style="min-width:120px" data-r="'+i+'" data-f="fg" value="'+esc(r.fg)+'" aria-label="Fiscal general"></td><td style="min-width:110px"><div class="bar"><i style="width:'+p+'%;background:'+(p>=100?'var(--ok)':'var(--abierta)')+'"></i></div><small>'+p+' %</small></td><td><button class="btn" data-rx="'+i+'" aria-label="Quitar">×</button></td></tr>'}).join('')+'</tbody></table></div></div><div class="fm" style="margin-top:10px"><div><label for="fn">Agregar escuela</label><input class="in" id="fn"></div><div><label for="fme">Mesas</label><input class="in" id="fme" type="number" min="1" value="10"></div><div><button class="btn pri" id="fadd">Agregar</button></div></div></div>';
 host.innerHTML=h;
 host.querySelectorAll('input[data-f]').forEach(function(i){if(!i.dataset.r)i.oninput=function(){ESC[i.dataset.f]=+i.value;persist('misc');renderEle()}});
 var sv=function(){FISC[fm]=rows;persist('plan')};
 host.querySelectorAll('input[data-r]').forEach(function(i){i.onchange=function(){var r=rows[+i.dataset.r];r[i.dataset.f]=i.dataset.f==='fg'?i.value.trim():Math.max(0,+i.value||0);sv();renderEle()}});
 host.querySelectorAll('[data-rx]').forEach(function(b){b.onclick=function(){rows.splice(+b.dataset.rx,1);sv();renderEle()}});
 $('fadd').onclick=function(){var n=$('fn').value.trim();if(!n)return;rows.push({n:n,me:Math.max(1,+$('fme').value||1),as:0,su:0,fg:''});sv();renderEle()};
 $('fmun').onchange=function(){window.__fm=this.value;renderEle()}}

/* ---------- presupuesto ---------- */
function renderPre(){
 var host=$('pre'),tot=ACT.reduce(function(a,x){return a+(x.c||0)},0),done=ACT.filter(function(x){return x.e==='hecho'}).reduce(function(a,x){return a+(x.c||0)},0);
 function by(f){var o={};ACT.forEach(function(a){if(a.c){var k=f(a);o[k]=(o[k]||0)+a.c}});return o}
 var bt=by(function(a){return a.tipo}),bm=by(function(a){return a.m}),bf=by(function(a){var n=FASE[a.tipo];return n?'Fase '+n:'Transversal'});
 var need=ESC.pad*ESC.par/100*ESC.obj/100,gap=Math.max(0,need-V23);
 var h='<h1>Presupuesto</h1><p class="lead">Cuánto cuesta lo que estamos planificando. El costo se carga en cada actividad. Son estimaciones del equipo: no están validadas contra topes legales de gasto de campaña, que conviene confirmar.</p>';
 h+='<div class="grid g3"><div class="card"><h2>Total estimado</h2><div class="big">'+money(tot)+'</div><p class="pc" style="margin:6px 0 0">'+ACT.filter(function(a){return a.c}).length+' de '+ACT.length+' actividades con costo cargado.</p></div><div class="card"><h2>Ya ejecutado</h2><div class="big">'+money(done)+'</div><p class="pc" style="margin:6px 0 0">Suma de las actividades marcadas como hechas.</p></div><div class="card"><h2>Costo por voto</h2><div class="big">'+(tot&&need?money(tot/need):'—')+'</div><p class="pc" style="margin:6px 0 0">Total dividido por los '+fmt(need)+' votos de la meta del '+ESC.obj+' % (pestaña Elección).'+(tot&&gap?' Por voto a sumar sobre 2023: '+money(tot/gap)+'.':'')+'</p></div></div>';
 h+='<div class="card" style="margin-top:14px"><div class="fm"><div><label for="tope">Fondos disponibles ($)</label><input class="in" id="tope" type="number" min="0" step="100000" value="'+(TOPE||0)+'"></div><div>'+(TOPE?'<div class="bar"><i style="width:'+Math.min(100,Math.round(tot/TOPE*100))+'%;background:'+(tot>TOPE?'var(--cerrada)':'var(--ok)')+'"></i></div><small>'+Math.round(tot/TOPE*100)+' % de los fondos'+(tot>TOPE?' · te pasás por '+money(tot-TOPE):' · quedan '+money(TOPE-tot)):'')+'</small></div></div></div>';
 function chart(o,col){var k=Object.keys(o).sort(function(a,b){return o[b]-o[a]});return k.length?hbar(k.map(function(x){return {l:x,v:o[x],c:col(x),hl:true}}),function(v){return money(v)}):'<span style="color:var(--mute)">Todavía no hay costos cargados.</span>'}
 h+='<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Por tipo de actividad</h2>'+chart(bt,function(k){return 'var(--'+TIPOS[k]+')'})+'</div><div class="card"><h2>Por municipio</h2>'+chart(bm,function(k){var d=dat(k);return d?'var(--'+d.k+')':'var(--sindato)'})+'</div><div class="card"><h2>Por fase</h2>'+chart(bf,function(){return 'var(--fuerte)'})+'</div><div class="card"><h2>Actividades más caras</h2>'+(ACT.filter(function(a){return a.c}).length?ACT.filter(function(a){return a.c}).sort(function(a,b){return b.c-a.c}).slice(0,6).map(function(a){return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--line)"><span>'+esc(a.t)+'</span><b style="white-space:nowrap">'+money(a.c)+'</b></div>'}).join(''):'<span style="color:var(--mute)">Todavía no hay costos cargados.</span>')+'</div></div>';
 host.innerHTML=h;
 $('tope').onchange=function(){TOPE=Math.max(0,+this.value||0);persist('misc');renderPre()}}

/* ---------- puntos en el mapa ---------- */
var PT_T={'Cartel':'t4','Evento':'t7','Punto de votación':'t1','Otro':'t2'};
function ptPanel(editId){
 var ed=$('ed'),p=editId?PTS.filter(function(x){return x.id===editId})[0]:null;
 ed.innerHTML='<h2 style="font:700 20px var(--fd);margin:0">Puntos en el mapa</h2><p class="pc" style="margin:0">Carteles, eventos o puntos de votación. Sin mapa de calles, se ubican por coordenadas: en Google Maps, clic derecho sobre el lugar y copiá los dos números.</p>'+
 '<div><label for="p_t">Tipo</label><select class="in" id="p_t">'+Object.keys(PT_T).map(function(k){return '<option'+(p&&p.t===k?' selected':'')+'>'+k+'</option>'}).join('')+'</select></div>'+
 '<div><label for="p_n">Nombre</label><input class="in" id="p_n" value="'+esc(p?p.n:'')+'"></div>'+
 '<div><label for="p_c">Coordenadas (latitud, longitud)</label><input class="in" id="p_c" placeholder="-31.3436, -64.3356" value="'+(p?p.lat+', '+p.lon:'')+'"></div>'+
 '<div><label for="p_nt">Nota</label><input class="in" id="p_nt" value="'+esc(p?p.nt:'')+'"></div><div id="p_err" class="warn" style="display:none;border-color:var(--cerrada)"></div>'+
 '<div class="acb"><button class="btn pri" id="p_ok">'+(p?'Guardar':'Agregar')+'</button><button class="btn" id="p_cx">Cerrar</button>'+(p?'<button class="btn dng" id="p_del">Eliminar</button>':'')+'</div>'+
 '<h3 style="font:700 12px var(--fd);text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin:10px 0 0">Cargados ('+PTS.length+')</h3>'+(PTS.length?PTS.map(function(x){return '<button class="btn" style="text-align:left" data-pe="'+x.id+'"><i class="dot" style="background:var(--'+PT_T[x.t]+')"></i> '+esc(x.n)+' <span class="pc">'+esc(x.t)+'</span></button>'}).join(''):'<span class="pc">Todavía no hay puntos.</span>')+
 '<div><label for="p_csv">Importar varios (una línea por punto: tipo;nombre;latitud;longitud)</label><textarea class="in" id="p_csv" rows="3"></textarea><button class="btn" id="p_imp" style="margin-top:6px">Importar</button></div>';
 ed.classList.add('open');
 var err=function(m){var e=$('p_err');e.textContent=m;e.style.display='block'};
 $('p_cx').onclick=function(){ed.classList.remove('open')};
 $('p_ok').onclick=function(){var n=$('p_n').value.trim(),c=$('p_c').value.match(/(-?\d+(?:\.\d+)?)[\s,;]+(-?\d+(?:\.\d+)?)/);
  if(!n){err('Escribí un nombre.');return}if(!c){err('Pegá las coordenadas como: -31.3436, -64.3356');return}
  var la=+c[1],lo=+c[2];if(la<-31.5||la>-30.8||lo<-64.5||lo>-63.9){err('Esas coordenadas quedan fuera del Departamento Colón.');return}
  var o=p||{id:'p'+Date.now().toString(36)};o.t=$('p_t').value;o.n=n;o.lat=la;o.lon=lo;o.nt=$('p_nt').value.trim();if(!p)PTS.push(o);persistPt(o);buildPins();ptPanel()};
 var dl=$('p_del');if(dl)dl.onclick=function(){var id=p.id;PTS=PTS.filter(function(x){return x.id!==id});persistDelPt(id);buildPins();ptPanel()};
 ed.querySelectorAll('[data-pe]').forEach(function(b){b.onclick=function(){ptPanel(b.dataset.pe)}});
 $('p_imp').onclick=function(){var k=0,bad=0;$('p_csv').value.split('\n').forEach(function(l){l=l.trim();if(!l)return;var s=l.split(';');var t=s[0].trim(),n=(s[1]||'').trim(),la=parseFloat(s[2]),lo=parseFloat(s[3]);if(!PT_T[t]||!n||isNaN(la)||isNaN(lo)||la<-31.5||la>-30.8||lo<-64.5||lo>-63.9){bad++;return}var o={id:'p'+Date.now().toString(36)+k,t:t,n:n,lat:la,lon:lo,nt:''};PTS.push(o);persistPt(o);k++});buildPins();ptPanel();var e=$('p_err');e.style.display='block';e.style.borderColor='var(--ok)';e.textContent=k+' puntos importados'+(bad?' · '+bad+' líneas con errores (revisá tipo y coordenadas)':'')}}

/* ---------- pins 3D ---------- */
var pinG=null,pinList=[],pinOn=true,LO0=-64.4523,LA1=-30.917,PK=0.8554759,PSC=1220.6258786686901;
function projPt(la,lo){return [(lo-LO0)*PK*PSC,(LA1-la)*PSC]}
function inRing(x,y,r){var c=false;for(var i=0,j=r.length-1;i<r.length;j=i++){var a=r[i],b=r[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function groupAt(x,y){for(var i=0;i<groups.length;i++){var g=groups[i];if(g.rings&&g.rings.some(function(r){return inRing(x,y,r)}))return g}return null}
function pinCol(t){var v=getComputedStyle(document.documentElement).getPropertyValue('--'+PT_T[t]).trim();return new THREE.Color(v||'#f5a742')}
function buildPins(){
 var n=$('ptn');if(n)n.textContent=PTS.length;
 if(!scene)return;
 if(pinG){scene.remove(pinG);pinG.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
 pinG=new THREE.Group();pinList=[];
 PTS.forEach(function(p){var xy=projPt(p.lat,p.lon),g=groupAt(xy[0],xy[1]);
  var col=pinCol(p.t),grp=new THREE.Group(),stem=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,22,6),new THREE.MeshLambertMaterial({color:0x222222})),ball=new THREE.Mesh(new THREE.SphereGeometry(5.5,16,12),new THREE.MeshLambertMaterial({color:col}));
  stem.position.y=11;ball.position.y=26;ball.userData.pt=p;grp.add(stem);grp.add(ball);
  grp.position.set(xy[0]-CX,0,xy[1]-CY);grp.userData={g:g,p:p};pinG.add(grp);pinList.push({grp:grp,ball:ball})});
 pinG.visible=pinOn;scene.add(pinG)}
function pinsUpdate(){pinList.forEach(function(q){var g=q.grp.userData.g;q.grp.position.y=g?g.cur:4})}
function pickPin(ev){if(!pinG||!pinOn||!pinList.length)return null;var r=cvs.getBoundingClientRect();ndc.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(pinList.map(function(q){return q.ball}),false);return h.length?h[0].object.userData.pt:null}
function wirePins(){
 var tg=$('ptg'),ed=$('pted');
 if(tg)tg.onclick=function(){pinOn=!pinOn;tg.setAttribute('aria-pressed',pinOn);if(pinG)pinG.visible=pinOn};
 if(ed)ed.onclick=function(){ptPanel()};
 cvs.addEventListener('pointermove',function(e){if(drag)return;var p=pickPin(e);if(p){var tip=$('tip'),r=stage.getBoundingClientRect();tip.style.display='block';tip.innerHTML='<b>'+esc(p.n)+'</b><br>'+esc(p.t)+(p.nt?'<br>'+esc(p.nt):'');tip.style.left=Math.min(e.clientX-r.left+14,r.width-250)+'px';tip.style.top=(e.clientY-r.top+14)+'px';cvs.style.cursor='pointer'}else cvs.style.cursor=''});
 cvs.addEventListener('pointerup',function(e){if(drag&&drag.moved>=6)return;var p=pickPin(e);if(p)ptPanel(p.id)},true)}
