class Bullet {
    public pos: p5.Vector;
    public vel: p5.Vector;
    public lifespan: number;

    private readonly speed = 2.45;
    private readonly size = 5;

    constructor(public x: number, public y: number, public color: string, public rotation: number) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(rotation - TWO_PI / 4).mult(this.speed);
        this.lifespan = 255;
    }

    show() {
        push();
        ellipseMode(CENTER)
        noStroke();
        fill(this.color);
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        ellipse(0, 0, this.size, this.size);
        pop();

    }

    update() {
        this.show();

        this.pos.add(this.vel);
        if (this.isCollidingwithWall(walls)) {
            console.log('colliding with wall');
        }
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
    }

    isAlive() {
        return this.lifespan >= 0;
    }

    pop() {
        console.log('pop');
    }


    private isCollidingWithWall(walls: Wall[], direction: 'horizontal' | 'vertical') {
        return walls.some(wall => {
            if (direction === 'horizontal') {
                return wall.isPointInside(this.pos.x + this.size / 2, this.pos.y) || wall.isPointInside(this.pos.x - this.size / 2, this.pos.y);
            }
            if (direction === 'vertical') {
                return wall.isPointInside(this.pos.x, this.pos.y + this.size / 2) || wall.isPointInside(this.pos.x, this.pos.y - this.size / 2);
            }

        });

    }

    private isCollidingwithWall(walls: Wall[]) {
        return walls.some(wall => {
            return wall.isPointInside(this.pos.x + this.size / 2, this.pos.y + this.size / 2) ||
                wall.isPointInside(this.pos.x - this.size / 2, this.pos.y + this.size / 2) ||
                wall.isPointInside(this.pos.x + this.size / 2, this.pos.y - this.size / 2) ||
                wall.isPointInside(this.pos.x - this.size / 2, this.pos.y - this.size / 2);
        });
    }
}