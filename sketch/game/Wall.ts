
function createWallsBasedOnGrid(grid: Cell[]) {
    const walls: Wall[] = [];
    grid.forEach(cell => {
        const x = cell.x * tileSize;
        const y = cell.y * tileSize;
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

class Wall {

    constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {}

    show() {
        push();
        noStroke()
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
        pop();
    }

    isPointInside(x: number, y: number) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    isPolygonInside(otherPolygon: SAT.Polygon) {
       const itsPolygon = this.getPolygon();
        const testPolygonPolygon = SAT.testPolygonPolygon(otherPolygon, itsPolygon);
        if(testPolygonPolygon) {
            push();
            noStroke()
            fill('red');
            rect(this.x, this.y, this.width, this.height);
            pop();
        }
        return testPolygonPolygon;
    }

    private getPolygon() {
        return new SAT.Polygon(new SAT.Vector(this.x, this.y), [
            new SAT.Vector(0, 0),
            new SAT.Vector(this.width, 0),
            new SAT.Vector(this.width, this.height),
            new SAT.Vector(0, this.height),
        ]);
    }
}