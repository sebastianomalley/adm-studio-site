/* Film page: thumbnails and touch color (the player itself is viewer.js) */
(function () {

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

  document.querySelectorAll('.reel[data-fb] .reel-thumb img').forEach(function (img) {
    if (img.complete && img.naturalWidth) img.classList.add('ok'); else img.onload = function () { img.classList.add('ok'); };
  });

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
