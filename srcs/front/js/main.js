import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

import Ball from './ball.js';
import Paddle from './paddle.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const body = document.body;
body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden'; // if some browsers still scroll (chrome)

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startGame);

const socket = io("http://localhost", {
    transports: ['websocket']
});

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
    gameLoop();
}

socket.on()

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.move();
    ball.draw(ctx);
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx); 
    draw() 
}

window.addEventListener('keydown', (e) => {
    if (isGameStarted) {
        const key = e.key; // use KeyboardEvent.key ('ArrowUp', 'ArrowDown', ...)
        if (key === 'ArrowUp') {
            console.log("player 2 move up")
            if (rightPaddle.y > 0)
                rightPaddle.moveUp();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'up'
            // })
        } else if (key === 'ArrowDown') {
            console.log("player 2 move down")
            if (rightPaddle.y + rightPaddle.height < canvas.height)
                rightPaddle.moveDown();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'down'
            // })
        } else if (key === 'w' || key === 'W') {
            console.log("player 1 move up")
            if (leftPaddle.y > 0)
                leftPaddle.moveUp();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'up'
            // })
        } else if (key === 's' || key === 'S') {
            console.log("player 1 move down")
            if (leftPaddle.y + leftPaddle.height < canvas.height)
                leftPaddle.moveDown();
            // socket.emit("move", {
            //     roomID: roomID,
            //     playerNo: playerNo,
            //     direction: 'down'
            // })
        } else if (key === 'Escape') {
            isGameStarted = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startButton.style.display = 'block';
            return;
        }
        draw();
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