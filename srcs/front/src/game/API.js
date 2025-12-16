import { printGameOver, resetState, draw } from "./graphics.js";
import { CONTEXT } from "./context.js";

export function handleGameStopped() {
	console.log("Game Stopped by server");
	CONTEXT.isGameStarted = false;
	resetState();
	draw();
}

export function handleGameOver(data) {
	console.log("Game Over. Final Score:", data);
	CONTEXT.isGameStarted = false;
	resetState();
	printGameOver(data);
}