// ---------- reel link ----------
// Paste the full Vimeo or YouTube link to the reel here, e.g.
// 'https://vimeo.com/123456789' or 'https://www.youtube.com/watch?v=abc123'
var REEL_URL = '';

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- hero loop ----------
(function(){
  var wrap = document.querySelector('.hero-media');
  var video = document.querySelector('.hero-video');
  if (!wrap || !video) return;

  function ready(){ wrap.classList.add('has-media'); }

  video.addEventListener('loadeddata', ready);
  video.addEventListener('error', function(){ video.remove(); });
  if (video.readyState >= 2) ready();

  // Respect "reduce motion": show the still frame, don't play
  if (reduceMotion){
    video.removeAttribute('autoplay');
    video.pause();
  }
})();

// ---------- work tiles: play a few silent seconds on hover / in view ----------
(function(){
  var tiles = document.querySelectorAll('.work-tile');
  if (!tiles.length) return;

  tiles.forEach(function(tile){
    var media = tile.querySelector('.work-media');
    var img = tile.querySelector('img');
    var video = tile.querySelector('video');

    // Drop the placeholder look once a real still or clip loads
    if (img){
      if (img.complete && img.naturalWidth) media.classList.add('has-media');
      img.addEventListener('load', function(){ media.classList.add('has-media'); });
    }
    if (video){
      video.addEventListener('loadeddata', function(){ media.classList.add('has-media', 'has-video'); });
    }

    if (!video || reduceMotion) return;

    function play(){ if (video.isConnected){ var p = video.play(); if (p && p.catch) p.catch(function(){}); } }
    function stop(){ if (video.isConnected){ video.pause(); } }

    tile.addEventListener('mouseenter', play);
    tile.addEventListener('mouseleave', stop);
    tile.addEventListener('focus', play);
    tile.addEventListener('blur', stop);
  });

  // On touch screens there's no hover, so play whichever tile is mostly on screen
  if (!reduceMotion && window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var v = entry.target.querySelector('video');
        if (!v || !v.isConnected) return;
        if (entry.intersectionRatio > 0.6){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
        else { v.pause(); }
      });
    }, { threshold: [0, 0.6, 1] });
    tiles.forEach(function(t){ io.observe(t); });
  }
})();

// ---------- reel modal ----------
(function(){
  var overlay = document.getElementById('reelOverlay');
  var embed = document.getElementById('reelEmbed');
  var openBtn = document.getElementById('openReel');
  var closeBtn = document.getElementById('closeReel');
  if (!overlay || !embed || !openBtn) return;
  var lastOpener = null;

  function embedUrl(url){
    var m;
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1&title=0&byline=0&portrait=0';
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0';
    return '';
  }

  function open(opener){
    lastOpener = opener || null;
    var src = REEL_URL ? embedUrl(REEL_URL) : '';
    if (src){
      embed.innerHTML = '<iframe src="' + src + '" title="Studio reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      embed.classList.add('has-media');
    }
    overlay.classList.add('open');
    closeBtn.focus();
    document.addEventListener('keydown', onEsc);
  }
  function close(){
    overlay.classList.remove('open');
    embed.innerHTML = '';            // stops playback
    embed.classList.remove('has-media');
    document.removeEventListener('keydown', onEsc);
    if (lastOpener) lastOpener.focus();
  }
  function onEsc(e){ if (e.key === 'Escape') close(); }

  openBtn.addEventListener('click', function(){ open(openBtn); });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });

  // Work tiles open the reel until each one has its own link
  document.querySelectorAll('[data-reel]').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); open(a); });
  });
})();
