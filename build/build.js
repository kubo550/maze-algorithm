var grid = [];
var cols;
var rows;
var current;
var isLooping = true;
var stack = [];
var canvasWidthSlider;
var canvasHeightSlider;
var tileSizeSlider;
var frameRateSlider;
var stopStartButton;
var canvas;
var stackDiv;
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
function readIfNotExist(key) {
    var item = localStorage.getItem(key);
    if (item) {
        canvasWidthSlider.value(+item);
    }
}
function setup() {
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
    stopStartButton = createButton("Stop");
    stackDiv = createDiv();
    restartCanvas();
    frameRate(+frameRateSlider.value());
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
function displayStackOnHTML(stack) {
    stackDiv.html("STACK: " + stack.map(function (cell) { return cell.toString(); }).join(" -> "));
}
function draw() {
    var _a;
    background(51);
    grid.forEach(function (cell) { return cell.show(); });
    displayStackOnHTML(stack);
    current.isVisited = true;
    var next = current.checkNeighbors();
    if (next) {
        next.isVisited = true;
        stack.push(current);
        _a = removeWalls(current, next), current = _a[0], next = _a[1];
        current = next;
    }
    else if (stack.length > 0) {
        current = stack.pop();
    }
    else {
        console.log("done");
    }
    canvasWidthSlider.mouseClicked(function () { return restartCanvas(); });
    canvasHeightSlider.mouseClicked(function () { return restartCanvas(); });
    tileSizeSlider.mouseClicked(function () { return restartCanvas(); });
    frameRateSlider.mouseClicked(function () { return frameRate(+frameRateSlider.value()); });
    stopStartButton.mouseClicked(function () { return isLooping ? stopLooping() : startLooping(); });
}
function restartCanvas() {
    localStorage.setItem("canvasWidth", canvasWidthSlider.value().toString());
    localStorage.setItem("canvasHeight", canvasHeightSlider.value().toString());
    localStorage.setItem("tileSize", tileSizeSlider.value().toString());
    localStorage.setItem("frameRate", frameRateSlider.value().toString());
    stack.length = 0;
    startLooping();
    canvas && canvas.remove();
    var canvasWidthPossibleToDivideByTileSize = Math.floor(+canvasWidthSlider.value() / +tileSizeSlider.value()) * +tileSizeSlider.value();
    var canvasHeightPossibleToDivideByTileSize = Math.floor(+canvasHeightSlider.value() / +tileSizeSlider.value()) * +tileSizeSlider.value();
    canvas = createCanvas(canvasWidthPossibleToDivideByTileSize, canvasHeightPossibleToDivideByTileSize);
    cols = width / +tileSizeSlider.value();
    rows = height / +tileSizeSlider.value();
    grid.length = 0;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            var cell = new Cell(x, y);
            grid.push(cell);
        }
    }
    current = grid[0];
}
var Cell = (function () {
    function Cell(x, y) {
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true];
        this.isVisited = false;
    }
    Cell.prototype.show = function () {
        var x = this.x * +tileSizeSlider.value();
        var y = this.y * +tileSizeSlider.value();
        stroke(255);
        if (this.walls[0]) {
            line(x, y, x + +tileSizeSlider.value(), y);
        }
        if (this.walls[1]) {
            line(x + +tileSizeSlider.value(), y, x + +tileSizeSlider.value(), y + +tileSizeSlider.value());
        }
        if (this.walls[2]) {
            line(x + +tileSizeSlider.value(), y + +tileSizeSlider.value(), x, y + +tileSizeSlider.value());
        }
        if (this.walls[3]) {
            line(x, y + +tileSizeSlider.value(), x, y);
        }
        if (this.isVisited) {
            noStroke();
            fill(255, 0, 255, 100);
            rect(x, y, +tileSizeSlider.value(), +tileSizeSlider.value());
        }
        if (this === current) {
            noStroke();
            fill(0, 255, 0, 100);
            rect(x, y, +tileSizeSlider.value(), +tileSizeSlider.value());
        }
    };
    Cell.prototype.checkNeighbors = function () {
        var neighbors = [];
        var top = grid[index(this.x, this.y - 1)];
        var right = grid[index(this.x + 1, this.y)];
        var bottom = grid[index(this.x, this.y + 1)];
        var left = grid[index(this.x - 1, this.y)];
        if (top && !top.isVisited) {
            neighbors.push(top);
        }
        if (right && !right.isVisited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.isVisited) {
            neighbors.push(bottom);
        }
        if (left && !left.isVisited) {
            neighbors.push(left);
        }
        if (neighbors.length > 0) {
            var r = floor(random(0, neighbors.length));
            return neighbors[r];
        }
        else {
            return undefined;
        }
    };
    Cell.prototype.toString = function () {
        return "(" + this.x + ", " + this.y + ")";
    };
    return Cell;
}());
function index(x, y) {
    if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
        return -1;
    }
    return x + y * cols;
}
function removeWalls(current, next) {
    var x = current.x - next.x;
    if (x === 1) {
        current.walls[3] = false;
        next.walls[1] = false;
    }
    else if (x === -1) {
        current.walls[1] = false;
        next.walls[3] = false;
    }
    var y = current.y - next.y;
    if (y === 1) {
        current.walls[0] = false;
        next.walls[2] = false;
    }
    else if (y === -1) {
        current.walls[2] = false;
        next.walls[0] = false;
    }
    return [current, next];
}
//# sourceMappingURL=build.js.map