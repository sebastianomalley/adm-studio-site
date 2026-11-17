/* Work page: thumbnails, touch color, and the video player overlay */
(function () {
  var viewer = document.querySelector('.viewer');
  if (!viewer) return;
  var frame = viewer.querySelector('.viewer-frame');
  var closeBtn = viewer.querySelector('.viewer-close');
  var lastFocus = null;

  // YouTube thumbnails: use the big one, fall back if a video doesn't have it
  document.querySelectorAll('.reel[data-yt]').forEach(function (r) {
    var id = r.getAttribute('data-yt'), img = r.querySelector('.reel-thumb img');
    var fallback = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    // YouTube answers a missing big thumbnail with a tiny gray one, so check the size
    img.onload = function () {
      if (img.naturalWidth > 120) img.classList.add('ok');
      else if (img.src !== fallback) img.src = fallback;
    };
    img.onerror = function () { if (img.src !== fallback) img.src = fallback; };
    img.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
  });

  function open(id, btn) {
    lastFocus = btn;
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Video player" ' +
      'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    viewer.hidden = false; document.body.classList.add('viewing'); closeBtn.focus();
  }
  function close() {
    frame.innerHTML = ''; viewer.hidden = true; document.body.classList.remove('viewing');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.reel[data-yt] .reel-play').forEach(function (b) {
    b.addEventListener('click', function () { open(b.closest('.reel').getAttribute('data-yt'), b); });
  });

  // Facebook videos: <li class="reel" data-fb="https://www.facebook.com/.../videos/123"> with its own still in the img
  document.querySelectorAll('.reel[data-fb]').forEach(function (r) {
    var img = r.querySelector('.reel-thumb img');
    if (img) { if (img.complete && img.naturalWidth) img.classList.add('ok'); else img.onload = function () { img.classList.add('ok'); }; }
    r.querySelector('.reel-play').addEventListener('click', function () {
      lastFocus = this;
      frame.innerHTML = '<iframe src="https://www.facebook.com/plugins/video.php?href=' +
        encodeURIComponent(r.getAttribute('data-fb')) + '&show_text=false&autoplay=true" title="Video player" ' +
        'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      viewer.hidden = false; document.body.classList.add('viewing'); closeBtn.focus();
    });
  });
  closeBtn.addEventListener('click', close);
  viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !viewer.hidden) close(); });

  // phones: color shows while a finger is on the thumbnail
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.reel').forEach(function (r) {
      function on() { r.classList.add('lift'); }
      function off() { r.classList.remove('lift'); }
      r.addEventListener('pointerdown', on);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { r.addEventListener(ev, off); });
    });
  }
})();
