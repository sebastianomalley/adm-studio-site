/* Websites & Apps: open the live gallery or game full screen, X to come back. */
(function () {
  var v = document.querySelector('.app-viewer');
  if (!v) return;
  var frame = v.querySelector('.app-frame'), title = v.querySelector('.app-title'), last = null;
  var touchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (touchOnly) document.documentElement.classList.add('touch-only');

  function open(btn) {
    last = btn;
    title.textContent = btn.getAttribute('data-title');
    frame.title = btn.getAttribute('data-title');
    frame.src = btn.getAttribute('data-app');
    v.hidden = false; document.body.classList.add('viewing');
    // the game listens for keys, so hand it the keyboard as soon as it loads
    frame.onload = function () { try { frame.focus(); } catch (e) {} };
  }
  function close() {
    v.hidden = true; frame.src = 'about:blank'; document.body.classList.remove('viewing');
    if (last) last.focus({ preventScroll: true });
  }
  document.querySelectorAll('.space-shot').forEach(function (b) {
    b.addEventListener('click', function () {
      if (touchOnly && b.hasAttribute('data-keys')) {
        var n = document.querySelector('.space-mobile'); n.classList.add('flash');
        n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { n.classList.remove('flash'); }, 1600);
        return;
      }
      open(b);
    });
  });
  v.querySelector('.app-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !v.hidden) close(); });
})();
