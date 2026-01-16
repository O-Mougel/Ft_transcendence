import { createGame } from "./game.js";
import { AI_REACTION_TIME, TICK_RATE } from "./config.js";
import { createMatch } from "../../src/modules/match/match.service.js"
import { findUserByName } from "../../src/modules/user/user.service.js"

export class GameManager {
  constructor(io) {
    this.io = io;

    this.games = new Map(); // gameId -> { game, tickId, aiId, players: Set<socketId> }
    this.onGameOverCb = null;
    this.onGameOver
  }

  setOnGameOver(cb) {
    this.onGameOverCb = cb;
  }

  setOnGameOver(cb) { 
    this.onGameOver = cb;
  }

  // Ensure a game entry exists for the given gameId
  ensureGameExist(gameId) {
    // if (!this.games.has(gameId)) {
    //   this.games.set(gameId, {
    //     game: createGame(),
    //     tickId: null,
    //     aiId: null,
    //     players: new Set(),
    //   });
    // }
    // let game = this.games.get(gameId);
    // game.game.id = gameId; // set the game unique id
    // return game;
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
    // const entry = this.ensureGameExist(gameId);
    // entry.players.add(socket.id);
    // socket.join(gameId);
    // return entry;
    this.ensureGameExist(gameId);
    const entry = this.games.get(gameId);
    entry.players.add(socket.id);
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
    // const entry = this.ensureGameExist(gameId);
    // const { game } = entry;

    // const mode = data?.mode ?? 0;
    // game.mode = mode;
    // game.player1Id = "1",//data?.player1Id ?? null;
    // game.player2Id = "2", //data?.player2Id ?? null;
    // game.start(data);

    // this.startTickLoop(gameId);
    // this.startAiLoop(gameId);

    // return { mode };
    this.ensureGameExist(gameId);
    const entry = this.games.get(gameId);
    entry.game.reset();

    const user1 = await findUserByName("TEST");
    entry.game.player1Id = user1.id;
    const user2 = await findUserByName("TEST");
    entry.game.player2Id = user2.id;

    // optional meta from caller
    entry.meta = data._tournament ? { ...data._tournament } : null;

    // let game decide how to use data (mode, player names, etc.)
    entry.game.start?.(data); // if your game has start()
    if (typeof entry.game.mode === "number" && typeof data.mode === "number") {
      entry.game.mode = data.mode;
    }

    this.startTickLoop(gameId);
    this.startAiLoop(gameId);

    return { ok: true };
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

      // IMPORTANT: emit to the room only
      this.io.to(gameId).emit("state", state);

      // Detect game over
      if (gameOver) {
        this.io.to(gameId).emit("gameOver", state.score);

        if (this.onGameOver) this.onGameOver({ gameId, state });

        console.log("Tournament: ", entry.meta?.tournamentId);

        if (game.mode === 1 && !entry.meta?.tournamentId) { // only persist 1v1 matches if not in tournament mode
          persistMatch(entry.game).catch((err) => {
            console.error("Error persisting match:", err);
          });
        }

        // notify tournament layer if any
        if (this.onGameOverCb) {
          try {
            this.onGameOverCb({ gameId, state, meta: entry.meta });
          } catch (e) {
            console.error("onGameOverCb error:", e);
          }
        }

        // Cleanly stop this match (sequential tournament needs cleanup)
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
  // on game over:
  const matchInfos = {
    player1Id: game.player1Id,
    player2Id: game.player1Id,
    player1score: state.score.left,
    player2score: state.score.right,
    winnerId: state.score.left > state.score.right ? game.player1Id : game.player2Id,
    longestStreak: game.longestStreak,
    duration: game.getDuration(),
  };
  createMatch(matchInfos).catch(console.error);
}