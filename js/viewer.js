/* One viewer for the whole site: photos open large, videos play, private films show
   a request card. Prev/next arrows (and arrow keys, and swipes on photos) move through
   everything on the page; X, Esc or a click outside closes back to where you were. */
(function () {
  // tag what can be opened on this page
  document.querySelectorAll('.wall.wall-4 .polaroid').forEach(function (p) { if (!p.hasAttribute('data-view')) p.setAttribute('data-view', 'img'); });
  document.querySelectorAll('.reel').forEach(function (r) {
    if (r.hasAttribute('data-yt')) { r.setAttribute('data-view', 'yt'); r.setAttribute('data-id', r.getAttribute('data-yt')); }
    else if (r.hasAttribute('data-fb')) { r.setAttribute('data-view', 'fb'); }
    else if (r.hasAttribute('data-private')) { r.setAttribute('data-view', 'private'); }
  });
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));
  if (!items.length) return;

  // build the viewer if the page doesn't have one
  var viewer = document.querySelector('.viewer');
  if (!viewer) {
    viewer = document.createElement('div'); viewer.className = 'viewer'; viewer.hidden = true;
    viewer.innerHTML = '<div class="viewer-box" role="dialog" aria-modal="true" aria-label="Viewer">' +
      '<button class="viewer-close" type="button" aria-label="Close">&times;</button><div class="viewer-frame"></div></div>';
    document.body.appendChild(viewer);
  }
  var box = viewer.querySelector('.viewer-box');
  var frame = viewer.querySelector('.viewer-frame');
  var closeBtn = viewer.querySelector('.viewer-close');
  var more = viewer.querySelector('.viewer-more');
  if (more) more.remove();
  var arrow = function (dir) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
  };
  var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'viewer-nav viewer-prev'; prev.setAttribute('aria-label', 'Previous'); prev.innerHTML = arrow(-1);
  var next = document.createElement('button'); next.type = 'button'; next.className = 'viewer-nav viewer-next'; next.setAttribute('aria-label', 'Next'); next.innerHTML = arrow(1);
  var bar = document.createElement('div'); bar.className = 'viewer-bar';
  bar.innerHTML = '<div class="viewer-cap"><strong></strong><span></span></div><div class="viewer-side"><span class="viewer-count"></span><a class="viewer-more"></a></div>';
  box.appendChild(bar); viewer.appendChild(prev); viewer.appendChild(next);
  if (items.length < 2) { prev.hidden = next.hidden = true; }

  var cur = -1, last = null;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(el, sel) { var n = el.querySelector(sel); return n ? n.textContent.trim() : ''; }


  // Facebook: a plain embed starts paused and muted. Their video SDK lets us press
  // play and turn the sound up once it's ready; if it can't load, fall back to the plain embed.
  var fbState = 0, fbQueue = [];
  function fbPlain(href, title) {
    frame.innerHTML = '<iframe src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(href) +
      '&show_text=false&autoplay=true" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }
  function fbLoad(cb) {
    if (fbState === 2) return cb(true);
    fbQueue.push(cb);
    if (fbState === 1) return;
    fbState = 1;
    var done = function (ok) { fbState = ok ? 2 : 0; var q = fbQueue; fbQueue = []; q.forEach(function (f) { f(ok); }); };
    var timer = setTimeout(function () { done(false); }, 5000);
    window.fbAsyncInit = function () {
      FB.init({ xfbml: false, version: 'v19.0' });
      FB.Event.subscribe('xfbml.ready', function (msg) {
        if (msg.type !== 'video') return;
        var pl = msg.instance;
        try { pl.unmute(); pl.setVolume(1); pl.play(); } catch (e) {}
      });
      clearTimeout(timer); done(true);
    };
    var sc = document.createElement('script');
    sc.async = true; sc.defer = true; sc.crossOrigin = 'anonymous';
    sc.src = 'https://connect.facebook.net/en_US/sdk.js';
    sc.onerror = function () { clearTimeout(timer); done(false); };
    document.body.appendChild(sc);
  }
  function fbEmbed(href, title) {
    var w = Math.round(frame.clientWidth || box.clientWidth || 960);
    frame.innerHTML = '<div class="fb-video" data-href="' + esc(href) + '" data-width="' + w + '" data-autoplay="true" data-show-text="false" data-allowfullscreen="true"></div>';
    fbLoad(function (ok) {
      if (!frame.querySelector('.fb-video')) return;   // moved on to another item
      if (ok && window.FB) FB.XFBML.parse(frame); else fbPlain(href, title);
    });
  }

  function show(i) {
    cur = (i + items.length) % items.length;
    var el = items[cur], kind = el.getAttribute('data-view');
    var img = el.querySelector('img');
    var title = el.getAttribute('data-title') || txt(el, '.reel-title') || txt(el, 'figcaption');
    var meta = txt(el, '.reel-meta');
    frame.className = 'viewer-frame';
    if (kind === 'img') {
      frame.classList.add('is-img');
      frame.innerHTML = '<img src="' + esc(el.getAttribute('data-src') || (img && img.getAttribute('src'))) + '" alt="' + esc(img && img.alt) + '">';
    } else if (kind === 'yt') {
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(el.getAttribute('data-id')) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    } else if (kind === 'fb') {
      frame.classList.add('fb');
      fbEmbed(el.getAttribute('data-fb'), title);
    } else if (kind === 'private') {
      frame.classList.add('is-private');
      frame.innerHTML = '<img src="' + esc(el.getAttribute('data-src') || (img && img.getAttribute('src'))) + '" alt="">' +
        '<div class="viewer-lock"><p>Private screening</p><h3>' + esc(title) + '</h3>' +
        '<a class="btn" href="get-in-touch.html?view=' + encodeURIComponent(title) + '">Request to view</a></div>';
    }
    bar.querySelector('strong').textContent = title;
    bar.querySelector('.viewer-cap span').textContent = meta;
    bar.querySelector('.viewer-count').textContent = items.length > 1 ? (cur + 1) + ' / ' + items.length : '';
    var m = (el.getAttribute('data-more') || '').split('|'), link = bar.querySelector('.viewer-more');
    if (m[0]) { link.href = m[0]; link.textContent = (m[1] || 'See more') + ' →'; link.hidden = false; } else { link.hidden = true; }
  }
  function open(i) {
    last = items[i]; show(i);
    viewer.hidden = false; document.body.classList.add('viewing'); closeBtn.focus();
  }
  function close() {
    frame.innerHTML = ''; viewer.hidden = true; document.body.classList.remove('viewing');
    if (last) { var f = last.querySelector('.reel-play') || last; f.focus({ preventScroll: true }); }
  }

  items.forEach(function (el, i) {
    var downAt = 0;
    if (!el.querySelector('.reel-play') && !el.hasAttribute('tabindex')) { el.tabIndex = 0; el.setAttribute('role', 'button'); }
    // on phones, press-and-hold shows the color; only a quick tap opens
    el.addEventListener('pointerdown', function () { downAt = Date.now(); });
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;           // e.g. "Request to view" goes straight to the form
      if (downAt && Date.now() - downAt > 400) return;
      open(i);
    });
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); open(i); }
    });
  });
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  closeBtn.addEventListener('click', close);
  viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });
  document.addEventListener('keydown', function (e) {
    if (viewer.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  // swipe left/right on photos (videos keep their own touch controls)
  var sx = null, sy = null;
  frame.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(cur + (dx < 0 ? 1 : -1));
  });
})();
