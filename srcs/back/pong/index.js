import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

import { Server } from 'socket.io';
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true
});

const io = new Server(fastify.server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

await fastify.register(fastifyStatic, {
  root: join(__dirname, '../../front'), // <- adjust if your front folder is elsewhere
  prefix: '/', // serve files at root
});

fastify.get('/', (req, res) => {
  console.log('Serving pong.html');
  res.sendFile('pong.html')
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});

let isGameStarted = false;
var speedMultiplier = 1.0;

let ball = {
  x: 400,
  y: 250,
  vx: Math.random() > 0.5 ? 3.0 : -3.0,
  vy: Math.random() > 0.5 ? 3.0 : -3.0,
  radius: 10,
  move: function() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off top and bottom
    if (this.y + this.radius > 500 || this.y - this.radius < 0) {
      this.vy = -this.vy;
    }

    // Bounce off paddles taking into account their positions and width
    if (this.x - this.radius < leftPaddle.width + 10) {
      if (this.y > leftPaddle.y && this.y < leftPaddle.y + leftPaddle.height) {
        this.vx = -this.vx;
        this.vx += 0.5; // Increase speed after each hit
        this.vy += 0.5; // Increase speed after each hit
        // Change angle based on where it hit the paddle
        let hitPos = this.y - (leftPaddle.y + leftPaddle.height / 2);
        this.vy = hitPos * 0.1;
      }
    }
    if (this.x - this.radius > 800 - 2 * rightPaddle.width - 20) {
      if (this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
        this.vx = -this.vx;
        this.vx -= 0.5; // Increase speed after each hit
        this.vy -= 0.5; // Increase speed after each hit
        // Change angle based on where it hit the paddle
        let hitPos = this.y - (rightPaddle.y + rightPaddle.height / 2);
        this.vy = hitPos * 0.1;
      }
    }
  },

  // Scoring when ball goes past paddles
  checkScore: function() {
    if (this.x - this.radius < 0) {
      // Right player scores
      rightScore += 1;
      this.reset();
    } else if (this.x + this.radius > 800) {
      // Left player scores
      leftScore += 1;
      this.reset();
    }
    if (leftScore >= 2 || rightScore >= 2) {
      console.log(`Game Over - Left: ${leftScore}, Right: ${rightScore}`);
      io.emit('gameOver', { left: leftScore, right: rightScore });
      resetGame();
    }
  },

  // Reset after scoring
  reset: function() {
    this.x = 400;
    this.y = 250;
    if (isGameStarted) {
      this.vx = this.vx < 0 ? -3.0 * speedMultiplier : 3.0 * speedMultiplier;
      this.vy = Math.random() > 0.5 ? 3.0 * speedMultiplier : -3.0 * speedMultiplier;
    } else {
      this.vx = Math.random() > 0.5 ? 3.0 : -3.0;
      this.vy = Math.random() > 0.5 ? 3.0 : -3.0;
    }
  }
};

let leftPaddle = {
  height: 80,
  width: 10,
  y: 250 - 80 / 2,
  moveUp: function() {
    if (this.y > 0) this.y -= 10;
  },
  moveDown: function() {
    if (this.y + this.height < 500) this.y += 10;
  }
};

let rightPaddle = {
  height: 80,
  width: 10,
  y: 250 - 80 / 2,
  moveUp: function() {
    if (this.y > 0) this.y -= 10;
  },
  moveDown: function() {
    if (this.y + this.height < 500) this.y += 10;
  }
};

let leftScore = 0;
let rightScore = 0;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('startGame', (data) => {
    console.log('Player joined the game');
    if (data.speed) {
      speedMultiplier = parseFloat(data.speed);
      console.log(`Game speed set to: ${data.speed}`);
      ball.vx *= speedMultiplier;
      ball.vy *= speedMultiplier;
    }
    isGameStarted = true;
  });

  socket.on('stopGame', () => {
    console.log('Player left the game');
    resetGame();
    socket.emit('gameStopped');
  });

  socket.on('move', (data) => {
    // console.log(`Paddle: ${data.Paddle}, Direction: ${data.Direction}`);
    if (data.Paddle === 'left')
    {
      if (data.Direction === 'up' && leftPaddle.y > 0) leftPaddle.moveUp();
      if (data.Direction === 'down' && leftPaddle.y + leftPaddle.height < 500) leftPaddle.moveDown();
    }
    if (data.Paddle === 'right')
    {
      if (data.Direction === 'up' && rightPaddle.y > 0) rightPaddle.moveUp();
      if (data.Direction === 'down' && rightPaddle.y + rightPaddle.height < 500) rightPaddle.moveDown();
    }
    // Here you can add logic to update paddle positions and broadcast to other clients
  });

  socket.on('disconnect', () => {
    isGameStarted = false;
    console.log('user disconnected');
  });
  isGameStarted = false;
});

function resetGame() {
  isGameStarted = false;
  ball.reset();
  leftPaddle.y = 250 - 80 / 2;
  rightPaddle.y = 250 - 80 / 2;
  leftScore = 0;
  rightScore = 0;
}

setInterval(updateGameState, 1000 / 60);

function updateGameState() {
  if (!isGameStarted) return;
  // Update ball position
  ball.move();
  ball.checkScore();
  // console.log(`Ball position: (${ball.x}, ${ball.y})`);
  
  // Check for collisions and update scores as necessary
  
  // Broadcast updated state to all connected clients
  io.emit('state', {
    paddles: { left: leftPaddle.y, right: rightPaddle.y },
    ball: { x: ball.x, y: ball.y, radius: ball.radius, vx: ball.vx, vy: ball.vy },
    score: { left: leftScore, right: rightScore }
  });
}

