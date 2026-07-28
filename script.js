
const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progressBar');
let current = 0;

function showSlide(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((s, i) => s.classList.toggle('active', i === current));
  counter.textContent = `${current + 1} / ${slides.length}`;
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, '', `#${current + 1}`);
}

document.getElementById('next').addEventListener('click', () => showSlide(current + 1));
document.getElementById('prev').addEventListener('click', () => showSlide(current - 1));
document.getElementById('fullscreen').addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

document.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) showSlide(current + 1);
  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) showSlide(current - 1);
  if (e.key === 'Home') showSlide(0);
  if (e.key === 'End') showSlide(slides.length - 1);
});

let touchStartX = 0;
document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive:true});
document.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 60) showSlide(current + (diff < 0 ? 1 : -1));
}, {passive:true});

const hashIndex = parseInt(location.hash.replace('#',''), 10) - 1;
showSlide(Number.isFinite(hashIndex) ? hashIndex : 0);
