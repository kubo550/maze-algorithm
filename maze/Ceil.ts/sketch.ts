const grid: Cell[] = [];
let cols: number;
let rows: number;
let current: Cell;
let isLooping = true;

const stack: Cell[] = [];

let canvasWidthSlider: p5.Element;
let canvasHeightSlider: p5.Element;
let tileSizeSlider: p5.Element;
let frameRateSlider: p5.Element;
let stopStartButton: p5.Element;
let canvas: p5.Renderer;


function setup() {
    canvasWidthSlider = createSlider(40, windowWidth, 400, 10);
    canvasHeightSlider = createSlider(40, windowHeight, 400, 10);
    tileSizeSlider = createSlider(10, 100, 40, 10);
    frameRateSlider = createSlider(1, 60, 15, 1);
    stopStartButton = createButton("Stop");

    restartCanvas();
    frameRate(
        +frameRateSlider.value()
    );
}


function stopLooping() {
    stopStartButton.html("Start");
    noLoop();
    isLooping = false;
}

function startLooping() {
    stopStartButton.html("Stop");
    loop();
    isLooping = true;
}

function draw() {
    background(51);

    grid.forEach(cell => cell.show());

    current.isVisited = true;
    let next = current.checkNeighbors();
    if (next) {
        next.isVisited = true;
        stack.push(current);
        [current, next] = removeWalls(current, next);
        current = next;
    } else if (stack.length > 0) {
        current = stack.pop();
    } else {
        console.log("done");
    }

    canvasWidthSlider.mouseClicked(() => restartCanvas());
    canvasHeightSlider.mouseClicked(() => restartCanvas());
    tileSizeSlider.mouseClicked(() => restartCanvas());
    frameRateSlider.mouseClicked(() => frameRate(+frameRateSlider.value()));
    stopStartButton.mouseClicked(() => isLooping ? stopLooping() : startLooping());
}


function restartCanvas() {
    console.log({width, height, tileSize: +tileSizeSlider.value()});

    startLooping();
    canvas && canvas.remove();
    canvas = createCanvas(+canvasWidthSlider.value(), +canvasHeightSlider.value());

    cols = width / +tileSizeSlider.value();
    rows = height / +tileSizeSlider.value();

    grid.length = 0
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }

    current = grid[0];
}
