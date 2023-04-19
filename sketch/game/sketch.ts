const CANVAS_WIDTH = 400, CANVAS_HEIGHT = 400;
const grid: Cell[] = [];
const tileSize = 40;
let cols: number;
let rows: number;
let current: Cell;
let walls: Wall[] = [];
let bullets: Bullet[] = [];
let socket: io.Socket;


type ServerWall = { x: number, y: number, width: number, height: number };
type ServerTank = { color: string, rotation: number, name: string, id: string, position: { x: number, y: number } };


let players = [] as Array<Tank>;

let player: Tank;

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

function setupPlayers(players: ServerTank[]) {
    return players.map(player => new Tank(player.position.x, player.position.y, player.color, player.rotation, player.id, player.name));
}

function setup() {
    socket = io.connect('http://localhost:8080');

    socket.on('connect', () => {
        console.log('🚀 - Socket is connected')
    });

    console.log("🚀 - Setup initialized - P5 is running");

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cols = width / tileSize;
    rows = height / tileSize;


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }


    current = random(grid);
    walls = createWallsOnMazeAlgorithm();

    socket.on('initLevel', (data) => {
        walls = generateWallObjects(data.walls as ServerWall[]);
        players = setupPlayers(data.players as ServerTank[]);
        player = players.find(p => p.id === socket.id);
    });

    // socket.on('newPlayer', (data) => {
    //     const {x, y} = generateRandomPosition(CANVAS_WIDTH, CANVAS_HEIGHT, tileSize);
    //     const newPlayer = new Tank(x, y, data.color);
    //     players.push(newPlayer);
    // });

    socket.on('playerMoved', (data) => {
        const player = players.find(p => p.id === data.id);
        if (player) {
            player.setPosition({x: data.x, y: data.y}, data.rotation);
        }
    });

    socket.on('playerShoot', (data) => {
        const player = players.find(p => p.id === data.playerId);
        if (player) {
            player.shoot({emitEvent: false, bulletId: data.id});
        }
    });

    socket.on('bulletMoved', (data) => {
        const bullet = bullets.find(b => b.id === data.id);
        if (bullet) {
            bullet.setPosition({x: data.position.x, y: data.position.y});
        }
    });

}


function draw() {
    background(51);

    walls.forEach(wall => wall.show());
    players.forEach(player => player.update());
    bullets.forEach(bullet => bullet.update());
    bullets = bullets.filter(bullet => bullet.isAlive());
}


function keyPressed() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({up: true});
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({left: true});
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({right: true});
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({down: true});
    }
    if (keyCode === 32) {
        player.shoot({emitEvent: true});
    }
}

function keyReleased() {
    if (keyCode === UP_ARROW) {
        player.movingController.setControls({up: false});
    }
    if (keyCode === LEFT_ARROW) {
        player.movingController.setControls({left: false});
    }
    if (keyCode === RIGHT_ARROW) {
        player.movingController.setControls({right: false});
    }
    if (keyCode === DOWN_ARROW) {
        player.movingController.setControls({down: false});
    }
}