
class Cell {
    walls: [boolean, boolean, boolean, boolean];
    isVisited: boolean;

    constructor(public x: number, public y: number) {
        this.walls = [true, true, true, true];
        this.isVisited = false;
    }

    show() {
        const x = this.x * +tileSizeSlider.value();
        const y = this.y * +tileSizeSlider.value();
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
    }

    checkNeighbors() {
        const neighbors = [];
        const top = grid[index(this.x, this.y - 1)];
        const right = grid[index(this.x + 1, this.y)];
        const bottom = grid[index(this.x, this.y + 1)];
        const left = grid[index(this.x - 1, this.y)];

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
            const r = floor(random(0, neighbors.length));
            return neighbors[r];
        } else {
            return undefined;
        }
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

function index(x: number, y: number) {
    if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
        return -1;
    }
    return x + y * cols;
}

function removeWalls(current: Cell, next: Cell): [Cell, Cell] {
    const x = current.x - next.x;
    if (x === 1) {
        current.walls[3] = false;
        next.walls[1] = false;
    } else if (x === -1) {
        current.walls[1] = false;
        next.walls[3] = false;
    }

    const y = current.y - next.y;
    if (y === 1) {
        current.walls[0] = false;
        next.walls[2] = false;
    } else if (y === -1) {
        current.walls[2] = false;
        next.walls[0] = false;
    }

    return [current, next];
}