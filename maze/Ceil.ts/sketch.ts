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
let stackDiv: p5.Element;
let showCoordsCheckbox: p5.Element;


function keyPressed() {
    if (key === " ") {
        isLooping ? stopLooping() : startLooping();
    }
    if (key === "r") {
        restartCanvas();
    }
    if (key === "s") {
        saveCanvas(canvas, "maze", "png");
    }
    if (key === "c") {
        localStorage.clear();
    }
}


function readIfNotExist(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
        canvasWidthSlider.value(+item);
    }
}

function setup() {
    stopStartButton = createButton("Stop");
    stackDiv = createDiv();
    showCoordsCheckbox = createCheckbox("Show coords", false);


    createP("Canvas width");
    canvasWidthSlider = createSlider(40, windowWidth, 400, 10);
    readIfNotExist("canvasWidth");

    createP("Canvas height");
    canvasHeightSlider = createSlider(40, windowHeight, 400, 10);
    readIfNotExist("canvasHeight");

    createP("Tile size");
    tileSizeSlider = createSlider(10, 100, 40, 10);
    readIfNotExist("tileSize");

    createP("Frame rate (FPS)");
    frameRateSlider = createSlider(1, 60, 15, 1);
    readIfNotExist("frameRate");

    createElement('br')
    createP('r -> Restart canvas')
    createP('s -> Save canvas as png')
    createP('space -> stop / start')
    createElement('br')

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

function displayStackOnHTML(stack: Cell[]) {
    stackDiv.html("STACK: " + stack.map(cell => cell.toString()).join(" -> "));
}

function draw() {
    background(51);

    // @ts-ignore
    grid.forEach(cell => cell.show({showCoords: showCoordsCheckbox.checked()}));

    displayStackOnHTML(stack);

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
    localStorage.setItem("canvasWidth", canvasWidthSlider.value().toString());
    localStorage.setItem("canvasHeight", canvasHeightSlider.value().toString());
    localStorage.setItem("tileSize", tileSizeSlider.value().toString());
    localStorage.setItem("frameRate", frameRateSlider.value().toString());

    stack.length = 0;

    startLooping();
    canvas && canvas.remove();
    const canvasWidthPossibleToDivideByTileSize = Math.floor(+canvasWidthSlider.value() / +tileSizeSlider.value()) * +tileSizeSlider.value();
    const canvasHeightPossibleToDivideByTileSize = Math.floor(+canvasHeightSlider.value() / +tileSizeSlider.value()) * +tileSizeSlider.value();
    canvas = createCanvas(canvasWidthPossibleToDivideByTileSize, canvasHeightPossibleToDivideByTileSize);

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
