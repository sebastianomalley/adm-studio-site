/* Live clock for the iPhone mockup on builds.html.
   Shows the visitor's own time and date and flips the minute exactly
   when their computer does. No libraries. */

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

  // update now, then right on the next minute, then every minute after
  tick();
  var now = new Date();
  var untilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
  setTimeout(function () {
    tick();
    setInterval(tick, 60000);
  }, untilNextMinute);

  // catch up if the tab was in the background
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
})();
