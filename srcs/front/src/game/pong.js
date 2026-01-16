import { waitStartGame, isSocketConnected, setupSocket, updateGameState } from "./socket.js";
import { CONTEXT, createGameElements } from "./context.js";
import { draw, drawScore, resetState } from "./graphics.js";
import { bindControls } from "./controls.js";

export function initPong(mode = {}) {
	CONTEXT.gameMode = mode.mode;
	console.log("Setting up Pong..., mode:", mode.mode);

	CONTEXT.canvas = document.getElementById("canvas");
	CONTEXT.startButton = document.getElementById("startButton");
	CONTEXT.backButton = document.getElementById("backToTournament");
	CONTEXT.score = document.getElementById("Scores");

	if (!CONTEXT.canvas || !CONTEXT.startButton || !CONTEXT.score || !CONTEXT.backButton) {
		console.error("Pong: canvas or startButton not found in DOM.");
		return;
	}

	const canvas = CONTEXT.canvas;
	const ctx = CONTEXT.ctx = canvas.getContext("2d");

	const scale = window.devicePixelRatio || 1;
	CONTEXT.scale = scale; // optional but handy

	const logicalWidth  = CONTEXT.GAME_WIDTH;
	const logicalHeight = CONTEXT.GAME_HEIGHT;

	// CSS display size (logical units)
	canvas.style.width  = logicalWidth + "px";
	canvas.style.height = logicalHeight + "px";

	// Physical backing store size (logical * DPR)
	canvas.width  = Math.floor(logicalWidth  * scale);
	canvas.height = Math.floor(logicalHeight * scale);

	// Reset + apply scale ONCE
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(scale, scale);

	// Do NOT overwrite GAME_WIDTH/HEIGHT with canvas.width/height

	// Optional: prevent scrolling
	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";
	
	CONTEXT.startButton.style.display = "block";
	CONTEXT.startButton.onclick = startGame;


	if (CONTEXT.gameId) {
      // Tournament match
      CONTEXT.startButton.style.display = "hidden";
      CONTEXT.backButton.classList.remove("hidden");

      CONTEXT.backButton.addEventListener("click", () => {
        // window.history.pushState({}, "", `/tournament/${CONTEXT.tournamentId}`);
        window.history.pushState({}, "", `/tournament`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    }

	createGameElements();
	setupSocket();
	bindControls();

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
			console.log(`Score - Left: ${left}, Right: ${right}`);
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
	scheduleClientUpdates();
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

function scheduleClientUpdates() {
	if (CONTEXT.updateIntervalId) return;
	CONTEXT.updateIntervalId = setInterval(updateGameState, 1000 / 60); // 60 FPS
	console.log("Client updates scheduled.");
}