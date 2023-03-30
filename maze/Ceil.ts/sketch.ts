// https://www.youtube.com/watch?v=sVcB8vUFlmU

const CANVAS_WIDTH = 400, CANVAS_HEIGHT = 400;
const grid: Cell[] = [];
const tileSize = 40;
let cols: number;
let rows: number;
let current: Cell;
let walls: Wall[] = [];

const stack: Cell[] = [];

let player: Tank;


function createWallsOnMazeAlgorithm() {
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

function setup() {
    console.log("🚀 - Setup initialized - P5 is running");

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cols = width / tileSize;
    rows = height / tileSize;

    player = new Tank(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, 'red');

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }


    current = random(grid);
    walls = createWallsOnMazeAlgorithm();

}


function draw() {
    background(51);

    walls.forEach(wall => wall.show());

    player.show();
    player.update();

}

class Tank {

    public pos: p5.Vector;
    public vel: p5.Vector;
    public acc: p5.Vector;

    public movingController: MovingControls;

    public width: number;
    public height: number;
    public rotation: number;

    public bullets: Bullet[];
    public bulletLimit: number;


    constructor(public x: number, public y: number, public color: string) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);

        this.movingController = new MovingControls();

        this.width = 15;
        this.height = 20;
        this.rotation = 0;
        this.bullets = [];
        this.bulletLimit = 5;
    }

    private readonly rotateSpeed = 0.05;


    show() {
        push();
        translate(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
        rotate(this.rotation);
        fill(this.color);
        rect(-this.width / 2, -this.height / 2, this.width, this.height);
        pop();
    }

    moveForward(dir = 1) {
        this.vel = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(dir);
        this.pos.add(this.vel);
    }


    update() {
        if (this.movingController.up) {
            this.moveForward();
        }
        if (this.movingController.down) {
            this.moveForward(-1);
        }
        if (this.movingController.left) {
            this.rotation -= this.rotateSpeed;
        }
        if (this.movingController.right) {
            this.rotation += this.rotateSpeed;
        }

        this.bullets.forEach(bullet => {
            bullet.update();
        });

        this.checkWallCollision(walls);
        this.bullets = this.bullets.filter(bullet => bullet.isAlive());
    }

    shoot() {
        if (this.bullets.length < this.bulletLimit) {
            this.bullets.push(new Bullet(this.pos.x, this.pos.y, this.color, this.rotation));
        }
    }

    isPointInside(x: number, y: number) {
        return x > this.pos.x && x < this.pos.x + this.width && y > this.pos.y && y < this.pos.y + this.height;
    }

    checkWallCollision(walls: Wall[]) {
        walls.forEach(wall => {
            if (wall.isPointInside(this.pos.x, this.pos.y)) {
                this.vel.mult(0);
            }
        });
    }
}

class MovingControls {
    up: boolean;
    left: boolean;
    right: boolean;
    down: boolean;

    constructor() {
        this.up = false;
        this.left = false;
        this.right = false;
        this.down = false;
    }

    reset() {
        this.up = false;
        this.left = false;
        this.right = false;
        this.down = false;
    }

    setControls({up, left, right, down}: Partial<Pick<MovingControls, 'left' | 'right' | 'up' | 'down'>>) {
        this.up = up ?? this.up;
        this.left = left ?? this.left;
        this.right = right ?? this.right;
        this.down = down ?? this.down;
    }
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