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
    CONTEXT.isGameStarted = false;
    CONTEXT.gameId = null;
    resetState();
    printGameOver(data);
    if (CONTEXT.tournamentId && CONTEXT.backButton) {
        CONTEXT.backButton.classList.remove("hidden");
    }
}
