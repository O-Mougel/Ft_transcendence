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

    let disconnectTimer = null;
    let disconnectedAt = null;

    const limiter = messageRateLimits.get(socket.id);

    socket.use((packet, next) => {
      if (!limiter) return next();
      const now = Date.now();
      if (now > limiter.resetAt) {
        limiter.count = 0;
        limiter.resetAt = now + 1000;
      }
      if (++limiter.count > 60) {
        console.warn(`Rate limit exceeded for ${socket.id}`);
        socket.disconnect();
        return;
      }
      next();
    });

    // socket.onAny((event, ...args) => {
    //   console.log(`Socket event received: ${event} with args: `, args);
    // });

    socket.on("disconnect", () => {
      console.log("User disconnected, socket id: ", socket.id);
      const gameId = socket.data.gameId;
      if (gameId) {
        if (tournamentManager.isGameInTournament(gameId)) tournamentManager.onGameStopped(gameId);
        manager.leaveGame(gameId, socket);
        socket.data.gameId = null;
      }
      messageRateLimits.delete(socket.id);
      disconnectedAt = Date.now();

      disconnectTimer = setTimeout(() => {
        // tournamentManager.deleteTournament(socket.data.tournamentId, socket);
        // socket.data.tournamentId = null;
        console.log(`User disconnected and cleanup completed: ${socket.id}`);
      }, DISCONNECT_GRACE_PERIOD);
    });

    socket.on("game:start", (data = {}) => {
      try {
        const parsed = startSchema.parse(data);
        const gameId = generateGameId();
  
        socket.data.gameId = gameId;
        manager.joinGame(gameId, socket);
  
        if (!manager.startGame(gameId, parsed))
          throw new Error("Failed to start game");
  
        socket.emit("game:started", { gameId } );
      }
      catch (e) {
        console.error("game:start error:", e);
        socket.emit("game:error", { message: e.message || "Invalid start data" });
      }
    });

    socket.on("game:stop", () => {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      manager.stopGame(gameId);
      socket.emit("game:stopped", { gameId });
      tournamentManager.onGameStopped(gameId);
    });

    socket.on("game:move", (data) => {
      try {
        const result = movementSchema.parse(data);
        const gameId = socket.data.gameId;
        if (!gameId || !result) return;
  
        manager.updatePaddle(gameId, result.paddle, result.direction);
      }
      catch (e) {
        console.error("game:move error:", e);
        socket.emit("game:error", { message: e.message || "Invalid movement data" });
      }
    });

    socket.on("tournament:create", (data = {}) => {
      try {
        const result = tournamentCreateSchema.parse(data);

        const size = Number(result.size);
        const names = result.names;

        // If a tournament is already ongoing for this socket, reject
        if (socket.data.tournamentId) {
          console.log("User already in a tournament:", socket.data.tournamentId);
          socket.emit("tournament:duplicate", { message: "Already in a tournament" });
          return;
        }
        const tournamentId = tournamentManager.createTournament(size, names);
        if (!tournamentId)
          throw new Error("Failed to create tournament");

        if (socket.data.gameId) {
          if (tournamentManager.isGameInTournament(socket.data.gameId))
            tournamentManager.onGameStopped(socket.data.gameId);
          else
            manager.leaveGame(socket.data.gameId, socket);
          socket.data.gameId = null;
        }
        // if (socket.data.tournamentId) {
        //   if (!tournamentManager.deleteTournament(socket.data.tournamentId, socket))
        //     throw new Error("Failed to delete existing tournament");
        //   socket.data.tournamentId = null;
        // } 

        socket.data.tournamentId = tournamentId;

        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament) throw new Error("Tournament not found after creation");
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        console.error("tournament:create error: ", e.message);
        socket.emit("tournament:error", { message: "Tournament creation error" });
      }
    });

    socket.on("tournament:getState", (data = {}) => {
      try {
        const result = tournamentGetStateSchema.parse(data);
        const tournamentId = result.tournamentId || socket.data.tournamentId;
        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament)
          throw new Error("Tournament not found");
        if (tournament.current) {
          if (tournamentManager.isGameInTournament(tournament.current))
            tournamentManager.onGameStopped(socket.data.gameId);
          else
            manager.leaveGame(socket.data.gameId, socket);
          socket.data.gameId = null;
        }
        socket.emit("tournament:state", { tournamentId, tournament });
      }
      catch (e) {
        console.error("tournament:getState error: ", e.message);
        socket.emit("tournament:error", { message: "Can't access tournament" });
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

        const tournament = tournamentManager.getTournament(tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        info.startData.mainPlayer = tournament.mainPlayer;
        if (tournament.mainPlayer !== info.player1 && tournament.mainPlayer !== info.player2) {
          info.startData.persistMatch = false;
        }
      
        if (!manager.startGame(info.gameId, info.startData))
          throw new Error("Failed to start tournament match game");
        
        socket.emit("match:started", info);
        
        socket.emit("tournament:state", { tournamentId, tournament });
      } catch (e) {
        console.log("tournament:nextMatch error: ", e.message);
        socket.emit("tournament:error", { message: e.message || "Can't access next match" });
      }
    });

    socket.on("session:retrieve", (data = {}) => {
      try {
        const result = sessionRetrieveSchema.parse(data);
        const tournamentId = result.tournamentId;
        if (tournamentId) {
          const tournament = tournamentManager.getTournament(tournamentId);
          if (tournament) {
            socket.data.tournamentId = tournamentId;
            socket.emit("tournament:sessionData", { tournamentId, tournament });
          } else {
            socket.emit("tournament:error", { message: "Tournament not found" });
          }
        }
      } catch (e) {
        console.error("session:retrieve error: ", e.message);
        socket.emit("tournament:error", { message: "Session retrieve error" });
      }
    });

    socket.on("tournament:leave", (data = {}) => {
      try {
        console.log("tournament:leave called with data: ", data);
        const result = tournamentLeaveSchema.parse(data);

        const tournamentId = result.tournamentId || socket.data.tournamentId;
        if (tournamentManager.deleteTournament(tournamentId, socket))
        {
          socket.data.tournamentId = null;
          throw new Error("Failed to delete tournament on leave");
        }
        socket.data.tournamentId = null;
        console.log("Tournament deleted: ", tournamentId);
      }
      catch (e) {
        console.error("tournament:leave error: ", e.message);
        socket.emit("tournament:error", { message: "Leave tournament" });
        if (socket.data.tournamentId && tournamentManager.deleteTournament(socket.data.tournamentId, socket))
          console.error("Failed to delete tournament on leave");
        socket.data.tournamentId = null;
      }
    });    
  });
}



