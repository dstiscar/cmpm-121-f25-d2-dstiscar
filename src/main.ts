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
const clearButton = document.getElementById("clearButton") as HTMLCanvasElement;
const undoButton = document.getElementById("undoButton") as HTMLCanvasElement;
const redoButton = document.getElementById("redoButton") as HTMLCanvasElement;

const redrawEvent = new Event("redraw");

interface Command {
  display(ctx: CanvasRenderingContext2D): void;
}

const commands: Command[] = [];
const redoCommands: Command[] = [];
let currentLine: Array<{ x: number; y: number }> = [];
let isDrawing = false;

function createDrawLineCommand(points: Array<{ x: number; y: number }>) {
  return {
    display(ctx: CanvasRenderingContext2D) {
      if (points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    },
  };
}

myCanvas.addEventListener("redraw", () => {
  const ctx = myCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  for (const cmd of commands) {
    cmd.display(ctx);
  }
  if (currentLine.length > 0) createDrawLineCommand(currentLine).display(ctx);
});

myCanvas.addEventListener("mousedown", (e) => {
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  redoCommands.splice(0, redoCommands.length);
  isDrawing = true;
  myCanvas.dispatchEvent(redrawEvent);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    myCanvas.dispatchEvent(redrawEvent);
  }
});

myCanvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    commands.push(createDrawLineCommand(currentLine));
    currentLine = [];
    myCanvas.dispatchEvent(redrawEvent);
  }
  isDrawing = false;
});

clearButton.addEventListener("click", () => {
  commands.splice(0, commands.length);
  myCanvas.dispatchEvent(redrawEvent);
});

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    const cmd = commands.pop();
    if (cmd) {
      redoCommands.push(cmd);
      myCanvas.dispatchEvent(redrawEvent);
    }
  }
});

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    const cmd = redoCommands.pop();
    if (cmd) {
      commands.push(cmd);
      myCanvas.dispatchEvent(redrawEvent);
    }
  }
});