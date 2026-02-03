import { waitStartGame, isSocketConnected, setupSocket, emitNextMatch } from "./socket.js";
import { CONTEXT, createGameElements } from "./context.js";
import { draw, drawScore, resetState } from "./graphics.js";
import { router} from "../eventTS/index.js";
import { resizeCanvasToElement} from "../eventTS/clickEvents.js";
import { bindControls } from "./controls.js";
import type { GameInitOptions, GameMode } from '../types/game.types';
import type { GameStateData } from '../types/socket.types';
import { getSocket } from "../gameTS/socket.js";
import { tournamentStateSchema } from "../gameTS/schemaYup.js";
import { findNextReadyMatch } from "../gameTS/tournament.js";
import type { TournamentStateData } from '../types/socket.types';
import { alertBoxMsg, backToDefaultPage } from "../eventTS/userLog.js";


export function initPong(mode: GameInitOptions = { mode: 0 }): void {
	if (mode.mode === 3 && !sessionStorage.getItem("player2_token")) {
		window.history.pushState(null, "", `/`);
		router();
		return;
	}
	CONTEXT.gameMode = mode.mode as GameMode;
	if (mode.gameId) {
		CONTEXT.gameId = mode.gameId;
	}
	CONTEXT.canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
	CONTEXT.startButton = document.getElementById("startButton") as HTMLButtonElement | null;
	CONTEXT.backButton = document.getElementById("backToTournament") as HTMLButtonElement | null;
	CONTEXT.score = document.getElementById("Scores");

	if (!CONTEXT.canvas || !CONTEXT.score || !CONTEXT.startButton) {
		console.error("Pong: canvas or startButton not found in DOM.");
		if (CONTEXT.gameId && !CONTEXT.backButton)
			console.error("backButton is missing on the page !");
		return;
	}

	const canvas = CONTEXT.canvas;
	const ctx = CONTEXT.ctx = canvas.getContext("2d");

	if (!ctx) {
		console.error("Pong: could not get 2d context.");
		return;
	}

	const scale = window.devicePixelRatio || 1;
	CONTEXT.scale = scale;

	// initial size and keep responsive on resize
	resizeCanvasToElement();
	// window.addEventListener("resize", resizeCanvasToElement);
	
	createGameElements();
	setupSocket();
	bindControls();

	if (!CONTEXT.tournamentId)
		CONTEXT.tournamentId = sessionStorage.getItem("currentTournamentId");
	
	if (CONTEXT.tournamentId && window.location.href.includes("/pongTournament")) {
		resetState();

		if (CONTEXT.score) CONTEXT.score.style.display = "flex";
		CONTEXT.isGameStarted = true;
		gameInit();
		if (CONTEXT.startButton) {
			CONTEXT.startButton.style.display = "block";
			CONTEXT.startButton.onclick = (): void => {
				window.scrollTo(0, 0);
				document.body.style.overflow = "hidden";
				if (CONTEXT.startButton) document.getElementById("startButton")?.remove();
				canvas.style.cursor = "none";
				emitNextMatch(CONTEXT.tournamentId);
				if (CONTEXT.backButton) CONTEXT.backButton.classList.add("hidden");
			};
		}
	} else {
		if (CONTEXT.startButton) {

			CONTEXT.startButton.style.display = "block";
			CONTEXT.startButton.onclick = startGame;
		}
	}

	if (CONTEXT.tournamentId && window.location.href.includes("/pongTournament") && CONTEXT.backButton) {
		CONTEXT.backButton.classList.remove("hidden");
		// CONTEXT.backButton.onclick = (): void => {
		// 	window.history.pushState(null, "", `/tournament`);
		// 	router();
		// };
	}

	draw();
}

export function updateGameScene(data: GameStateData): void {
	if (!data) return;
	const { ball, leftPaddle, rightPaddle, isGameStarted } = CONTEXT;

	if (!ball || !leftPaddle || !rightPaddle) return;

	// Ball
	if (typeof data.ball?.x === "number") ball.x = data.ball.x * CONTEXT.RES_CHANGE * CONTEXT.GAME_WIDTH;
	if (typeof data.ball?.y === "number") ball.y = data.ball.y * CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT;
	if (typeof data.ball?.vx === "number") ball.speedX = data.ball.vx;
	if (typeof data.ball?.vy === "number") ball.speedY = data.ball.vy;

	if (typeof data.paddles?.left === "number") leftPaddle.y = data.paddles.left * CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT;
	if (typeof data.paddles?.right === "number") rightPaddle.y = data.paddles.right * CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT;
	if (CONTEXT.gameMode === 2) {
		const { leftPaddle2, rightPaddle2 } = CONTEXT;
		if (leftPaddle2 && typeof data.paddles?.left2 === "number") leftPaddle2.y = data.paddles.left2 * CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT;
		if (rightPaddle2 && typeof data.paddles?.right2 === "number") rightPaddle2.y = data.paddles.right2 * CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT;
	}

	// Score
	if (data.score) {
		const { left, right } = data.score;
		if (typeof left === "number" &&
			typeof right === "number" &&
			(left !== leftPaddle.score || right !== rightPaddle.score))
		{
			leftPaddle.score = left;
			rightPaddle.score = right;
			drawScore();
		}
	}
	if (isGameStarted) draw();
}

function startGame(): void {
	if (!isSocketConnected())
		return;

	console.log("Game Started");

	waitStartGame();
	resetState();

	if (CONTEXT.startButton) {
		CONTEXT.canvas!.style.cursor = "none";
		window.scrollTo(0, 0);
		document.body.style.overflow = "hidden";
		CONTEXT.startButton.style.display = "none";
	}
	if (CONTEXT.score) CONTEXT.score.style.display = "flex";
	CONTEXT.isGameStarted = true;
	gameInit();
}

function gameInit(): void {
	const { ctx } = CONTEXT;
	if (!ctx) return;
	ctx.clearRect(0, 0, CONTEXT.RES_CHANGE * CONTEXT.GAME_WIDTH, CONTEXT.RES_CHANGE * CONTEXT.GAME_HEIGHT);
	draw();
}

export function retrieveSessionData(): void {
	const socket = getSocket();
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}
	socket.emit("tournament:retrieve", { tournamentId: CONTEXT.tournamentId });

	socket.on("tournament:sessionData", (data: unknown): void => {
		if (!data) {
			alertBoxMsg(`❌ Tournament session data could not be retrieved !`);
			backToDefaultPage();
		}
		else {
			try {
				const result = tournamentStateSchema.validateSync(data) as TournamentStateData;
				if (!CONTEXT.tournamentId)
					CONTEXT.tournamentId = result.tournamentId;
				const nextMatch = findNextReadyMatch(result.tournament);
				if (nextMatch) {
					CONTEXT.leftName = nextMatch.player1;
					CONTEXT.rightName = nextMatch.player2;
				}
				console.log("Tournament session data retrieved successfully.");
			} catch (err) {
				console.error("Error validating tournament session data:", err, data);
				alertBoxMsg("❌ Error validating tournament session data.");
				backToDefaultPage();
			}
		}
	});
}
