import "./style.css";

document.body.innerHTML = `
<h1>Drawing with mouse events</h1>
<canvas id="myCanvas" width="256" height="256"></canvas>
<br><br>
<button id="clearButton">clear</button>
`;

let isDrawing = false;
let x = 0;
let y = 0;

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
const clearButton = document.getElementById("clearButton");

myCanvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    x = e.offsetX;
    y = e.offsetY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    isDrawing = false;
  }
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
});
