import { CONTEXT } from "./context.js";
import { setupSocket, getSocket } from "./socket.js";
// import type { Socket } from '../types/socket.types';
import type { Tournament, TournamentStateData, MatchStartedData, TournamentEndedData } from '../types/socket.types';
import { tournamentStateSchema, matchStartedSchema, tournamentEndedSchema, messageSchema } from "./schemaYup.js";
import { alertBoxMsg, backToDefaultPage } from "../eventTS/userLog.js";
import { router } from "../eventTS/index.js";

export function initTournament(): void {
	const socket = setupSocket();
	if (!socket) {
		alertBoxMsg("❌ Unable to establish socket connection");
		backToDefaultPage();
		return;
	}

	const tournamentId = extractTournamentId();
	if (!tournamentId) {
		const statusEl = document.getElementById("tournamentStatus");
		if (statusEl) statusEl.textContent = "Missing tournament id.";
		window.history.pushState(null, "", "/tournamentSize");
		router();
		return;
	}


	const nextMatchBtn = document.getElementById("nextMatchBtn") as HTMLButtonElement | null;
	const quitBtn = document.getElementById("quitButton") as HTMLButtonElement | null;

	if (quitBtn && socket) {
		quitBtn.onclick = (): void => {
			console.log("Leaving tournament:", tournamentId);
			if (window.sessionStorage.getItem("currentTournamentId"))
				sessionStorage.removeItem("currentTournamentId");
			window.sessionStorage.setItem("tournamentEnded", "true");
			CONTEXT.tournamentId = null;
			window.history.pushState(null, "", "/tournamentSize");
			router();
			socket.emit("tournament:leave", { tournamentId });
		};
	}

	if (nextMatchBtn) {
		if (CONTEXT.gameId) {
			nextMatchBtn.textContent = "Back to Match";
			nextMatchBtn.onclick = (): void => {
				window.history.pushState(null, "", "/pong");
				router();
			};
		} else {
			CONTEXT.tournamentId = tournamentId;
			nextMatchBtn.onclick = (): void => {
				console.log("Presenting next match in tournament:", tournamentId);
				window.history.pushState(null, "", "/pongTournament");
				router();
			};
		}
	}

	if (socket) {
		if (!socket) {
			alertBoxMsg("❌ Disconnected from server !");
			backToDefaultPage();
			return;
		}

		tournamentStateSetup(socket, tournamentId, nextMatchBtn);

		matchStartedSetup(socket, tournamentId);

		tournamentEndedSetup(socket, tournamentId);

		tournamentErrorSetup(socket);

		tournamentDuplicateSetup(socket);
		
		socket.emit("tournament:getState", { tournamentId });
	}
}

function tournamentStateSetup(socket: ReturnType<typeof getSocket>, tournamentId: string, nextMatchBtn: HTMLButtonElement | null): void {
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}

	socket.off("tournament:state");
	socket.on("tournament:state", (data: unknown): void => {
		try {
			window.sessionStorage.setItem("tournamentEnded", "false");
			const stateData = data as TournamentStateData;
			const result = tournamentStateSchema.validateSync(stateData) as TournamentStateData;
			if (result.tournamentId !== tournamentId) return;
			if (result.tournament.status === "finished") {
				if (nextMatchBtn)
					nextMatchBtn.style.display = "none";
				nextMatchBtn?.remove();
				window.sessionStorage.setItem("tournamentEnded", "true");
				// window.sessionStorage.removeItem("currentTournamentId");
			}
			renderTournament(result.tournament);
			const nextMatch = findNextReadyMatch(result.tournament);
			if (nextMatch) {
				CONTEXT.leftName = nextMatch.player1;
				CONTEXT.rightName = nextMatch.player2;
			}
		}
		catch (err) {
			alertBoxMsg("❌ Tournament state error occurred");
			if (sessionStorage.getItem("currentTournamentId"))
				sessionStorage.removeItem("currentTournamentId");
			backToDefaultPage();
		}
	});
}

function matchStartedSetup(socket: ReturnType<typeof getSocket>, tournamentId: string): void {
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}
	socket.off("match:started");
	socket.on("match:started", (data: unknown): void => {
		try {
			const info = matchStartedSchema.validateSync(data) as MatchStartedData;
			if (info.tournamentId && info.tournamentId !== tournamentId) return;

			CONTEXT.gameId = info.gameId;
			CONTEXT.leftName = info.player1;
			CONTEXT.rightName = info.player2;
			CONTEXT.gameMode = 1;
			CONTEXT.tournamentId = tournamentId;
		}
		catch (err) {
			console.error("Invalid match started data received:", err, data);
			alertBoxMsg("❌ Match start error");
			backToDefaultPage();
		}
	});
}

function tournamentEndedSetup(socket: ReturnType<typeof getSocket>, tournamentId: string): void {
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}
	socket.off("tournament:ended");
	socket.on("tournament:ended", (data: unknown): void => {
		try {
			const endData = tournamentEndedSchema.validateSync(data) as TournamentEndedData;
			if (endData.tournamentId !== tournamentId) return;
			console.log("Tournament ended, winner:", endData.winner);
			window.sessionStorage.setItem("tournamentEnded", "true");
		}
		catch (err) {
			console.error("Invalid tournament ended data received:", err);
			alertBoxMsg("❌ Tournament end error occurred");
		}
	});
}

function tournamentErrorSetup(socket: ReturnType<typeof getSocket>): void {
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}
	socket.off("tournament:error");
	socket.on("tournament:error", (message: unknown) => {
		try {
			const result = messageSchema.validateSync(message);
			if (result.message === "A match is already in progress") {
				console.error("Tournament error:", result);
				alertBoxMsg("❌ " + result.message);
				window.history.replaceState(null, "", "/tournament");
				return;
			}
			const statusEl = document.getElementById("tournamentStatus");
			if (statusEl)
				statusEl.textContent = `Error: ${result}`;
			console.error("Tournament error:", result.message);
			alertBoxMsg("❌ " + (result.message));
			window.sessionStorage.setItem("tournamentEnded", "true");
			if (window.sessionStorage.getItem("currentTournamentId"))
					window.sessionStorage.removeItem("currentTournamentId"); // if error in back, tournament deleted, so we remove it
			backToDefaultPage();
		}
		catch (err) {
			console.error("Invalid tournament error data received:", err);
			alertBoxMsg("❌ Tournament creation error occurred");
			if (sessionStorage.getItem("currentTournamentId"))
				sessionStorage.removeItem("currentTournamentId");
			backToDefaultPage();
		}
	});
}

function tournamentDuplicateSetup(socket: ReturnType<typeof getSocket>): void {
	if (!socket) {
		alertBoxMsg("❌ Disconnected from server !");
		backToDefaultPage();
		return;
	}
	socket.off("tournament:duplicate");
	socket.on("tournament:duplicate", (data) => {
		try {
			const result = messageSchema.validateSync(data);
			console.error("Tournament duplicate error:", result.message);
			alertBoxMsg("❌ " + (result.message || "There is already a tournament ongoing."));
			history.pushState(null, "", "/tournament");
		}
		catch (err) {
			console.error("Invalid tournament duplicate data received:", err);
			alertBoxMsg("❌ Duplicate tournament join attempt.");
			backToDefaultPage();
		}
	});
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
	// Display each round
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
	}
}

export function findNextReadyMatch(tournament: Tournament): { player1: string | undefined; player2: string | undefined; status: string; winner: string | null } | null {
	for (let r = 0; r < tournament.bracket.length; r++) {
	  for (let m = 0; m < tournament.bracket[r].length; m++) {
		const match = tournament.bracket[r][m];
		if (match.status === "ready") {
			return { player1: match.player1 || undefined, player2: match.player2 || undefined, status: match.status, winner: match.winner || null};
		}
	  }
	}
	return null;
}