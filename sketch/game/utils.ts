function createWallsOnMazeAlgorithm() {
    const stack: Cell[] = [];


    while (true) {
        current.isVisited = true;
        let next = current.checkNeighbors();
        if (next) {
            next.isVisited = true;
            stack.push(current);
            [current, next] = removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            return createWallsBasedOnGrid(grid);
        }
    }
}

function generateRandomPosition(CANVAS_WIDTH: number, CANVAS_HEIGHT: number, tileSize: number) {
    const x = (Math.floor(Math.random() * CANVAS_WIDTH / tileSize) * tileSize) + tileSize / 2
    const y = (Math.floor(Math.random() * CANVAS_HEIGHT / tileSize) * tileSize) + tileSize / 2
    return {x, y};

}


function generateWallObjects(walls: { x: number; y: number; width: number; height: number }[]) {
    return walls.map(wall => new Wall(wall.x, wall.y, wall.width, wall.height, 'gray'));
}

function setupPlayers(players: ServerPlayer[]) {
    return players.map(player => new Tank(player.position.x, player.position.y, player.color, player.rotation, player.id, player.name));
}