import "./style.css";

document.body.innerHTML = `
<h1>Draw Canvas</h1>
<canvas id="myCanvas" width="512" height="512"></canvas>
<br><br>
<button id="clearButton">clear</button>
<button id="undoButton">undo</button>
<button id="redoButton">redo</button>
<button id="exportButton">export</button>
<br><br>
`;

const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
myCanvas.style.cursor = "none";
const clearButton = document.getElementById("clearButton") as HTMLCanvasElement;
const undoButton = document.getElementById("undoButton") as HTMLCanvasElement;
const redoButton = document.getElementById("redoButton") as HTMLCanvasElement;
const exportButton = document.getElementById(
  "exportButton",
) as HTMLCanvasElement;

const redrawEvent = new Event("redraw");
const toolMovedEvent = new Event("tool-moved");

interface Marker {
  name: string;
  image: string;
  width: number;
}

const markers: Marker[] = [
  {
    name: "thin",
    image: "‧",
    width: 5,
  },
  {
    name: "thick",
    image: "●",
    width: 20,
  },
  {
    name: "smile",
    image: "😁 ",
    width: 0,
  },
  {
    name: "flower",
    image: "🌻",
    width: 0,
  },
  {
    name: "sparkle",
    image: "✨",
    width: 0,
  },
  {
    name: "custom",
    image: "✏️",
    width: 0,
  },
];

interface Command {
  display(ctx: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}

interface Preview {
  point: Point;
  text: string;
  angle: number;
  visible: boolean;
}

const commands: Command[] = [];
const redoCommands: Command[] = [];
const preview: Preview = {
  point: { x: 0, y: 0 },
  text: "‧",
  angle: 0,
  visible: true,
};
let currentLine: Array<Point> = [];
let isDrawing = false;
let currentWidth = 5;
let currentImage = "‧";
let defaultPrompt = "✏️";
let imageAngle = 0;

markers.forEach((marker: Marker) => {
  const btn = document.createElement("button");
  if (marker.name == "custom") {
    btn.innerHTML = "Custom";
  } else {
    btn.innerHTML = marker.image;
  }
  document.body.append(btn);
  btn.addEventListener("click", () => {
    if (marker.name == "custom") {
      const text = prompt("Custom sticker text", defaultPrompt);
      if (text) {
        defaultPrompt = text;
        marker.image = text;
      }
    }
    preview.text = marker.image;
    currentWidth = marker.width;
    currentImage = marker.image;

    myCanvas.dispatchEvent(redrawEvent);
    myCanvas.dispatchEvent(toolMovedEvent);
  });
});

const rotateRange = document.createElement("input");
rotateRange.type = "range";
rotateRange.min = (0).toString();
rotateRange.max = (360).toString();
rotateRange.step = (22.5).toString();
rotateRange.value = imageAngle.toString();
document.body.append(document.createElement("br"));
document.body.append(document.createElement("br"));
document.body.append("Rotate")
document.body.append(rotateRange);

function createDrawLineCommand(
  points: Array<Point>,
  width: number,
): Command {
  return {
    display(ctx: CanvasRenderingContext2D) {
      if (points.length === 0) return;
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    },
  };
}

function createDrawImageCommand(x: number, y: number, image: string, angle: number): Command {
  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);

      ctx.font = "48px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(image, 0, 0);
      ctx.restore();
    },
  };
}

function setPreview(
  preview: Preview,
): Command {
  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(preview.point.x, preview.point.y);
      ctx.rotate((preview.angle * Math.PI) / 180);

      ctx.font = "48px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(preview.text, 0, 0);
      ctx.restore();
    },
  };
}

myCanvas.addEventListener("redraw", () => {
  const ctx = myCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  for (const cmd of commands) {
    cmd.display(ctx);
  }
  if (currentLine.length > 0) {
    ctx.lineWidth = currentWidth;
    createDrawLineCommand(currentLine, currentWidth).display(ctx);
  }
});

myCanvas.addEventListener("tool-moved", () => {
  const ctx = myCanvas.getContext("2d")!;
  if (!isDrawing && preview.visible) {
    setPreview(preview).display(ctx);
  }
});

myCanvas.addEventListener("mousedown", (e) => {
  if (currentWidth > 0) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    redoCommands.splice(0, redoCommands.length);
    isDrawing = true;
    preview.visible = false;
  }
  myCanvas.dispatchEvent(redrawEvent);
  myCanvas.dispatchEvent(toolMovedEvent);
});

myCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
  } else {
    preview.point = { x: e.offsetX, y: e.offsetY };
    preview.angle = imageAngle;
  }
  myCanvas.dispatchEvent(redrawEvent);
  myCanvas.dispatchEvent(toolMovedEvent);
});

myCanvas.addEventListener("mouseup", (e) => {
  if (currentWidth > 0) {
    commands.push(createDrawLineCommand(currentLine, currentWidth));
    currentLine = [];
    isDrawing = false;
  } else {
    commands.push(createDrawImageCommand(e.offsetX, e.offsetY, currentImage, imageAngle));
    redoCommands.splice(0, redoCommands.length);
  }

  preview.visible = true;
  preview.point = { x: e.offsetX, y: e.offsetY };
  preview.angle = imageAngle;
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

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = myCanvas.width * 2;
  exportCanvas.height = myCanvas.height * 2;

  const ctx = exportCanvas.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  for (const cmd of commands) {
    cmd.display(ctx);
  }

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

rotateRange.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  imageAngle = parseFloat(target.value);

  preview.angle = imageAngle;

  myCanvas.dispatchEvent(redrawEvent);
  myCanvas.dispatchEvent(toolMovedEvent);
});
