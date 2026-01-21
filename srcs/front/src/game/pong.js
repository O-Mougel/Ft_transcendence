import { waitStartGame, isSocketConnected, setupSocket, emitStopGame, joinExistingGame, emitNextMatch } from "./socket.js";
import { CONTEXT, createGameElements } from "./context.js";
import { draw, drawScore, resetState } from "./graphics.js";
import { bindControls } from "./controls.js";

export function initPong(mode = {}) {
	if (mode.mode === 3 && !sessionStorage.getItem("player2_token")) {
		window.history.pushState({}, "", `/ranked`);
		window.dispatchEvent(new PopStateEvent("popstate"));
		return;
	}
	CONTEXT.gameMode = mode.mode;
	console.log("Setting up Pong..., mode:", mode.mode);
	console.log("Game ID from initPong:", mode.gameId);

	if (mode.gameId) {
		CONTEXT.gameId = mode.gameId;
	}

	CONTEXT.canvas = document.getElementById("canvas");
	CONTEXT.startButton = document.getElementById("startButton");
	CONTEXT.quitButton = document.getElementById("backToTournament");
	CONTEXT.score = document.getElementById("Scores");

	if (!CONTEXT.canvas || !CONTEXT.startButton || !CONTEXT.score || !CONTEXT.quitButton) {
		console.error("Pong: canvas or startButton not found in DOM.");
		return;
	}

	// In SPA, stop the game when navigating away
	// window.addEventListener("popstate", () => {
	// 	console.log("Popstate event detected.");
	// 	if (isSocketConnected()) {
	// 		console.log("Navigating away, stopping game.");
	// 		emitStopGame();
	// 	}
	// });

	// // Stop game if user leaves the page (enters new URL, closes tab, refreshes, etc.)
	// window.addEventListener("beforeunload", () => {
	// 	if (isSocketConnected()) {
	// 		console.log("Window unloading, stopping game.");
	// 		emitStopGame(); // send final state
	// 		if (sessionStorage.getItem("currentTournamentId")) {
	// 			sessionStorage.removeItem("currentTournamentId");
	// 		}
	// 	}
	// });

	const canvas = CONTEXT.canvas;
	const ctx = CONTEXT.ctx = canvas.getContext("2d");

const scale = window.devicePixelRatio || 1;
	CONTEXT.scale = scale;

	// Resize canvas drawing buffer to match displayed CSS size (and DPR)
	const resizeCanvasToElement = () => {
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
	// Prevent scrolling
	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";

	console.log("Tournament ID:", CONTEXT.tournamentId);
	console.log("Game ID:", CONTEXT.gameId);
		
	createGameElements();
	setupSocket();
	bindControls();
	
	if (CONTEXT.tournamentId/* && CONTEXT.gameId*/) {
		CONTEXT.startButton.style.display = "none";
		joinExistingGame(CONTEXT.gameId);
		resetState();

		if (CONTEXT.startButton) CONTEXT.startButton.style.display = "none";
		if (CONTEXT.score) CONTEXT.score.style.display = "flex";
		if (CONTEXT) CONTEXT.isGameStarted = true;
		gameInit();
		CONTEXT.startButton.style.display = "block";
		CONTEXT.startButton.onclick = () => {
			startButton.style.display = "none";
			emitNextMatch(CONTEXT.tournamentId);
		};
	} else {
		CONTEXT.startButton.style.display = "block";
		CONTEXT.startButton.onclick = startGame;
	}

	if (CONTEXT.tournamentId) {
		CONTEXT.quitButton.classList.remove("hidden");
		CONTEXT.quitButton.onclick = () => {
			window.history.pushState({}, "", `/tournament`);
			window.dispatchEvent(new PopStateEvent("popstate"));
		};
	}
	
	draw();
}

export function updateGameScene(data) {
	if (!data) return;
	const { ball, leftPaddle, rightPaddle, GAME_WIDTH, GAME_HEIGHT, isGameStarted } = CONTEXT;

	// Ball
	if (typeof data.ball?.x === "number") ball.x = data.ball.x * GAME_WIDTH;
	if (typeof data.ball?.y === "number") ball.y = data.ball.y * GAME_HEIGHT;
	if (typeof data.ball?.vx === "number") ball.speedX = data.ball.vx;
	if (typeof data.ball?.vy === "number") ball.speedY = data.ball.vy;

	if (typeof data.paddles?.left === "number") leftPaddle.y = data.paddles.left * GAME_HEIGHT;
	if (typeof data.paddles?.right === "number") rightPaddle.y = data.paddles.right * GAME_HEIGHT;
	if (CONTEXT.gameMode === 2) {
		const { leftPaddle2, rightPaddle2 } = CONTEXT;
		if (typeof data.paddles?.left2 === "number") leftPaddle2.y = data.paddles.left2 * GAME_HEIGHT;
		if (typeof data.paddles?.right2 === "number") rightPaddle2.y = data.paddles.right2 * GAME_HEIGHT;
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
			drawScore(left, right);
		}
	}
	if (isGameStarted) draw();
}

function startGame() {
	if (!isSocketConnected())
		return;

	console.log("Game Started");

	waitStartGame();
	resetState();

	if (CONTEXT.startButton) CONTEXT.startButton.style.display = "none";
	if (CONTEXT.score) CONTEXT.score.style.display = "flex";
	if (CONTEXT) CONTEXT.isGameStarted = true;
	gameInit();
}

function gameInit() {
	const { ctx, GAME_WIDTH, GAME_HEIGHT } = CONTEXT;
	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	draw();
}