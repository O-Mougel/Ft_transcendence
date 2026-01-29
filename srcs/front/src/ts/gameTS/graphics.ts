import { CONTEXT } from "./context.js";
import { resetControls } from "./controls.js";
import type { GameOverData } from '../types/game.types';

export function draw(): void {
	const { ctx, canvas, GAME_WIDTH, GAME_HEIGHT, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, ball } = CONTEXT;
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

	if (leftPaddle) leftPaddle.draw(ctx);
	if (rightPaddle) rightPaddle.draw(ctx);
	if (CONTEXT.gameMode === 2) {
		if (leftPaddle2) leftPaddle2.draw(ctx);
		if (rightPaddle2) rightPaddle2.draw(ctx);
	}
	if (ball) ball.draw(ctx);

	drawCenterLine();
}

function drawCenterLine(): void {
	const { ctx, GAME_WIDTH, GAME_HEIGHT } = CONTEXT;
	if (!ctx) return;
	ctx.strokeStyle = "white";
	ctx.setLineDash([10, 10]);
	ctx.beginPath();
	ctx.moveTo(GAME_WIDTH / 2, 0);
	ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
	ctx.stroke();
	ctx.setLineDash([]);
}

export function drawScore(): void {
	const { leftPaddle, rightPaddle, score } = CONTEXT;
	if (score && leftPaddle && rightPaddle) {
		const leftScore = score.querySelector("#LeftScore");
		const rightScore = score.querySelector("#RightScore");
		if (leftScore) leftScore.textContent = String(leftPaddle.score);
		if (rightScore) rightScore.textContent = String(rightPaddle.score);
	}
}

export function resetState(): void {
	const { ctx, canvas, ball, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2, score, startButton, GAME_HEIGHT, GAME_WIDTH } = CONTEXT;
	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	if (ball) ball.reset();
	if (leftPaddle) {
		leftPaddle.y = (GAME_HEIGHT / 2 - leftPaddle.height / 2);
	}
	if (rightPaddle) {
		rightPaddle.y = (GAME_HEIGHT / 2 - rightPaddle.height / 2);
	}
	if (CONTEXT.gameMode === 2) {
		if (leftPaddle2) {
			leftPaddle2.y = (GAME_HEIGHT / 2 - leftPaddle2.height / 2);
		}
		if (rightPaddle2) {
			rightPaddle2.y = (GAME_HEIGHT / 2 - rightPaddle2.height / 2);
		}
	}
	if (leftPaddle) leftPaddle.score = 0;
	if (rightPaddle) rightPaddle.score = 0;
	CONTEXT.isGameStarted = false;
	drawScore();
	resetControls();

	if (score)
		score.style.display = "none";

	const gameOverDiv = document.getElementById("GameOver");
	if (gameOverDiv)
		gameOverDiv.style.display = "none";

	if (startButton && !CONTEXT.isGameStarted && !window.location.href.includes("/pongTournament"))
		startButton.style.display = "block";
}

export function printGameOver(data: GameOverData): void {
	console.log("printGameOver called with data:", data);
	const { left, right } = data;
	let { winner } = data;
	const gameOverDiv = document.getElementById("GameOver");
	const gameOverScore = document.getElementById("GameOverScore");
	const winnerSpan = document.getElementById("winnerGameSpan");
	const LeftPlayer = document.getElementById("LeftPlayer");
	const RightPlayer = document.getElementById("RightPlayer");
	
	let winnerName: string | null = winner ? winner : "";

	if (!winnerName && RightPlayer && LeftPlayer)
	{
		if (left > right)
			winnerName = LeftPlayer.textContent;
		else if (right > left)
		{
			if (RightPlayer.textContent == "[AI]")
				winnerName = "AI 🤖";
			else
				winnerName = RightPlayer.textContent;
		}
		else
			winnerName = "Draw ! (How ?!)";
	}
	else if (!RightPlayer || !LeftPlayer)
	{
		if (left > right)
			winnerName = "Blue team";
		else if (right > left)
			winnerName = "Red team";
		else
			winnerName = "Draw ! (How ?!)";
	}
	if (gameOverDiv && gameOverScore && winnerSpan) {
		gameOverScore.textContent = `${left} - ${right}`;
		gameOverDiv.style.display = "block";
		winnerSpan.textContent = `WINNER : ${winnerName}`
		// winnerSpan.textContent = `GAME OVER`
	}
}
