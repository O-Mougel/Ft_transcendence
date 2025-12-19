import { CONTEXT } from "./context.js";
import { handleEscapeKey } from "./socket.js";

export function bindControls() {
  if (CONTEXT.controlsBound) return;
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  CONTEXT.controlsBound = true;
}

function handleKeyDown(e) {
  if (!CONTEXT.isGameStarted) return;

  const key = e.key;
  CONTEXT.keysPressed.add(key);
  updateDirections();
}

function handleKeyUp(e) {
  const key = e.key;

  // ESC stops the game
  if (key === "Escape") handleEscapeKey();
  CONTEXT.keysPressed.delete(key);
  updateDirections();
}

function updateDirections() {
  const { keysPressed, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;

  // Right paddle or Right paddle2: arrow keys
  if (CONTEXT.gameMode === 1) {
    if (keysPressed.has("ArrowUp") && !keysPressed.has("ArrowDown")) rightPaddle.direction = "up";
    else if (keysPressed.has("ArrowDown") && !keysPressed.has("ArrowUp")) rightPaddle.direction = "down";
    else rightPaddle.direction = "none";
  } else if (CONTEXT.gameMode === 2) {
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

  if (CONTEXT.gameMode !== 2) return;

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
}
