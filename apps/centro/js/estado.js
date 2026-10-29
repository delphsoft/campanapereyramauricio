var C={cerrada:'Disputa cerrada',abierta:'Fragmentada o abierta',fuerte:'Oficialismo fuerte',sindato:'Sin dato suficiente'};
var GR={'Agua de Oro':'El Manzano / Agua de Oro / Cerro Azul','El Manzano':'El Manzano / Agua de Oro / Cerro Azul','Villa Cerro Azul':'El Manzano / Agua de Oro / Cerro Azul','La Granja':'Ascochinga / La Granja (a confirmar)','Colonia Tirolesa':'Colonia Tirolesa y zona (a confirmar)'};
var ISS={'La Calera':['Agua (presión, fugas, tarifas)','Peaje Ruta E-55 / Av. Ejército Argentino','Salud (CAPS, tiempos de espera)','Calles y desagües']};
var Z=[
{id:'ind',n:'Industrial, Dr. Cocca, Altos, Los Prados',e:9000,c:'B',t:['agua','salud']},
{id:'cen',n:'Calera Central y Villa Los Paraísos',e:6500,c:'B',t:['agua','peaje','calles']},
{id:'cue',n:'Cuesta Colorada y cerrados del este',e:5500,c:'B',t:['peaje','agua']},
{id:'nor',n:'Casco norte (Maipú, 25 de Mayo, 9 de Julio, COVICO, La Isla)',e:5000,c:'B',t:['agua','salud']},
{id:'sto',n:'Stöcklin',e:4000,c:'B',t:['peaje']},
{id:'dum',n:'Dumesnil',e:3400,c:'B',t:['agua']},
{id:'cer',n:'Cerrados (La Estanzuela, La Cuesta, La Pankana)',e:3000,c:'B',t:['peaje','seguridad']},
{id:'diq',n:'El Diquecito y Casa Bamba',e:1200,c:'C',t:['agua']}];
Z.forEach(function(z){z.m=z.c==='C'?1:4;z.d=z.c==='C'?5:3});
var LEG_M='1 = casi nadie duda: el voto está definido, a favor o en contra.<br>3 = hay indecisos, pero hay que ir a buscarlos.<br>5 = muchos indecisos y elección ajustada: cada voto cuenta.';
var LEG_D='1 = barrio compacto, con contactos y fácil de recorrer.<br>3 = hay que armar equipo para cubrirlo.<br>5 = disperso, cerrado o adverso: cuesta mucho llegar.';
var LEG_T='Temperatura de campo: 1 = en contra, 2 = inclinado en contra, 3 = indeciso, 4 = inclinado a favor, 5 = voto seguro.';

/* ---------- utilidades ---------- */
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function fmt(n){return Math.round(n).toLocaleString('es-AR')}
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function cv(n){return getComputedStyle(document.documentElement).getPropertyValue('--'+n).trim()}
function dat(n){return D.filter(function(x){return x.n===n})[0]}
function sch(n){return SCH[GR[n]||n]||[]}
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- estado guardado ---------- */
var ST2=LS.get('cmd_muni',{}),ZS=LS.get('cmd_zonas',{}),KP=LS.get('cmd_kpi',null),ELDATE=LS.get('cmd_edate','');
Z.forEach(function(z){var s=ZS[z.id];if(s){z.m=s.m;z.d=s.d;z.e=s.e}});
function zobj(){var o={};Z.forEach(function(z){o[z.id]={m:z.m,d:z.d,e:z.e}});return o}
function saveZ(){persist('zonas')}
var CAND=LS.get('cmd_cand',{}),FISC=LS.get('cmd_fisc',{}),LINKS=LS.get('cmd_links',null),TOPE=LS.get('cmd_tope',0),ESC=LS.get('cmd_esc',{pad:37000,par:64,obj:35,seg:2}),PTS=LS.get('cmd_pts',[]),CAPN=LS.get('cmd_capn',''),MYCT=LS.get('cmd_ct',[]),ALLCT={};
if(!LINKS)LINKS=[{t:'Sitio público de campaña',u:'https://campanapereyramauricio.vercel.app'},{t:'Repositorio',u:'https://github.com/delphsoft/campanapereyramauricio'}];
function mstate(n){var o=ST2[n]=ST2[n]||{};var d=dat(n);if(o.m==null)o.m={cerrada:5,abierta:3,fuerte:1,sindato:2}[d.k];if(o.d==null)o.d=d.k==='fuerte'?4:3;if(!o.ck)o.ck={};if(!o.nt)o.nt='';return o}
function pop(d){var s=sch(d.n).reduce(function(a,x){return a+x.e},0);return d.p||s||3000}
function shares(){var L=D.map(function(d){var o=mstate(d.n);return {n:d.n,v:pop(d)*o.m/o.d}}),T=L.reduce(function(a,x){return a+x.v},0),r={};L.slice().sort(function(a,b){return b.v-a.v}).forEach(function(x,i){r[x.n]={p:T?x.v/T:0,rank:i+1}});return r}
function zcalc(){var s=Z.map(function(z){return z.e*z.m*(z.t.length>=2?3:2)/z.d}),T=s.reduce(function(a,b){return a+b},0);return Z.map(function(z,i){return {z:z,s:s[i],p:T?s[i]/T:0}})}

/* ---------- actividades ---------- */
var TIPOS={'Trámite':'t1','Datos':'t2','Reclutamiento':'t3','Escucha':'t4','Reunión':'t5','Comunicación':'t6','Evento':'t7','Evaluación':'t8'};
var FASE={'Trámite':1,'Datos':1,'Reclutamiento':2,'Escucha':3,'Reunión':3,'Comunicación':4,'Evento':5};
var ESTADOS={pend:'Pendiente',curso:'En curso',hecho:'Hecho'};
function seed(){return [
 {t:'Pedir a la Junta Electoral Municipal el listado de escuelas y mesas 2023',tipo:'Trámite',m:'La Calera',s:'2026-11-02',f:'2026-11-06',r:'',e:'pend',n:'Punto 5 del documento de trabajo.'},
 {t:'Pedir el escrutinio 2023 por mesa y por lista',tipo:'Trámite',m:'Todos',s:'2026-11-09',f:'2026-11-13',r:'',e:'pend',n:''},
 {t:'Confirmar el calendario electoral de cada municipio',tipo:'Trámite',m:'Todos',s:'2026-11-16',f:'2026-11-20',r:'',e:'pend',n:'La fecha 2027 todavía no está confirmada.'},
 {t:'Planilla de contactos con temperatura 1 a 5 lista',tipo:'Datos',m:'La Calera',s:'2026-11-02',f:'2026-11-09',r:'',e:'curso',n:''},
 {t:'Relevar resultados 2023 por lista en Unquillo',tipo:'Datos',m:'Unquillo',s:'2026-11-23',f:'2026-11-27',r:'',e:'pend',n:''},
 {t:'Reclutar 8 a 15 capitanes de barrio',tipo:'Reclutamiento',m:'La Calera',s:'2026-11-02',f:'2027-01-29',r:'',e:'curso',n:'Gente con red real en cada zona B.'},
 {t:'Escucha puerta a puerta: Industrial, Dr. Cocca, Altos, Los Prados',tipo:'Escucha',m:'La Calera',s:'2026-11-16',f:'2026-12-18',r:'',e:'pend',n:'Zona 1 por esfuerzo.'},
 {t:'Escucha puerta a puerta: Calera Central y Villa Los Paraísos',tipo:'Escucha',m:'La Calera',s:'2026-12-01',f:'2027-01-15',r:'',e:'pend',n:'Zona 2 por esfuerzo.'},
 {t:'Reunión chica por agua (presión y fugas)',tipo:'Reunión',m:'La Calera',s:'2026-12-03',f:'2026-12-03',r:'',e:'pend',n:''},
 {t:'Explorar frente con espacios vecinales',tipo:'Reunión',m:'Mendiolaza',s:'2026-12-10',f:'2026-12-10',r:'',e:'pend',n:'Se definió por 22 votos en 2023.'},
 {t:'Definir 3 a 5 propuestas de 100 días por zona',tipo:'Comunicación',m:'La Calera',s:'2027-01-18',f:'2027-02-26',r:'',e:'pend',n:''},
 {t:'Revisión mensual de resultados del scoring de campo',tipo:'Evaluación',m:'Todos',s:'2026-12-01',f:'2026-12-01',r:'',e:'pend',n:'Repetir el primer lunes de cada mes.'}
].map(function(a,i){a.id='s'+i;a.sug=1;return a})}
var ACT=LS.get('cmd_acts',null);if(!ACT){ACT=seed();LS.set('cmd_acts',ACT)}
function dms(iso){var p=String(iso||'').split('-');if(p.length!==3)return NaN;return Date.UTC(+p[0],+p[1]-1,+p[2])}
function pendFor(n){return ACT.filter(function(a){return a.e!=='hecho'&&(a.m===n)}).length}
