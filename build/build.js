var Bullet = (function () {
    function Bullet(x, y, color, rotation) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotation = rotation;
        this.speed = 1.25;
        this.size = 7;
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(rotation - TWO_PI / 4).mult(this.speed);
        this.lifespan = 255;
    }
    Bullet.prototype.show = function () {
        push();
        ellipseMode(CENTER);
        noStroke();
        fill(this.color);
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        ellipse(0, 0, this.size, this.size);
        pop();
    };
    Bullet.prototype.update = function () {
        this.show();
        this.pos.add(this.vel);
        if (this.isCollidingWithWall(walls, 'vertical')) {
            this.vel.y *= -1;
        }
        if (this.isCollidingWithWall(walls, 'horizontal')) {
            this.vel.x *= -1;
        }
        this.lifespan -= 0.5;
        if (!this.isAlive()) {
            this.pop();
        }
    };
    Bullet.prototype.isAlive = function () {
        return this.lifespan >= 0;
    };
    Bullet.prototype.pop = function () {
        console.log('pop');
    };
    Bullet.prototype.isCollidingWithWall = function (walls, direction) {
        var _this = this;
        return walls.some(function (wall) {
            if (direction === 'horizontal') {
                return wall.isPointInside(_this.pos.x + _this.size / 2, _this.pos.y) || wall.isPointInside(_this.pos.x - _this.size / 2, _this.pos.y);
            }
            if (direction === 'vertical') {
                return wall.isPointInside(_this.pos.x, _this.pos.y + _this.size / 2) || wall.isPointInside(_this.pos.x, _this.pos.y - _this.size / 2);
            }
        });
    };
    return Bullet;
}());
var Particle = (function () {
    function Particle(position, velocity) {
        this.pos = position;
        this.vel = velocity;
        this.acc = createVector(0, 0);
        this.life = 255;
        this.lifespan = 255;
    }
    Particle.prototype.update = function () {
        this.show();
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.life -= 5;
    };
    Particle.prototype.isAlive = function () {
        return this.life > 0;
    };
    Particle.prototype.show = function () {
        push();
        fill(120, 120, 120, this.life / this.lifespan * 200);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 5);
        pop();
    };
    return Particle;
}());
var Tank = (function () {
    function Tank(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotateSpeed = 0.05;
        this.speed = 0.85;
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.movingController = new MovingControls();
        this.width = 15;
        this.height = 20;
        this.rotation = 0;
        this.bullets = [];
        this.particles = [];
        this.bulletLimit = 5;
    }
    Tank.prototype.update = function () {
        if (this.movingController.up) {
            this.moveForward();
        }
        if (this.movingController.down) {
            this.moveForward(-0.5);
        }
        if (this.movingController.left) {
            this.rotation -= this.rotateSpeed;
        }
        if (this.movingController.right) {
            this.rotation += this.rotateSpeed;
        }
        this.bullets.forEach(function (bullet) {
            bullet.update();
        });
        this.particles.forEach(function (particle) {
            particle.update();
        });
        this.checkWallCollision(walls);
        this.bullets = this.bullets.filter(function (bullet) { return bullet.isAlive(); });
        this.particles = this.particles.filter(function (particle) { return particle.isAlive(); });
        this.show();
    };
    Tank.prototype.shoot = function () {
        if (this.bullets.length < this.bulletLimit) {
            this.bullets.push(new Bullet(this.pos.x, this.pos.y, this.color, this.rotation));
        }
    };
    Tank.prototype.isPointInside = function (x, y) {
        return x > this.pos.x && x < this.pos.x + this.width && y > this.pos.y && y < this.pos.y + this.height;
    };
    Tank.prototype.checkWallCollision = function (walls) {
        var _this = this;
        walls.forEach(function (wall) {
            if (wall.isPolygonInside(_this.getPolygon())) {
                _this.pos.sub(_this.vel);
                _this.rotation -= _this.rotateSpeed;
                if (random() > 0.75) {
                    _this.showSmokeParticles();
                }
            }
        });
    };
    Tank.prototype.show = function () {
        push();
        rectMode(CENTER);
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(this.color);
        rect(0, 0, this.width, this.height);
        pop();
    };
    Tank.prototype.moveForward = function (dir) {
        if (dir === void 0) { dir = 1; }
        this.vel = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(this.speed * dir);
        this.pos.add(this.vel);
    };
    Tank.prototype.getPolygon = function () {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.width / 2, this.pos.y - this.height / 2), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width + this.width / 2, 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
    };
    Tank.prototype.showSmokeParticles = function () {
        var oppositeDirectionVector = p5.Vector.fromAngle(random((this.rotation + PI / 2) - PI / 8, (this.rotation + PI / 2) + PI / 8));
        this.particles.push(new Particle(this.pos.copy(), oppositeDirectionVector, 'gray'));
    };
    return Tank;
}());
var MovingControls = (function () {
    function MovingControls() {
        this.up = false;
        this.left = false;
        this.right = false;
        this.down = false;
    }
    MovingControls.prototype.setControls = function (_a) {
        var up = _a.up, left = _a.left, right = _a.right, down = _a.down;
        this.up = up !== null && up !== void 0 ? up : this.up;
        this.left = left !== null && left !== void 0 ? left : this.left;
        this.right = right !== null && right !== void 0 ? right : this.right;
        this.down = down !== null && down !== void 0 ? down : this.down;
    };
    return MovingControls;
}());
function createWallsBasedOnGrid(grid) {
    var walls = [];
    grid.forEach(function (cell) {
        var x = cell.x * tileSize;
        var y = cell.y * tileSize;
        if (cell.walls[0]) {
            walls.push(new Wall(x, y, tileSize, 1, 'pink'));
        }
        if (cell.walls[1]) {
            walls.push(new Wall(x + tileSize, y, 1, tileSize, 'pink'));
        }
        if (cell.walls[2]) {
            walls.push(new Wall(x, y + tileSize, tileSize, 1, 'pink'));
        }
        if (cell.walls[3]) {
            walls.push(new Wall(x, y, 1, tileSize, 'pink'));
        }
    });
    return walls;
}
var Wall = (function () {
    function Wall(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    Wall.prototype.show = function () {
        push();
        noStroke();
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
        pop();
    };
    Wall.prototype.isPointInside = function (x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    };
    Wall.prototype.isPolygonInside = function (otherPolygon) {
        var itsPolygon = this.getPolygon();
        var testPolygonPolygon = SAT.testPolygonPolygon(otherPolygon, itsPolygon);
        if (testPolygonPolygon) {
            push();
            noStroke();
            fill('red');
            rect(this.x, this.y, this.width, this.height);
            pop();
        }
        return testPolygonPolygon;
    };
    Wall.prototype.getPolygon = function () {
        return new SAT.Polygon(new SAT.Vector(this.x, this.y), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width, 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
    };
    return Wall;
}());
var CANVAS_WIDTH = 400, CANVAS_HEIGHT = 400;
var grid = [];
var tileSize = 40;
var cols;
var rows;
var current;
var walls = [];
var stack = [];
var player;
function createWallsOnMazeAlgorithm() {
    var _a;
    while (true) {
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
            return createWallsBasedOnGrid(grid);
        }
    }
}
function generateRandomPosition(CANVAS_WIDTH, CANVAS_HEIGHT, tileSize) {
    var x = (Math.floor(Math.random() * CANVAS_WIDTH / tileSize) * tileSize) + tileSize / 2;
    var y = (Math.floor(Math.random() * CANVAS_HEIGHT / tileSize) * tileSize) + tileSize / 2;
    return { x: x, y: y };
}
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cols = width / tileSize;
    rows = height / tileSize;
    for (var y_1 = 0; y_1 < rows; y_1++) {
        for (var x_1 = 0; x_1 < cols; x_1++) {
            var cell = new Cell(x_1, y_1);
            grid.push(cell);
        }
    }
    current = random(grid);
    walls = createWallsOnMazeAlgorithm();
    var _a = generateRandomPosition(CANVAS_WIDTH, CANVAS_HEIGHT, tileSize), x = _a.x, y = _a.y;
    player = new Tank(x, y, 'red');
}
function draw() {
    background(51);
    walls.forEach(function (wall) { return wall.show(); });
    player.update();
}
function keyPressed() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({ up: true });
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({ left: true });
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({ right: true });
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({ down: true });
    }
    if (keyCode === 32) {
        player.shoot();
    }
}
function keyReleased() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({ up: false });
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({ left: false });
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({ right: false });
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({ down: false });
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