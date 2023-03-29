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

    public width: number;
    public height: number;
    public rotation: number;

    public bullets: Bullet[];
    public bulletLimit: number;


    constructor(public x: number, public y: number, public color: string) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);

        this.width = 20;
        this.height = 30;
        this.rotation = 0;
        this.bullets = [];
        this.bulletLimit = 5;
    }

    show() {
        push();
        translate(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
        rotate(this.rotation);
        fill(this.color);
        rect(-this.width / 2, -this.height / 2, this.width, this.height);
        pop();
    }

    moveForward() {
        this.acc.add(p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(0.1));
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

        this.bullets.forEach(bullet => {
            bullet.update();
        });
        this.bullets = this.bullets.filter(bullet => !bullet.isDead());
        console.log(this.bullets.length)
    }

    shoot() {
        if (this.bullets.length < this.bulletLimit) {
            this.bullets.push(new Bullet(this.pos.x, this.pos.y, this.color, this.rotation));
        }

    }
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        player.moveForward();
    }
    if (keyCode === LEFT_ARROW) {
        player.rotation -= 0.1;
    }
    if (keyCode === RIGHT_ARROW) {
        player.rotation += 0.1;
    }

    if (keyCode === 32) {
        player.shoot();
    }
}


class Bullet {
    public pos: p5.Vector;
    public vel: p5.Vector;
    public lifespan: number;

    constructor(public x: number, public y: number, public color: string, public rotation: number) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(rotation - TWO_PI / 4).mult(5);
        this.lifespan = 255;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(this.color);
        ellipse(0, 0, 5, 5);
        pop();
    }

    update() {
        this.show();

        this.pos.add(this.vel);
        if (this.checkWallCollision(walls)) {
            console.log('hit')
            this.vel.mult(-1);
        }
        this.lifespan -= 5;
        if (this.isDead()) {
            this.pop();
        }
    }

    isDead() {
        return this.lifespan < 0;
    }

    pop() {
        console.log('pop');

    }

    checkWallCollision(walls: Wall[]) {
        return walls.some(wall => {
            return wall.isPointInside(this.pos.x, this.pos.y);
        });
    }
}