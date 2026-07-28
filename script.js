const sequence = [
"s1a","s1b",
"s2a","s2b","s2c",
"s3a","s3b","s3c","s3d","s3e",
"s4l1","s4r1","s4l2","s4r2","s4l3","s4r3","s4l4","s4r4",
"s4l5","s4r5","s4l6","s4r6","s4l7","s4r7","s4l8","s4r8",
"s5","s6","s7","s8","s9"
];
const titles = {
s1a:"1. 試合の現象：何が起きたか",s1b:"1. 試合の現象：印象的だった場面",
s2a:"2. 結果願望",s2b:"2. 意図・覚悟",s2c:"2. 行動への変換",
s3a:"3. 試合の目的が変わった",s3b:"3. 回避動機へ反転",s3c:"3. 「誰かが行く」が起きた",s3d:"3. チームコラプス",s3e:"3. 高校生年代の特徴",
s5:"5. このズレが生んだ結果",s6:"6. 今回の核心",s7:"7. 今後のチームとして必要なこと",s8:"8. 監督が選手へ伝えたいこと",s9:"9. 最終的に目指すチームの姿"
};
let index=-1, phase="map", endingStep=0;
const focusLayer=document.getElementById("focusLayer"),focusCard=document.getElementById("focusCard"),ending=document.getElementById("ending");
const statusTitle=document.getElementById("statusTitle"),statusCount=document.getElementById("statusCount"),guide=document.getElementById("guide"),bar=document.getElementById("progressBar");
const total=sequence.length;

function fit(){
 const vp=document.getElementById("viewport");
 const scale=Math.min((vp.clientWidth-20)/1600,(vp.clientHeight-20)/1040);
 document.getElementById("stage").style.setProperty("--scale",scale);
}
function item(id){return document.querySelector(`[data-id="${id}"]`)}
function update(){
 document.querySelectorAll(".item").forEach(el=>{
   const i=sequence.indexOf(el.dataset.id);
   el.classList.toggle("placed",i>=0&&i<=index);
 });
 document.querySelectorAll(".pair-row").forEach(row=>{
   const ids=[...row.querySelectorAll(".item")].map(x=>x.dataset.id);
   row.classList.toggle("active",ids.every(id=>sequence.indexOf(id)<=index));
 });
 statusCount.textContent=`${Math.max(index+1,0)} / ${total}`;
 bar.style.width=`${Math.max(index+1,0)/total*100}%`;
 if(index<0) statusTitle.textContent="開始";
 else statusTitle.textContent=titles[sequence[index]]||"4. 翻訳結果の違い";
 if(phase==="focus") guide.textContent="タップすると全体マップに入ります";
 else if(index===total-1) guide.textContent="タップするとエンディングへ";
 else guide.textContent=index<0?"タップして開始":"タップして次へ";
}
function showFocus(id){
 const src=item(id); focusCard.innerHTML="";
 const clone=src.cloneNode(true); clone.classList.add("placed");
 focusCard.appendChild(clone); focusLayer.classList.add("active"); phase="focus"; update();
}
function next(){
 if(phase==="ending"){
   if(endingStep<9){endingStep++;document.querySelector(`[data-end="${endingStep}"]`)?.classList.add("show");}
   return;
 }
 if(phase==="focus"){focusLayer.classList.remove("active");phase="map";update();return;}
 if(index<total-1){index++;showFocus(sequence[index]);return;}
 phase="ending";ending.classList.add("active");endingStep=0;guide.style.display="none";statusTitle.textContent="エンディング";
}
function prev(){
 if(phase==="ending"){ending.classList.remove("active");document.querySelectorAll("[data-end]").forEach(x=>x.classList.remove("show"));phase="map";endingStep=0;guide.style.display="block";update();return;}
 if(phase==="focus"){focusLayer.classList.remove("active");phase="map";index--;update();return;}
 if(index>=0){index--;update();}
}
function reset(){
 focusLayer.classList.remove("active");ending.classList.remove("active");document.querySelectorAll("[data-end]").forEach(x=>x.classList.remove("show"));
 index=-1;phase="map";endingStep=0;guide.style.display="block";update();
}
document.getElementById("next").addEventListener("click",e=>{e.stopPropagation();next()});
document.getElementById("prev").addEventListener("click",e=>{e.stopPropagation();prev()});
document.getElementById("reset").addEventListener("click",e=>{e.stopPropagation();reset()});
document.getElementById("fullscreen").addEventListener("click",async e=>{e.stopPropagation();try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();else await document.exitFullscreen?.()}catch{}});
document.getElementById("viewport").addEventListener("click",next);focusLayer.addEventListener("click",next);ending.addEventListener("click",next);
document.addEventListener("keydown",e=>{if(["ArrowRight","PageDown"," ","Enter"].includes(e.key)){e.preventDefault();next()}if(["ArrowLeft","PageUp","Backspace"].includes(e.key)){e.preventDefault();prev()}if(e.key==="Home")reset()});
let sx=0;document.addEventListener("touchstart",e=>sx=e.changedTouches[0].screenX,{passive:true});document.addEventListener("touchend",e=>{const d=e.changedTouches[0].screenX-sx;if(Math.abs(d)>70)(d<0?next():prev())},{passive:true});
window.addEventListener("resize",fit);fit();update();
