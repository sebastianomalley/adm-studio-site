// ---------- iris intro ----------
window.addEventListener('load', function(){
  var iris = document.getElementById('iris');
  requestAnimationFrame(function(){
    setTimeout(function(){
      iris.classList.add('closed');
      setTimeout(function(){ iris.classList.add('done'); }, 1200);
    }, 150);
  });
});

// ---------- contact modal open/close ----------
var overlay = document.getElementById('contactOverlay');
var openBtn = document.getElementById('openContact');
var closeBtn = document.getElementById('closeContact');
var formView = document.getElementById('formView');
var successView = document.getElementById('successView');
var successCloseBtn = document.getElementById('successClose');

function resetModalView(){
  formView.hidden = false;
  successView.hidden = true;
}

function openModal(){
  overlay.classList.add('open');
  document.getElementById('name').focus();
  document.addEventListener('keydown', onEsc);
}
function closeModal(){
  overlay.classList.remove('open');
  document.removeEventListener('keydown', onEsc);
  openBtn.focus();
  // Reset back to the form after the close animation/transition settles
  setTimeout(resetModalView, 200);
}
function onEsc(e){ if (e.key === 'Escape') closeModal(); }

openBtn.addEventListener('click', openModal);
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
    status.textContent = 'Something went wrong — email us directly at adigitalmediastudio@gmail.com.';
    status.className = 'form-status show err';
    submitBtn.textContent = 'Send message';
    submitBtn.disabled = false;
  });
});