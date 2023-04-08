class Tank {
    public pos: p5.Vector;
    public vel: p5.Vector;

    public movingController: MovingControls;

    public width: number;
    public height: number;
    public rotation: number;

    public bullets: Bullet[];
    public particles: Particle[];

    private readonly bulletLimit: number;
    private readonly rotateSpeed = 0.14;
    private readonly speed = 1.95;

    constructor(public x: number, public y: number, public color: string) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);

        this.movingController = new MovingControls();

        this.width = 15;
        this.height = 20;
        this.rotation = 0;
        this.bullets = [];
        this.particles = [];
        this.bulletLimit = 900;
    }

    update() {
        if (this.movingController.up) {
            this.moveForward();
        }
        if (this.movingController.down) {
            this.moveForward(-this.speed / 2);
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
        this.particles.forEach(particle => {
            particle.update()
        });

        this.checkWallCollision(walls);
        this.bullets = this.bullets.filter(bullet => bullet.isAlive());
        this.particles = this.particles.filter(particle => particle.isAlive());

        this.show();

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

                this.rotation -= this.rotateSpeed / 2;





                if (random() > 0.75) {
                    this.showSmokeParticles();
                }
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
        fill(0);
        rect(0, -this.height / 3, 5, 8);

        pop();
    }

    private moveForward(dir = 1) {
        this.vel = p5.Vector.fromAngle(this.rotation - TWO_PI / 4).mult(this.speed * dir);
        this.pos.add(this.vel);
    }

    private getPolygon() {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.width / 2, this.pos.y - this.height / 2), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width / 2 , 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
    }

    private showSmokeParticles() {
        const oppositeDirectionVector = p5.Vector.fromAngle(random((this.rotation + PI / 2) - PI / 8, (this.rotation + PI / 2) + PI / 8))
        this.particles.push(new Particle(this.pos.copy(), oppositeDirectionVector));
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

    setControls({up, left, right, down}: Partial<Pick<MovingControls, 'left' | 'right' | 'up' | 'down'>>) {
        this.up = up ?? this.up;
        this.left = left ?? this.left;
        this.right = right ?? this.right;
        this.down = down ?? this.down;
    }
}

function radiansToDegrees(radians: number) {
    return radians * 180 / Math.PI;
}