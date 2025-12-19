import { CONTEXT } from "./context.js";

export function draw() {
	const { ctx, canvas, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, ball } = CONTEXT;
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	leftPaddle.draw(ctx);
	rightPaddle.draw(ctx);
	if (CONTEXT.gameMode === 2) {
		leftPaddle2.draw(ctx);
		rightPaddle2.draw(ctx);
	}
	ball.draw(ctx);

	drawCenterLine();
}

function drawCenterLine() {
	const { ctx, canvas } = CONTEXT;
	ctx.strokeStyle = "white";
	ctx.setLineDash([10, 10]);
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
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
	const { ctx, canvas, ball, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, score, startButton } = CONTEXT;
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ball.reset();
	leftPaddle.y = (canvas.height / 2 - leftPaddle.height / 2);
	rightPaddle.y = (canvas.height / 2 - rightPaddle.height / 2);
	if (CONTEXT.gameMode === 2) {
		leftPaddle2.y = (canvas.height / 2 - leftPaddle2.height / 2);
		rightPaddle2.y = (canvas.height / 2 - rightPaddle2.height / 2);
	}
	leftPaddle.score = 0;
	rightPaddle.score = 0;
	drawScore();

	if (score)
		score.style.display = "none";

	const gameOverDiv = document.getElementById("GameOver");
	if (gameOverDiv)
		gameOverDiv.style.display = "none";

	if (startButton)
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