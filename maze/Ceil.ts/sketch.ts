// https://www.youtube.com/watch?v=sVcB8vUFlmU
const grid: Cell[] = [];
const tileSize = 40;
let cols: number;
let rows: number;
let current: Cell;

const stack: Cell[] = [];

function setup() {
    console.log("🚀 - Setup initialized - P5 is running");

    createCanvas(400, 400)
    cols = width / tileSize;
    rows = height / tileSize;


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }

    current = random(grid);

    // while (true) {
    //
    // }

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

