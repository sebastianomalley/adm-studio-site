/* Contact page motion.
   Plain JS, no libraries. Everything degrades to the static page
   if this file is removed or fails to load. */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Staggered entrance ---------- */
  var order = ['.adm', '.studio', '.brand-rule', '.tag', '.photo-ring',
               'h1', '.role', '.gold-rule', '.save', '.make', '.swash'];
  var items = [];
  order.forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) { el.classList.add('reveal'); items.push(el); }
  });

  function reveal() {
    items.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, reduced ? 0 : 90 + i * 115);
    });
    var adm = document.querySelector('.adm');
    if (adm && !reduced) setTimeout(function () { adm.classList.add('lit'); }, 500);
  }

  /* ---------- 2. Shooting star ---------- */
  var page = document.querySelector('.page');
  function shootingStar() {
    if (reduced || !page || document.hidden) return;
    var s = document.createElement('i');
    s.className = 'star';
    s.style.top = (4 + Math.random() * 12) + '%';
    page.appendChild(s);
    requestAnimationFrame(function () { s.classList.add('go'); });
    setTimeout(function () { s.remove(); }, 1800);
  }

  /* ---------- 3. Ambient sparks ---------- */
  function sparks() {
    if (reduced || !page) return;
    var c = document.createElement('canvas');
    c.className = 'sparks';
    page.insertBefore(c, page.firstChild);
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, dots = [];
    var tints = ['rgba(22,220,226,', 'rgba(245,182,95,', 'rgba(255,33,132,'];

    function size() {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      dots = [];
      var n = Math.round(Math.min(26, Math.max(14, w * h / 26000)));
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.7,
          vy: -(0.04 + Math.random() * 0.16),
          vx: (Math.random() - 0.5) * 0.06,
          a: 0.12 + Math.random() * 0.4,
          tw: Math.random() * Math.PI * 2,
          tint: tints[Math.floor(Math.random() * tints.length)]
        });
      }
    }
    function frame() {
      if (document.hidden) { return requestAnimationFrame(frame); }
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y += d.vy; d.x += d.vx; d.tw += 0.02;
        if (d.y < -6) { d.y = h + 6; d.x = Math.random() * w; }
        if (d.x < -6) d.x = w + 6;
        if (d.x > w + 6) d.x = -6;
        var alpha = d.a * (0.55 + 0.45 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.tint + alpha.toFixed(3) + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    window.addEventListener('resize', function () { size(); seed(); });
  }

  /* ---------- 4. Save button ---------- */
  function saveButton() {
    var btn = document.querySelector('.save');
    if (!btn) return;

    /* sweeping light */
    var gleam = document.createElement('span');
    gleam.className = 'gleam';
    btn.insertBefore(gleam, btn.firstChild);

    /* checkmark, hidden until tapped */
    var tick = document.createElement('span');
    tick.className = 'tick';
    btn.insertBefore(tick, btn.querySelector('.label') || null);

    btn.addEventListener('click', function () {
      /* the download itself is the link's normal behavior, untouched */
      if (!reduced) {
        var colors = ['#16dce2', '#ff2184', '#f5b65f', '#ffffff'];
        for (var i = 0; i < 16; i++) {
          var p = document.createElement('i');
          var ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
          var dist = 46 + Math.random() * 54;
          p.className = 'burst';
          p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
          p.style.setProperty('--dy', (Math.sin(ang) * dist * 0.62).toFixed(1) + 'px');
          p.style.background = colors[i % colors.length];
          btn.appendChild(p);
          (function (node) {
            requestAnimationFrame(function () { node.classList.add('go'); });
            setTimeout(function () { node.remove(); }, 950);
          })(p);
        }
      }
      var label = btn.querySelector('.label');
      var was = label ? label.textContent : '';
      btn.classList.add('saved');
      if (label) label.textContent = 'ADDED TO CONTACTS';
      setTimeout(function () {
        btn.classList.remove('saved');
        if (label) label.textContent = was;
      }, 4200);
    });
  }

  /* ---------- go ---------- */
  function init() {
    reveal();
    sparks();
    saveButton();
    if (!reduced) {
      setTimeout(shootingStar, 1400);
      setInterval(function () {
        if (Math.random() < 0.6) shootingStar();
      }, 11000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
