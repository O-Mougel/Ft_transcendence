import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

import Ball from './ball.js';
import Paddle from './paddle.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Ensure only one speed checkbox can be selected at a time
document.getElementsByName('ball-color').forEach((checkbox) => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            document.getElementsByName('ball-color').forEach((otherCheckbox) => {
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = false;
                }
            });
        }
    });
});

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


// Prevent scrolling
const body = document.body;
body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden'; // if some browsers still scroll (chrome)

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startGame);

let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 'white');
let leftPaddle = new Paddle(10, canvas.height / 2 - 40, 10, 80, 'dodgerblue');
let rightPaddle = new Paddle(canvas.width - 20, canvas.height / 2 - 40, 10, 80, 'red');

let isGameStarted = false;

function startGame() {
    if (socket.connected) {
        console.log('Game Started');
        ball.color = Array.from(document.getElementsByName('ball-color')).find(checkbox => checkbox.checked)?.value || 'white';
        socket.emit('startGame', {
            speed: document.getElementById('ball-speed-value').textContent || 1.0
        });
        startButton.style.display = 'none';
    
        isGameStarted = true;
        gameInit();
    }
    else {
        console.log('Cannot start game: Not connected to server');
    }
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
    // if (!isGameStarted) return;

    const key = e.key;
    // if (isGameStarted) {
        if (key === 'Escape') {
            console.log('Game Stopped');
            if (socket.connected) {
                socket.emit('stopGame');
            }
            return;
        }
    // }
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

function draw() {
    ctx.clearRect(0, 0, 800, 500);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);
    drawScore();
    drawCenterLine();
}

function drawCenterLine() {
    ctx.strokeStyle = 'white';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(leftPaddle.score, (canvas.width * 3) / 8, 50);
    ctx.fillText(rightPaddle.score, (canvas.width * 5) / 8, 50);
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
    ball.reset();
    leftPaddle.y = 250 - 80 / 2;
    rightPaddle.y = 250 - 80 / 2;
    leftPaddle.score = 0;
    rightPaddle.score = 0;
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

socket.on('gameOver', (data) => {
    console.log('Game Over. Final Score:', data);
    isGameStarted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    printGameOver(data);
});

function printGameOver(data) {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    const message = `Game Over!`;
    const textWidth = ctx.measureText(message).width;
    ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
    const messageScore = `${data.left} - ${data.right}`;
    const textWidthScore = ctx.measureText(messageScore).width;
    ctx.fillText(messageScore, (canvas.width - textWidthScore) / 2, canvas.height / 2 + 40);
    ctx.font = '20px Arial';
    const restartMessage = 'Press Escape to go back to menu.';
    const restartTextWidth = ctx.measureText(restartMessage).width;
    ctx.fillText(restartMessage, (canvas.width - restartTextWidth) / 2, canvas.height / 2 + 80);
}



const slider = document.getElementById('ball-speed');
const output = document.getElementById('ball-speed-value');

    // Function to update number and slider color
function updateSlider() {
    const value = parseFloat(slider.value);
    output.textContent = value.toFixed(1);
}

// Initialize and update on input
updateSlider();
slider.addEventListener('input', updateSlider);

