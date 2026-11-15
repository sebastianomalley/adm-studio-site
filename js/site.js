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

  // ---------- polaroids: on touch screens, reveal color once in view ----------
  if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.intersectionRatio > 0.7) { e.target.classList.add('seen'); pio.unobserve(e.target); }
      });
    }, { threshold: [0.7] });
    document.querySelectorAll('.polaroid.bw').forEach(function (p) { pio.observe(p); });
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
  var TIME = 6000, cur = 0, timer = null, left = TIME, started = 0;
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
    left = TIME; run();
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
  box.addEventListener('mouseenter', pause);
  box.addEventListener('mouseleave', resume);
  box.addEventListener('focusin', pause);
  box.addEventListener('focusout', resume);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
  show(0);
})();
