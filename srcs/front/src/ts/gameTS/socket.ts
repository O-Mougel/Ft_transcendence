import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import { CONTEXT } from "./context.js";
import { handleGameOver, handleGameStopped } from "./API.js";
import { updateGameScene } from "./pong.js";
import { fetchErrcodeHandler } from "../eventTS/userLog.js";
import type { GameStateData, GameStartedData, Socket as SocketType } from '../types/socket.types';
import type { GameOverData } from '../types/game.types';
// import Paddle from "./paddle.js";

let socket: SocketType | null = null;

export function setupSocket(): SocketType | null {

	if (socket) return socket;

	const token = sessionStorage.getItem("access_token");
	if (!token) {
		console.error("No access token found in sessionStorage");
		return null;
	}

	socket = io({
		path: "/pong/socket.io",
		transports: ["websocket"],
		secure: true,
		auth: { token },
	}) as SocketType;

	socket.on("connect", () => {
		console.log("Connected to WebSocket server");
		// retrieve tournamentId if possible
		const tournamentId = sessionStorage.getItem("currentTournamentId");
		if (tournamentId)
			CONTEXT.tournamentId = tournamentId;
	});

	socket.on("disconnect", (reason: unknown) => {
		console.log("WebSocket disconnected:", reason);
	});

	socket.on("connect_error",	(err: unknown) => {
	console.error("WebSocket connection error:", err);
		return null;
	});

	if (typeof updateGameScene === "function") 
	{
		socket.off("game:state");
		socket.on("game:state", (...args: unknown[]) => {
			const data = args[0] as GameStateData;
			updateGameScene(data);
			});
	}

	if (typeof handleGameStopped === "function") 
	{
		socket.off("game:stopped");
		socket.on("game:stopped", handleGameStopped);
	}

	if (typeof handleGameOver === "function")
	{
		socket.off("game:over");
		socket.on("game:over", (...args: unknown[]) => {
			const data = args[0] as GameOverData;
			(handleGameOver as (d: GameOverData) => void)(data);
			});
	}

	socket.off("game:error");
	socket.on("game:error", (err: unknown) => {
		console.error("WebSocket error:", err);
	});

	return socket;
}

export function isSocketConnected(): boolean {
	return !!(socket && socket.connected);
}

export async function waitStartGame(): Promise<void> {
	if (!isSocketConnected()) {
		console.log("Cannot start game: Not connected to server");
		return;
	}
	try {
		const dataRequestResponse = await fetch('/profile/grab', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});

		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();
		if (!result) throw new Error('No data received from server');

		if (CONTEXT.gameId && socket) {
			console.log("Joining existing game with ID:", CONTEXT.gameId);
			socket.emit("game:join", { gameId: CONTEXT.gameId });
			return;
		}
		const tokenP1 = sessionStorage.getItem("access_token");

		if (!socket) return;

		if (CONTEXT.gameMode === 0) {
			console.log("Starting single-player game against AI opponent");
			socket.emit("game:start", {
				mode: 0,
				player1Token: tokenP1,
				player2: "AIOpponent",
			});
		}
		else if (CONTEXT.gameMode === 1) {
			socket.emit("game:start", {
				mode: 1,
				player1Token: tokenP1,
				player2: "Player2",
			});
		}
		else if (CONTEXT.gameMode === 3) {
			const tokenP2 = sessionStorage.getItem("player2_token");
			socket.emit("game:start", {
				mode: 3,
				player1Token: tokenP1,
				player2Token: tokenP2,
			});
		}
		else {
			socket.emit("game:start", {
				mode: 2,
				player1: "Player 1",
				player2: "Player 2",
				player3: "Player 3",
				player4: "Player 4",
			});
		}

		socket.once("game:started", (...args: unknown[]) => {
		const data = args[0] as GameStartedData;
		console.log("Game started with data:", data);
	});
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
					return waitStartGame();
		console.error('Couldn\'t grab user info!\n => ', err);
	}
}

export function startNewGame(payload: unknown): void {
	if (!isSocketConnected() || !socket) return;
	socket.emit("game:start", payload);
}

export function joinExistingGame(gameId: string | null): void {
	if (!isSocketConnected() || !socket || !gameId) return;
	socket.emit("game:join", { gameId });
}

export function emitStopGame(): void {
	if (!isSocketConnected() || !socket) return;
	socket.emit("game:stop");
}

export function emitNextMatch(tournamentId: string | null): void {
	if (!isSocketConnected() || !socket) {
		console.log("Cannot start next match: Not connected to server");
		return;
	}
	if (!tournamentId) {
		console.log("Cannot start next match: No tournament ID provided");
		return;
	}
	socket.emit("tournament:nextMatch", { tournamentId });
}

export function updateGameState(): void {
	const { isGameStarted, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;
	if (!isGameStarted || !socket) return;
	// print value and their types

	const directionLeft = leftPaddle?.direction || "none";
	const directionRight = rightPaddle?.direction || "none";
	const directionLeft2 = leftPaddle2?.direction || "none";
	const directionRight2 = rightPaddle2?.direction || "none";

	if (leftPaddle && leftPaddle.direction) socket.emit("game:move", { paddle: "left", direction: directionLeft });
	if (rightPaddle&& rightPaddle.direction) socket.emit("game:move", { paddle: "right", direction: directionRight });

	if (CONTEXT.gameMode !== 2) return;

	if (leftPaddle2 && leftPaddle2.direction) socket.emit("game:move", { paddle: "left2", direction: directionLeft2 });
	if (rightPaddle2 && rightPaddle2.direction) socket.emit("game:move", { paddle: "right2", direction: directionRight2 });
}

export function handleEscapeKey(): void {
	if (!isSocketConnected() || !socket) {
		console.log("Cannot stop game: Not connected to server");
		return;
	}
	if (!CONTEXT.isGameStarted || window.location.href.includes("/pongTournament")) return;
		socket.emit("game:stop");
}

export function getSocket(): SocketType | null {
	return socket;
}
