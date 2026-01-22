import { createGame } from "./game.js";
import { AI_REACTION_TIME, TICK_RATE } from "./config.js";
import { createMatch } from "../../src/modules/match/match.service.js"
import { findUserByName } from "../../src/modules/user/user.service.js"
import { verifyPlayerToken } from "./server.js";
import { getMatchRound } from "./tournamentManager.js";


export class GameManager {
  constructor(io) {
    this.io = io;

    this.games = new Map(); // gameId -> { game, tickId, aiId, players: Set<socketId> }
    this.onGameOver = null;
  }

  setOnGameOver(gameState) {
    this.onGameOver = gameState;
  }

  // Ensure a game entry exists for the given gameId
  ensureGameExist(gameId) {
    if (this.games.has(gameId)) return;

    this.games.set(gameId, {
      game: createGame(),
      tickId: null,
      aiId: null,
      players: new Set(),
      meta: null,
    });
  }

  joinGame(gameId, socket) {
    this.ensureGameExist(gameId);
    const entry = this.games.get(gameId);
    entry.players.add(socket.id);
    entry.game.player1 = socket.data.user;
    socket.join(gameId);
  }

  leaveGame(gameId, socket) {
    const entry = this.games.get(gameId);
    if (!entry) return;

    entry.players.delete(socket.id);
    socket.leave(gameId);

    // If room is empty, stop loops + delete game
    if (entry.players.size === 0) {
      this.stopLoops(gameId);
      this.games.delete(gameId);
    }
  }

  async startGame(gameId, data) {
    this.ensureGameExist(gameId);
    const entry = this.games.get(gameId);
    entry.game.reset();

    try {
      if (data.mode === 3) {
        var verifiedPlayer2 = verifyPlayerToken(data.player2Token);
        if (!verifiedPlayer2) {
          socket.emit("error", { message: "Invalid player 2 token" });
          return;
        }
        entry.game.player2 = verifiedPlayer2;
      }
      else {
        entry.game.player2 = { username: "Guest", id: 0 };
      }
      // entry.meta = data.tournament ? { ...data.tournament } : null;

      // console.log("Starting game:", gameId, "with mode:", data.mode, "and meta:", entry.meta);

      entry.game.start?.(data);
      if (typeof entry.game.mode === "number" && typeof data.mode === "number") {
        entry.game.mode = data.mode;
      }

      this.startTickLoop(gameId);
      this.startAiLoop(gameId);

      return { ok: true };
    }
    catch (err) {
      console.error("Error starting game:", err);
      return { ok: false, error: "Failed to start game" };
    }
  }

  getState(gameId) {
    const entry = this.games.get(gameId);
    if (!entry) return null;
    return entry.game.getCurrentGameState();
  }

  stopGame(gameId) {
    const entry = this.games.get(gameId);
    if (!entry) return;

    entry.game.stop();
    this.stopLoops(gameId);
  }

  updatePaddle(gameId, side, direction) {
    const entry = this.games.get(gameId);
    if (!entry) return;
    entry.game.updatePaddleDirection(side, direction);
  }

  startTickLoop(gameId) {
    const entry = this.games.get(gameId);
    if (!entry || entry.tickId) return;

    entry.tickId = setInterval(() => {
      const { game } = entry;
      const { gameOver } = game.updateGameState();
      const state = game.getCurrentGameState();
      if (!state) return;

      this.io.to(gameId).emit("game:state", state);

      if (gameOver) {
        this.io.to(gameId).emit("game:over", state.score);

        if (this.onGameOver) this.onGameOver({ gameId, state });

        // console.log("Tournament: ", entry.meta?.tournamentId);

        if (game.mode !== 2) {
          persistMatch(entry.game).catch((err) => {
            console.error("Error persisting match:", err);
          });
        }

        // console.log("this.onGameOver:", !!this.onGameOver);
        // console.log("Emitted game:over for gameId:", gameId);
        // console.log("Final state:", state);
        // console.log("Meta data:", entry.meta);
        // console.log("Game mode:", game.mode);

        if (this.onGameOver) {
          try {
            // this.onGameOver({ gameId, state, meta: entry.meta });
          } catch (e) {
            console.error("onGameOver error:", e);
          }
        }

        this.stopLoops(gameId);
        game.reset();
      }
    }, TICK_RATE);
  }

  startAiLoop(gameId) {
    const entry = this.games.get(gameId);
    if (!entry || entry.aiId) return;

    // Only schedule AI updates for AI mode
    entry.aiId = setInterval(() => {
      const { game } = entry;

      if (!game.isGameStarted) return;
      if (game.mode !== 0) return;

      const aiPlayer = game.AIPlayer;
      if (aiPlayer) aiPlayer.updatePrediction();
    }, AI_REACTION_TIME);
  }

  stopLoops(gameId) {
    const entry = this.games.get(gameId);
    if (!entry) return;

    if (entry.tickId) {
      clearInterval(entry.tickId);
      entry.tickId = null;
    }
    if (entry.aiId) {
      clearInterval(entry.aiId);
      entry.aiId = null;
    }
  }
}

async function persistMatch(game) {
  if (!game) return;

  const state = game.getCurrentGameState();

  const type = game.mode === 0 ? "AI" : game.mode === 3 ? "ranked" : "1v1";

  if (game.tournamentId) {
    type = "tournament";
  }

  console.log("Persisting match:", {
    player1Id: game.player1.id,
    player2Id: game.player2.id,
    player1Score: state.score.left,
    player2Score: state.score.right,
    winnerId: state.score.left > state.score.right ? game.player1.id : game.player2.id,
    longestStreak: game.longestStreak,
    duration: game.getDuration(),
    type: type,
    round: game.tournamentRound,
    finish: true,
  });

  const matchInfos = {
    player1Id: game.player1.id,
    player2Id: game.player2.id,
    player1Score: state.score.left,
    player2Score: state.score.right,
    winnerId: state.score.left > state.score.right ? game.player1.id : game.player2.id,
    longestStreak: game.longestStreak,
    duration: game.getDuration(),
    type: type,
    round: game.tournamentRound,
    finish: true,
  };
  createMatch(matchInfos).catch(console.error);
}