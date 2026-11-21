/* Hidden plan-and-sign page.
   Link options (combine with &):
     ?plan=care|essentials|standard|plus     preselect a plan
     ?only=standard               show just that plan
     ?standard=3200               set a custom monthly price for a plan (same for care / essentials / plus)
     ?org=Smooth%20Press          prefill the organization
*/
(function () {
  var form = document.getElementById('signForm');
  if (!form) return;
  var q = new URLSearchParams(location.search);
  var names = { care: 'Website care', essentials: 'Essentials', standard: 'Standard', plus: 'Plus' };
  var prices = { care: 500, essentials: 1800, standard: 3000, plus: 5500 };

  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }

  Object.keys(prices).forEach(function (k) {
    var v = parseInt(q.get(k), 10);
    if (v > 0 && v < 100000) prices[k] = v;
    var el = document.querySelector('[data-price="' + k + '"]');
    if (el) el.textContent = money(prices[k]);
  });

  var only = q.get('only');
  if (only && names[only]) {
    document.querySelectorAll('.plan').forEach(function (p) {
      if (p.dataset.plan !== only) p.classList.add('hidden-plan');
    });
    var pl = document.querySelector('.plans'); pl.style.gridTemplateColumns = 'minmax(0,420px)'; pl.style.justifyContent = 'center';
  }
  var pre = only || q.get('plan');
  if (pre && names[pre]) form.querySelector('input[name="plan"][value="' + pre + '"]').checked = true;
  if (q.get('org')) form.organization.value = q.get('org').slice(0, 120);

  var summary = document.getElementById('planSummary');
  var sigInput = document.getElementById('sigInput');
  var sigPreview = document.getElementById('sigPreview');
  var status = document.getElementById('signStatus');
  var submit = form.querySelector('button[type="submit"]');

  function current() {
    var r = form.querySelector('input[name="plan"]:checked');
    var k = r ? r.value : 'standard';
    var fee = prices[k];
    var np = form.nonprofit.checked;
    if (np) fee = Math.round(fee * 0.9);
    return { key: k, name: names[k], fee: fee, nonprofit: np };
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function fmtDate(v) {
    if (!v) return 'To be confirmed';
    var d = new Date(v + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function render() {
    var c = current();
    summary.innerHTML =
      '<div><dt>Plan</dt><dd>' + esc(c.name) + '</dd></div>' +
      '<div><dt>Monthly fee</dt><dd>' + money(c.fee) + (c.nonprofit ? ' <small>(nonprofit rate)</small>' : '') + '</dd></div>' +
      '<div><dt>Start date</dt><dd>' + esc(fmtDate(form.start_date.value)) + '</dd></div>' +
      '<div><dt>Initial term</dt><dd>3 months</dd></div>';
  }
  form.addEventListener('change', render);
  form.start_date.addEventListener('input', render);
  render();

  sigInput.addEventListener('input', function () { sigPreview.textContent = sigInput.value; });

  // Printable copy (agreement plus the filled-in details)
  function buildPrint(signed) {
    var c = current();
    var f = form;
    var client = [esc(f.organization.value), esc(f.name.value) + (f.title.value ? ', ' + esc(f.title.value) : '')].filter(Boolean).join('<br>');
    var rows = [
      ['Plan', esc(c.name) + ', ' + money(c.fee) + ' per month' + (c.nonprofit ? ' (nonprofit rate)' : '')],
      ['Client', client],
      ['Email and phone', [esc(f.email.value), esc(f.phone.value)].filter(Boolean).join(' &middot; ')],
      ['Billing address', esc(f.address.value)],
      ['Start date', esc(fmtDate(f.start_date.value))],
      ['Portfolio', f.portfolio_opt_out.checked ? 'Client opts out of portfolio use' : 'Portfolio use allowed']
    ];
    var html = '<h1>Monthly Retainer Agreement</h1><p class="pc-sub">A Digital Media Studio, LLC &middot; adigitalmediastudio.com</p>';
    html += '<h4>Schedule A: Plan and client</h4><table>' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
    html += document.getElementById('agreementText').innerHTML;
    html += '<div class="pc-block"><h4>Signatures</h4><table>';
    html += '<tr><th colspan="2" class="pc-party">Client</th></tr>';
    if (signed) {
      html += '<tr><th>Signature</th><td><span class="pc-sig">' + esc(signed.sig) + '</span></td></tr>';
      html += '<tr><th>Name and title</th><td>' + esc(signed.name) + (f.title.value ? ', ' + esc(f.title.value) : '') + '</td></tr>';
      html += '<tr><th>Date</th><td>Signed electronically ' + esc(signed.when) + '</td></tr>';
    } else {
      html += '<tr><th>Signature</th><td class="pc-blank"></td></tr><tr><th>Name and title</th><td class="pc-blank"></td></tr><tr><th>Date</th><td class="pc-blank"></td></tr>';
    }
    html += '<tr><th colspan="2" class="pc-party">A Digital Media Studio, LLC</th></tr>';
    html += '<tr><th>Name and title</th><td>Jason O\'Malley, Owner</td></tr>';
    html += '<tr><th>Signature</th><td>Countersigned by email when the start date is confirmed (section 5.8)</td></tr>';
    html += '</table></div>';
    document.getElementById('printFields').innerHTML = html;
  }

  document.getElementById('printAgreement').addEventListener('click', function () { buildPrint(null); window.print(); });

  var lastSigned = null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var bad = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
      var wrap = el.closest('.field');
      if (wrap) wrap.classList.toggle('invalid', !ok);
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      status.textContent = bad.type === 'checkbox' ? 'Please check both boxes to sign.' : 'Please fill in the highlighted fields.';
      bad.focus();
      return;
    }
    var c = current();
    var when = new Date();
    var whenText = when.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    form.plan_name.value = c.name;
    form.monthly_fee.value = money(c.fee) + (c.nonprofit ? ' (nonprofit rate applied)' : '');
    form.signed_at.value = whenText + ' (' + when.toISOString() + ')';
    form.subject.value = 'Signed agreement: ' + form.organization.value + ', ' + c.name + ' plan';
    lastSigned = { sig: form.signature.value, name: form.name.value, when: whenText };
    buildPrint(lastSigned);

    submit.disabled = true;
    submit.textContent = 'Sending…';
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.success) throw new Error(j.message);
        form.hidden = true;
        document.getElementById('signedView').hidden = false;
        document.querySelector('.start-head').hidden = true;
        window.scrollTo(0, 0);
      })
      .catch(function () {
        status.textContent = 'Something went wrong sending that. Please try again in a minute, or use the contact form on the site.';
        submit.disabled = false;
        submit.textContent = 'Sign and send';
      });
  });

  document.getElementById('saveCopy').addEventListener('click', function () { window.print(); });
})();
