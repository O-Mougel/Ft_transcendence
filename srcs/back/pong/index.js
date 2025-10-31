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
  res.sendFile('index.html')
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});



let ball = {
  x: 400,
  y: 250,
  vx: 5,
  vy: 5,
  radius: 10,
  move: function() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off top and bottom
    if (this.y + this.radius > 500 || this.y - this.radius < 0) {
      this.vy = -this.vy;
    }
  }
};

let leftPaddle = {
  y: 250,
  height: 80,
  width: 10,
  moveUp: function() {
    if (this.y > 0) this.y -= 10;
  },
  moveDown: function() {
    if (this.y + this.height < 500) this.y += 10;
  }
};

let rightPaddle = {
  y: 250,
  height: 80,
  width: 10,
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

  socket.on('join', (message) => {
    console.log(message);
  });

  socket.on('move', (data) => {
    console.log(`Paddle: ${data.Paddle}, Direction: ${data.Direction}`);
    // Here you can add logic to update paddle positions and broadcast to other clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

setInterval(updateGameState, 1000 / 60);

function updateGameState() {
  // Update ball position
  ball.move();

  // Check for collisions and update scores as necessary

  // Broadcast updated state to all connected clients
  io.emit('state', {
    paddles: { left: leftPaddle.y, right: rightPaddle.y },
    ball: { x: ball.x, y: ball.y },
    score: { left: leftScore, right: rightScore }
  });
}