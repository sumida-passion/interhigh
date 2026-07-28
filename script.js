const labels = [
  '開始',
  '1. 試合の現象',
  '2. 「勝ちたい」の三段階',
  '3. 行動が出なかった要因',
  '4. 翻訳結果の違い',
  '5. ズレが生んだ結果',
  '6. 今回の核心',
  '7. 今後の指導',
  '8. 選手へ伝えたいこと',
  '9. 目指すチーム像'
];

const blocks = [...document.querySelectorAll('.map-block')];
const focusLayer = document.getElementById('focusLayer');
const focusCard = document.getElementById('focusCard');
const finalBanner = document.getElementById('finalBanner');
const statusTitle = document.getElementById('statusTitle');
const statusCount = document.getElementById('statusCount');
const progressBar = document.getElementById('progressBar');
const tapGuide = document.getElementById('tapGuide');
const mapViewport = document.getElementById('mapViewport');

let step = 0;
let phase = 'map'; // map -> focus -> map
const maxStep = 9;

function fitMap() {
  const viewport = document.querySelector('.map-viewport');
  const usableW = viewport.clientWidth - 20;
  const usableH = viewport.clientHeight - 20;
  const scale = Math.min(usableW / 1600, usableH / 980);
  document.getElementById('mapStage').style.setProperty('--map-scale', scale);
}

function updateMap() {
  blocks.forEach(block => {
    const n = Number(block.dataset.step);
    block.classList.toggle('placed', n <= step);
  });

  document.querySelectorAll('[data-line]').forEach(line => {
    const n = Number(line.dataset.line);
    line.classList.toggle('visible', n < step);
  });

  finalBanner.classList.toggle('visible', step === maxStep && phase === 'map');
  statusTitle.textContent = labels[step];
  statusCount.textContent = `${step} / ${maxStep}`;
  progressBar.style.width = `${(step / maxStep) * 100}%`;

  if (step === 0) tapGuide.textContent = 'タップして開始';
  else if (step === maxStep && phase === 'map') tapGuide.textContent = '全体マップ 完成';
  else if (phase === 'focus') tapGuide.textContent = 'タップすると全体マップに入ります';
  else tapGuide.textContent = 'タップして次のブロックへ';
}

function showFocus(n) {
  const source = blocks.find(b => Number(b.dataset.step) === n);
  if (!source) return;
  focusCard.innerHTML = '';
  const clone = source.cloneNode(true);
  clone.classList.add('placed');
  focusCard.appendChild(clone);
  focusLayer.classList.add('active');
  phase = 'focus';
  statusTitle.textContent = labels[n];
  tapGuide.textContent = 'タップすると全体マップに入ります';
}

function placeFocused() {
  focusLayer.classList.remove('active');
  phase = 'map';
  updateMap();
}

function next() {
  if (phase === 'focus') {
    placeFocused();
    return;
  }
  if (step < maxStep) {
    step += 1;
    showFocus(step);
    updateMap();
  }
}

function prev() {
  if (phase === 'focus') {
    focusLayer.classList.remove('active');
    phase = 'map';
    step = Math.max(0, step - 1);
    updateMap();
    return;
  }
  if (step > 0) {
    step -= 1;
    updateMap();
  }
}

function reset() {
  focusLayer.classList.remove('active');
  phase = 'map';
  step = 0;
  updateMap();
}

document.getElementById('next').addEventListener('click', e => {
  e.stopPropagation(); next();
});
document.getElementById('prev').addEventListener('click', e => {
  e.stopPropagation(); prev();
});
document.getElementById('reset').addEventListener('click', e => {
  e.stopPropagation(); reset();
});
document.getElementById('fullscreen').addEventListener('click', async e => {
  e.stopPropagation();
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  } catch (_) {}
});

mapViewport.addEventListener('click', next);
focusLayer.addEventListener('click', next);

document.addEventListener('keydown', e => {
  if (['ArrowRight','PageDown',' ','Enter'].includes(e.key)) {
    e.preventDefault(); next();
  }
  if (['ArrowLeft','PageUp','Backspace'].includes(e.key)) {
    e.preventDefault(); prev();
  }
  if (e.key === 'Home') reset();
  if (e.key === 'End') {
    focusLayer.classList.remove('active');
    phase = 'map';
    step = maxStep;
    updateMap();
  }
});

let touchStartX = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, {passive:true});
document.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 70) diff < 0 ? next() : prev();
}, {passive:true});

window.addEventListener('resize', fitMap);
fitMap();
updateMap();
