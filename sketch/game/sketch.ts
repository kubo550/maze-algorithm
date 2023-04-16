const CANVAS_WIDTH = 400, CANVAS_HEIGHT = 400;
const grid: Cell[] = [];
const tileSize = 40;
let cols: number;
let rows: number;
let current: Cell;
let walls: Wall[] = [];
let bullets: Bullet[] = [];



const players: Tank[] = [];

let player: Tank;

function createWallsOnMazeAlgorithm() {
    const stack: Cell[] = [];

    while (true) {
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
            return createWallsBasedOnGrid(grid);
        }
    }
}

function generateRandomPosition(CANVAS_WIDTH: number, CANVAS_HEIGHT: number, tileSize: number) {
    const x = (Math.floor(Math.random() * CANVAS_WIDTH / tileSize) * tileSize) + tileSize / 2
    const y = (Math.floor(Math.random() * CANVAS_HEIGHT / tileSize) * tileSize) + tileSize / 2
    return {x, y};

}

function setup() {
    console.log("🚀 - Setup initialized - P5 is running");

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cols = width / tileSize;
    rows = height / tileSize;


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }


    current = random(grid);
    walls = createWallsOnMazeAlgorithm();


    const {x, y} = generateRandomPosition(CANVAS_WIDTH, CANVAS_HEIGHT, tileSize);
    player = new Tank(x, y, 'red');
    players.push(player);

    const otherPlayer = new Tank(x, y, 'blue');
    players.push(otherPlayer);

}


function draw() {
    background(51);

    walls.forEach(wall => wall.show());
    players.forEach(player => player.update());
    bullets.forEach(bullet => bullet.update());
    bullets = bullets.filter(bullet => bullet.isAlive());
}


function keyPressed() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({up: true});
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({left: true});
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({right: true});
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({down: true});
    }
    if (keyCode === 32) {
        player.shoot();
    }
}

function keyReleased() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({up: false});
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({left: false});
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({right: false});
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({down: false});
    }
}