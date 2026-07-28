const labels = [
  'タイトル',
  '1. 試合の現象',
  '2. 「勝ちたい」の三段階',
  '3. 勝ちに行く行動が出なかった要因',
  '4. 監督と選手の翻訳の違い',
  '5. 翻訳のズレが生んだ結果',
  '6. 今回の核心',
  '7. 今後の指導の方向性',
  '8. 監督が選手へ伝えたいこと',
  '9. 最終的に目指すチーム像'
];

let step = 0;
const maxStep = 9;

const masks = [...document.querySelectorAll('.mask')];
const stepLabel = document.getElementById('stepLabel');
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progressBar');
const tapHint = document.getElementById('tapHint');
const canvasWrap = document.getElementById('canvasWrap');

function render() {
  masks.forEach(mask => {
    const n = Number(mask.dataset.step);
    mask.classList.toggle('hidden', n <= step);
  });

  stepLabel.textContent = labels[step];
  counter.textContent = `${step} / ${maxStep}`;
  progressBar.style.width = `${(step / maxStep) * 100}%`;
  tapHint.textContent = step < maxStep ? 'タップして展開' : '全体像 完成';
  tapHint.classList.toggle('done', step === maxStep);

  history.replaceState(null, '', `#${step}`);
}

function next() {
  if (step < maxStep) {
    step += 1;
    render();
  }
}

function prev() {
  if (step > 0) {
    step -= 1;
    render();
  }
}

function reset() {
  step = 0;
  render();
}

document.getElementById('next').addEventListener('click', e => {
  e.stopPropagation();
  next();
});
document.getElementById('prev').addEventListener('click', e => {
  e.stopPropagation();
  prev();
});
document.getElementById('reset').addEventListener('click', e => {
  e.stopPropagation();
  reset();
});
document.getElementById('fullscreen').addEventListener('click', async e => {
  e.stopPropagation();
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch (_) {}
});

canvasWrap.addEventListener('click', next);

document.addEventListener('keydown', e => {
  if (['ArrowRight','PageDown',' ','Enter'].includes(e.key)) {
    e.preventDefault();
    next();
  }
  if (['ArrowLeft','PageUp','Backspace'].includes(e.key)) {
    e.preventDefault();
    prev();
  }
  if (e.key === 'Home') reset();
  if (e.key === 'End') {
    step = maxStep;
    render();
  }
});

let touchStartX = 0;
canvasWrap.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, {passive:true});
canvasWrap.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 60) {
    diff < 0 ? next() : prev();
  }
}, {passive:true});

const initial = Number(location.hash.replace('#',''));
if (Number.isInteger(initial) && initial >= 0 && initial <= maxStep) {
  step = initial;
}
render();
