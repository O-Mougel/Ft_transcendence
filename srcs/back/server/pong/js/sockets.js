
function generateGameId() {
  // unique id for in-memory games
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function registerSocketHandlers(io, manager, tournamentManager) {
  io.on("connection", (socket) => {
    // console.log("User connected, socket id: ", socket.id);

    // SIMPLE MATCH
    socket.on("game:start", (data = {}) => {
      const gameId = generateGameId();
      console.log(`SOCKET.JS: Starting new game with id: ${gameId}`);

      socket.data.gameId = gameId;
      manager._joinGame(gameId, socket);

      const info = manager._startGame(gameId, data);

      // Return the gameId to the client
      socket.emit("game:started", { gameId, ...info });
    });

    // Join an EXISTING game
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
    //   manager._joinGame(gameId, socket);

    //   socket.emit("game:joined", { gameId });
    //   // Optionally push current state immediately
    //   socket.emit("game:state", entry.game._getState());
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
    manager._joinGame(gameId, socket);
  
    socket.emit("game:joined", { gameId });
    socket.emit("game:state", entry.game._getCurrentGameState());
  });

    socket.on("game:stop", () => {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      manager._stopGame(gameId);
      socket.emit("game:stopped", { gameId });
    });

    // Client sends: { Paddle: "...", Direction: "..." }
    socket.on("game:move", (data) => {
      const gameId = socket.data.gameId;
      if (!gameId || !data) return;

      manager._updatePaddle(gameId, data.Paddle, data.Direction);
    });

    // TOURNAMENT (single client, sequential)
    // socket.on("tournament:create", (data = {}) => {
    //   try {
    //     const size = Number(data.size);
    //     const names = data.names;

    //     const tournamentId = tournamentManager._createTournament(size, names);
    //     socket.data.tournamentId = tournamentId;

    //     const tournament = tournamentManager._getTournament(tournamentId);
    //     socket.emit("tournament:created", { tournamentId, tournament });
    //   } catch (e) {
    //     socket.emit("error", { message: e.message || "Failed to create tournament" });
    //   }
    // });

    // socket.on("tournament:nextMatch", (data = {}) => {
    //   try {
    //     const tournamentId = data.tournamentId || socket.data.tournamentId;
    //     if (!tournamentId) throw new Error("Missing tournamentId");

    //     const info = tournamentManager._nextMatch(tournamentId);

    //     // Switch active gameId to the new match
    //     socket.data.gameId = info.gameId;

    //     manager._joinGame(info.gameId, socket);

    //     socket.emit("match:started", info);

    //     const tournament = tournamentManager._getTournament(tournamentId);
    //     socket.emit("tournament:state", { tournamentId, tournament });
    //   } catch (e) {
    //     socket.emit("error", { message: e.message || "Failed to start next match" });
    //   }
    // });
    socket.on("tournament:create", (data = {}) => {
  try {
    const size = Number(data.size);
    const names = data.names;

    const tournamentId = tournamentManager._createTournament(size, names);
    socket.data.tournamentId = tournamentId;

    const tournament = tournamentManager._getTournament(tournamentId);
    socket.emit("tournament:state", { tournamentId, tournament });
  } catch (e) {
    socket.emit("tournament:error", { message: e.message || "create failed" });
  }
});

socket.on("tournament:getState", (data = {}) => {
  const tournamentId = data.tournamentId || socket.data.tournamentId;
  const tournament = tournamentManager._getTournament(tournamentId);
  if (!tournament) {
    socket.emit("tournament:error", { message: "Tournament not found" });
    return;
  }
  socket.emit("tournament:state", { tournamentId, tournament });
});

socket.on("tournament:nextMatch", (data = {}) => {
  try {
    const tournamentId = data.tournamentId || socket.data.tournamentId;
    const info = tournamentManager._nextMatch(tournamentId);

    // important: switch socket to this game room
    socket.data.gameId = info.gameId;
    manager._joinGame(info.gameId, socket);

    // tell UI what match is now playing
    socket.emit("match:started", info);

    // also send updated bracket/status
    const tournament = tournamentManager._getTournament(tournamentId);
    socket.emit("tournament:state", { tournamentId, tournament });
  } catch (e) {
    socket.emit("tournament:error", { message: e.message || "nextMatch failed" });
  }
});


    socket.on("disconnect", () => {
      const gameId = socket.data.gameId;
      if (gameId) manager._leaveGame(gameId, socket);
      console.log("User disconnected", socket.id);
    });
  });
}

//     // TOURNAMENT (single client, sequential)
//     socket.on("tournament:create", (data = {}) => {
//       try {
//         const size = Number(data.size);
//         const names = data.names;

//         const tournamentId = tournamentManager._createTournament(size, names);
//         socket.data.tournamentId = tournamentId;

//         const tournament = tournamentManager._getTournament(tournamentId);
//         socket.emit("tournament:created", { tournamentId, tournament });
//       } catch (e) {
//         socket.emit("error", { message: e.message || "Failed to create tournament" });
//       }
//     });

//     socket.on("tournament:nextMatch", (data = {}) => {
//       try {
//         const tournamentId = data.tournamentId || socket.data.tournamentId;
//         if (!tournamentId) throw new Error("Missing tournamentId");

//         const info = tournamentManager._nextMatch(tournamentId);

//         // Switch active gameId to the new match
//         socket.data.gameId = info.gameId;

//         manager._joinGame(info.gameId, socket);

//         socket.emit("match:started", info);

//         const tournament = tournamentManager._getTournament(tournamentId);
//         socket.emit("tournament:state", { tournamentId, tournament });
//       } catch (e) {
//         socket.emit("error", { message: e.message || "Failed to start next match" });
//       }
//     });
