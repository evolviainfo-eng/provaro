/* PROVARO+ — deep and unhurried. Everything fails to visible. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Hide-for-reveal only once JS is known to be able to undo it. */
  if (!reduce && hasIO) root.classList.add('js');

  /* ── hero entrance ─────────────────────────────────── */
  var hero = document.getElementById('hero');
  function loadHero() {
    if (!hero || hero.classList.contains('is-loaded')) return;
    hero.classList.add('is-loaded');
    var h1 = hero.querySelector('.msk');
    if (h1) h1.classList.add('is-in');
  }
  if (root.classList.contains('js')) {
    var heroImg = hero && hero.querySelector('.hero__img');
    if (heroImg && heroImg.complete) setTimeout(loadHero, 120);
    else if (heroImg) {
      heroImg.addEventListener('load', function () { setTimeout(loadHero, 80); });
      heroImg.addEventListener('error', loadHero);
    }
    setTimeout(loadHero, 1400); /* watchdog — entrance never blocks the page */
  } else {
    loadHero();
  }

  /* ── scroll reveals ────────────────────────────────── */
  var items = [].slice.call(document.querySelectorAll('[data-rise],[data-bloom],[data-msk]'))
    .filter(function (el) { return !hero || !hero.contains(el); });

  function show(el, delay) {
    if (el.classList.contains('is-in')) return;
    if (delay) el.style.transitionDelay = delay + 'ms';
    el.classList.add('is-in');
    el.querySelectorAll && el.querySelectorAll('img').forEach && void 0;
  }

  if (root.classList.contains('js')) {
    var groups = new Map();
    items.forEach(function (el) {
      var key = el.closest('section') || document.body;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var peers = groups.get(el.closest('section') || document.body) || [];
        var i = peers.indexOf(el);
        show(el, Math.min(i, 5) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

    items.forEach(function (el) { io.observe(el); });

    /* Backstop for environments that never dispatch scroll/IO
       (hidden panes, headless): reveal only what is actually in view. */
    var ticks = 0;
    var beat = setInterval(function () {
      ticks++;
      var vh = window.innerHeight || 800;
      var left = 0;
      items.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        left++;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) { show(el, 0); io.unobserve(el); }
      });
      if (!left || ticks > 100) clearInterval(beat);
    }, 400);
  }

  /* ── nav reflects where you are ─────────────────────── */
  var navLinks = [].slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var targets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function spy() {
    var line = (window.scrollY || 0) + (window.innerHeight || 800) * 0.34;
    var best = -1;
    targets.forEach(function (t, i) {
      if (t && t.offsetTop <= line) best = i;
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('is-here', i === best); });
  }

  /* ── nav + callbar frame loop ──────────────────────── */
  var nav = document.getElementById('nav');
  var callbar = document.getElementById('callbar');
  var contact = document.getElementById('kontaktai');

  function frame() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('is-stuck', y > (window.innerHeight || 800) * 0.7);
    if (callbar) {
      var cTop = contact ? contact.getBoundingClientRect().top : 1e9;
      var on = y > 560 && cTop > (window.innerHeight || 800) * 0.9;
      callbar.classList.toggle('is-on', on);
      callbar.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    spy();
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { frame(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  /* scroll events are unreliable in embedded panes — a slow heartbeat keeps state true */
  setInterval(frame, 250);
  frame();

  /* ── structured inquiry ────────────────────────────── */
  var form = document.getElementById('uzklausa');
  if (!form) return;
  var sent = document.getElementById('sent');
  var body = document.getElementById('sent-body');
  var summaryEl = document.getElementById('summary-t');
  var dydis = document.getElementById('f-dydis');
  var dydisLabel = document.getElementById('l-dydis');

  var FIELDS = [
    { id: 'f-vardas', err: 'e-vardas' },
    { id: 'f-kont', err: 'e-kont' }
  ];

  function picked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  /* the unit follows the object — furniture is counted, rooms are measured */
  function unitFor(tipas) {
    return tipas === 'Minkšti baldai arba čiužinys'
      ? { label: 'Kiek vienetų', ph: 'pvz. sofa + 2 foteliai' }
      : { label: 'Plotas, m²', ph: 'pvz. 62' };
  }

  function summarise() {
    var tipas = picked('tipas');
    var u = unitFor(tipas);
    dydisLabel.textContent = u.label;
    dydis.placeholder = u.ph;

    var size = dydis.value.trim();
    var city = document.getElementById('f-miestas').value;
    var when = picked('kada');

    var parts = [tipas];
    if (size) parts.push(tipas === 'Minkšti baldai arba čiužinys' ? size : size + ' m²');
    parts.push(city);
    parts.push(when.toLowerCase());
    var line = parts.join(' · ');
    if (summaryEl) summaryEl.textContent = line;
    return line;
  }

  form.addEventListener('change', summarise);
  form.addEventListener('input', summarise);
  summarise();

  function validate(f) {
    var input = document.getElementById(f.id);
    var msg = document.getElementById(f.err);
    var ok = input.value.trim().length >= 2;
    input.closest('.field').classList.toggle('is-bad', !ok);
    msg.hidden = ok;
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  FIELDS.forEach(function (f) {
    var input = document.getElementById(f.id);
    input.addEventListener('blur', function () { if (input.value) validate(f); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('is-bad')) validate(f);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    FIELDS.forEach(function (f) {
      var good = validate(f);
      if (!good && !first) first = document.getElementById(f.id);
      ok = ok && good;
    });
    if (!ok) { first.focus(); return; }

    var tipas = picked('tipas');
    var size = dydis.value.trim();
    var text =
      'Ką valyti: ' + tipas + '\n' +
      (size ? (tipas === 'Minkšti baldai arba čiužinys' ? 'Kiekis: ' : 'Plotas: ') + size + '\n' : '') +
      'Miestas: ' + document.getElementById('f-miestas').value + '\n' +
      'Kada: ' + picked('kada') + '\n' +
      'Vardas: ' + document.getElementById('f-vardas').value.trim() + '\n' +
      'Kontaktas: ' + document.getElementById('f-kont').value.trim();
    var extra = document.getElementById('f-zinute').value.trim();
    if (extra) text += '\n\n' + extra;

    body.textContent = text;
    form.hidden = true;
    sent.hidden = false;
    sent.focus();

    window.location.href = 'mailto:provaroplius@gmail.com'
      + '?subject=' + encodeURIComponent('Užklausa dėl valymo — ' + tipas)
      + '&body=' + encodeURIComponent(text);
  });

  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var t = body.textContent;
    var done = function () {
      copy.textContent = 'Nukopijuota';
      setTimeout(function () { copy.textContent = 'Kopijuoti tekstą'; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done);
    else done();
  });
})();
