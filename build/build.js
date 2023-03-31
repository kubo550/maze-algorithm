var grid = [];
var tileSize = 20;
var cols;
var rows;
var current;
var stack = [];
function setup() {
    createCanvas(400, 400);
    cols = width / tileSize;
    rows = height / tileSize;
    frameRate(20);
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            var cell = new Cell(x, y);
            grid.push(cell);
        }
    }
    current = random(grid);
}
function draw() {
    var _a;
    background(51);
    grid.forEach(function (cell) { return cell.show(); });
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
        console.log(grid);
    }
}
var Cell = (function () {
    function Cell(x, y) {
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true];
        this.isVisited = false;
    }
    Cell.prototype.show = function () {
        var x = this.x * tileSize;
        var y = this.y * tileSize;
        stroke(255);
        if (this.walls[0]) {
            line(x, y, x + tileSize, y);
        }
        if (this.walls[1]) {
            line(x + tileSize, y, x + tileSize, y + tileSize);
        }
        if (this.walls[2]) {
            line(x + tileSize, y + tileSize, x, y + tileSize);
        }
        if (this.walls[3]) {
            line(x, y + tileSize, x, y);
        }
        if (this.isVisited) {
            noStroke();
            fill(255, 0, 255, 100);
            rect(x, y, tileSize, tileSize);
        }
        if (this === current) {
            noStroke();
            fill(0, 255, 0, 100);
            rect(x, y, tileSize, tileSize);
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