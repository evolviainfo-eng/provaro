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

  /* ── THE WIPE — scroll scrubs the sofa clean ───────── */
  var wipe = document.querySelector('.wipe');
  var wipePo = wipe && wipe.querySelector('.wipe__po');
  var wipeEdge = wipe && wipe.querySelector('.wipe__edge');
  var tagPries = wipe && wipe.querySelector('.wipe__tag--pries');
  var phone = window.matchMedia('(max-width: 880px)');

  function scrub() {
    if (!wipe) return;
    if (phone.matches || reduce) { wipePo.style.clipPath = ''; wipeEdge.style.left = ''; if (tagPries) tagPries.style.opacity = ''; return; }
    var vh = window.innerHeight || 800;
    var r = wipe.getBoundingClientRect();
    var total = wipe.offsetHeight - vh;
    if (total <= 0) return;
    var p = Math.min(1, Math.max(0, -r.top / total));
    /* ease the middle so the edge lingers where the eye compares */
    var x = (1 - p) * 100;
    wipePo.style.clipPath = 'inset(0 0 0 ' + x.toFixed(2) + '%)';
    wipeEdge.style.left = x.toFixed(2) + '%';
    /* once the frame is fully cleaned the "before" label is no longer true */
    if (tagPries) tagPries.style.opacity = Math.max(0, Math.min(1, (0.94 - p) / 0.18)).toFixed(3);
  }

  var playedOnce = false;
  function wipeMobile() {
    if (!wipe || !phone.matches || playedOnce) return;
    var r = wipe.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    if (r.top < vh * 0.6 && r.bottom > 0) {
      playedOnce = true;
      if (reduce) { wipePo.style.clipPath = 'inset(0 0 0 0)'; if (wipeEdge) wipeEdge.style.opacity = 0; }
      else wipe.classList.add('is-played');
    }
  }
  /* No-JS fallback is the CSS 50/50 split — honest and readable. */

  /* Tap replays the mobile wipe */
  if (wipe) wipe.addEventListener('click', function () {
    if (!phone.matches || reduce) return;
    wipe.classList.remove('is-played');
    void wipe.offsetWidth;
    wipe.classList.add('is-played');
  });

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
    scrub();
    wipeMobile();
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

  /* ── inquiry form ──────────────────────────────────── */
  var form = document.getElementById('uzklausa');
  if (!form) return;
  var sent = document.getElementById('sent');
  var body = document.getElementById('sent-body');

  var FIELDS = [
    { id: 'f-vardas', err: 'e-vardas' },
    { id: 'f-kont', err: 'e-kont' },
    { id: 'f-zinute', err: 'e-zinute' }
  ];

  function validate(f) {
    var input = document.getElementById(f.id);
    var msg = document.getElementById(f.err);
    var ok = input.value.trim().length >= (f.id === 'f-zinute' ? 6 : 2);
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

    var vardas = document.getElementById('f-vardas').value.trim();
    var kont = document.getElementById('f-kont').value.trim();
    var zinute = document.getElementById('f-zinute').value.trim();

    var text = 'Vardas: ' + vardas + '\nKontaktas: ' + kont + '\n\n' + zinute;

    body.textContent = text;
    form.hidden = true;
    sent.hidden = false;
    sent.focus();

    window.location.href = 'mailto:provaroplius@gmail.com'
      + '?subject=' + encodeURIComponent('Užklausa dėl valymo — ' + vardas)
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
