import "./style.css";

document.body.innerHTML = `
<h1>Draw Canvas</h1>
<canvas id="myCanvas" width="256" height="256"></canvas>
<br><br>
<button id="clearButton">clear</button>
`;

let isDrawing = false;
let x = 0;
let y = 0;

const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
const clearButton = document.getElementById("clearButton") as HTMLCanvasElement;

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

myCanvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
  }
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
});
