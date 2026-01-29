import { CONTEXT } from "./context.js";
import { setupSocket, getSocket } from "./socket.js";
// import type { Socket } from '../types/socket.types';
import type { Tournament, TournamentStateData, MatchStartedData, TournamentEndedData } from '../types/socket.types';
import { isPageReload } from "../eventTS/clickEvents.js";
import { closeSocketCommunication } from "../eventTS/userSocket.js";

window.addEventListener("pagehide", (): void => {
	if (!(sessionStorage.getItem('f5WasPressed'))) {
		sessionStorage.setItem('f5WasPressed', 'false');
	}

	const checkKeyReload = sessionStorage.getItem('f5WasPressed') === 'true';
	const reloadTypeResult = isPageReload();

	if (checkKeyReload || reloadTypeResult) {
		window.sessionStorage.setItem('pagehide', 'pageshouldreload');
		closeSocketCommunication();
		return;
	}
});

export function initTournament(): void {
	// ensure socket exists
	setupSocket();
	const socket = getSocket();

	const tournamentId = extractTournamentId();
	if (!tournamentId) {
		const statusEl = document.getElementById("tournamentStatus");
		if (statusEl) statusEl.textContent = "Missing tournament id.";
		window.history.pushState(null, "", "/tournamentSize");
		window.dispatchEvent(new PopStateEvent("popstate"));
		return;
	}


	const nextMatchBtn = document.getElementById("nextMatchBtn") as HTMLButtonElement | null;
	const quitBtn = document.getElementById("quitButton") as HTMLButtonElement | null;

	// Buttons
	if (quitBtn && socket) {
		quitBtn.onclick = (): void => {
			console.log("Leaving tournament:", tournamentId);
			sessionStorage.removeItem("currentTournamentId");
			CONTEXT.tournamentId = null;
			window.history.pushState(null, "", "/tournamentSize");
			window.dispatchEvent(new PopStateEvent("popstate"));
			socket.emit("tournament:leave", { tournamentId });
		};
	}

	if (nextMatchBtn) {
		if (CONTEXT.gameId) {
			nextMatchBtn.textContent = "Back to Match";
			nextMatchBtn.onclick = (): void => {
				window.history.pushState(null, "", "/pong");
				window.dispatchEvent(new PopStateEvent("popstate"));
			};
		} else {
			CONTEXT.tournamentId = tournamentId;
			nextMatchBtn.onclick = (): void => {
				console.log("Starting next match in tournament:", tournamentId);
				window.history.pushState(null, "", "/pongTournament");
				window.dispatchEvent(new PopStateEvent("popstate"));
			};
		}
	}

	if (socket) {
		socket.off("tournament:state");
		socket.on("tournament:state", (data: unknown): void => {
			console.log("Received tournament state update:", data);
			const stateData = data as TournamentStateData;
			if (stateData.tournamentId !== tournamentId) return;
			if (stateData.tournament.status === "finished") {
				if (nextMatchBtn)
					nextMatchBtn.style.display = "none";
				nextMatchBtn?.remove();
			}
			renderTournament(stateData.tournament);
		});

		socket.off("match:started");
		socket.on("match:started", (data: unknown): void => {
			const info = data as MatchStartedData;
			if (info.tournamentId && info.tournamentId !== tournamentId) return;

			CONTEXT.gameId = info.gameId;
			CONTEXT.leftName = info.player1;
			CONTEXT.rightName = info.player2;
			CONTEXT.gameMode = 1;
			CONTEXT.tournamentId = tournamentId;
		});

		// Tournament ended
		socket.off("tournament:ended");
		socket.on("tournament:ended", (data: unknown): void => {
			const endData = data as TournamentEndedData;
			if (endData.tournamentId !== tournamentId) return;
			console.log("Tournament ended, winner:", endData.winner);
		});

		socket.off("tournament:error");
		socket.on("tournament:error", (data: unknown): void => {
			const errorData = data as { message: string };
			console.error("Tournament error:", errorData.message);
			const statusEl = document.getElementById("tournamentStatus");
			if (statusEl) statusEl.textContent = `Error: ${errorData.message}`;
		});

		// Initial state request
		socket.emit("tournament:getState", { tournamentId });
	}
}

function extractTournamentId(): string | null {
	const storedTournamentId = sessionStorage.getItem("currentTournamentId");
	if (storedTournamentId) return storedTournamentId;
	return null;
}

function renderTournament(tournament: Tournament): void {
	const statusElement = document.getElementById("tournamentStatus");
	const currentMatchElement = document.getElementById("currentMatch");
	const bracketElement = document.getElementById("bracket");
	if (statusElement === null || currentMatchElement === null || bracketElement === null) return;

	statusElement.textContent = `${tournament.status}${tournament.winner ? ` (winner: ${tournament.winner})` : ""}`;
	if (tournament.winner)
		statusElement.className = "text-green-500";
	else
		statusElement.className = "text-white";
		
	// Current match
	if (tournament.current) {
			const { r, m } = tournament.current;
			currentMatchElement.textContent = `Current match: Round ${r + 1}, Match ${m + 1}`;
	} else {
			currentMatchElement.textContent = "";
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

			const p1 = match.player1 ?? "?";
			const p2 = match.player2 ?? "?";

			const desc = document.createElement("div");
			desc.className = "block";
			if (p1 === "?")
				desc.textContent = `⏳ ${match.status}`;
			else
				desc.textContent = `#${m + 1}: ${p1} vs ${p2} (${match.status})`;

			const winnerSpan = document.createElement("span");
			winnerSpan.className = "text-green-500 block mt-1";
			winnerSpan.textContent = match.winner ? `Winner : ${match.winner}` : "";
			line.appendChild(desc);
			line.appendChild(winnerSpan);
			roundBox.appendChild(line);
		});

		bracketElement.appendChild(roundBox);
	});
	if (tournament.status === "ended") {
		const nextMatchBtn = document.getElementById("nextMatchBtn") as HTMLButtonElement | null;
		if (nextMatchBtn) nextMatchBtn.style.display = "none";
		sessionStorage.removeItem("currentTournamentId");
	}
}
