class Tank {
    public pos: p5.Vector;
    public vel: p5.Vector;

    public movingController: MovingControls;

    public width: number;
    public height: number;
    public rotation: number;

    public bullets: Bullet[];
    public bulletLimit: number;
    private readonly rotateSpeed = 0.05;
    private readonly speed = 0.85;

    constructor(public x: number, public y: number, public color: string) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);

        this.movingController = new MovingControls();

        this.width = 15;
        this.height = 20;
        this.rotation = 0;
        this.bullets = [];
        this.bulletLimit = 5;
    }

    update() {
        this.show();
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
            if (wall.isPolygonInside(this.getPolygon())) {
                this.pos.sub(this.vel);
                this.rotation -= this.rotateSpeed;
            }
        });
    }

    private show() {
        push();
        rectMode(CENTER)
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(this.color);
        rect(0, 0, this.width, this.height);
        pop();
    }

    private moveForward(dir = 1) {
        this.vel = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(this.speed * dir);
        this.pos.add(this.vel);
    }

    private getPolygon() {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.width /2 , this.pos.y - this.height /2 ), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width + this.width / 2, 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
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