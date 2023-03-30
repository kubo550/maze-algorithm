class Bullet {
    public pos: p5.Vector;
    public vel: p5.Vector;
    public lifespan: number;

    private readonly speed = 1.25;
    private readonly size = 8;

    constructor(public x: number, public y: number, public color: string, public rotation: number) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(rotation - TWO_PI / 4).mult(this.speed);
        this.lifespan = 255;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        fill(this.color);
        ellipse(0, 0, this.size, this.size);
        pop();
    }

    update() {
        this.show();

        this.pos.add(this.vel);
        if (this.checkWallCollision(walls)) {
            console.log('hit')
            this.vel.mult(-1);
        }
        this.lifespan -= 1;
        if (!this.isAlive()) {
            this.pop();
        }
    }

    isAlive() {
        return this.lifespan >= 0;
    }

    pop() {
        console.log('pop');
    }

    checkWallCollision(walls: Wall[]) {
        return walls.some(wall => {
            return wall.isPointInside(this.pos.x, this.pos.y);
        });
    }
    checkTankCollision(tank: Tank[]) {
        return tank.some(tank => {
            return tank.isPointInside(this.pos.x, this.pos.y);
        });
    }
}