const groups = [
  {
    key:"g1",
    title:"1. 試合の現象",
    items:["s1a","s1b"]
  },
  {
    key:"g2",
    title:"2. 「勝ちたい」は三つに分かれる",
    items:["s2a","s2b","s2c"]
  },
  {
    key:"g3",
    title:"3. なぜ、勝ちに行く行動が出なかったのか",
    items:["s3a","s3b","s3c","s3d","s3e"]
  },
  {
    key:"g4",
    title:"4. 同じ言葉でも、翻訳結果が違った",
    items:[
      "s4l1","s4r1","s4l2","s4r2","s4l3","s4r3","s4l4","s4r4",
      "s4l5","s4r5","s4l6","s4r6","s4l7","s4r7","s4l8","s4r8"
    ]
  },
  { key:"g5", title:"5. このズレが生んだ結果", items:["s5"] },
  { key:"g6", title:"6. 本当の問題 ― 今回の核心", items:["s6"] },
  { key:"g7", title:"7. 今後のチームとして必要なこと", items:["s7"] },
  { key:"g8", title:"8. 監督が選手へ伝えたいこと", items:["s8"] },
  { key:"g9", title:"9. 最終的に目指すチームの姿", items:["s9"] }
];

const flatItems = groups.flatMap(g => g.items);
const totalItems = flatItems.length;

let groupIndex = -1;
let revealIndex = 0;
let phase = "map"; // map | focus | ending
let endingStep = 0;

const focusLayer = document.getElementById("focusLayer");
const focusCard = document.getElementById("focusCard");
const ending = document.getElementById("ending");
const statusTitle = document.getElementById("statusTitle");
const statusCount = document.getElementById("statusCount");
const guide = document.getElementById("guide");
const bar = document.getElementById("progressBar");

function item(id){
  return document.querySelector(`[data-id="${id}"]`);
}

function fit(){
  const vp = document.getElementById("viewport");
  const scale = Math.min((vp.clientWidth - 20) / 1600, (vp.clientHeight - 20) / 1120);
  document.getElementById("stage").style.setProperty("--scale", scale);
}

function completedItemCount(){
  let count = 0;
  for(let i=0;i<groupIndex;i++) count += groups[i].items.length;
  if(groupIndex >= 0){
    if(phase === "focus") count += revealIndex;
    else count += groups[groupIndex].items.length;
  }
  return count;
}

function updateMap(){
  const completedGroups = phase === "focus" ? groupIndex : groupIndex + 1;
  document.querySelectorAll(".item").forEach(el => {
    const g = groups.findIndex(gr => gr.items.includes(el.dataset.id));
    el.classList.toggle("placed", g >= 0 && g < completedGroups);
  });

  document.querySelectorAll(".pair-row").forEach(row => {
    const ids = [...row.querySelectorAll(".item")].map(x => x.dataset.id);
    row.classList.toggle("active", ids.every(id => item(id).classList.contains("placed")));
  });

  const done = Math.min(completedItemCount(), totalItems);
  statusCount.textContent = `${done} / ${totalItems}`;
  bar.style.width = `${done / totalItems * 100}%`;

  if(groupIndex < 0) statusTitle.textContent = "開始";
  else statusTitle.textContent = groups[groupIndex].title;

  if(phase === "focus"){
    const g = groups[groupIndex];
    guide.textContent = revealIndex < g.items.length
      ? "タップして次の内容を表示"
      : "タップすると全体マップに入ります";
  } else if(groupIndex === groups.length - 1){
    guide.textContent = "タップするとエンディングへ";
  } else {
    guide.textContent = groupIndex < 0 ? "タップして開始" : "タップして次へ";
  }
}

function buildGroupFocus(g){
  focusCard.innerHTML = "";

  const wrap = document.createElement("section");
  wrap.className = `focus-group focus-${g.key}`;

  const h2 = document.createElement("h2");
  h2.textContent = g.title;
  wrap.appendChild(h2);

  if(g.key === "g4"){
    const head = document.createElement("div");
    head.className = "focus-translation-head";
    head.innerHTML = "<b>川﨑先生（監督）の翻訳</b><span>同じ言葉</span><b>選手側の翻訳</b>";
    wrap.appendChild(head);

    for(let r=1;r<=8;r++){
      const row = document.createElement("div");
      row.className = "focus-pair-row";
      row.dataset.focusIndex = String((r-1)*2 + 1);

      const left = item(`s4l${r}`).cloneNode(true);
      const common = document.createElement("div");
      common.className = "focus-common";
      common.textContent = "勝ちたい";
      const right = item(`s4r${r}`).cloneNode(true);

      left.classList.remove("placed");
      right.classList.remove("placed");
      row.append(left, common, right);
      wrap.appendChild(row);
    }

    const note = document.querySelector(".g4 .cold-note").cloneNode(true);
    note.classList.add("focus-cold-note");
    wrap.appendChild(note);
  } else {
    const grid = document.createElement("div");
    grid.className = `focus-group-grid ${g.key}`;

    g.items.forEach((id, i) => {
      const clone = item(id).cloneNode(true);
      clone.classList.remove("placed");
      clone.dataset.focusIndex = String(i + 1);
      grid.appendChild(clone);
    });

    wrap.appendChild(grid);
  }

  focusCard.appendChild(wrap);
}

function renderFocus(){
  const g = groups[groupIndex];

  if(g.key === "g4"){
    document.querySelectorAll(".focus-pair-row").forEach((row, i) => {
      const leftStep = i*2 + 1;
      const rightStep = i*2 + 2;
      const left = row.querySelectorAll(".item")[0];
      const common = row.querySelector(".focus-common");
      const right = row.querySelectorAll(".item")[1];

      left.classList.toggle("focus-visible", revealIndex >= leftStep);
      common.classList.toggle("focus-visible", revealIndex >= leftStep);
      right.classList.toggle("focus-visible", revealIndex >= rightStep);
    });
    document.querySelector(".focus-cold-note")?.classList.toggle(
      "focus-visible", revealIndex >= g.items.length
    );
  } else {
    document.querySelectorAll("[data-focus-index]").forEach(el => {
      el.classList.toggle("focus-visible", Number(el.dataset.focusIndex) <= revealIndex);
    });
  }
}

function startNextGroup(){
  if(groupIndex >= groups.length - 1){
    startEnding();
    return;
  }

  groupIndex += 1;
  revealIndex = 0;
  phase = "focus";
  buildGroupFocus(groups[groupIndex]);
  focusLayer.classList.add("active");
  renderFocus();
  updateMap();
}

function placeGroup(){
  focusLayer.classList.remove("active");
  phase = "map";
  updateMap();
}

function next(){
  if(phase === "ending"){
    if(endingStep < 9){
      endingStep++;
      document.querySelector(`[data-end="${endingStep}"]`)?.classList.add("show");
    }
    return;
  }

  if(phase === "focus"){
    const g = groups[groupIndex];
    if(revealIndex < g.items.length){
      revealIndex++;
      renderFocus();
      updateMap();
      return;
    }
    placeGroup();
    return;
  }

  if(groupIndex < groups.length - 1){
    startNextGroup();
  } else {
    startEnding();
  }
}

function prev(){
  if(phase === "ending"){
    ending.classList.remove("active");
    document.querySelectorAll("[data-end]").forEach(x => x.classList.remove("show"));
    phase = "map";
    endingStep = 0;
    guide.style.display = "block";
    updateMap();
    return;
  }

  if(phase === "focus"){
    if(revealIndex > 0){
      revealIndex--;
      renderFocus();
      updateMap();
      return;
    }
    focusLayer.classList.remove("active");
    phase = "map";
    groupIndex--;
    updateMap();
    return;
  }

  if(groupIndex >= 0){
    const g = groups[groupIndex];
    phase = "focus";
    revealIndex = g.items.length;
    buildGroupFocus(g);
    focusLayer.classList.add("active");
    renderFocus();
    updateMap();
  }
}

function startEnding(){
  phase = "ending";
  ending.classList.add("active");
  endingStep = 0;
  guide.style.display = "none";
  statusTitle.textContent = "エンディング";
}

function reset(){
  focusLayer.classList.remove("active");
  ending.classList.remove("active");
  document.querySelectorAll("[data-end]").forEach(x => x.classList.remove("show"));
  groupIndex = -1;
  revealIndex = 0;
  phase = "map";
  endingStep = 0;
  guide.style.display = "block";
  updateMap();
}

document.getElementById("next").addEventListener("click", e => { e.stopPropagation(); next(); });
document.getElementById("prev").addEventListener("click", e => { e.stopPropagation(); prev(); });
document.getElementById("reset").addEventListener("click", e => { e.stopPropagation(); reset(); });
document.getElementById("fullscreen").addEventListener("click", async e => {
  e.stopPropagation();
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }catch{}
});

document.getElementById("viewport").addEventListener("click", next);
focusLayer.addEventListener("click", next);
ending.addEventListener("click", next);

document.addEventListener("keydown", e => {
  if(["ArrowRight","PageDown"," ","Enter"].includes(e.key)){ e.preventDefault(); next(); }
  if(["ArrowLeft","PageUp","Backspace"].includes(e.key)){ e.preventDefault(); prev(); }
  if(e.key === "Home") reset();
});

let sx = 0;
document.addEventListener("touchstart", e => sx = e.changedTouches[0].screenX, {passive:true});
document.addEventListener("touchend", e => {
  const d = e.changedTouches[0].screenX - sx;
  if(Math.abs(d) > 70) (d < 0 ? next() : prev());
}, {passive:true});

window.addEventListener("resize", fit);
fit();
updateMap();
