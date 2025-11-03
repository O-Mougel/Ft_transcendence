import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

import Ball from './ball.js';
import Paddle from './paddle.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

console.log('Attempting to connect to WebSocket server...');

var socket = io("http://localhost:3000", {
    transports: ['websocket']
});


socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('connect_error', (err) => {
    console.log('Failed to connect to WebSocket:', err);
});


const body = document.body;
body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden'; // if some browsers still scroll (chrome)

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startGame);

let ball = new Ball(canvas.width / 2, canvas.height / 2, 20, 'white');
let leftPaddle = new Paddle(10, canvas.height / 2 - 40, 10, 80, 'blue');
let rightPaddle = new Paddle(canvas.width - 20, canvas.height / 2 - 40, 10, 80, 'red');

let isGameStarted = false;

function startGame() {
    console.log('Game Started');
    startButton.style.display = 'none';

    if (socket.connected) {
        socket.emit('startGame');
    }

    isGameStarted = true;
    gameInit();
}

function gameInit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.move();

    // ball.draw(ctx);
    // leftPaddle.draw(ctx);
    // rightPaddle.draw(ctx); 
    draw();
}

const keysPressed = new Set();

window.addEventListener('keydown', (e) => {
    if (!isGameStarted) return;

    const key = e.key;
    keysPressed.add(key);

    updateDirections();
});

window.addEventListener('keyup', (e) => {
    if (!isGameStarted) return;

    const key = e.key;
    if (isGameStarted) {
        if (key === 'Escape') {
            console.log('Game Stopped');
            if (socket.connected) {
                socket.emit('stopGame');
            }
            return;
        }
    }
    keysPressed.delete(key);

    updateDirections();
});

function updateDirections() {
    // Right paddle
    if (keysPressed.has('ArrowUp') && !keysPressed.has('ArrowDown')) {
        rightPaddle.direction = 'up';
    } else if (keysPressed.has('ArrowDown') && !keysPressed.has('ArrowUp')) {
        rightPaddle.direction = 'down';
    } else {
        rightPaddle.direction = 'none';
    }

    // Left paddle
    if ((keysPressed.has('w') || keysPressed.has('W')) && !(keysPressed.has('s') || keysPressed.has('S'))) {
        leftPaddle.direction = 'up';
    } else if ((keysPressed.has('s') || keysPressed.has('S')) && !(keysPressed.has('w') || keysPressed.has('W'))) {
        leftPaddle.direction = 'down';
    } else {
        leftPaddle.direction = 'none';
    }
}

// window.addEventListener('keydown', (e) => {
//     if (isGameStarted) {
//         const key = e.key; // use KeyboardEvent.key ('ArrowUp', 'ArrowDown', ...)
//         if (key === 'ArrowUp') rightPaddle.direction = 'up';
//         if (key === 'ArrowDown') rightPaddle.direction = 'down';
//         if (key === 'w' || key === 'W') leftPaddle.direction = 'up';
//         if (key === 's' || key === 'S') leftPaddle.direction = 'down';

//         if (key === 'Escape') {
//             console.log('Game Stopped');
//             if (socket.connected) {
//                 socket.emit('stopGame');
//             }
//             return;
//         }
//     }
// });

// window.addEventListener('keyup', (e) => {
//     if (isGameStarted) {
//         const key = e.key;
//         if (key === 'ArrowUp') {
//             if (rightPaddle.direction === 'up') rightPaddle.direction = 'none';
//         }
//         if (key === 'ArrowDown' ) {
//             if (rightPaddle.direction === 'down') rightPaddle.direction = 'none';
//         }
//         if (key === 'w' || key === 'W') {
//             if (leftPaddle.direction === 'up') leftPaddle.direction = 'none';
//         }
//         if (key === 's' || key === 'S') {
//             if (leftPaddle.direction === 'down') leftPaddle.direction = 'none';
//         }
//     }
// });

function draw() {
    ctx.clearRect(0, 0, 800, 500);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);
}

function updateGameScene(data) {
    if (!data) return;

    // Ball: handle server shape { ball: { x, y } }
    // console.log('Received game state from server:', data);
    if (typeof data.ball.x === 'number') ball.x = data.ball.x;
    if (typeof data.ball.y === 'number') ball.y = data.ball.y;
    if (typeof data.ball.vx === 'number') ball.speedX = data.ball.vx;
    if (typeof data.ball.vy === 'number') ball.speedY = data.ball.vy;
    if (typeof data.ball.radius === 'number') ball.radius = data.ball.radius;

    // Paddles: support either data.leftPaddle/.rightPaddle or data.paddles.{left,right}
    const leftY = data.leftPaddle?.y ?? data.paddles?.left;
    const rightY = data.rightPaddle?.y ?? data.paddles?.right;

    if (typeof leftY === 'number') leftPaddle.y = leftY;
    if (typeof rightY === 'number') rightPaddle.y = rightY;

    if (data.score) {
        if (typeof data.score.left === 'number' && typeof data.score.right === 'number' && (data.score.left !== leftPaddle.score || data.score.right !== rightPaddle.score)) {
            leftPaddle.score = data.score.left;
            rightPaddle.score = data.score.right;
            console.log(`Score - Left: ${data.score.left}, Right: ${data.score.right}`);
        }
    }

    // Redraw the game scene
    if (isGameStarted) 
        draw();
}

socket.on('state', data => {
    updateGameScene(data);
});

socket.on('gameStopped', () => {
    console.log('Game Stopped by server');
    isGameStarted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startButton.style.display = 'block';
});

setInterval(updateGameState, 1000 / 60);
function updateGameState() {
    if (isGameStarted) {
        // Send current paddle directions to server
        socket.emit("move", {
            Paddle: 'left',
            Direction: leftPaddle.direction
        });
        socket.emit("move", {
            Paddle: 'right',
            Direction: rightPaddle.direction
        });
    }
}

