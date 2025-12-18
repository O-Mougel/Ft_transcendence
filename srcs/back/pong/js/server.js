import Fastify from 'fastify';
// import fastifyStatic from '@fastify/static';
// import path, { join } from 'path';
// import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import { registerSocketHandlers } from './sockets.js';
import { Game } from './game.js';
import { AI_REACTION_TIME, TICK_RATE } from './config.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
const io = new Server(fastify.server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// await fastify.register(fastifyStatic, {
//   root: join(__dirname, '../../../front/src'),
//   prefix: '/',
// });

// fastify.get('/', (req, res) => {
//   res.sendFile('pong.html');
// });

// Create ONE instance of the game
const game = new Game();
let updateIntervalId = null;

// Pass it to socket handlers
registerSocketHandlers(io, game);

// Game loop uses game.update() as the “main” function
export function scheduleClientUpdates() {
  if (updateIntervalId) return;
  updateIntervalId = setInterval(() => {
    const { gameOver } = game.update();
    const state = game.getState();

    io.emit('state', state);

    if (gameOver) {
      io.emit('gameOver', state.score);
      game.reset();
    }
  }, TICK_RATE);
}

export function scheduleAIUpdates(mode, game) {
  console.log('Scheduling AI updates for mode:', mode);
  if (mode !== 0) return; // Only schedule AI updates in single-player mode
  console.log('AI updates scheduled');
  console.log('Game running status:', game.isGameStarted);
  const aiUpdateIntervalId = setInterval(() => {
    if (!game.isGameStarted) {
      clearInterval(aiUpdateIntervalId);
      return;
    }
    
    console.log('AI update tick');
    const aiPlayer = game.AIPlayer;
    if (aiPlayer) {
      aiPlayer.update();
    }
  }, AI_REACTION_TIME);
}

export function stopClientUpdates() {
  if (updateIntervalId) {
    clearInterval(updateIntervalId);
    updateIntervalId = null;
  }
}

fastify.listen({ port: 3002 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // fastify.log.info(`Server listening at ${address}`);
});
