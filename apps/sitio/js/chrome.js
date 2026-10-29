(function () {
  var C = window.CAMPANA || {};
  var links = [
    { href: 'index.html', label: 'Inicio' },
    { href: 'index.html#ejes', label: 'Propuesta' },
    { href: 'diagnostico-calera.html', label: 'Diagnóstico' },
    { href: 'salud.html', label: 'Salud' },
    { href: 'infraestructura.html', label: 'Obras' },
    { href: 'candidato.html', label: 'Mauricio' },
    { href: 'sumate.html', label: 'Sumate', cta: true }
  ];
  var more = [
    { href: 'seguridad-transito.html', label: 'Seguridad y tránsito' },
    { href: 'parque-35ha.html', label: 'Polo 35 ha' },
    { href: 'pilar1.html', label: 'Polo industrial' },
    { href: 'pilar2.html', label: 'Conocimiento' },
    { href: 'pilar3.html', label: 'Turismo' },
    { href: 'pilar4.html', label: 'Empleo joven' },
    { href: 'pilar5.html', label: 'PYME' },
    { href: 'programas-adicionales.html', label: 'Financiamiento' }
  ];

  function waUrl(text) {
    if (!C.whatsapp) return '';
    var t = text || 'Hola, quiero sumarme a la campaña de Mauricio Pereyra.';
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(t);
  }

  function skip() {
    if (document.querySelector('.site-skip')) return;
    var a = document.createElement('a');
    a.className = 'site-skip';
    a.href = '#ejes';
    a.textContent = 'Saltar al contenido';
    document.body.insertBefore(a, document.body.firstChild);
  }

  function drawer() {
    if (document.querySelector('.site-drawer')) return;
    var d = document.createElement('div');
    d.className = 'site-drawer';
    d.id = 'site-drawer';
    d.setAttribute('hidden', '');
    var html = '<nav aria-label="Menú de campaña"><button class="close" type="button" aria-label="Cerrar">×</button>';
    links.concat(more).forEach(function (l) {
      html += '<a href="' + l.href + '"' + (l.cta ? ' class="cta"' : '') + '>' + l.label + '</a>';
    });
    html += '</nav>';
    d.innerHTML = html;
    document.body.appendChild(d);
    function close() {
      d.classList.remove('open');
      d.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.classList.contains('close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.__openSiteMenu = function () {
      d.removeAttribute('hidden');
      d.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
  }

  function burger(nav) {
    if (!nav || nav.querySelector('.site-burger')) return;
    var b = document.createElement('button');
    b.className = 'site-burger';
    b.type = 'button';
    b.setAttribute('aria-label', 'Abrir menú');
    b.innerHTML = '<span></span><span></span><span></span>';
    b.addEventListener('click', function () {
      if (window.__openSiteMenu) window.__openSiteMenu();
    });
    nav.appendChild(b);
  }

  function deskCta(nav) {
    var list = nav && nav.querySelector('.nav-links');
    if (!list) return;
    if (list.querySelector('.site-nav-cta')) return;
    var li = document.createElement('li');
    li.innerHTML = '<a class="site-nav-cta" href="sumate.html">Sumate</a>';
    list.appendChild(li);
  }

  function innerNav(nav) {
    if (!nav || nav.querySelector('.nav-links') || nav.querySelector('.site-desk-links')) return;
    var ul = document.createElement('ul');
    ul.className = 'nav-links site-desk-links';
    ul.style.cssText = 'display:flex;gap:1.4rem;list-style:none;align-items:center;margin:0;padding:0';
    links.slice(1).forEach(function (l) {
      var li = document.createElement('li');
      if (l.cta) li.innerHTML = '<a class="site-nav-cta" href="' + l.href + '">' + l.label + '</a>';
      else {
        var a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        a.style.cssText = 'font-size:.82rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55);text-decoration:none';
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    var right = nav.querySelector('.nav-right');
    if (right) nav.insertBefore(ul, right);
    else nav.appendChild(ul);
  }

  function ctaBar() {
    if (/sumate\.html/i.test(location.pathname)) return;
    if (document.querySelector('.site-cta-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'site-cta-bar';
    var wa = waUrl();
    bar.innerHTML =
      '<a class="pri" href="sumate.html">Sumate a la campaña</a>' +
      (wa ? '<a class="wa" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a>' : '');
    document.body.appendChild(bar);
  }

  function footer() {
    var existing = document.querySelector('footer');
    var foot = document.createElement('footer');
    foot.className = 'site-foot';
    var social = '';
    if (C.instagram) social += '<a href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a>';
    if (C.facebook) social += '<a href="' + C.facebook + '" target="_blank" rel="noopener">Facebook</a>';
    if (C.x) social += '<a href="' + C.x + '" target="_blank" rel="noopener">X</a>';
    if (C.email) social += '<a href="mailto:' + C.email + '">' + C.email + '</a>';
    var wa = waUrl();
    if (wa) social += '<a href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a>';
    foot.innerHTML =
      '<div class="site-foot-inner">' +
      '<div><div class="brand">PEREYRA 2027</div><p>' + (C.name || 'Mauricio Pereyra') + ' · ' + (C.office || 'Candidato a Intendente') + ' · ' + (C.city || 'La Calera') + '</p>' + social + '</div>' +
      '<div><h3>Plataforma</h3><a href="index.html">Inicio</a><a href="index.html#ejes">Propuesta</a><a href="candidato.html">Mauricio</a><a href="diagnostico-calera.html">Diagnóstico</a><a href="sumate.html">Sumate</a></div>' +
      '<div><h3>Propuestas</h3><a href="salud.html">Salud</a><a href="infraestructura.html">Obras</a><a href="seguridad-transito.html">Seguridad</a><a href="pilar1.html">Economía</a><a href="privacidad.html">Privacidad</a></div>' +
      '<p class="copy">Sitio de campaña. Los datos que envíes se usan solo para contactarte sobre la campaña, con tu consentimiento. Ley 25.326.</p>' +
      '</div>';
    if (existing) existing.replaceWith(foot);
    else document.body.appendChild(foot);
  }

  skip();
  drawer();
  var nav = document.querySelector('nav');
  if (nav) {
    deskCta(nav);
    innerNav(nav);
    burger(nav);
  }
  ctaBar();
  footer();
})();
