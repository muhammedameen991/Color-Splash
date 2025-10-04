// ===== Canvas Setup =====
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let color = 'red';
let painting = false;
let brushSize = 10;
let fruitImg = new Image();

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Sounds
const brushSound = new Audio('sounds/brush.mp3');
const eraserSound = new Audio('sounds/eraser.mp3');
const clickSound = new Audio('sounds/click.mp3');
const fruitLoadSound = new Audio('sounds/fruit-load.mp3');
const bgMusic = new Audio('sounds/background.mp3');

brushSound.volume = 0.3;
eraserSound.volume = 0.3;
clickSound.volume = 0.5;
fruitLoadSound.volume = 0.4;
bgMusic.volume = 0.2;
bgMusic.loop = true;

// Start music after first interaction
let musicStarted = false;
document.body.addEventListener('click', () => {
  if(!musicStarted) {
    bgMusic.play().catch(()=>console.log("User interaction required."));
    musicStarted = true;
  }
}, { once: true });

// ===== Resize Canvas =====
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 500);
  canvas.width = size;
  canvas.height = size;

  // redraw last state
  if(undoStack.length > 0){
    let img = new Image();
    img.src = undoStack[undoStack.length - 1];
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else if(fruitImg.src) {
    ctx.drawImage(fruitImg, 0, 0, canvas.width, canvas.height);
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== Colors =====
['red','yellow','green','orange','purple'].forEach(c=>{
  document.getElementById(`color-${c}`).addEventListener('click', ()=>{
    color=c; playClick();
  });
});

// Eraser
document.getElementById('eraser').addEventListener('click', ()=>{ color='white'; playClick(); });

// Brush size
document.getElementById('brush-size').addEventListener('change', e=>{
  brushSize = parseInt(e.target.value);
  playClick();
});

// Fruits
['apple','banana','orange','mango','watermelon'].forEach(f=>{
  document.getElementById(`fruit-${f}`).addEventListener('click', ()=>loadFruit(`${f}.png`));
});

// Actions
document.getElementById('clear-btn').addEventListener('click', ()=>{ clearCanvas(); playClick(); });
document.getElementById('undo-btn').addEventListener('click', ()=>{ undo(); playClick(); });
document.getElementById('redo-btn').addEventListener('click', ()=>{ redo(); playClick(); });
document.getElementById('save-btn').addEventListener('click', ()=>{ saveCanvas(); playClick(); });

// ===== Drawing =====
canvas.addEventListener('mousedown', () => { painting = true; saveState(); });
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mousemove', draw);

// Touch support
canvas.addEventListener('touchstart', e => { painting = true; saveState(); e.preventDefault(); });
canvas.addEventListener('touchend', () => painting = false);
canvas.addEventListener('touchmove', e => {
  if(!painting) return;
  const touch = e.touches[0];
  draw({ offsetX: touch.clientX - canvas.getBoundingClientRect().left, offsetY: touch.clientY - canvas.getBoundingClientRect().top });
  e.preventDefault();
});

// ===== Draw function =====
function draw(e) {
  if(!painting) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, brushSize, 0, Math.PI*2);
  ctx.fill();

  if(color==='white'){ eraserSound.currentTime=0; eraserSound.play(); }
  else { brushSound.currentTime=0; brushSound.play(); }
}

// ===== Clear Canvas =====
function clearCanvas() {
  saveState();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(fruitImg.src) ctx.drawImage(fruitImg,0,0,canvas.width,canvas.height);
}

// ===== Load Fruit =====
function loadFruit(filename) {
  fruitImg.src = `images/${filename}`;
  fruitImg.onload = () => {
    saveState();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(fruitImg,0,0,canvas.width,canvas.height);
    fruitLoadSound.currentTime=0;
    fruitLoadSound.play();
  };
}

// ===== Undo/Redo =====
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack=[];
}

function undo() {
  if(undoStack.length===0) return;
  redoStack.push(canvas.toDataURL());
  let img = new Image();
  img.src = undoStack.pop();
  img.onload = ()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);
}

function redo() {
  if(redoStack.length===0) return;
  undoStack.push(canvas.toDataURL());
  let img = new Image();
  img.src = redoStack.pop();
  img.onload = ()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);
}

// ===== Save Canvas =====
function saveCanvas() {
  const link=document.createElement('a');
  link.download='my_fruit_coloring.png';
  link.href=canvas.toDataURL();
  link.click();
}

// ===== Click Sound =====
function playClick() {
  clickSound.currentTime=0;
  clickSound.play();
}

// ===== PWA Service Worker Registration =====
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.log('Service Worker failed', err));
  });
}
