/* ---------- análisis a fondo por municipio ---------- */
var MUNV=null,MUNMODE='cob';
function squarify(items,x,y,w,h){
 /* items: [{v,...}] ordenados desc; devuelve rects [{it,x,y,w,h}] */
 var tot=items.reduce(function(a,i){return a+i.v},0),out=[];if(!tot||w<=0||h<=0)return out;
 var sc=w*h/tot,q=items.map(function(i){return {it:i,a:i.v*sc}});
 function worst(row,side){var s=row.reduce(function(a,r){return a+r.a},0),mx=Math.max.apply(null,row.map(function(r){return r.a})),mn=Math.min.apply(null,row.map(function(r){return r.a}));return Math.max(side*side*mx/(s*s),s*s/(side*side*mn))}
 function lay(row,x0,y0,w0,h0){var s=row.reduce(function(a,r){return a+r.a},0),horiz=w0>=h0;
  if(horiz){var cw=s/h0,cy=y0;row.forEach(function(r){var ch=r.a/cw;out.push({it:r.it,x:x0,y:cy,w:cw,h:ch});cy+=ch});return [x0+cw,y0,w0-cw,h0]}
  var rh=s/w0,cx=x0;row.forEach(function(r){var cw2=r.a/rh;out.push({it:r.it,x:cx,y:y0,w:cw2,h:rh});cx+=cw2});return [x0,y0+rh,w0,h0-rh]}
 var rect=[x,y,w,h],row=[];
 while(q.length){var side=Math.min(rect[2],rect[3]),n=q[0];
  if(!row.length||worst(row.concat([n]),side)<=worst(row,side)){row.push(q.shift())}
  else{rect=lay(row,rect[0],rect[1],rect[2],rect[3]);row=[]}}
 if(row.length)lay(row,rect[0],rect[1],rect[2],rect[3]);
 return out}
function tmSvg(items,W,H,colorOf,labelOf,subOf,attr,tipOf){tipOf=tipOf||function(){return ''};
 var r=squarify(items.slice().sort(function(a,b){return b.v-a.v}),0,0,W,H),s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block;max-width:'+W+'px" role="img">';
 r.forEach(function(q,i){var c=colorOf(q.it),dark=c.indexOf('var(')===0,tx=dark?'var(--fg)':'#0d1311',big=q.w>92&&q.h>44,mid=q.w>56&&q.h>30;
  s+='<g '+attr(q.it)+' tabindex="0" style="cursor:pointer"><title>'+esc(labelOf(q.it))+' · '+esc(subOf(q.it))+'</title><rect x="'+(q.x+1)+'" y="'+(q.y+1)+'" width="'+Math.max(0,q.w-2)+'" height="'+Math.max(0,q.h-2)+'" rx="4" style="fill:'+c+'"/>';
  if(mid){var fs=big?12:10.5,mx=Math.floor((q.w-12)/(fs*0.56));s+='<text x="'+(q.x+7)+'" y="'+(q.y+18)+'" font-size="'+fs+'" font-weight="700" style="fill:'+tx+'">'+esc(trunc(labelOf(q.it),mx))+'</text>';if(big)s+='<text x="'+(q.x+7)+'" y="'+(q.y+33)+'" font-size="10.5" style="fill:'+tx+';opacity:.8">'+esc(trunc(subOf(q.it),mx))+'</text>'}
  s+='</g>'});
 return s+'</svg>'}
function lerp(a,b,t){return a+(b-a)*t}
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function ramp(t,stops){t=Math.max(0,Math.min(1,t));var n=stops.length-1,i=Math.min(n-1,Math.floor(t*n)),f=t*n-i,a=hex(stops[i]),b=hex(stops[i+1]);return 'rgb('+[0,1,2].map(function(k){return Math.round(lerp(a[k],b[k],f))}).join(',')+')'}
var RAMP_TEMP=['#ff6455','#f5a742','#d8d36a','#7ccf9a','#2fb273'];
var RAMP_COB=['#ff6455','#f5a742','#2fb273'];
function circMap(name){
 var ps=POLY.filter(function(o){return o.m===name});if(!ps.length)return '<span style="color:var(--mute)">Sin circuitos cargados.</span>';
 var xs=[],ys=[];ps.forEach(function(o){ringsOf(o.d).forEach(function(r){r.forEach(function(p){xs.push(p[0]);ys.push(p[1])})})});
 var x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys),pad=10,W=x1-x0+2*pad,H=y1-y0+2*pad,mx=Math.max.apply(null,ps.map(function(o){return o.e}));
 var d=dat(name),col='var(--'+d.k+')';
 var s='<svg viewBox="'+(x0-pad)+' '+(y0-pad)+' '+W+' '+H+'" style="width:100%;height:auto;max-height:340px;display:block" role="img" aria-label="Circuitos electorales de '+esc(name)+'">';
 ps.forEach(function(o){s+='<path d="'+o.d+'" style="fill:'+col+';fill-opacity:'+(0.25+0.6*o.e/mx).toFixed(2)+';stroke:var(--fg);stroke-opacity:.5;stroke-width:'+(W/400).toFixed(2)+'"><title>'+esc(o.n)+': '+fmt(o.e)+' electores</title></path>'});
 ps.forEach(function(o){var rs=ringsOf(o.d).sort(function(a,b){return area(b)-area(a)})[0];if(!rs)return;var cx=0,cy=0;rs.forEach(function(p){cx+=p[0];cy+=p[1]});cx/=rs.length;cy/=rs.length;
  var fs=W/26;s+='<text x="'+cx+'" y="'+cy+'" text-anchor="middle" font-size="'+fs.toFixed(1)+'" font-weight="700" style="fill:var(--fg);paint-order:stroke;stroke:var(--bg);stroke-width:'+(fs/4).toFixed(1)+'px">'+esc(trunc(o.n.toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase()}),18))+'</text><text x="'+cx+'" y="'+(cy+fs*1.15)+'" text-anchor="middle" font-size="'+(fs*0.9).toFixed(1)+'" style="fill:var(--mute);paint-order:stroke;stroke:var(--bg);stroke-width:'+(fs/4).toFixed(1)+'px">'+fmt(o.e)+'</text>'});
 return s+'</svg>'}
function ctByZone(){var L=allContacts(),r={};Z.forEach(function(z){r[z.id]=[0,0,0,0,0]});L.forEach(function(c){if(c.m==='La Calera'&&r[c.z])r[c.z][c.k-1]++});return r}
function avgT(n){var N=n.reduce(function(a,b){return a+b},0);return N?n.reduce(function(a,v,i){return a+v*(i+1)},0)/N:null}
function legendRamp(stops,a,b){return '<div style="display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--mute);margin-top:6px"><span>'+a+'</span><i style="flex:0 0 120px;height:8px;border-radius:4px;background:linear-gradient(90deg,'+stops.join(',')+')"></i><span>'+b+'</span></div>'}

function eleCtx(name){
 var tot=E25.colon.lineas.filter(function(l){return !/^(Votos en blanco|Nulos)/.test(l[0])}).slice(0,6),pv=E25.cordoba.lineas;
 function short(n){return n.replace('ALIANZA ','').replace(/ - UNIDAD$/,'').toLowerCase().replace(/(^|\s)\S/g,function(c){return c.toUpperCase()})}
 var pm={};pv.forEach(function(l){pm[l[0]]=l[2]});
 var h='<div class="sec"><h2>Contexto electoral: 2025 nacional y 2023 municipal</h2><div class="warn" style="margin-bottom:10px">Los números de 2025 son del <b>Departamento Colón completo</b> (diputados nacionales), no de '+esc(name)+'. Muestran la tendencia de fondo, pero no distinguen un municipio de otro ni se pueden trasladar a una elección de intendente.</div><div class="grid g2"><div class="card"><h2>Colón vs Córdoba, 2025</h2><p class="pc" style="margin-top:0">% de votos positivos. Participación en Colón: '+E25.colon.part.toString().replace('.',',')+' % (provincia '+E25.cordoba.part.toString().replace('.',',')+' %).</p>'+hbar(tot.map(function(l){return {l:short(l[0]),v:l[2],c:'var(--fuerte)',hl:true}}),function(v){return v.toFixed(1).replace('.',',')+' %'})+'<div style="font-size:11.5px;color:var(--mute);margin:6px 0 4px">Mismas listas, toda la provincia</div>'+hbar(tot.map(function(l){return {l:short(l[0]),v:pm[l[0]]||0,c:'var(--sindato)',hl:false}}),function(v){return v.toFixed(1).replace('.',',')+' %'})+'</div>';
 if(name==='La Calera')h+='<div class="card"><h2>La Calera, intendente 2023</h2><p class="pc" style="margin-top:0">Tres listas entre 27 y 33 %: la elección local se define por margen corto.</p>'+hbar(E23.La_Calera.map(function(l){return {l:l[0],v:l[2],c:'var(--abierta)',hl:true}}),function(v){return v.toFixed(1).replace('.',',')+' %'})+'<p class="pc" style="margin:8px 0 0">Los 3 candidatos juntos suman 90,7 %: en lo local pesan las personas y las listas vecinales, no el voto nacional.</p></div>';
 else h+='<div class="card"><h2>Lectura</h2><p style="margin:0">En 2025 La Libertad Avanza sacó en Colón 2,4 puntos más que en la provincia (44,7 % contra 42,4 %), y Provincias Unidas y Defendamos Córdoba algo menos. La diferencia es chica: Colón se parece mucho al promedio provincial. En una elección municipal esa tendencia se filtra por los candidatos locales. Cuando carguemos los resultados por mesa, vamos a poder ver cuánto se parece cada municipio al promedio del departamento.</p></div>';
 return h+'</div></div>'}
function renderMun(name){
 if(name)MUNV=name;name=MUNV||'La Calera';var host=$('mun'),d=dat(name),o=mstate(name),ss=sch(name),fr=FISC[name]||ss.map(function(s){return {n:s.n,me:s.me,as:0,su:0,fg:''}});
 var fm={};fr.forEach(function(r){fm[r.n]=r});
 var me=ss.reduce(function(a,x){return a+x.me},0),el=ss.reduce(function(a,x){return a+x.e},0),top3=ss.slice().sort(function(a,b){return b.e-a.e}).slice(0,3),t3=top3.reduce(function(a,x){return a+x.e},0);
 var h='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn" id="mback">← Volver al mapa</button><select class="in" id="msel" aria-label="Municipio" style="width:auto">'+D.filter(function(x){return sch(x.n).length||POLY.some(function(p){return p.m===x.n})}).map(function(x){return '<option'+(x.n===name?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select></div>';
 h+='<h1 style="margin-top:12px">'+esc(name)+'</h1><p class="lead"><span class="tag" style="background:var(--'+d.k+');color:#0d1311">'+C[d.k]+'</span> '+esc(d.j)+'</p>';
 h+='<div class="grid g3"><div class="card"><h2>Electores (escuelas)</h2><div class="big">'+(el?fmt(el):'s/d')+'</div><p class="pc" style="margin:6px 0 0">'+ss.length+' escuelas · '+me+' mesas'+(me?' · '+Math.round(el/me)+' electores por mesa':'')+'</p></div><div class="card"><h2>Concentración</h2><div class="big">'+(el?Math.round(t3/el*100)+' %':'s/d')+'</div><p class="pc" style="margin:6px 0 0">de los electores votan en las 3 escuelas más grandes.</p></div><div class="card"><h2>Ganó en 2023</h2><div class="big" style="font-size:22px;line-height:1.2">'+esc(d.w)+'</div><p class="pc" style="margin:6px 0 0">'+esc(d.pc)+' · margen '+esc(d.m)+'</p></div></div>';
 h+='<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Circuitos electorales</h2>'+circMap(name)+'<p class="pc" style="margin:6px 0 0">Es el recorte más fino con mapa oficial. Intensidad = electores del circuito. Los barrios no tienen polígono público: se leen en las escuelas y, en La Calera, en las zonas.</p></div>';
 // treemap escuelas
 if(ss.length){
  var groups={};ss.forEach(function(s){var g=(s.d||'').trim();var k=/^\d|^av|^calle/i.test(g)?'Otros domicilios':g||'Sin dato';groups[k]=(groups[k]||0)+s.e});
  var cov=function(s){var r=fm[s.n];return r&&r.me?Math.min(1,r.as/r.me):0};
  var colorOf=MUNMODE==='cob'?function(s){return ramp(cov(s),RAMP_COB)}:function(s){return ramp(s.e/ss[0].e,['#6bb0e0','#c58af0','#f06fb0'])};
  var ssd=ss.map(function(s){return Object.assign({v:s.e},s)});
  h+='<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">Escuelas por electores</h2><div class="seg" role="group" aria-label="Color"><button class="btn'+(MUNMODE==='cob'?' pri':'')+'" data-mm="cob">Cobertura de fiscales</button><button class="btn'+(MUNMODE==='tam'?' pri':'')+'" data-mm="tam">Tamaño</button></div></div><div style="margin-top:8px">'+tmSvg(ssd,520,330,colorOf,function(s){return s.n},function(s){return fmt(s.e)+' electores · '+s.me+' mesas'},function(s){return 'data-sc="'+esc(s.n)+'"'},function(s){return 'Fiscales '+((fm[s.n]||{as:0}).as)+'/'+s.me})+'</div>'+(MUNMODE==='cob'?legendRamp(RAMP_COB,'sin fiscales','cobertura completa'):legendRamp(['#6bb0e0','#c58af0','#f06fb0'],'chica','grande'))+'<p class="pc" style="margin:6px 0 0">Superficie = electores. Cargá los fiscales en Elección → Fiscalización.</p></div>';
 } else h+='<div class="card"><h2>Escuelas</h2><span style="color:var(--mute)">No hay escuelas cargadas para este municipio.</span></div>';
 h+='</div>';
 // La Calera: zonas
 if(name==='La Calera'){
  var zc=zcalc(),ct=ctByZone(),need=ESC.pad*ESC.par/100*ESC.obj/100,tz=Z.reduce(function(a,z){return a+z.e},0);
  var zi=Z.map(function(z,i){var a=avgT(ct[z.id]);return Object.assign({v:z.e,avg:a,N:ct[z.id].reduce(function(x,y){return x+y},0),votos:need*z.e/tz,sc:(zc[i]||{}).p},z)});
  h+='<div class="sec"><h2>Zonas y barrios de La Calera</h2><p>Superficie = electores estimados de la zona. Color = temperatura promedio de los contactos de campo (1 en contra, 5 voto seguro); gris si todavía no hay contactos.</p><div class="grid g2"><div class="card">'+tmSvg(zi,520,330,function(z){return z.avg==null?'var(--line)':ramp((z.avg-1)/4,RAMP_TEMP)},function(z){return z.n.split(' (')[0].split(',')[0]},function(z){return fmt(z.e)+' electores'+(z.avg!=null?' · temp '+z.avg.toFixed(1):'')},function(z){return 'data-zc="'+z.id+'"'})+legendRamp(RAMP_TEMP,'en contra','voto seguro')+'</div><div class="card"><h2>Votos a sumar por zona</h2><p class="pc" style="margin-top:0">Para la meta del '+ESC.obj+' % ('+fmt(need)+' votos), repartida según el padrón de cada zona.</p>'+hbar(zi.map(function(z){return {l:z.n.split(' (')[0].split(',')[0],v:z.votos,c:'var(--fuerte)',hl:true}}),function(v){return fmt(v)})+'</div></div>';
  h+='<div class="gt" style="margin-top:12px"><div class="tw"><table><thead><tr><th>Zona (barrios)</th><th>Electores</th><th>Margen</th><th>Dificultad</th><th>Temas</th><th>Contactos</th><th>Temperatura</th><th>Votos meta</th></tr></thead><tbody>'+zi.map(function(z){return '<tr><td><b>'+esc(z.n.split(' (')[0])+'</b>'+(z.n.indexOf(' (')>0?'<br><small style="color:var(--mute)">'+esc(z.n.slice(z.n.indexOf('(')))+'</small>':'')+'</td><td>'+fmt(z.e)+'</td><td>'+z.m+'</td><td>'+z.d+'</td><td>'+esc(z.t.join(', '))+'</td><td>'+z.N+'</td><td>'+tbar(ct[z.id])+'</td><td>'+fmt(z.votos)+'</td></tr>'}).join('')+'</tbody></table></div></div></div>'}
 h+=eleCtx(name);
 // lectura
 var ins=[];
 if(ss.length){var big=ss[0];ins.push('La escuela más grande es '+big.n+' con '+fmt(big.e)+' electores ('+Math.round(big.e/el*100)+' % del municipio).');var sinf=fr.filter(function(r){return r.me&&r.as<r.me}).length;ins.push(sinf?('En '+sinf+' de '+fr.length+' escuelas todavía faltan fiscales de mesa.'):'Todas las escuelas tienen fiscales de mesa asignados.')}
 if(name==='La Calera'){var zz=Z.map(function(z){return Object.assign({a:avgT(ctByZone()[z.id])},z)}).filter(function(z){return z.a!=null}).sort(function(a,b){return a.a-b.a})[0];if(zz)ins.push('La zona con peor temperatura de campo es '+zz.n.split(' (')[0]+' ('+zz.a.toFixed(1)+' de 5).')}
 h+='<div class="sec"><h2>Qué mirar</h2><div class="card"><ul style="margin:0;padding-left:18px">'+ins.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul></div></div>';
 // tabla escuelas
 if(ss.length)h+='<div class="sec"><h2>Detalle por escuela</h2><div class="gt"><div class="tw"><table><thead><tr><th>Escuela</th><th>Zona o domicilio</th><th>Mesas</th><th>Electores</th><th>% del total</th><th>Fiscales</th></tr></thead><tbody>'+ss.map(function(s){var r=fm[s.n]||{as:0};return '<tr id="sr-'+esc(s.n).replace(/\W/g,'')+'"><td>'+esc(s.n)+'</td><td>'+esc(s.d)+'</td><td>'+s.me+'</td><td>'+fmt(s.e)+'</td><td><div class="bar" style="min-width:70px"><i style="width:'+Math.round(s.e/ss[0].e*100)+'%"></i></div><small>'+(s.e/el*100).toFixed(1)+' %</small></td><td>'+r.as+'/'+s.me+'</td></tr>'}).join('')+'</tbody></table></div></div></div>';
 host.innerHTML=h;
 $('mback').onclick=function(){setView('mapa')};
 $('msel').onchange=function(){renderMun(this.value);select(this.value)};
 host.querySelectorAll('[data-mm]').forEach(function(b){b.onclick=function(){MUNMODE=b.dataset.mm;renderMun()}});
 host.querySelectorAll('[data-sc]').forEach(function(g){var go=function(){var r=document.getElementById('sr-'+g.dataset.sc.replace(/\W/g,''));if(r){r.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});r.style.outline='2px solid var(--abierta)';setTimeout(function(){r.style.outline=''},1600)}};g.onclick=go;g.onkeydown=function(e){if(e.key==='Enter')go()}});
 host.querySelectorAll('[data-zc]').forEach(function(g){g.onclick=function(){zsel=g.dataset.zc;select('La Calera');drawerTab='Zonas';setView('mapa');drawer()}})}
