import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import { CONTEXT } from "./context.js";
import { handleGameOver, handleGameStopped } from "./API.js";
import { updateGameScene } from "./pong.js";

let socket = null;

export function setupSocket() {
  if (socket) return socket;

  socket = io({ path: "/pong/socket.io" });

  socket.on("connect", () => { console.log("Connected to WebSocket server"); });

  if (updateGameScene) {
	  socket.off("game:state");
	  socket.on("game:state", (data) => updateGameScene?.(data));
  }

  if (handleGameStopped) {
	  socket.off("game:stopped");
	  socket.on("game:stopped", handleGameStopped);
  }

  if (handleGameOver) {
	  socket.off("game:over");
	  socket.on("game:over", handleGameOver);
  }

  return socket;
}

export function isSocketConnected() {
  return !!(socket && socket.connected);
}

export async function waitStartGame() {
  if (!isSocketConnected()) {
	  console.log("Cannot start game: Not connected to server");
	  return;
  }
  try {
    const dataRequestResponse = await fetch('/profile/grab', { //GET request by default without the "request" parameter
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (!result) throw new Error('No data received from server');

    if (CONTEXT.gameId) {
      console.log("Joining existing game with ID:", CONTEXT.gameId);
      socket.emit("game:join", { gameId: CONTEXT.gameId });
      return;
    }
    if (CONTEXT.gameMode === 0) {
      console.log("Starting single-player game against AI opponent");
      socket.emit("game:start", { 
        mode: 0,
    	  player1: result.name,
    	  player2: "AIOpponent",
      });
    }
    else if (CONTEXT.gameMode === 1) {
      socket.emit("game:start", { 
        mode: 1,
    	  player1: result.name,
    	  player2: "Player2",
      });
    }
    else {
      socket.emit("game:start", { 
        mode: 2,
    	  player1: "Player 1",
    	  player2: "Player 2",
        player3: "Player 3",
        player4: "Player 4",
      });
    }

    socket.once("game:started", (data) => {
      console.log("Game started with data:", data);
    });
  } catch (error) {
    if (await fetchErrcodeHandler(err) == 0)
      return(grabCustomizationPageInfo());
    console.error('⚠️ Couldn\'t grab user info!\n => ', err);
  }
}

export function startNewGame(payload) {
  if (!isSocketConnected()) return;
  socket.emit("game:start", payload);
}

export function joinExistingGame(gameId) {
  if (!isSocketConnected()) return;
  socket.emit("game:join", { gameId });
}

export function emitStopGame() {
  if (!isSocketConnected()) return;
  socket.emit("game:stop");
}

export function updateGameState() {
  const { isGameStarted, leftPaddle, rightPaddle, leftPaddle2, rightPaddle2 } = CONTEXT;
  if (!isGameStarted || !socket) return;

  socket.emit("game:move", { Paddle: "left", Direction: leftPaddle.direction });
  socket.emit("game:move", { Paddle: "right",	Direction: rightPaddle.direction });

  if (CONTEXT.gameMode !== 2) return;

  socket.emit("game:move", { Paddle: "left2", Direction: leftPaddle2.direction });
  socket.emit("game:move", { Paddle: "right2", Direction: rightPaddle2.direction });
}

export function handleEscapeKey() {
  if (!isSocketConnected()) {
	  console.log("Cannot stop game: Not connected to server");
	  return;
  }
  if (!CONTEXT.isGameStarted || CONTEXT.tournamentId) return;
  socket.emit("game:stop");
}

export function getSocket() {
  return socket;
}
