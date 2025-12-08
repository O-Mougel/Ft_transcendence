export function registerSocketHandlers(io, game) {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('startGame', (data) => {
      console.log('Player joined the game');
      game.start(data?.speed);
    });

    socket.on('startGame2', (data) => {
      console.log('Player joined the game 2');
      game.start(data?.speed);
      game.mode = 2;
    });

    socket.on('stopGame', () => {
      console.log('Player left the game');
      game.stop();
      socket.emit('gameStopped');
    });

    socket.on('move', (data) => {
      if (!data) return;
      game.movePaddle(data.Paddle, data.Direction);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      game.reset();
    });
  });
}
