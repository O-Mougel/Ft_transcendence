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
    socket.emit('join', 'Hello server from client');
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
        socket.emit('joinGame');
        console.log('Player connected');
    }
    else {
        console.log('Player not connected');
    }

    isGameStarted = true;
    gameInit();
}

function gameInit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.move();

    ball.draw(ctx);
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx); 
    draw();
}

window.addEventListener('keydown', (e) => {
    if (isGameStarted) {
        const key = e.key; // use KeyboardEvent.key ('ArrowUp', 'ArrowDown', ...)
        if (key === 'ArrowUp') {
            console.log("Paddle right move up")
            // if (rightPaddle.y > 0)
            //     rightPaddle.moveUp();
            socket.emit("move", {
                Paddle: 'right',
                Direction: 'up'
            });
        }
        if (key === 'ArrowDown') {
            console.log("Paddle right move down")
            // if (rightPaddle.y + rightPaddle.height < canvas.height)
            //     rightPaddle.moveDown();
            socket.emit("move", {
                Paddle: 'right',
                Direction: 'down'
            });
        }
        if (key === 'w' || key === 'W') {
            console.log("Paddle left move up")
            // if (leftPaddle.y > 0)
            //     leftPaddle.moveUp();
             socket.emit("move", {
                Paddle: 'left',
                Direction: 'up'
            });
        }
        if (key === 's' || key === 'S') {
            console.log("Paddle left move down")
            // if (leftPaddle.y + leftPaddle.height < canvas.height)
            //     leftPaddle.moveDown();
            // socket.emit("move", {
            socket.emit("move", {
                Paddle: 'left',
                Direction: 'down'
            });
        }

        
        if (key === 'Escape') {
            isGameStarted = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startButton.style.display = 'block';
            return;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (isGameStarted) {
        const key = e.key; // use KeyboardEvent.key ('ArrowUp', 'ArrowDown', ...)
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            socket.emit("move", {
                Paddle: 'right',
                Direction: 'none'
            });
        }
        if (key === 'w' || key === 'W' || key === 's' || key === 'S') {
            socket.emit("move", {
                Paddle: 'left',
                Direction: 'none'
            });
        }
    }
});

function draw() {
    ctx.clearRect(0, 0, 800, 500);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);
}

function updateGameScene(data) {
  // Update ball position
  ball.x = data.ball.x;
  ball.y = data.ball.y;

  // Update left paddle position
  leftPaddle.y = data.leftPaddle.y;

  // Update right paddle position
  rightPaddle.y = data.rightPaddle.y;

  // Redraw the game scene
  draw();
}

socket.on('state', data => {
  // Smoothly animate towards new positions
  updateGameScene(data);
});
