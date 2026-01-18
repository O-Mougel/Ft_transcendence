import { CONTEXT } from "./context.js";

export function draw() {
	const { ctx, canvas, GAME_WIDTH, GAME_HEIGHT, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, ball } = CONTEXT;
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

	leftPaddle._draw(ctx);
	rightPaddle._draw(ctx);
	if (CONTEXT.gameMode === 2) {
		leftPaddle2._draw(ctx);
		rightPaddle2._draw(ctx);
	}
	ball._draw(ctx);

	drawCenterLine();
}

function drawCenterLine() {
	const { ctx, GAME_WIDTH, GAME_HEIGHT } = CONTEXT;
	ctx.strokeStyle = "white";
	ctx.setLineDash([10, 10]);
	ctx.beginPath();
	ctx.moveTo(GAME_WIDTH / 2, 0);
	ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
	ctx.stroke();
	ctx.setLineDash([]);
}

export function drawScore() {
	const { leftPaddle, rightPaddle, score } = CONTEXT;
	if (score) {
		const leftScore = score.querySelector("#LeftScore");
		const rightScore = score.querySelector("#RightScore");
		if (leftScore) leftScore.textContent = String(leftPaddle.score);
	  	if (rightScore) rightScore.textContent = String(rightPaddle.score);
	}
}

export function resetState() {
	const { ctx, canvas, ball, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, score, startButton, GAME_HEIGHT, GAME_WIDTH } = CONTEXT;
	if (!ctx || !canvas) return;

	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	// ball._reset();
	// leftPaddle.y = (canvas.height / 2 - leftPaddle.height / 2);
	// rightPaddle.y = (canvas.height / 2 - rightPaddle.height / 2);
	// if (CONTEXT.gameMode === 2) {
	// 	leftPaddle2.y = (canvas.height / 2 - leftPaddle2.height / 2);
	// 	rightPaddle2.y = (canvas.height / 2 - rightPaddle2.height / 2);
	// }
	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	ball._reset();
	leftPaddle.y = (GAME_HEIGHT / 2 - leftPaddle.height / 2);
	rightPaddle.y = (GAME_HEIGHT / 2 - rightPaddle.height / 2);
	if (CONTEXT.gameMode === 2) {
		leftPaddle2.y = (GAME_HEIGHT / 2 - leftPaddle2.height / 2);
		rightPaddle2.y = (GAME_HEIGHT / 2 - rightPaddle2.height / 2);
	}
	leftPaddle.score = 0;
	rightPaddle.score = 0;
	CONTEXT.isGameStarted = false;
	drawScore();

	if (score)
		score.style.display = "none";

	const gameOverDiv = document.getElementById("GameOver");
	if (gameOverDiv)
		gameOverDiv.style.display = "none";

	if (startButton && !CONTEXT.isGameStarted && !CONTEXT.tournamentId)
		startButton.style.display = "block";
}

export function printGameOver(data) {
	const { left, right } = data;
	const gameOverDiv = document.getElementById("GameOver");
	const gameOverScore = document.getElementById("GameOverScore");
	if (gameOverDiv && gameOverScore) {
		gameOverScore.textContent = `${left} - ${right}`;
		gameOverDiv.style.display = "block";
	}
}