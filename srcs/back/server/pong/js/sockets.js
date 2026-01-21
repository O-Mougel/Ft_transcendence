
function generateGameId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function registerSocketHandlers(io, manager, tournamentManager) {
  io.on("connection", (socket) => {
    console.log("User connected, socket id: ", socket.id);

    // SIMPLE MATCH
    socket.on("game:start", (data = {}) => {
      const gameId = generateGameId();
      console.log(`SOCKET.JS: Starting new game with id: ${gameId}`);

      socket.data.gameId = gameId;
      manager.joinGame(gameId, socket);

      const info = manager.startGame(gameId, data);

      // Return the gameId to the client
      socket.emit("game:started", { gameId, ...info });
    });

    // Join an existing game (multiplayer)
    // Client sends: { gameId }
    // socket.on("game:join", (data = {}) => {
    //   const gameId = data.gameId;
    //   if (!gameId) {
    //     socket.emit("error", { message: "Missing gameId" });
    //     return;
    //   }

    //   const entry = manager.games.get(gameId);
    //   if (!entry) {
    //     socket.emit("error", { message: "Game not found" });
    //     return;
    //   }

    //   socket.data.gameId = gameId;
    //   manager.joinGame(gameId, socket);

    //   socket.emit("game:joined", { gameId });
    //   // Optionally push current state immediately
    //   socket.emit("game:state", entry.game.getState());
    // });

    socket.on("game:join", (data = {}) => {
    const gameId = data.gameId;
    if (!gameId) {
      socket.emit("error", { message: "Missing gameId" });
      return;
    }
  
    const entry = manager.games.get(gameId);
    if (!entry) {
      socket.emit("error", { message: "Game not found" });
      return;
    }
  
    socket.data.gameId = gameId;
    manager.joinGame(gameId, socket);
  
    socket.emit("game:joined", { gameId });
    socket.emit("game:state", entry.game.getCurrentGameState());
  });

    socket.on("game:stop", () => {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      manager.stopGame(gameId);
      socket.emit("game:stopped", { gameId });
      // if in tournament, notify tournament manager
      tournamentManager.onGameStopped(gameId);
    });

    // Client sends: { Paddle: "...", Direction: "..." }
    socket.on("game:move", (data) => {
      const gameId = socket.data.gameId;
      if (!gameId || !data) return;

      manager.updatePaddle(gameId, data.Paddle, data.Direction);
    });

    // TOURNAMENT
    socket.on("tournament:create", (data = {}) => {
      try {
        const size = Number(data.size);
        const names = data.names;

        const tournamentId = tournamentManager.createTournament(size, names);
        socket.data.tournamentId = tournamentId;

        const tournament = tournamentManager.getTournament(tournamentId);
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        socket.emit("tournament:error", { message: e.message || "create failed" });
      }
    });

    socket.on("tournament:getState", (data = {}) => {
      const tournamentId = data.tournamentId || socket.data.tournamentId;
      const tournament = tournamentManager.getTournament(tournamentId);
      if (!tournament) {
        socket.emit("tournament:error", { message: "Tournament not found" });
        return;
      }
      socket.emit("tournament:state", { tournamentId, tournament });
    });

    socket.on("tournament:nextMatch", (data = {}) => {
      try {
        const tournamentId = data.tournamentId || socket.data.tournamentId;
      
        if (socket.data.gameId) manager.leaveGame(socket.data.gameId, socket);
      
        const info = tournamentManager.nextMatch(tournamentId);
      
        socket.data.gameId = info.gameId;
        manager.joinGame(info.gameId, socket);
      
        manager.startGame(info.gameId, info.startData); // auto-start the match game
        
        socket.emit("match:started", info);
        
        const tournament = tournamentManager.getTournament(tournamentId);
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        socket.emit("tournament:error", { message: e.message || "nextMatch failed" });
      }
    });

    socket.on("disconnect", () => {
      const gameId = socket.data.gameId;
      if (gameId) manager.leaveGame(gameId, socket);
      console.log("User disconnected", socket.id);
    });
  });
}



