import "./style.css";

document.body.innerHTML = `
<h1>Draw Canvas</h1>
<canvas id="myCanvas" width="256" height="256"></canvas>
<br><br>
<button id="thinButton">thin</button>
<button id="thickButton">thick</button>
<br><br>
<button id="clearButton">clear</button>
<button id="undoButton">undo</button>
<button id="redoButton">redo</button>
`;

const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
myCanvas.style.cursor = "none";
const clearButton = document.getElementById("clearButton") as HTMLCanvasElement;
const undoButton = document.getElementById("undoButton") as HTMLCanvasElement;
const redoButton = document.getElementById("redoButton") as HTMLCanvasElement;
const thinButton = document.getElementById("thinButton") as HTMLCanvasElement;
const thickButton = document.getElementById("thickButton") as HTMLCanvasElement;

const redrawEvent = new Event("redraw");
const toolMovedEvent = new Event("tool-moved");

interface Command {
  width: number;
  display(ctx: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}

interface Preview {
  point: Point;
  text: string;
  visible: boolean;
}

const commands: Command[] = [];
const redoCommands: Command[] = [];
const preview: Preview = { point: { x: 0, y: 0 }, text: "‧", visible: false };
let currentLine: Array<Point> = [];
let isDrawing = false;
let currentWidth = 2;

function createDrawLineCommand(
  points: Array<{ x: number; y: number }>,
  width: number,
): Command {
  return {
    width,
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

function createPreview(
  preview: Preview,
): Command {
  return {
    width: 0,
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(preview.text, preview.point.x, preview.point.y + 4);
    },
  };
}

myCanvas.addEventListener("redraw", () => {
  const ctx = myCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  for (const cmd of commands) {
    ctx.lineWidth = cmd.width;
    cmd.display(ctx);
  }
  if (currentLine.length > 0) {
    ctx.lineWidth = currentWidth;
    createDrawLineCommand(currentLine, currentWidth).display(ctx);
  }
});

myCanvas.addEventListener("tool-moved", () => {
  const ctx = myCanvas.getContext("2d")!;
  if (!isDrawing) {
    createPreview(preview).display(ctx);
  }
});

myCanvas.addEventListener("mousedown", (e) => {
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  redoCommands.splice(0, redoCommands.length);
  isDrawing = true;
  preview.visible = false;
  myCanvas.dispatchEvent(redrawEvent);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
  } else {
    preview.point = { x: e.offsetX, y: e.offsetY };
  }
  myCanvas.dispatchEvent(redrawEvent);
  myCanvas.dispatchEvent(toolMovedEvent);
});

myCanvas.addEventListener("mouseup", (e) => {
  commands.push(createDrawLineCommand(currentLine, currentWidth));
  currentLine = [];

  isDrawing = false;

  preview.visible = true;
  preview.point = { x: e.offsetX, y: e.offsetY };
  myCanvas.dispatchEvent(redrawEvent);
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

thinButton.addEventListener("click", () => {
  preview.text = "‧";
  currentWidth = 2;
});

thickButton.addEventListener("click", () => {
  preview.text = "●";
  currentWidth = 9;
});
