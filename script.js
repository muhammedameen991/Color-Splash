// ======= Canvas Setup =======
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let color = 'red';
let painting = false;
let brushSize = 10;
let fruitImg = new Image();

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// ======= Load Sounds =======
const brushSound = new Audio('sounds/brush.mp3');         // drawing
const eraserSound = new Audio('sounds/eraser.mp3');       // erasing
const clickSound = new Audio('sounds/click.mp3');         // button clicks
const fruitLoadSound = new Audio('sounds/fruit-load.mp3'); // fruit load
const bgMusic = new Audio('sounds/background.mp3');       // background music

// Optional: adjust volumes
brushSound.volume = 0.3;
eraserSound.volume = 0.3;
clickSound.volume = 0.5;
fruitLoadSound.volume = 0.4;
bgMusic.volume = 0.2;
bgMusic.loop = true;

// ======= Start background music after first user interaction =======
let musicStarted = false;
document.body.addEventListener('click', () => {
  if(!musicStarted) {
    bgMusic.play().catch(() => {
      console.log("Background music requires user interaction to play.");
    });
    musicStarted = true;
  }
}, { once: true });

// ======= Color Buttons =======
document.getElementById('color-red').addEventListener('click', () => { color='red'; playClick(); });
document.getElementById('color-yellow').addEventListener('click', () => { color='yellow'; playClick(); });
document.getElementById('color-green').addEventListener('click', () => { color='green'; playClick(); });
document.getElementById('color-orange').addEventListener('click', () => { color='orange'; playClick(); });
document.getElementById('color-purple').addEventListener('click', () => { color='purple'; playClick(); });

// Eraser Button
document.getElementById('eraser').addEventListener('click', () => { color='white'; playClick(); });

// ======= Brush Size =======
document.getElementById('brush-size').addEventListener('change', (e) => { 
  brushSize = parseInt(e.target.value); 
  playClick(); 
});

// ======= Fruit Buttons =======
const fruits = ['apple', 'banana', 'orange', 'mango', 'watermelon'];
fruits.forEach(fruit => {
  document.getElementById(`fruit-${fruit}`).addEventListener('click', () => loadFruit(`${fruit}.png`));
});

// ======= Action Buttons =======
document.getElementById('clear-btn').addEventListener('click', () => { clearCanvas(); playClick(); });
document.getElementById('undo-btn').addEventListener('click', () => { undo(); playClick(); });
document.getElementById('redo-btn').addEventListener('click', () => { redo(); playClick(); });
document.getElementById('save-btn').addEventListener('click', () => { saveCanvas(); playClick(); });

// ======= Drawing Events =======
canvas.addEventListener('mousedown', () => { painting = true; saveState(); });
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if(!painting) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, brushSize, 0, Math.PI * 2);
  ctx.fill();

  // Play brush or eraser sound
  if(color === 'white') {
    eraserSound.currentTime = 0;
    eraserSound.play();
  } else {
    brushSound.currentTime = 0;
    brushSound.play();
  }
}

// ======= Clear Canvas =======
function clearCanvas() {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(fruitImg.src) ctx.drawImage(fruitImg, 0, 0, canvas.width, canvas.height);
}

// ======= Load Fruit Image =======
function loadFruit(filename) {
  fruitImg.src = `images/${filename}`;
  fruitImg.onload = () => {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fruitImg, 0, 0, canvas.width, canvas.height);
    fruitLoadSound.currentTime = 0;
    fruitLoadSound.play();
  };
}

// ======= Undo / Redo =======
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = [];
}

function undo() {
  if(undoStack.length === 0) return;
  redoStack.push(canvas.toDataURL());
  let previous = undoStack.pop();
  let img = new Image();
  img.src = previous;
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function redo() {
  if(redoStack.length === 0) return;
  undoStack.push(canvas.toDataURL());
  let next = redoStack.pop();
  let img = new Image();
  img.src = next;
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// ======= Save Canvas as PNG =======
function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'my_fruit_coloring.png';
  link.href = canvas.toDataURL();
  link.click();
}

// ======= Play Click Sound =======
function playClick() {
  clickSound.currentTime = 0;
  clickSound.play();
}
