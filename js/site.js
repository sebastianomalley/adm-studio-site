/* A Digital Media Studio: site script (2026 redesign).
   Plain JS, no libraries. Every page loads this one file. */

// ---------- settings you can edit ----------
// Paste the full Vimeo or YouTube link to your reel here, for example
// 'https://vimeo.com/123456789' or 'https://www.youtube.com/watch?v=abc123'
var REEL_URL = '';

// Email shown if the form fails to send
var STUDIO_EMAIL = 'adigitalmediastudio@gmail.com';

(function () {
  'use strict';

  // ---------- mobile menu ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---------- media slots: hide the placeholder once a real file loads ----------
  document.querySelectorAll('.slot img').forEach(function (img) {
    var slot = img.closest('.slot');
    function ok() { if (img.naturalWidth) slot.classList.add('has-media'); }
    if (img.complete) { if (img.naturalWidth) ok(); else img.remove(); }
    img.addEventListener('load', ok);
    img.addEventListener('error', function () { img.remove(); });
  });

  // ---------- reel: swaps the placeholder for the video when clicked ----------
  var play = document.querySelector('[data-reel]');
  if (play) {
    if (!REEL_URL) {
      play.setAttribute('aria-disabled', 'true');
    }
    play.addEventListener('click', function () {
      var src = embedUrl(REEL_URL);
      if (!src) return;
      var slot = play.closest('.slot');
      slot.innerHTML = '<iframe src="' + src + '" title="Studio reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      slot.classList.add('has-media');
    });
  }
  function embedUrl(url) {
    var m;
    if (!url) return '';
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1&title=0&byline=0&portrait=0';
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0';
    return '';
  }

  // ---------- contact form (Web3Forms) ----------
  var form = document.getElementById('contactForm');
  if (form) {
    var prompts = {
      photo: 'What kind of shoot, and roughly when?',
      video: 'What is the video for, and when do you need it?',
      web: 'What are you working on? Add a few times that work for a call.',
      ongoing: 'What does a typical month look like for you?'
    };
    var subjects = {
      photo: 'Photo session request',
      video: 'Video inquiry',
      web: 'Website or app inquiry',
      ongoing: 'Ongoing support inquiry'
    };
    var label = document.getElementById('messageLabel');
    var subject = form.querySelector('input[name="subject"]');
    var status = document.getElementById('formStatus');
    var submit = form.querySelector('button[type="submit"]');
    var sent = document.getElementById('sentView');

    function setChoice(value) {
      if (label) label.textContent = prompts[value] || prompts.photo;
      if (subject) subject.value = (subjects[value] || 'New inquiry') + ' from adigitalmediastudio.com';
    }

    // ?need=web on the link preselects a choice (used by the buttons on each page)
    var want = new URLSearchParams(location.search).get('need');
    if (want && prompts[want]) {
      var radio = form.querySelector('input[name="need"][value="' + want + '"]');
      if (radio) radio.checked = true;
    }
    // ?view=Film%20Title (from a private video on the Work page) fills in a request
    var viewReq = new URLSearchParams(location.search).get('view');
    if (viewReq) {
      var vr = form.querySelector('input[name="need"][value="video"]');
      if (vr) vr.checked = true;
      var ta = form.querySelector('textarea[name="message"]');
      if (ta && !ta.value) ta.value = 'Hi! I\'d like to request access to view "' + viewReq.slice(0, 120) + '."';
    }
    var checked = form.querySelector('input[name="need"]:checked');
    setChoice(checked ? checked.value : 'photo');

    form.querySelectorAll('input[name="need"]').forEach(function (r) {
      r.addEventListener('change', function () { setChoice(r.value); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.textContent = '';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json.success) throw new Error(json.message || 'Failed');
          form.reset();
          form.hidden = true;
          sent.hidden = false;
          sent.querySelector('button').focus();
        })
        .catch(function () {
          status.textContent = 'Something went wrong. Email me directly at ' + STUDIO_EMAIL + '.';
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = 'Send message';
        });
    });

    var again = document.getElementById('sendAnother');
    if (again) {
      again.addEventListener('click', function () {
        sent.hidden = true;
        form.hidden = false;
        var c = form.querySelector('input[name="need"]:checked');
        setChoice(c ? c.value : 'photo');
      });
    }
  }

  // ---------- polaroids on touch screens ----------
  // Photos stay black and white. Pressing one lifts, straightens and colors it
  // (like the desktop hover) until you let go; a quick tap flashes it.
  if (window.matchMedia('(hover: none)').matches) {
    // Press to lift, let go to drop. A tiny delay means a finger that is
    // starting to scroll the page doesn't flick every photo it passes.
    document.querySelectorAll('.polaroid').forEach(function (p) {
      var t, settle, x0, y0, pressed = false, moved = false;
      function lift() { clearTimeout(settle); p.classList.add('lift'); }
      function drop() { clearTimeout(t); pressed = false; p.classList.remove('lift'); }
      p.addEventListener('pointerdown', function (e) {
        x0 = e.clientX; y0 = e.clientY; pressed = true; moved = false;
        t = setTimeout(lift, 70);
      });
      p.addEventListener('pointermove', function (e) {
        if (pressed && (Math.abs(e.clientX - x0) > 10 || Math.abs(e.clientY - y0) > 10)) { moved = true; drop(); }
      });
      p.addEventListener('pointerup', function () {
        // a quick tap still gets a short lift so it never feels dead
        if (pressed && !moved && !p.classList.contains('lift')) {
          clearTimeout(t); pressed = false; lift(); settle = setTimeout(drop, 650); return;
        }
        drop();
      });
      // touch fires pointerleave right after pointerup, so only react while a finger is down
      ['pointercancel', 'pointerleave'].forEach(function (ev) { p.addEventListener(ev, function () { if (pressed) drop(); }); });
      p.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
  }

  // ---------- keep the footer year current ----------
  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* ---------- testimonials carousel ---------- */
(function () {
  var box = document.querySelector('.testimonials');
  if (!box) return;
  var slides = box.querySelectorAll('.t-slide');
  var dots = box.querySelectorAll('.t-dot');
  // Each quote stays up long enough to read: about 4 words a second plus a
  // beat, never less than 6 seconds. Its dot fills over the same time.
  var times = Array.prototype.map.call(slides, function (s) {
    var words = s.querySelector('blockquote').textContent.trim().split(/\s+/).length;
    return Math.max(6000, Math.round(words / 4 * 1000 + 1500));
  });
  dots.forEach(function (d, n) { if (times[n]) d.style.setProperty('--t-time', times[n] + 'ms'); });
  slides.forEach(function (s, n) {
    if (times[n] > 12000) s.classList.add('t-long');
    if (times[n] > 40000) s.classList.add('t-xlong');   // 150+ words: a size smaller still
  });
  var cur = 0, timer = null, left = times[0], started = 0;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      s.classList.toggle('is-active', n === cur);
      s.setAttribute('aria-hidden', n === cur ? 'false' : 'true');
    });
    dots.forEach(function (d, n) {
      d.classList.remove('is-active');
      d.classList.toggle('done', n < cur);
      d.setAttribute('aria-current', n === cur ? 'true' : 'false');
    });
    void dots[cur].offsetWidth;          // restart the fill animation
    dots[cur].classList.add('is-active');
    left = times[cur]; run();
  }
  function run() {
    clearTimeout(timer);
    if (still || box.classList.contains('paused')) return;
    started = Date.now();
    timer = setTimeout(function () { show(cur + 1); }, left);
  }
  function pause() {
    if (box.classList.contains('paused')) return;
    box.classList.add('paused'); clearTimeout(timer);
    left = Math.max(0, left - (Date.now() - started));
  }
  function resume() { box.classList.remove('paused'); run(); }

  dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); }); });
  // Pause while a mouse is over the quotes, or while someone is tabbing through
  // the dots with a keyboard. A click or a phone tap should keep it running.
  if (window.matchMedia('(hover: hover)').matches) {
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pause(); });
    box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') resume(); });
  }
  box.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) pause(); });
  box.addEventListener('focusout', function () { if (!box.matches(':hover')) resume(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
  show(0);
})();
