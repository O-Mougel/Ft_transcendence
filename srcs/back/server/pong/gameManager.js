import { createGame } from "./game.js";
import { AI_REACTION_TIME, TICK_RATE } from "./config.js";
import { createMatch } from "../src/modules/match/match.service.js"
import { findUserByName } from "../src/modules/user/user.service.js"
import { verifyPlayerToken } from "./server.js";


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

    if (data.mode === 2 || data.persistMatch === false)
      entry.game.persistMatch = false;

    if (data.mainPlayer)
      entry.game.mainTournamentPlayer = data.mainPlayer;

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
        const username = data.player2 || "Guest";
        entry.game.player2 = { username: username, id: 0 };
      }

      if (data.player1) entry.game.player1.username = data.player1

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

        if (entry.game.persistMatch) {
          persistMatch(entry.game).catch((err) => {
            console.error("Error persisting match:", err);
          });
        }

        if (this.onGameOver) {
          try {
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

  const type = game.mode === 0 ? "AI" : game.mode === 3 ? "ranked" : game.tournamentId ? "tournament" : "1v1";

  const player2name = type === "AI" ? "COMPUTER" : "1v1" ? "Guest" : game.player2.username;

  console.log("Match type determined as:", type);
  console.log("Main tournament player:", game.mainTournamentPlayer);

  if (type == "tournament" && (game.mainTournamentPlayer === game.player2.username || game.mainTournamentPlayer === game.player1.username)) {
    if (game.mainTournamentPlayer === game.player2.username) {
      console.log("");
      const tempScore = state.score.left;
      state.score.left = state.score.right;
      state.score.right = tempScore;
      console.log("Swapped scores for main tournament player:", game.mainTournamentPlayer);
    }
  }

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
	  player2name,
  };

  createMatch(matchInfos).catch(console.error);
}
