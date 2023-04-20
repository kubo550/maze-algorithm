var Bullet = (function () {
    function Bullet(id, x, y, color, rotation) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotation = rotation;
        this.speed = 2.25;
        this.size = 5;
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
        this.handleCollision(walls);
        this.handleCollision(players);
        this.pos.add(this.vel);
        this.show();
        this.lifespan -= 0.5;
        if (!this.isAlive()) {
            this.pop();
        }
        socket.emit('bulletMoved', { position: { x: this.pos.x, y: this.pos.y }, id: this.id });
    };
    Bullet.prototype.isAlive = function () {
        return this.lifespan >= 0;
    };
    Bullet.prototype.pop = function () { };
    Bullet.prototype.handleCollision = function (others) {
        var _this = this;
        others.forEach(function (other) {
            if (other.isPolygonInside(_this.getPolygon())) {
                if (other instanceof Wall) {
                    _this.vel.mult(0);
                    _this.lifespan = 0;
                }
                if (other instanceof Tank) {
                    _this.vel.mult(0);
                    _this.lifespan = 0;
                    other.explode();
                }
            }
        });
    };
    Bullet.prototype.getPolygon = function () {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.size / 2, this.pos.y - this.size / 2), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.size, 0),
            new SAT.Vector(this.size, this.size),
            new SAT.Vector(0, this.size)
        ]);
    };
    Bullet.prototype.setPosition = function (pos) {
        this.pos = createVector(pos.x, pos.y);
    };
    return Bullet;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        this.vel.mult(0.98);
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
var TankExplosionParticle = (function (_super) {
    __extends(TankExplosionParticle, _super);
    function TankExplosionParticle(position, velocity, color) {
        if (color === void 0) { color = "red"; }
        var _this = _super.call(this, position, velocity) || this;
        _this.color = color;
        _this.total = random(5, 15);
        _this.radius = random(1.5, 3.5);
        _this.life = 1000;
        _this.offset = [];
        for (var i = 0; i < _this.total; i++) {
            _this.offset[i] = random(-_this.radius * 0.5, _this.radius * 0.5);
        }
        return _this;
    }
    TankExplosionParticle.prototype.show = function () {
        push();
        stroke('black');
        fill(this.color);
        translate(this.pos.x, this.pos.y);
        beginShape();
        for (var i = 0; i < this.total; i++) {
            var angle = map(i, 0, this.total, 0, TWO_PI);
            var r = this.radius + this.offset[i];
            var x = r * cos(angle);
            var y = r * sin(angle);
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    };
    return TankExplosionParticle;
}(Particle));
var Tank = (function () {
    function Tank(x, y, color, rotation, id, name) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotateSpeed = 0.09;
        this.speed = 1.3;
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.movingController = new MovingControls();
        this.rotation = rotation;
        this.id = id;
        this.name = name;
        this.width = 15;
        this.height = 20;
        this.particles = [];
        this.bulletLimit = 100;
        this.barrelLength = 10;
        this.isShooting = false;
        this.isAlive = true;
    }
    Tank.prototype.update = function () {
        if (this.movingController.up) {
            this.moveForward();
        }
        if (this.movingController.down) {
            this.moveForward(-this.speed / 2);
        }
        if (this.movingController.left) {
            this.rotation -= this.rotateSpeed;
            this.emitMove();
        }
        if (this.movingController.right) {
            this.rotation += this.rotateSpeed;
            this.emitMove();
        }
        if (this.isShooting) {
            this.showSmokeParticles();
            this.barrelLength -= 0.5;
        }
        this.particles.forEach(function (particle) {
            particle.update();
        });
        this.checkWallCollision(walls);
        this.particles = this.particles.filter(function (particle) { return particle.isAlive(); });
        this.show();
    };
    Tank.prototype.shoot = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.emitEvent, emitEvent = _c === void 0 ? true : _c, bulletId = _b.bulletId;
        if (bullets.length < this.bulletLimit && !this.isShooting) {
            this.barrelLength = 20;
            this.isShooting = true;
            var positionBeforeTank = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(this.height / 2 + 7);
            var position = p5.Vector.add(this.pos, positionBeforeTank);
            bulletId = bulletId || random(100000).toString();
            var bullet = new Bullet(bulletId, position.x, position.y, this.color, this.rotation);
            emitEvent && socket.emit('playerShoot', { id: bullet.id, position: { x: bullet.pos.x, y: bullet.pos.y } });
            bullets.push(bullet);
            setTimeout(function () {
                _this.barrelLength = 10;
                _this.isShooting = false;
            }, 200);
        }
    };
    Tank.prototype.checkWallCollision = function (walls) {
        var _this = this;
        walls.forEach(function (wall) {
            if (wall.isPolygonInside(_this.getPolygon())) {
                _this.pos.sub(_this.vel);
                _this.emitMove();
                _this.rotation -= _this.rotateSpeed / 2;
                if (random() > 0.75) {
                    _this.showSmokeParticles();
                }
            }
        });
    };
    Tank.prototype.isPolygonInside = function (otherPolygon) {
        var itsPolygon = this.getPolygon();
        var testPolygonPolygon = SAT.testPolygonPolygon(otherPolygon, itsPolygon);
        if (testPolygonPolygon) {
            push();
            rectMode(CENTER);
            translate(this.pos.x, this.pos.y);
            rotate(this.rotation);
            fill('pink');
            rect(0, 0, this.width, this.height);
            fill(0);
            rect(0, -this.height / 3, 5, 8);
            pop();
        }
        return testPolygonPolygon;
    };
    Tank.prototype.explode = function () {
        this.isAlive = false;
        this.particles = [];
        this.showTankExplosionParticles();
    };
    Tank.prototype.setPosition = function (pos, rotation) {
        this.pos = createVector(pos.x, pos.y);
        this.rotation = rotation;
    };
    Tank.prototype.show = function () {
        push();
        rectMode(CENTER);
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(this.isAlive ? this.color : 'white');
        rect(0, 0, this.width, this.height);
        fill(0);
        rect(0, -this.height / 3, 5, this.barrelLength);
        pop();
    };
    Tank.prototype.moveForward = function (dir) {
        if (dir === void 0) { dir = 1; }
        this.vel = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(this.speed * dir);
        this.pos.add(this.vel);
        this.emitMove();
    };
    Tank.prototype.emitMove = function () {
        socket.emit('playerMoved', { x: this.pos.x, y: this.pos.y, rotation: this.rotation, id: this.id });
    };
    Tank.prototype.getPolygon = function () {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.width / 2, this.pos.y - this.height / 2), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width / 2, 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
    };
    Tank.prototype.showSmokeParticles = function () {
        var oppositeDirectionVector = p5.Vector.fromAngle(random((this.rotation + PI / 2) - PI / 8, (this.rotation + PI / 2) + PI / 8));
        this.particles.push(new Particle(this.pos.copy(), oppositeDirectionVector));
    };
    Tank.prototype.showTankExplosionParticles = function () {
        for (var i = 0; i < 100; i++) {
            var randomDirectionVector = p5.Vector.fromAngle(random(TWO_PI)).mult(random(0.2, 1));
            this.particles.push(new Particle(this.pos.copy(), randomDirectionVector));
        }
        for (var i = 0; i < 5; i++) {
            var randomDirectionVector = p5.Vector.fromAngle(random(TWO_PI)).mult(random(0.3, 1));
            this.particles.push(new TankExplosionParticle(this.pos.copy(), randomDirectionVector, this.color));
        }
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
        var wallSize = 3;
        var color = 'gray';
        if (cell.walls[0]) {
            walls.push(new Wall(x, y, tileSize, wallSize, color));
        }
        if (cell.walls[1]) {
            walls.push(new Wall(x + tileSize, y, wallSize, tileSize, color));
        }
        if (cell.walls[2]) {
            walls.push(new Wall(x, y + tileSize, tileSize, wallSize, color));
        }
        if (cell.walls[3]) {
            walls.push(new Wall(x, y, wallSize, tileSize, color));
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
    Wall.prototype.isPolygonInside = function (otherPolygon) {
        var itsPolygon = this.getPolygon();
        var testPolygonPolygon = SAT.testPolygonPolygon(otherPolygon, itsPolygon);
        if (testPolygonPolygon) {
            push();
            noStroke();
            fill('pink');
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
    Wall.prototype.toString = function () {
        return 'wall';
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
var bullets = [];
var socket;
var restartGameButton;
var players = [];
var player;
function setup() {
    socket = io.connect('http://localhost:8080');
    socket.on('connect', function () {
        console.log('🚀 - Socket is connected');
    });
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cols = width / tileSize;
    rows = height / tileSize;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            var cell = new Cell(x, y);
            grid.push(cell);
        }
    }
    restartGameButton = createButton('Restart Game');
    restartGameButton.mousePressed(function () {
        socket.emit('restartGame');
    });
    current = random(grid);
    walls = createWallsOnMazeAlgorithm();
    socket.on('initLevel', function (data) {
        walls = generateWallObjects(data.walls);
        players = setupPlayers(data.players);
        player = players.find(function (p) { return p.id === socket.id; });
    });
    socket.on('playerMoved', function (data) {
        var player = players.find(function (p) { return p.id === data.id; });
        if (player) {
            player.setPosition({ x: data.x, y: data.y }, data.rotation);
        }
    });
    socket.on('playerShoot', function (data) {
        var player = players.find(function (p) { return p.id === data.playerId; });
        if (player) {
            player.shoot({ emitEvent: false, bulletId: data.id });
        }
    });
    socket.on('bulletMoved', function (data) {
        var bullet = bullets.find(function (b) { return b.id === data.id; });
        if (bullet) {
            bullet.setPosition({ x: data.position.x, y: data.position.y });
        }
    });
}
function draw() {
    background(51);
    walls.forEach(function (wall) { return wall.show(); });
    players.forEach(function (player) { return player.update(); });
    bullets.forEach(function (bullet) { return bullet.update(); });
    bullets = bullets.filter(function (bullet) { return bullet.isAlive(); });
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
        player.shoot({ emitEvent: true });
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
function createWallsOnMazeAlgorithm() {
    var _a;
    var stack = [];
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
function generateWallObjects(walls) {
    return walls.map(function (wall) { return new Wall(wall.x, wall.y, wall.width, wall.height, 'gray'); });
}
function setupPlayers(players) {
    return players.map(function (player) { return new Tank(player.position.x, player.position.y, player.color, player.rotation, player.id, player.name); });
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