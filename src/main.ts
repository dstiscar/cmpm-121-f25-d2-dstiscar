import "./style.css";

document.body.innerHTML = `
<h1>Draw Canvas</h1>
<canvas id="myCanvas" width="256" height="256"></canvas>
<br><br>
<button id="clearButton">clear</button>
<button id="undoButton">undo</button>
<button id="redoButton">redo</button>
`;

const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
const clearButton = document.getElementById("clearButton") as HTMLCanvasElement;
const undoButton = document.getElementById("undoButton") as HTMLCanvasElement;
const redoButton = document.getElementById("redoButton") as HTMLCanvasElement;

const redrawEvent = new Event("redraw");

type Point = { x: number; y: number };
type Line = Point[];
const lines: Line[] = [];
const redoLines: Line[] = [];
let currentLine: Line = [];

let isDrawing = false;
let cx = 0;
let cy = 0;

myCanvas.addEventListener("redraw", () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const { x, y } = line[0];
      ctx.moveTo(x, y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
});

myCanvas.addEventListener("mousedown", (e) => {
  cx = e.offsetX;
  cy = e.offsetY;
  isDrawing = true;

  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cx, y: cy });
  redoLines.splice(0, redoLines.length);

  myCanvas.dispatchEvent(redrawEvent);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    cx = e.offsetX;
    cy = e.offsetY;
    currentLine.push({ x: cx, y: cy });
    myCanvas.dispatchEvent(redrawEvent);
  }
});

myCanvas.addEventListener("mouseup", () => {
  isDrawing = false;
  currentLine = [];
  myCanvas.dispatchEvent(redrawEvent);
});

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  myCanvas.dispatchEvent(redrawEvent);
});

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const popLine = lines.pop();
    if (popLine) {
      redoLines.push(popLine);
    }
    myCanvas.dispatchEvent(redrawEvent);
  }
});

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const popLine = redoLines.pop();
    if (popLine) {
      lines.push(popLine);
    }
    myCanvas.dispatchEvent(redrawEvent);
  }
});
