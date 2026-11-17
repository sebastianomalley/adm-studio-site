/* Homepage "Recent work": open a photo, play a video, or show a private-screening
   card in a viewer, then close back to the homepage. */
(function () {
  var viewer = document.querySelector('.viewer');
  if (!viewer) return;
  var frame = viewer.querySelector('.viewer-frame');
  var more = viewer.querySelector('.viewer-more');
  var closeBtn = viewer.querySelector('.viewer-close');
  var last = null;

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function open(el) {
    last = el;
    var kind = el.getAttribute('data-view');
    frame.className = 'viewer-frame';
    if (kind === 'img') {
      frame.classList.add('is-img');
      frame.innerHTML = '<img src="' + esc(el.getAttribute('data-src')) + '" alt="' + esc(el.querySelector('img').alt) + '">';
    } else if (kind === 'yt') {
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(el.getAttribute('data-id')) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Video player" ' +
        'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    } else if (kind === 'private') {
      var title = el.getAttribute('data-title');
      frame.classList.add('is-private');
      frame.innerHTML = '<img src="' + esc(el.getAttribute('data-src')) + '" alt="">' +
        '<div class="viewer-lock"><p>Private screening</p><h3>' + esc(title) + '</h3>' +
        '<a class="btn" href="get-in-touch.html?view=' + encodeURIComponent(title) + '">Request to view</a></div>';
    }
    var m = (el.getAttribute('data-more') || '').split('|');
    more.href = m[0] || 'film.html'; more.textContent = (m[1] || 'See more') + ' →';
    viewer.hidden = false; document.body.classList.add('viewing'); closeBtn.focus();
  }
  function close() {
    frame.innerHTML = ''; viewer.hidden = true; document.body.classList.remove('viewing');
    if (last) last.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-view]').forEach(function (el) {
    var downAt = 0;
    // on phones, press-and-hold shows the color; only a quick tap opens the viewer
    el.addEventListener('pointerdown', function () { downAt = Date.now(); });
    el.addEventListener('click', function () { if (Date.now() - downAt < 400 || !downAt) open(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
  });
  closeBtn.addEventListener('click', close);
  viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !viewer.hidden) close(); });
})();
