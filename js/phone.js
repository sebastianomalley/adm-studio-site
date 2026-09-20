/* Live clock for the iPhone mockup on builds.html.
   Shows the visitor's own time and date. No libraries. */

(function () {
  var t = document.getElementById('phTime');
  var d = document.getElementById('phDate');
  if (!t || !d) return;

  function tick() {
    var now = new Date();
    var h = now.getHours() % 12; if (h === 0) h = 12;
    var m = now.getMinutes(); if (m < 10) m = '0' + m;
    t.textContent = h + ':' + m;
    d.textContent = now.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  }
  tick();
  setInterval(tick, 20000);
})();
