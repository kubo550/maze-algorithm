class Bullet {
    public pos: p5.Vector;
    public vel: p5.Vector;
    public lifespan: number;

    private readonly speed = 2.25;
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
        this.handleCollision(walls);
        this.handleCollision(players);
        this.pos.add(this.vel);
        this.show();


        this.lifespan -= 0.5;
        if (!this.isAlive()) {
            this.pop();
        }
    }

    isAlive() {
        return this.lifespan >= 0;
    }

    pop() {
        // this.vel.mult(0);
        console.log("pop")
    }

    private handleCollision(others: { isPolygonInside: (polygon: SAT.Polygon) => boolean }[]) {

        others.forEach(other => {
            if (other.isPolygonInside(this.getPolygon())) {
                if (other instanceof Wall) {
                    this.vel.mult(0);
                }

                if (other instanceof Tank) {
                    console.log("hit tank")
                }

            }
        });


    }

    public getPolygon():SAT.Polygon {
        return new SAT.Polygon(new SAT.Vector(this.pos.x - this.size / 2, this.pos.y - this.size / 2), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.size, 0),
            new SAT.Vector(this.size, this.size),
            new SAT.Vector(0, this.size)
        ]);
    }
}