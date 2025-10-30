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

let leftPaddleDir = 0;
let rightPaddleDir = 0;


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
            console.log("player 2 move up")
            rightPaddleDir = 1;
            // if (rightPaddle.y > 0)
            //     rightPaddle.moveUp();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'up'
            // })
        }
        if (key === 'ArrowDown') {
            console.log("player 2 move down")
            rightPaddleDir = -1;
            // if (rightPaddle.y + rightPaddle.height < canvas.height)
            //     rightPaddle.moveDown();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'down'
            // })
        }
        if (key === 'w' || key === 'W') {
            console.log("player 1 move up")
            leftPaddleDir = 1;
            // if (leftPaddle.y > 0)
            //     leftPaddle.moveUp();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'up'
            // })
        }
        if (key === 's' || key === 'S') {
            console.log("player 1 move down")
            leftPaddleDir = -1;
            // if (leftPaddle.y + leftPaddle.height < canvas.height)
            //     leftPaddle.moveDown();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'down'
            // })
        }

        
        if (key === 'Escape') {
            isGameStarted = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startButton.style.display = 'block';
            return;
        }
        
        if (rightPaddleDir === 1 && rightPaddle.y > 0)
            rightPaddle.moveUp();
        else if (rightPaddleDir === -1 && rightPaddle.y + rightPaddle.height < canvas.height)
            rightPaddle.moveDown();

        if (leftPaddleDir === 1 && leftPaddle.y > 0)
            leftPaddle.moveUp();
        else if (leftPaddleDir === -1 && leftPaddle.y + leftPaddle.height < canvas.height)
            leftPaddle.moveDown();
        draw();
    }
});


window.addEventListener('keyup', (e) => {
    if (isGameStarted) {
        const key = e.key; // use KeyboardEvent.key ('ArrowUp', 'ArrowDown', ...)
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            rightPaddleDir = 0;
        }
        if (key === 'w' || key === 'W' || key === 's' || key === 'S') {
            leftPaddleDir = 0;
        }
    }
});

function draw() {
    ctx.clearRect(0, 0, 800, 500);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);

    // ctx.strokeStyle = 'white';
    // ctx.beginPath();
    // ctx.setLineDash([10, 10])
    // ctx.moveTo(400, 5);
    // ctx.lineTo(400, 495);
    // ctx.stroke();
}