import Fastify from "fastify";
import { Server } from "socket.io";

import { registerSocketHandlers } from "./sockets.js";
import { GameManager } from "./gameManager.js";
import { TournamentManager } from "./tournamentManager.js";

const fastify = Fastify({ logger: true });

const io = new Server(fastify.server, {
  path: "/pong/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const manager = new GameManager(io);
const tournamentManager = new TournamentManager(manager);

// tournament hook
manager._setOnGameOver(({ gameId, state }) => {
  const res = tournamentManager._onGameOver({ gameId, state });
  if (!res) return;

  const t = tournamentManager._getTournament(res.tournamentId);
  io.emit("tournament:state", { tournamentId: res.tournamentId, tournament: t });

  if (res.type === "tournamentEnded") io.emit("tournament:ended", res);
  else io.emit("match:ended", res);
});

registerSocketHandlers(io, manager, tournamentManager);


// /* ========= REST API (CLI) ========= */

fastify.post("/api/pong/games", async (req, reply) => {
  const { mode = 0, data = {} } = req.body ?? {};
  const gameId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  console.log("SERVER.JS: Creating new game with id:", gameId);

  // Create + start server-side game without socket
  manager._ensureGameExist(gameId);
  manager._startGame(gameId, { ...data, mode });

  return { gameId };
});

fastify.post("/api/pong/games/:gameId/join", async (req, reply) => {
  const { gameId } = req.params;
  manager._ensureGameExist(gameId);
  return { ok: true };
});

fastify.post("/api/pong/games/:gameId/input", async (req, reply) => {
  const { gameId } = req.params;
  const { side, direction } = req.body ?? {};

  if (!side || !direction) return reply.code(400).send({ error: "Missing side or direction" });

  manager._updatePaddle(gameId, side, direction);
  return { ok: true };
});

fastify.get("/api/pong/games/:gameId/state", async (req, reply) => {
  const { gameId } = req.params;
  const state = manager._getState(gameId);
  if (!state) return reply.code(404).send({ error: "Game not found" });
  return state;
});

//  /* ======== Start Server ======== */

fastify.listen({ port: 3002, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});