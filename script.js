
const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progressBar');
let current = 0;
let mindmapReveal = 0;
const mindmapMaxReveal = 9;

function updateMindmap() {
  document.querySelectorAll('#mindmapSlide .reveal-item').forEach((item) => {
    const step = Number(item.dataset.reveal || 0);
    item.classList.toggle('is-visible', step <= mindmapReveal);
  });
  const label = document.getElementById('mindmapCounter');
  if (label) {
    label.textContent = mindmapReveal === 0
      ? '中心テーマ'
      : mindmapReveal < mindmapMaxReveal
        ? `${mindmapReveal} / ${mindmapMaxReveal} 展開`
        : '全体像 完成';
  }
}

function showSlide(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((s, i) => s.classList.toggle('active', i === current));
  counter.textContent = `${current + 1} / ${slides.length}`;
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, '', `#${current + 1}`);
  if (slides[current]?.id !== 'mindmapSlide') {
    mindmapReveal = 0;
    updateMindmap();
  }
}

function goNext() {
  if (slides[current]?.id === 'mindmapSlide' && mindmapReveal < mindmapMaxReveal) {
    mindmapReveal += 1;
    updateMindmap();
    return;
  }
  showSlide(current + 1);
}

function goPrev() {
  if (slides[current]?.id === 'mindmapSlide' && mindmapReveal > 0) {
    mindmapReveal -= 1;
    updateMindmap();
    return;
  }
  showSlide(current - 1);
}

document.getElementById('next').addEventListener('click', goNext);
document.getElementById('prev').addEventListener('click', goPrev);
document.getElementById('fullscreen').addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

document.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) goNext();
  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) goPrev();
  if (e.key === 'Home') showSlide(0);
  if (e.key === 'End') showSlide(slides.length - 1);
});

let touchStartX = 0;
document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive:true});
document.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 60) (diff < 0 ? goNext() : goPrev());
}, {passive:true});

const hashIndex = parseInt(location.hash.replace('#',''), 10) - 1;
showSlide(Number.isFinite(hashIndex) ? hashIndex : 0);

updateMindmap();
