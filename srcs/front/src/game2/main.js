import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import Ball from "./ball.js";
import Paddle from "./paddle.js";

// --- Module-scope variables (kept across initPong calls) ---
let canvas, ctx;
let socket = null;

let ball, leftPaddle, leftPaddle2, rightPaddle, rightPaddle2;
let isGameStarted = false;
const keysPressed = new Set();

let updateIntervalId = null;
let controlsBound = false;

let GAME_WIDTH = 800;
let GAME_HEIGHT = 500;

let GAME_WIDTH_RATIO = 1;
let GAME_HEIGHT_RATIO = 1;

let startButton, slider, output;

let score, leftScore = 0, rightScore = 0;

// --- Public entry point called by the SPA view ---
export function initPong() {
	// Get DOM elements created by the SPA view
	canvas = document.getElementById("canvas");
	startButton = document.getElementById("startButton");
	slider = document.getElementById("ball-speed");
	output = document.getElementById("ball-speed-value");
	score = document.getElementById("Scores");
	leftScore = document.getElementById("ScoreLeft");
	rightScore = document.getElementById("ScoreRight");

	if (!canvas || !startButton) {
		console.error("Pong: canvas or startButton not found in DOM.");
		return;
	}

	ctx = canvas.getContext("2d");

    console.log(canvas.width, canvas.height, canvas.width, canvas.height);

    GAME_HEIGHT = canvas.height;
    GAME_WIDTH = canvas.width;
    GAME_HEIGHT_RATIO = canvas.height / 500;
    GAME_WIDTH_RATIO = canvas.width / 800;

	// Optional: prevent scrolling while Pong is active
	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";

	// Ensure only one ball-color checkbox is selected at a time
	const colorCheckboxes = Array.from(document.getElementsByName("ball-color"));
	colorCheckboxes.forEach((checkbox) => {
		checkbox.addEventListener("change", function () {
			if (this.checked) {
				colorCheckboxes.forEach((otherCheckbox) => {
					if (otherCheckbox !== this) {
						otherCheckbox.checked = false;
					}
				});
			}
		});
	});

	// Initialize slider (if present)
	if (slider && output) {
		const updateSlider = () => {
			const value = parseFloat(slider.value || "1.0");
			output.textContent = value.toFixed(1);
		};
		updateSlider();
		slider.addEventListener("input", updateSlider);
	}

	// Create game objects
	ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2, 10 * GAME_WIDTH_RATIO, "white");
	leftPaddle = new Paddle(10 * GAME_WIDTH_RATIO, GAME_HEIGHT / 2, 10 * GAME_WIDTH_RATIO, 80 * GAME_HEIGHT_RATIO, "dodgerblue");
	rightPaddle = new Paddle(GAME_WIDTH - 20 * GAME_WIDTH_RATIO, GAME_HEIGHT / 2, 10 * GAME_WIDTH_RATIO, 80 * GAME_HEIGHT_RATIO, "red");

	leftPaddle2 = new Paddle(GAME_WIDTH / 4, GAME_HEIGHT / 2, 10 * GAME_WIDTH_RATIO, 80 * GAME_HEIGHT_RATIO, "dodgerblue");
	rightPaddle2 = new Paddle(GAME_WIDTH * 3 / 4, GAME_HEIGHT / 2, 10 * GAME_WIDTH_RATIO, 80 * GAME_HEIGHT_RATIO, "red");
	// Socket.io connection: create once
	if (!socket) {
		console.log("Attempting to connect to WebSocket server...");

		socket = io("http://localhost:3002", {
			transports: ["websocket"],
		});

		socket.on("connect", () => {
			console.log("Connected to WebSocket server");
		});

		socket.on("connect_error", (err) => {
			console.log("Failed to connect to WebSocket:", err);
		});

		socket.on("state", (data) => {
			updateGameScene(data);
		});

		socket.on("gameStopped", handleGameStopped);
		socket.on("gameOver", handleGameOver);
	}

	// Start button
	startButton.style.display = "block";
	startButton.onclick = startGame;
	// Bind keyboard controls only once
	if (!controlsBound) {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		controlsBound = true;
	}

	// Send paddle moves at 60 FPS (only created once)
	if (!updateIntervalId) {
		updateIntervalId = setInterval(updateGameState, 1000 / 60);
	}

	// Initial draw
	draw();
}

// --- Game control functions ---

function startGame() {
	if (!socket || !socket.connected) {
		console.log("Cannot start game: Not connected to server");
		return;
	}

	console.log("Game Started");

	// Set ball color from selected checkbox (fallback white)
	const selected = Array.from(
		document.getElementsByName("ball-color")
	).find((checkbox) => checkbox.checked);
	ball.color = selected?.value || "white";

	const speedText = output ? output.textContent : "1.0";

	socket.emit("startGame2", {
		speed: speedText || 1.0,
	});

	startButton.style.display = "none";
	score.style.display = "flex";
	isGameStarted = true;

	gameInit();
}

function gameInit() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ball.move(); // initial move step (same as your original logic)
	draw();
}

// --- Input handling ---

function handleKeyDown(e) {
	if (!isGameStarted) return;

	const key = e.key;
	keysPressed.add(key);
	updateDirections();
}

function handleKeyUp(e) {
	const key = e.key;

	// ESC stops the game
	if (key === "Escape") {
		console.log("Game Stopped");
		if (socket && socket.connected) {
			socket.emit("stopGame");
		}
		return;
	}

	keysPressed.delete(key);
	updateDirections();
}

function updateDirections() {
	// Right paddle: arrow keys
	if (keysPressed.has("ArrowUp") && !keysPressed.has("ArrowDown"))
		rightPaddle2.direction = "up";
	else if (keysPressed.has("ArrowDown") && !keysPressed.has("ArrowUp"))
		rightPaddle2.direction = "down";
	else
		rightPaddle2.direction = "none";

	// Right paddle 2: 6/3 keys
	if (keysPressed.has("6") && !keysPressed.has("3"))
		rightPaddle.direction = "up";
	else if (keysPressed.has("3") && !keysPressed.has("6"))
		rightPaddle.direction = "down";
	else
		rightPaddle.direction = "none";

	// Left paddle: W/S
	if ((keysPressed.has("w") || keysPressed.has("W")) && !(keysPressed.has("s") || keysPressed.has("S")))
		leftPaddle.direction = "up";
	else if ((keysPressed.has("s") || keysPressed.has("S")) && !(keysPressed.has("w") || keysPressed.has("W")))
		leftPaddle.direction = "down";
	else
		leftPaddle.direction = "none";

	// Left paddle 2: J/M
	if ((keysPressed.has("j") || keysPressed.has("J")) && !(keysPressed.has("m") || keysPressed.has("M")))
		leftPaddle2.direction = "up";
	else if ((keysPressed.has("m") || keysPressed.has("M")) && !(keysPressed.has("j") || keysPressed.has("J")))
		leftPaddle2.direction = "down";
	else
		leftPaddle2.direction = "none";
}

// --- Drawing ---

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	leftPaddle.draw(ctx);
	rightPaddle.draw(ctx);
	rightPaddle2.draw(ctx);
	leftPaddle2.draw(ctx);
	ball.draw(ctx);

	// drawScore();
	drawCenterLine();
}

function drawCenterLine() {
	ctx.strokeStyle = "white";
	ctx.setLineDash([10, 10]);
	ctx.beginPath();
	ctx.moveTo((GAME_WIDTH / 2), 0);
	ctx.lineTo((GAME_WIDTH / 2), GAME_HEIGHT);
	ctx.stroke();
	ctx.setLineDash([]);
}

function drawScore() {
	console.log('Drawing score:', leftPaddle.score, rightPaddle.score);
	if (leftScore) leftScore.textContent = String(leftPaddle.score);
  	if (rightScore) rightScore.textContent = String(rightPaddle.score);
}

// --- Server state sync ---

function updateGameScene(data) {
	if (!data) return;

	// Ball
	if (typeof data.ball?.x === "number") ball.x = data.ball.x * GAME_WIDTH;
	if (typeof data.ball?.y === "number") ball.y = data.ball.y * GAME_HEIGHT;
	if (typeof data.ball?.vx === "number") ball.speedX = data.ball.vx;
	if (typeof data.ball?.vy === "number") ball.speedY = data.ball.vy;

	// Paddles (support both old and new shapes)
	const leftY = data.leftPaddle?.y ?? data.paddles?.left;
	const rightY = data.rightPaddle?.y ?? data.paddles?.right;
	const leftY2 = data.leftPaddle2?.y ?? data.paddles?.left2;
	const rightY2 = data.rightPaddle2?.y ?? data.paddles?.right2;

	if (typeof leftY === "number") leftPaddle.y = leftY * GAME_HEIGHT;
	if (typeof rightY === "number") rightPaddle.y = rightY * GAME_HEIGHT;
	if (typeof leftY2 === "number") leftPaddle2.y = leftY2 * GAME_HEIGHT;
	if (typeof rightY2 === "number") rightPaddle2.y = rightY2 * GAME_HEIGHT;

	// Score
	if (data.score) {
		const { left, right } = data.score;
		if (
			typeof left === "number" &&
			typeof right === "number" &&
			(left !== leftPaddle.score || right !== rightPaddle.score)
		) {
			leftPaddle.score = left;
			rightPaddle.score = right;
			console.log(`Score - Left: ${left}, Right: ${right}`);
			drawScore(left, right);
		}
	}

	if (isGameStarted) {
		draw();
	}
}

function updateGameState() {
	if (!isGameStarted || !socket) return;

	socket.emit("move", {
		Paddle: "left",
		Direction: leftPaddle.direction,
	});

	socket.emit("move", {
		Paddle: "right",
		Direction: rightPaddle.direction,
	});

	socket.emit("move", {
		Paddle: "left2",
		Direction: leftPaddle2.direction,
	});

	socket.emit("move", {
		Paddle: "right2",
		Direction: rightPaddle2.direction,
	});
}

// --- Game stop / over handlers ---

function handleGameStopped() {
	console.log("Game Stopped by server");
	isGameStarted = false;
	resetLocalState();
	draw();
}

function handleGameOver(data) {
	console.log("Game Over. Final Score:", data);
	isGameStarted = false;
	resetLocalState();
	printGameOver(data);
}

function resetLocalState() {
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ball.reset();
	leftPaddle.y = (canvas.height / 2 - leftPaddle.height / 2);
	rightPaddle.y = (canvas.height / 2 - rightPaddle.height / 2);
	leftPaddle2.y = (canvas.height / 2 - leftPaddle2.height / 2);
	rightPaddle2.y = (canvas.height / 2 - rightPaddle2.height / 2);
	leftPaddle.score = 0;
	rightPaddle.score = 0;
	drawScore();
	score.style.display = "none";
	const gameOverDiv = document.getElementById("GameOver");
	if (gameOverDiv) {
		gameOverDiv.style.display = "none";
	}

	if (startButton) {
		startButton.style.display = "block";
	}
}

function printGameOver(data) {
	const { left, right } = data;

	const gameOverDiv = document.getElementById("GameOver");
	const gameOverScore = document.getElementById("GameOverScore");
	if (gameOverDiv && gameOverScore) {
		gameOverScore.textContent = `${left} - ${right}`;
		gameOverDiv.style.display = "block";
	}
}