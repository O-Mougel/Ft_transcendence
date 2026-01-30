import { startSchema, movementSchema, tournamentCreateSchema, tournamentGetStateSchema, tournamentNextMatchSchema, tournamentLeaveSchema, sessionRetrieveSchema } from "./schemaZod.js";
import { DISCONNECT_GRACE_PERIOD } from "./config.js";

function generateGameId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function registerSocketHandlers(io, manager, tournamentManager, messageRateLimits) {
  io.on("connection", (socket) => {
    if (socket.recovered) {
      console.log(`Socket reconnected: ${socket.id}`);
      return;
    }
    console.log("New socket connection established");
    console.log("User connected, socket id: ", socket.id);

    let disconnectTimer = null; // To track the reconnection grace period
    let disconnectedAt = null; // To track when the user disconnected

    const limiter = messageRateLimits.get(socket.id); // Keeping this ??

    socket.use((packet, next) => {
      if (!limiter) return next();
      const now = Date.now();
      if (now > limiter.resetAt) {
        limiter.count = 0;
        limiter.resetAt = now + 1000;
      }
      if (++limiter.count > 10) {
        console.warn(`Rate limit exceeded for ${socket.id}`);
        socket.disconnect();
        return;
      }
      next();
    });

    // Handle disconnect with grace period
    socket.on("disconnect", () => {
      console.log("User disconnected, socket id: ", socket.id);
      const gameId = socket.data.gameId;
      if (gameId) {
        manager.leaveGame(gameId, socket);
        socket.data.gameId = null;
      }
      // Store the time of disconnection
      disconnectedAt = Date.now();
      // Start a timer to clean up if the user doesn't reconnect
      disconnectTimer = setTimeout(() => {
        messageRateLimits.delete(socket.id);
        console.log(`User disconnected and cleanup completed: ${socket.id}`);
      }, DISCONNECT_GRACE_PERIOD);
    });

    // // Handle reconnection
    // socket.on("reconnect", () => {
    //   console.log("User reconnected, socket id: ", socket.id);
    //   // If the user reconnects within the grace period, clear the cleanup timer
    //   if (disconnectTimer) {
    //     clearTimeout(disconnectTimer);
    //     disconnectTimer = null;
    //     console.log(`User reconnected before grace period expired: ${socket.id}`);
    //   }

    //   // Optionally, you can re-join the game or tournament if they were previously in one
    //   const gameId = socket.data.gameId;
    //   if (gameId) {
    //     manager.joinGame(gameId, socket);
    //     socket.emit("game:joined", { gameId });
    //   }
    // });

    // Handle simple match start
    socket.on("game:start", (data = {}) => {
      try {
        const parsed = startSchema.parse(data);
        const gameId = generateGameId();
  
        socket.data.gameId = gameId;
        manager.joinGame(gameId, socket);
  
        const info = manager.startGame(gameId, parsed);
  
        // Return the gameId to the client
        socket.emit("game:started", { gameId, ...info });
      }
      catch (e) {
        console.error("game:start error:", e);
        socket.emit("game:error", { message: e.message || "Invalid start data" });
      }
    });

    // Is it still even called anywhere?
    socket.on("game:join", (data = {}) => {
      console.log("game:join called with data:", data);
        const gameId = data.gameId;
        if (!gameId) {
          socket.emit("game:error", { message: "Missing gameId" });
          return;
        }
      
        const entry = manager.games.get(gameId);
        if (!entry) {
          socket.emit("game:error", { message: "Game not found" });
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
      try {
        const result = movementSchema.parse(data);
        const gameId = socket.data.gameId;
        if (!gameId || !result) return;
  
        manager.updatePaddle(gameId, result.paddle, result.direction);
      }
      catch (e) {
        console.error("game:move error:", e);
      }
    });

    // Handle tournament creation
    socket.on("tournament:create", (data = {}) => {
      try {
        const result = tournamentCreateSchema.parse(data);

        const size = Number(result.size);
        const names = result.names;

        // If a tournament is already ongoing for this socket, reject
        if (socket.data.tournamentId) {
          socket.emit("tournament:error", { error: "Already in a tournament" });
          return;
        }
        const tournamentId = tournamentManager.createTournament(size, names);
        if (!tournamentId) {
          socket.emit("tournament:error", { error: "create failed" });
          return;
        }
        // leave previous game/tournament if any
        if (socket.data.gameId) {
          manager.leaveGame(socket.data.gameId, socket);
          socket.data.gameId = null;
        }
        if (socket.data.tournamentId) {
          tournamentManager.deleteTournament(socket.data.tournamentId, socket);
          socket.data.tournamentId = null;
        } 

        socket.data.tournamentId = tournamentId;

        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament) throw new Error("Tournament not found after creation");
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        socket.emit("tournament:error", { error: e.message || "create failed" });
      }
    });

    socket.on("tournament:getState", (data = {}) => {
      try {
        const result = tournamentGetStateSchema.parse(data);
        const tournamentId = result.tournamentId || socket.data.tournamentId;
        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament) {
          socket.emit("tournament:error", { error: "Tournament not found" });
          return;
        }
        // tournamentManager.resetTimer(tournamentId);
        socket.emit("tournament:state", { tournamentId, tournament });
      }
      catch (e) {
        socket.emit("tournament:error", { error: e.message || "getState failed" });
      }
    });

    socket.on("tournament:nextMatch", (data = {}) => {
      try {
        const result = tournamentNextMatchSchema.parse(data);

        const tournamentId = result.tournamentId || socket.data.tournamentId;
      
        if (socket.data.gameId) manager.leaveGame(socket.data.gameId, socket);
      
        const info = tournamentManager.nextMatch(tournamentId);
      
        socket.data.gameId = info.gameId;
        manager.joinGame(info.gameId, socket);

        // set persistMatch to false for tournament games if is not main player
        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament) throw new Error("Tournament not found");
        info.startData.mainPlayer = tournament.mainPlayer;

        if (tournament.mainPlayer !== info.player1 && tournament.mainPlayer !== info.player2) {
          info.startData.persistMatch = false;
        }
      
        manager.startGame(info.gameId, info.startData);
        
        socket.emit("match:started", info);
        
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        socket.emit("tournament:error", { error: e.message || "nextMatch failed" });
      }
    });

    socket.on("tournament:leave", (data = {}) => {
      try {
        console.log("tournament:leave called with data:", data);
        const result = tournamentLeaveSchema.parse(data);

        const tournamentId = result.tournamentId || socket.data.tournamentId;
        tournamentManager.deleteTournament(tournamentId, socket);
        socket.data.tournamentId = null;
        console.log("Tournament deleted: ", tournamentId);
      }
      catch (e) {
        socket.emit("tournament:error", { error: e.message || "leave failed" });
      }
    });    
  });
}



