import { waitStartGame, isSocketConnected, setupSocket, emitNextMatch, joinExistingGame } from "./socket.js";
import { CONTEXT, createGameElements } from "./context.js";
import { draw, drawScore, resetState } from "./graphics.js";
import { bindControls } from "./controls.js";
import type { GameInitOptions, GameMode } from '../types/game.types';
import type { GameStateData } from '../types/socket.types';

export function initPong(mode: GameInitOptions = { mode: 0 }): void {
	if (mode.mode === 3 && !sessionStorage.getItem("player2_token")) {
		window.history.pushState({}, "", `/ranked`);
		window.dispatchEvent(new PopStateEvent("popstate"));
		return;
	}
	CONTEXT.gameMode = mode.mode as GameMode;
	console.log("Setting up Pong..., mode:", mode.mode);

	if (mode.gameId) {
		CONTEXT.gameId = mode.gameId;
	}

	CONTEXT.canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
	CONTEXT.startButton = document.getElementById("startButton") as HTMLButtonElement | null;
	CONTEXT.backButton = document.getElementById("backToTournament") as HTMLButtonElement | null;
	CONTEXT.score = document.getElementById("Scores");

	if (!CONTEXT.canvas || !CONTEXT.startButton || !CONTEXT.score || !CONTEXT.backButton) {
		console.error("Pong: canvas or startButton not found in DOM.");
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

	// Resize canvas drawing buffer to match displayed CSS size (and DPR)
	const resizeCanvasToElement = (): void => {
		const rect = canvas.getBoundingClientRect();
		const cssW = Math.max(1, Math.floor(rect.width));
		const cssH = Math.max(1, Math.floor(rect.height));

		// keep logical drawing coordinates in CSS pixels so game math uses those values
		CONTEXT.GAME_WIDTH = cssW;
		CONTEXT.GAME_HEIGHT = cssH;

		// set backing buffer in device pixels
		const backingW = Math.floor(cssW * scale);
		const backingH = Math.floor(cssH * scale);
		if (canvas.width !== backingW || canvas.height !== backingH) {
			canvas.width = backingW;
			canvas.height = backingH;
		}

		// ensure CSS width/height match the element rect (some frameworks may change these)
		canvas.style.width = cssW + "px";
		canvas.style.height = cssH + "px";

		// reset transform and apply DPR scaling so drawing uses CSS pixel coordinates
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(scale, scale);
	};

	// initial size and keep responsive on resize
	resizeCanvasToElement();
	window.addEventListener("resize", resizeCanvasToElement);

	console.log("Tournament ID:", CONTEXT.tournamentId);

	createGameElements();
	setupSocket();
	bindControls();

	if (CONTEXT.tournamentId && window.location.href.includes("/pongTournament")) {
		if (CONTEXT.startButton) CONTEXT.startButton.style.display = "none";
		joinExistingGame(CONTEXT.gameId);
		resetState();

		if (CONTEXT.startButton) CONTEXT.startButton.style.display = "none";
		if (CONTEXT.score) CONTEXT.score.style.display = "flex";
		CONTEXT.isGameStarted = true;
		gameInit();
		if (CONTEXT.startButton) {
			CONTEXT.startButton.style.display = "block";
			CONTEXT.startButton.onclick = (): void => {
				window.scrollTo(0, 0);
				document.body.style.overflow = "hidden";
				if (CONTEXT.startButton) CONTEXT.startButton.style.display = "none";
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
		console.log("Showing back to tournament button");
		CONTEXT.backButton.classList.remove("hidden");
		CONTEXT.backButton.onclick = (): void => {
			window.history.pushState({}, "", `/tournamentSize`);
			window.dispatchEvent(new PopStateEvent("popstate"));
		};
	}

	draw();
}

export function updateGameScene(data: GameStateData): void {
	if (!data) return;
	const { ball, leftPaddle, rightPaddle, GAME_WIDTH, GAME_HEIGHT, isGameStarted } = CONTEXT;

	if (!ball || !leftPaddle || !rightPaddle) return;

	// Ball
	if (typeof data.ball?.x === "number") ball.x = data.ball.x * GAME_WIDTH;
	if (typeof data.ball?.y === "number") ball.y = data.ball.y * GAME_HEIGHT;
	if (typeof data.ball?.vx === "number") ball.speedX = data.ball.vx;
	if (typeof data.ball?.vy === "number") ball.speedY = data.ball.vy;

	if (typeof data.paddles?.left === "number") leftPaddle.y = data.paddles.left * GAME_HEIGHT;
	if (typeof data.paddles?.right === "number") rightPaddle.y = data.paddles.right * GAME_HEIGHT;
	if (CONTEXT.gameMode === 2) {
		const { leftPaddle2, rightPaddle2 } = CONTEXT;
		if (leftPaddle2 && typeof data.paddles?.left2 === "number") leftPaddle2.y = data.paddles.left2 * GAME_HEIGHT;
		if (rightPaddle2 && typeof data.paddles?.right2 === "number") rightPaddle2.y = data.paddles.right2 * GAME_HEIGHT;
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
		// scroll back to top + disable scroll
		window.scrollTo(0, 0);
		document.body.style.overflow = "hidden";
		CONTEXT.startButton.style.display = "none";
	}
	if (CONTEXT.score) CONTEXT.score.style.display = "flex";
	CONTEXT.isGameStarted = true;
	gameInit();
}

function gameInit(): void {
	const { ctx, GAME_WIDTH, GAME_HEIGHT } = CONTEXT;
	if (!ctx) return;
	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	draw();
}
