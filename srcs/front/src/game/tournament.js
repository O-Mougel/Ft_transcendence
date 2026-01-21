import { CONTEXT } from "/game/context.js";
import { setupSocket, getSocket } from "/game/socket.js";

export function initTournament() {
	// ensure socket exists
	setupSocket();
	const socket = getSocket();

	const tournamentId = extractTournamentId();
	if (!tournamentId) {
	  document.getElementById("tournamentStatus").textContent = "Missing tournament id in URL.";
	  return;
	}

		
	const nextMatchBtn = document.getElementById("nextMatchBtn");
	const backBtn = document.getElementById("backButton");
		
	// Buttons
	backBtn.onclick = () => {
	  window.history.pushState({}, "", "/tournamentSize");
	  window.dispatchEvent(new PopStateEvent("popstate"));
	};
		
	if (CONTEXT.gameId) {
	  nextMatchBtn.textContent = "Back to Match";
	  nextMatchBtn.onclick = () => {
		window.history.pushState({}, "", "/pong");
		window.dispatchEvent(new PopStateEvent("popstate"));
	  };
	} else {
	  nextMatchBtn.onclick = () => {
		socket.emit("tournament:nextMatch", { tournamentId });
	  };
	}

	socket.off("tournament:state");
	socket.on("tournament:state", ({ tournamentId: tid, tournament }) => {
	  if (tid !== tournamentId) return;
	  renderTournament(tournament);
	});
		
	socket.off("match:started");
	socket.on("match:started", (info) => {
	if (info.tournamentId && info.tournamentId !== tournamentId) return;
	  
	  CONTEXT.gameId = info.gameId;
	  CONTEXT.leftName = info.player1;
	  CONTEXT.rightName = info.player2;
	  CONTEXT.gameMode = 1;
	  CONTEXT.tournamentId = tournamentId;

	  window.history.pushState({}, "", "/pong");
	  window.dispatchEvent(new PopStateEvent("popstate"));
	});

	// Tournament ended
	socket.off("tournament:ended");
	socket.on("tournament:ended", ({ tournamentId: tid, winner }) => {
		if (tid !== tournamentId) return;
		const winnerLine = document.getElementById("winnerLine");
		console.log("Tournament ended, winner:", winner);
		console.log("nextMatchBtn:", nextMatchBtn);
		// nextMatchBtn.innerText = "Tournament Ended";
		// nextMatchBtn.onclick = null;
		// nextMatchBtn.innerText = "Tournament Ended";
		// nextMatchBtn.display = "none";
		// nextMatchBtn.disabled = true;
		nextMatchBtn.style.display = "hidden";
		// sessionStorage.removeItem("currentTournamentId");
		CONTEXT.tournamentId = null;
	});

	socket.emit("tournament:getState", { tournamentId });
}

function extractTournamentId() {
	const storedTournamentId = sessionStorage.getItem("currentTournamentId");
	if (storedTournamentId) return storedTournamentId;
	return null;
}

function renderTournament(tournament) {
	const statusElement = document.getElementById("tournamentStatus");
	const currentMatchElement = document.getElementById("currentMatch");
	const bracketElement = document.getElementById("bracket");
	if (statusElement === null || currentMatchElement === null || bracketElement === null) return;

	statusElement.textContent = `${tournament.status}${tournament.winner ? ` (winner: ${tournament.winner})` : ""}`;

	// Current match
	if (tournament.current) {
	  	const { r, m } = tournament.current;
	  	currentMatchElement.textContent = `Current match: Round ${r + 1}, Match ${m + 1}`;
	} else {
	  	currentMatchElement.textContent = "No match running.";
	}

	// Bracket rendering
	bracketElement.innerHTML = "";
	// Display each round as a column-like card
	tournament.bracket.forEach((round, r) => {
	  	const roundBox = document.createElement("div");
	  	roundBox.className = "border border-[#98c6f8] rounded-lg p-3 bg-black/20";

		const title = document.createElement("div");
	  	title.className = "font-bold text-[#98c6f8] mb-2";
	  	title.textContent = `Round ${r + 1}`;
		roundBox.appendChild(title);

		round.forEach((match, m) => {
			const line = document.createElement("div");
			line.className = "p-2 border border-white/10 rounded mb-2";

			const p1 = match.player1 ?? "TBD";
			const p2 = match.player2 ?? "TBD";
			const w = match.winner ? ` — Winner: ${match.winner}` : "";

			line.textContent = `#${m + 1}: ${p1} vs ${p2} (${match.status})${w}`;
			roundBox.appendChild(line);
		});

		bracketElement.appendChild(roundBox);
	});
	if (tournament.status === "ended") {
		const nextMatchBtn = document.getElementById("nextMatchBtn");
		nextMatchBtn.style.display = "none";
		sessionStorage.removeItem("currentTournamentId");
	}
}