// ---------- reveal once everything is truly ready ----------
Promise.all([
  new Promise(function(resolve){
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  }),
  document.fonts ? document.fonts.ready : Promise.resolve()
]).then(function(){
  document.body.classList.add('ready');
});

// ---------- booking links ----------
// Paste a scheduling link here (Calendly, Cal.com, etc.) and the matching
// buttons will go straight to it. Leave it empty and they open the form.
var BOOKING = {
  session: '', // "Book a session" buttons (photography)
  call: ''     // "Book an intro call" buttons (builds, retainer)
};

// What the form says, depending on which button opened it
var CONTEXT = {
  project: {
    title: 'Start a project',
    label: 'What are you looking to build?',
    subject: 'New inquiry from adigitalmediastudio.com'
  },
  session: {
    title: 'Book a session',
    label: 'What kind of shoot, and roughly when?',
    subject: 'Photo session request from adigitalmediastudio.com'
  },
  call: {
    title: 'Book an intro call',
    label: 'What are you working on? Add a few times that work for a call.',
    subject: 'Intro call request from adigitalmediastudio.com'
  }
};

// ---------- contact modal open/close ----------
var overlay = document.getElementById('contactOverlay');
var closeBtn = document.getElementById('closeContact');
var formView = document.getElementById('formView');
var successView = document.getElementById('successView');
var successCloseBtn = document.getElementById('successClose');
var modalTitle = document.getElementById('modalTitle');
var messageLabel = document.querySelector('label[for="message"]');
var subjectInput = document.querySelector('#contactForm input[name="subject"]');
var lastOpener = null;

function resetModalView(){
  formView.hidden = false;
  successView.hidden = true;
}

function setContext(type){
  var c = CONTEXT[type] || CONTEXT.project;
  if (modalTitle) modalTitle.textContent = c.title;
  if (messageLabel) messageLabel.textContent = c.label;
  if (subjectInput) subjectInput.value = c.subject;
}

function openModal(type){
  setContext(type);
  overlay.classList.add('open');
  document.getElementById('name').focus();
  document.addEventListener('keydown', onEsc);
}
function closeModal(){
  overlay.classList.remove('open');
  document.removeEventListener('keydown', onEsc);
  if (lastOpener) lastOpener.focus();
  // Reset back to the form after the close animation/transition settles
  setTimeout(resetModalView, 200);
}
function onEsc(e){ if (e.key === 'Escape') closeModal(); }

document.querySelectorAll('#openContact, [data-contact]').forEach(function(btn){
  btn.addEventListener('click', function(e){
    var type = btn.getAttribute('data-contact') || 'project';
    if (BOOKING[type]){
      // A booking link is set: go there instead of the form
      e.preventDefault();
      window.open(BOOKING[type], '_blank', 'noopener');
      return;
    }
    e.preventDefault();
    lastOpener = btn;
    openModal(type);
  });
});
closeBtn.addEventListener('click', closeModal);
successCloseBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', function(e){
  if (e.target === overlay) closeModal();
});

// ---------- contact form submit (Web3Forms) ----------
var form = document.getElementById('contactForm');
var submitBtn = document.getElementById('submitBtn');
var status = document.getElementById('formStatus');

form.addEventListener('submit', function(e){
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  status.className = 'form-status';

  var data = new FormData(form);

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: data
  })
  .then(function(res){ return res.json(); })
  .then(function(json){
    if (json.success){
      form.reset();
      submitBtn.textContent = 'Send message';
      submitBtn.disabled = false;
      status.className = 'form-status';
      // Swap the whole form out for a clean confirmation state
      formView.hidden = true;
      successView.hidden = false;
      successCloseBtn.focus();
    } else {
      throw new Error(json.message || 'Something went wrong');
    }
  })
  .catch(function(){
    status.textContent = 'Something went wrong. Email me directly at adigitalmediastudio@gmail.com.';
    status.className = 'form-status show err';
    submitBtn.textContent = 'Send message';
    submitBtn.disabled = false;
  });
});

// ---------- keep footer year current ----------
document.querySelectorAll('.yr').forEach(function(el){ el.textContent = new Date().getFullYear(); });
