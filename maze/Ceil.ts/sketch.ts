const grid: Cell[] = [];
const tileSize = 20;
let cols: number;
let rows: number;
let current: Cell;

const stack: Cell[] = [];

function setup() {
    createCanvas(400, 400)
    cols = width / tileSize;
    rows = height / tileSize;

    frameRate(20);


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }

    current = random(grid);

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
        console.log(grid);
    }
}

