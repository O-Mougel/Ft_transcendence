import Fastify from "fastify";
import { Server } from "socket.io";
import fjwt from '@fastify/jwt'


import { registerSocketHandlers } from "./sockets.js";
import { GameManager } from "./gameManager.js";
import { TournamentManager } from "./tournamentManager.js";

const fastify = Fastify({ logger: true });

fastify.register(fjwt, {
  secret: process.env.JWT_SECRET,
});

const io = new Server(fastify.server, {
  path: "/pong/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket"],
  secure: true,
});

const messageRateLimits = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error("Socket auth error: No token provided");
      return next(new Error("Unauthorized"));
    }

    const payload = fastify.jwt.verify(token);
    socket.data.user = payload;

    messageRateLimits.set(socket.id, { count: 0, resetAt: Date.now() + 1000 });

    return next();
  } catch (e) {
    console.error("Socket auth error:", e);
    return next(new Error("Invalid token"));
  }
});


const manager = new GameManager(io);
const tournamentManager = new TournamentManager(manager);

manager.setOnGameOver(({ gameId, state }) => {
  const res = tournamentManager.onGameOver({ gameId, state });
  if (!res) return;

  const t = tournamentManager.getTournament(res.tournamentId);
  if (t) {
    io.emit("tournament:state", { tournamentId: res.tournamentId, tournament: t });
  }

  if (res.type === "tournamentEnded") io.emit("tournament:ended", res);
  else io.emit("match:ended", res);
});

registerSocketHandlers(io, manager, tournamentManager, messageRateLimits);

fastify.post("/api/pong/games", async (req, reply) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return reply.code(401).send({ error: "Missing or invalid authorization header" });

    const token = auth.split(" ")[1];
    const payload = fastify.jwt.verify(token);
    if (!payload)
      return reply.code(401).send({ error: "Invalid token" });

    const { mode = 0, data = {} } = req.body ?? {};
    const gameId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    console.log("SERVER.JS: Creating new game with id:", gameId);

    manager.ensureGameExist(gameId);
    if (!manager.startGame(gameId, { ...data, mode }))
      throw new Error("Failed to start game");
    return { gameId };
  } catch (e) {
    console.error("Error in /api/pong/games:", e);
    const errCode = e.code;
		if (errCode === "FAST_JWT_EXPIRED")
			return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
		else if (errCode === "FAST_JWT_MALFORMED") 
			return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
		else
			return reply.status(403).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
  }
});

fastify.post("/api/pong/games/:gameId/input", async (req, reply) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return reply.code(401).send({ error: "Missing or invalid authorization header" });

    const token = auth.split(" ")[1];
    const payload = fastify.jwt.verify(token);
    if (!payload)
      return reply.code(401).send({ error: "Invalid token" });

    const { gameId } = req.params;
    const { side, direction } = req.body ?? {};
  
    if (!side || !direction) return reply.code(400).send({ error: "Missing side or direction" });
  
    manager.updatePaddle(gameId, side, direction);
    return { ok: true };
  } catch (e) {
    console.error("Error in /api/pong/games/:gameId/input:", e);
    const errCode = e.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(403).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
  }
});

fastify.get("/api/pong/games/:gameId/state:", async (req, reply) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return reply.code(401).send({ error: "Missing or invalid authorization header" });

    const token = auth.split(" ")[1];
    const payload = fastify.jwt.verify(token);
    if (!payload)
      return reply.code(401).send({ error: "Invalid token" });

    const { gameId } = req.params;
    const state = manager.getState(gameId);
    if (!state) return reply.code(404).send({ error: "Game not found" });
    return state;
  } catch (e) {
    console.error("Error in /api/pong/games/:gamId/state", e);
    const errCode = e.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(403).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
  }
});

fastify.listen({ port: 3002, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

export function verifyPlayerToken(token) {
  try {
    const payload = fastify.jwt.verify(token);
    return payload;
  } catch (e) {
    console.error("Token verification error:", e);
    return null;
  }
}
