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
        fill('#fff');
        rect(this.x, this.y, this.width, this.height);
        pop();
    }


    isColliding(pos: p5.Vector, radius: number) {
        const x = pos.x;
        const y = pos.y;
        const x1 = this.x;
        const y1 = this.y;
        const x2 = this.x + this.width;
        const y2 = this.y + this.height;
        return x + radius > x1 && x - radius < x2 && y + radius > y1 && y - radius < y2;
    }

    isPointInside(x: number, y: number) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }
}