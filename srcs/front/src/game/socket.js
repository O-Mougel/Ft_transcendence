import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import { CONTEXT } from "./context.js";
import { handleGameOver, handleGameStopped } from "./API.js";
import { updateGameScene } from "./pong.js";
import { alertBoxMsg, fetchErrcodeHandler } from "../js/userLog.js";

let socket = null;

export function setupSocket() {
  if (socket) return socket;

  const token = sessionStorage.getItem("access_token");
  if (!token) {
    console.error("No access token found in sessionStorage");
    return null;
  }

  socket = io({
    path: "/pong/socket.io",
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => { console.log("Connected to WebSocket server"); });

  socket.on("connect_error", async (err) => {
    alertBoxMsg("❌ Connection error: ${err.message}", "error");
    console.error("WebSocket connection error:", err);
    if (await fetchErrcodeHandler(err) == 0) // Good to use ? It seems appropriate but may cause conflicts ?
          return (setupSocket());
  });

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
    const tokenP1 = sessionStorage.getItem("access_token");

    if (CONTEXT.gameMode === 0) {
      console.log("Starting single-player game against AI opponent");
      socket.emit("game:start", { 
        mode: 0,
    	  player1Token: tokenP1,
    	  player2: "AIOpponent",
      });
    }
    else if (CONTEXT.gameMode === 1) {
      socket.emit("game:start", { 
        mode: 1,
    	  player1Token: tokenP1,
    	  player2: "Player2",
      });
    }
    else if (CONTEXT.gameMode === 3) {
      const tokenP2 = sessionStorage.getItem("player2_token");
      socket.emit("game:start", { 
        mode: 3,
    	  player1Token: tokenP1,
    	  player2Token: tokenP2,
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
      return(waitStartGame());
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

export function emitNextMatch(tournamentId) {
  if (!isSocketConnected()) {
    console.log("Cannot start next match: Not connected to server");
    return;
  }
  if (!tournamentId) {
    console.log("Cannot start next match: No tournament ID provided");
    return;
  }
  socket.emit("tournament:nextMatch", { tournamentId });
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
