function createWallsBasedOnGrid(grid: Cell[]) {
    const walls: Wall[] = [];
    grid.forEach(cell => {
        const x = cell.x * tileSize;
        const y = cell.y * tileSize;
        const wallSize = 3;
        const color = 'gray';
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

class Wall {

    constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
    }

    public show() {
        push();
        noStroke()
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
        pop();
    }

    public isPolygonInside(otherPolygon: SAT.Polygon) {
        const itsPolygon = this.getPolygon();

        const testPolygonPolygon = SAT.testPolygonPolygon(otherPolygon, itsPolygon);
        if (testPolygonPolygon) {
            push();
            noStroke()
            fill('pink');
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
    public toString() {
        return 'wall'
    }
}