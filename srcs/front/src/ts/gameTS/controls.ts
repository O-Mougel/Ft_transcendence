import { CONTEXT } from "./context.js";
import { handleEscapeKey, updateGameState } from "./socket.js";
import type { PaddleDirection } from '../types/game.types';

export function bindControls(): void {
  if (CONTEXT.controlsBound) return;
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  CONTEXT.controlsBound = true;
}

export function resetControls(): void {
  CONTEXT.keysPressed.clear();
  const { leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;
  if (leftPaddle) leftPaddle.direction = "none";
  if (rightPaddle) rightPaddle.direction = "none";
  if (CONTEXT.gameMode === 2) {
    if (leftPaddle2) leftPaddle2.direction = "none";
    if (rightPaddle2) rightPaddle2.direction = "none";
  }
}

function handleKeyDown(e: KeyboardEvent): void {
  if (!CONTEXT.isGameStarted) return;

  const key = e.key;
  CONTEXT.keysPressed.add(key);
  updateDirections();
}

function handleKeyUp(e: KeyboardEvent): void {
  if (!CONTEXT.isGameStarted) return;
  const key = e.key;

  // ESC stops the game
  if (key === "Escape" && !window.location.href.includes("/pongTournament")) handleEscapeKey();
  CONTEXT.keysPressed.delete(key);
  updateDirections();
}

function updateDirections(): void {
  const { keysPressed, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;

  if (!leftPaddle || !rightPaddle) return;

  const state: { right: PaddleDirection; left: PaddleDirection } = { right: rightPaddle.direction, left: leftPaddle.direction };

  // Right paddle or Right paddle2: arrow keys
  if (CONTEXT.gameMode === 1 || CONTEXT.gameMode === 3) {
    if (keysPressed.has("ArrowUp") && !keysPressed.has("ArrowDown")) rightPaddle.direction = "up";
    else if (keysPressed.has("ArrowDown") && !keysPressed.has("ArrowUp")) rightPaddle.direction = "down";
    else rightPaddle.direction = "none";
  } else if (CONTEXT.gameMode === 2 && rightPaddle2) {
    if (keysPressed.has("ArrowUp") && !keysPressed.has("ArrowDown")) rightPaddle2.direction = "up";
    else if (keysPressed.has("ArrowDown") && !keysPressed.has("ArrowUp")) rightPaddle2.direction = "down";
    else rightPaddle2.direction = "none";
  }

  // Left paddle: W/S
  const w = keysPressed.has("w") || keysPressed.has("W");
  const s = keysPressed.has("s") || keysPressed.has("S");
  if (w && !s) leftPaddle.direction = "up";
  else if (s && !w) leftPaddle.direction = "down";
  else leftPaddle.direction = "none";

  if (state.left !== leftPaddle.direction || state.right !== rightPaddle.direction) updateGameState();
  updateGameState();


  if (CONTEXT.gameMode !== 2) return;

  if (!leftPaddle2 || !rightPaddle2) return;

  const state2: { right: PaddleDirection; left: PaddleDirection } = { right: rightPaddle2.direction, left: leftPaddle2.direction };

  // Left paddle 2: O/L
  const o = keysPressed.has("o") || keysPressed.has("O");
  const l = keysPressed.has("l") || keysPressed.has("L");
  if (o && !l) leftPaddle2.direction = "up";
  else if (l && !o) leftPaddle2.direction = "down";
  else leftPaddle2.direction = "none";

  // Right paddle: 6/3
  if (keysPressed.has("6") && !keysPressed.has("3")) rightPaddle.direction = "up";
  else if (keysPressed.has("3") && !keysPressed.has("6")) rightPaddle.direction = "down";
  else rightPaddle.direction = "none";

  if (state2.left !== leftPaddle2.direction || state2.right !== rightPaddle2.direction) updateGameState();
  updateGameState();
}
