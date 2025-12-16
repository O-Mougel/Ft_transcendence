import { scheduleClientUpdates, stopClientUpdates } from "./server.js";

export function registerSocketHandlers(io, game) {
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('startGame', (data) => {
      if (!data) return;
      if (!data.mode) data.mode = 1;
      game.mode = data.mode;
      game.start(data);
      socket.emit('gameStarted', { mode: game.mode });
      scheduleClientUpdates();
    });

    socket.on('stopGame', () => {
      console.log('Player left the game');
      game.stop();
      socket.emit('gameStopped');
      stopClientUpdates();
    });

    socket.on('move', (data) => {
      if (!data) return;
      game.updatePaddle(data.Paddle, data.Direction);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      game.reset();
    });
  });
}
