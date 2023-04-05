class Particle {
    public pos: p5.Vector;
    public vel: p5.Vector;
    public acc: p5.Vector;
    public life: number;
    public lifespan: number;

    constructor(position: p5.Vector, velocity: p5.Vector) {
        this.pos = position
        this.vel = velocity;
        this.acc = createVector(0, 0);
        this.life = 255;
        this.lifespan = 255;
    }

    public update() {
        this.show();

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.life-= 5;
    }

    public isAlive() {
        return this.life > 0;
    }

    private show() {
        push();
        fill(120, 120, 120, this.life / this.lifespan * 200);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 5);
        pop();
    }
}