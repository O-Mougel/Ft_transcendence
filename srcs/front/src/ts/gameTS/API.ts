import { printGameOver, resetState, draw } from "./graphics.js";
import { CONTEXT } from "./context.js";
import type { GameOverData } from '../types/game.types';

export function handleGameStopped(): void {
	console.log("Game Stopped by server");
	CONTEXT.isGameStarted = false;
	CONTEXT.gameId = null;
	document.body.style.overflow = "auto";
	CONTEXT.canvas!.style.cursor = "default";
	resetState();
	draw();
}

export function handleGameOver(data: GameOverData): void {
	CONTEXT.isGameStarted = false;
	CONTEXT.gameId = null;
	document.body.style.overflow = "auto";
	CONTEXT.canvas!.style.cursor = "default";
	resetState();
	printGameOver(data);
	if (CONTEXT.tournamentId && CONTEXT.backButton && window.location.href.includes("/pongTournament")) {
		CONTEXT.backButton.classList.remove("hidden");
	}
}
