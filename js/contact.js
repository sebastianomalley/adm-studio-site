/* Contact page motion.
   Plain JS, no libraries. If this file is removed or fails to load,
   the page still renders normally and the save link still works. */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var page = document.querySelector('.page');
  var content = document.querySelector('.content');

  /* ------------------------------------------------------------
     1. Hold the card until everything is ready, then show it all
        at once. Fonts, the headshot and the rest of the page load
        at different speeds; waiting on the slowest avoids pop-in.
     ------------------------------------------------------------ */
  function whenReady() {
    var jobs = [];

    if (document.fonts && document.fonts.ready) {
      jobs.push(document.fonts.ready.catch(function () {}));
    }

    Array.prototype.slice.call(document.images).forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      jobs.push(new Promise(function (done) {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }));
    });

    if (document.readyState !== 'complete') {
      jobs.push(new Promise(function (done) {
        window.addEventListener('load', done, { once: true });
      }));
    }

    /* never hold the card longer than 2s, even on a bad connection */
    var timeout = new Promise(function (done) { setTimeout(done, 2000); });
    return Promise.race([Promise.all(jobs), timeout]);
  }

  function showCard() {
    if (content) content.classList.add('in');
    var adm = document.querySelector('.adm');
    if (adm && !reduced) setTimeout(function () { adm.classList.add('lit'); }, 420);
    if (!reduced) {
      setTimeout(shootingStar, 900);
      setInterval(shootingStar, 9000);
    }
  }

  /* ---------- 2. Shooting star ---------- */
  function shootingStar() {
    if (reduced || !page || document.hidden) return;
    var s = document.createElement('i');
    s.className = 'star';
    s.style.top = (5 + Math.random() * 10) + '%';
    s.style.setProperty('--tx', (page.clientWidth + 240) + 'px');
    s.style.setProperty('--ty', Math.round(page.clientHeight * 0.34) + 'px');
    page.appendChild(s);
    requestAnimationFrame(function () { s.classList.add('go'); });
    setTimeout(function () { s.remove(); }, 1900);
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
          x: Math.random() * w, y: Math.random() * h,
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
      if (!document.hidden) {
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
      }
      requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    window.addEventListener('resize', function () { size(); seed(); });
  }

  /* ---------- 4. Save button ----------
     On iPhone, Apple shows its own contact preview after the tap,
     and the checkmark at the top of that preview closes it WITHOUT
     saving. No website can change that screen. So on Apple devices
     the button first opens a full-screen step that tells people
     exactly what to do, and the real download link lives inside it.
     Everywhere else the button downloads the contact directly. */
  function saveButton() {
    var btn = document.querySelector('.save');
    if (!btn) return;

    if (btn.parentNode && !btn.parentNode.classList.contains('save-wrap')) {
      var wrap = document.createElement('span');
      wrap.className = 'save-wrap';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
    }

    var gleam = document.createElement('span');
    gleam.className = 'gleam';
    btn.insertBefore(gleam, btn.firstChild);

    var isApple = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    function burst(el) {
      if (reduced) return;
      try {
        var colors = ['#16dce2', '#ff2184', '#f5b65f', '#ffffff'];
        for (var i = 0; i < 16; i++) {
          var p = document.createElement('i');
          var ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
          var dist = 46 + Math.random() * 54;
          p.className = 'burst';
          p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
          p.style.setProperty('--dy', (Math.sin(ang) * dist * 0.62).toFixed(1) + 'px');
          p.style.background = colors[i % colors.length];
          el.appendChild(p);
          (function (node) {
            requestAnimationFrame(function () { node.classList.add('go'); });
            setTimeout(function () { node.remove(); }, 950);
          })(p);
        }
      } catch (e) {}
    }

    if (!isApple) {
      btn.addEventListener('click', function () {
        setTimeout(function () { burst(btn); }, 0);
      }, { passive: true });
      return;
    }

    /* ---- the step screen, Apple devices only ---- */
    var href = btn.getAttribute('href');
    var step = document.createElement('div');
    step.className = 'step';
    step.setAttribute('role', 'dialog');
    step.setAttribute('aria-modal', 'true');
    step.setAttribute('aria-labelledby', 'stepTitle');
    step.innerHTML =
      '<div class="step-card">' +
        '<div class="step-tag" id="stepTag">One more step</div>' +
        '<h2 class="step-title" id="stepTitle">On the next screen,<br>scroll down and tap<br><span>Create New Contact</span></h2>' +
        '<div class="step-warn" id="stepWarn">' +
          '<span class="step-check" aria-hidden="true"></span>' +
          '<span>The <b>checkmark at the top</b> closes without saving.</span>' +
        '</div>' +
        '<a class="step-go" id="stepGo" href="' + href + '">Got it, save contact</a>' +
        '<button type="button" class="step-close" id="stepClose">Not now</button>' +
      '</div>';
    document.body.appendChild(step);

    var tag = step.querySelector('#stepTag');
    var title = step.querySelector('#stepTitle');
    var go = step.querySelector('#stepGo');
    var closeBtn = step.querySelector('#stepClose');
    var firstCopy = {
      tag: tag.innerHTML, title: title.innerHTML,
      go: go.innerHTML, close: closeBtn.innerHTML
    };

    function open() {
      tag.innerHTML = firstCopy.tag;
      title.innerHTML = firstCopy.title;
      go.innerHTML = firstCopy.go;
      closeBtn.innerHTML = firstCopy.close;
      step.classList.add('open');
      document.documentElement.classList.add('step-open');
      setTimeout(function () { go.focus({ preventScroll: true }); }, 50);
    }
    function close() {
      step.classList.remove('open');
      document.documentElement.classList.remove('step-open');
    }

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      burst(btn);
      open();
    });

    /* the real download: a plain link the person taps themselves.
       Once Apple's sheet is up, swap this screen to the "did it
       save?" version so it is waiting for them when they return. */
    go.addEventListener('click', function () {
      setTimeout(function () {
        tag.innerHTML = 'Did it save?';
        title.innerHTML = 'If you tapped the checkmark,<br>it <span>didn\u2019t save</span>.';
        go.innerHTML = 'Try again';
        closeBtn.innerHTML = 'It saved, all set';
      }, 800);
    }, { passive: true });

    closeBtn.addEventListener('click', close);
    step.addEventListener('click', function (ev) {
      if (ev.target === step) close();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') close();
    });
  }

  /* ------------------------------------------------------------
     5. Last-resort fit. The CSS sizes everything against the screen
        height, but on a very short screen (landscape, or an older
        small phone) the card can still run long. If it does, scale
        it down so the whole thing is visible without scrolling.
     ------------------------------------------------------------ */
  function fitToScreen() {
    if (!content || !page) return;
    content.style.transform = '';
    var cs = getComputedStyle(page);
    var available = page.clientHeight
      - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var needed = content.scrollHeight;
    if (needed > available && needed > 0) {
      var s = Math.max(available / needed, 0.7);
      content.style.transform = 'scale(' + s.toFixed(4) + ')';
    }
  }

  function init() {
    sparks();
    saveButton();
    whenReady().then(function () {
      fitToScreen();
      showCard();
    });
    window.addEventListener('resize', fitToScreen);
    window.addEventListener('orientationchange', function () {
      setTimeout(fitToScreen, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
