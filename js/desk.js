(function () {
  var BASE = 'https://adigitalmediastudio.com/';
  var SHEET = BASE + 'media/adm-pricing-sheet.pdf';
  var names = { care: 'Website care', essentials: 'Essentials', standard: 'Standard', plus: 'Plus' };
  var prices = { care: 500, essentials: 1800, standard: 3000, plus: 5500 };
  var deals = { friends: ['Friends & family', 15], founding: ['Founding client', 10], prepay: ['Prepay', 5] };
  var f = document.getElementById('deskForm');
  var org = document.getElementById('org'), price = document.getElementById('price');
  var outLink = document.getElementById('outLink'), outPreview = document.getElementById('outPreview');
  var link = '';

  function val(n) { var r = f.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }

  function build() {
    var kind = val('kind');
    document.querySelector('.sign-only').hidden = kind !== 'sign';
    if (kind === 'sheet') {
      link = SHEET;
      outPreview.textContent = 'The one-page pricing sheet (PDF).';
    } else {
      var plan = val('plan'), deal = val('deal');
      price.disabled = !plan;
      if (!plan) price.value = '';
      var p = new URLSearchParams();
      if (plan) p.set('only', plan);
      var custom = parseInt(String(price.value).replace(/[^0-9]/g, ''), 10);
      if (plan && custom > 0) p.set(plan, custom);
      if (org.value.trim()) p.set('org', org.value.trim());
      var qs = p.toString().replace(/\+/g, '%20');
      link = BASE + (deal || 'start.html') + (qs ? '?' + qs : '');
      var desc;
      if (plan) {
        var base = custom > 0 ? custom : prices[plan];
        desc = names[plan] + ' only at ' + money(base) + '/month';
        if (deal) desc += ', shown as ' + money(Math.round(base * (1 - deals[deal][1] / 100))) + ' with ' + deals[deal][0] + ' ' + deals[deal][1] + '% off';
      } else {
        desc = 'All four plans' + (deal ? ', with ' + deals[deal][0] + ' ' + deals[deal][1] + '% off' : ' at regular prices');
      }
      if (org.value.trim()) desc += '. Business name filled in.';
      outPreview.textContent = desc;
    }
    outLink.textContent = link;
    var msg = kind === 'sheet' ? 'Here is my pricing sheet: ' + link : 'Here is the link to pick your plan and sign: ' + link;
    document.getElementById('textBtn').href = 'sms:&body=' + encodeURIComponent(msg);
    document.getElementById('mailBtn').href = 'mailto:?subject=' + encodeURIComponent(kind === 'sheet' ? 'A Digital Media Studio pricing' : 'Getting started with A Digital Media Studio') + '&body=' + encodeURIComponent(msg);
    document.getElementById('openBtn').href = link;
  }

  function copy(text, btn) {
    function done() { var t = btn.textContent; btn.textContent = 'Copied'; btn.classList.add('done'); setTimeout(function () { btn.textContent = t; btn.classList.remove('done'); }, 1400); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  }

  f.addEventListener('change', build);
  f.addEventListener('input', build);
  document.getElementById('copyBtn').addEventListener('click', function () { copy(link, this); });
  build();

  var quick = [
    ['Sign-up page, all plans', BASE + 'start.html'],
    ['Friends & family, 15% off', BASE + 'friends'],
    ['Founding client, 10% off', BASE + 'founding'],
    ['Prepay, 5% off', BASE + 'prepay'],
    ['Pricing sheet (PDF)', SHEET],
    ['Contact form', BASE + 'get-in-touch.html']
  ];
  var ul = document.getElementById('quickList');
  quick.forEach(function (q) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="q-name"><b></b><small></small></span><button type="button">Copy</button>';
    li.querySelector('b').textContent = q[0];
    li.querySelector('small').textContent = q[1].replace('https://', '');
    li.querySelector('button').addEventListener('click', function () { copy(q[1], this); });
    ul.appendChild(li);
  });
})();
