import { printGameOver, resetState, draw } from "./graphics.js";
import { CONTEXT } from "./context.js";

export function handleGameStopped() {
	console.log("Game Stopped by server");
	CONTEXT.isGameStarted = false;
	CONTEXT.gameId = null;
	resetState();
	draw();
}

export function handleGameOver(data) {
	if (CONTEXT.isGameStarted === false || CONTEXT.gameId === null) return; // ????????
	console.log("Game Over. Final Score:", data);
	CONTEXT.isGameStarted = false;
	CONTEXT.gameId = null;
	resetState();
	printGameOver(data);
}