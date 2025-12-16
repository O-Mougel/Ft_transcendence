import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import { CONTEXT } from "./context.js";
import { handleGameOver, handleGameStopped } from "./API.js";
import { updateGameScene } from "./pong.js";

let socket = null;

export function setupSocket() {
  console.log("Attempting to connect to WebSocket server...");

  socket = io("http://localhost:3002", {
	transports: ["websocket"],
  });

  socket.on("connect", () => {
	console.log("Connected to WebSocket server");
  });

  if (updateGameScene) {
	  socket.off("state");
	  socket.on("state", (data) => updateGameScene(data));
  }

  if (handleGameStopped) {
	  socket.off("gameStopped");
	  socket.on("gameStopped", handleGameStopped);
  }

  if (handleGameOver) {
	  socket.off("gameOver");
	  socket.on("gameOver", handleGameOver);
  }
}

export function isSocketConnected() {
  return !!(socket && socket.connected);
}

export function emitStartGame() {
  if (!isSocketConnected()) {
	console.log("Cannot start game: Not connected to server");
	return;
  }
  if (CONTEXT.gameMode === 1) {
    socket.emit("startGame", { 
    mode: 1,
  	player1: "Player1",
  	player2: "Player2",
    });
  }
  else {
    socket.emit("startGame", { 
      mode: 2,
  	  player1: "Player1",
  	  player2: "Player2",
      player3: "Player3",
      player4: "Player4",
    });
  }


}

export function emitStopGame() {
  if (!isSocketConnected()) return;
  socket.emit("stopGame");
}

export function updateGameState() {
  const { isGameStarted, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;
  if (!isGameStarted || !socket) return;

  socket.emit("move", {
  	Paddle: "left",
  	Direction: leftPaddle.direction,
  });

  socket.emit("move", {
  	Paddle: "right",
  	Direction: rightPaddle.direction,
  });

  if (CONTEXT.gameMode !== 2) return;

  socket.emit("move", {
	  Paddle: "left2",
	  Direction: leftPaddle2.direction,
  });

  socket.emit("move", {
	  Paddle: "right2",
	  Direction: rightPaddle2.direction,
  });


}

export function handleEscapeKey() {
  if (!isSocketConnected()) {
	  console.log("Cannot stop game: Not connected to server");
	  return;
  }
  socket.emit("stopGame");
}