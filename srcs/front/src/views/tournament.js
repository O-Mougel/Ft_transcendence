import ViewTemplate from "./ViewTemplate.js";
import { CONTEXT } from "/game/context.js";
import { setupSocket, getSocket } from "/game/socket.js"; // you need to export getSocket()

export default class extends ViewTemplate {

	constructor() {
		super();
		this.setTitle("Tournament");
	}

	async getHTML() {
	return `
		<div class="h-full w-full flex justify-center text-white">
		<div class="pt-10 w-[70%] flex flex-col gap-6">
			<h1 class="text-3xl font-bold text-center">Tournament</h1>

			<div class="flex justify-between items-center border border-[#98c6f8] rounded-lg p-4 bg-black/30">

			<div class="flex gap-3">
				<button id="nextMatchBtn"
				class="px-6 py-3 bg-[#98c6f8] text-white font-bold rounded-lg hover:bg-[#7aaedc]">
				Start next match
				</button>

				<button id="backButton"
				class="px-6 py-3 bg-transparent border border-[#98c6f8] text-white font-bold rounded-lg hover:bg-white/10">
				Back
				</button>
			</div>
			</div>

			<div id="statusBox" class="border border-[#98c6f8] rounded-lg p-4 bg-black/30">
			<div class="text-sm text-[#98c6f8]">Status</div>
			<div id="tournamentStatus" class="text-lg">Waiting for tournament state...</div>
			<div id="currentMatch" class="mt-2 text-lg"></div>
			<div id="winnerLine" class="mt-2 text-xl font-bold hidden"></div>
			</div>

			<div class="border border-[#98c6f8] rounded-lg p-4 bg-black/30">
			<div class="text-sm text-[#98c6f8] mb-3">Bracket</div>
			<div id="bracket" class="grid gap-4"></div>
			</div>
		</div>
		</div>
	`;
	}
	async init() {
	// ensure socket exists
	setupSocket();
	const socket = getSocket();

	const tournamentId = this._extractTournamentId();
	if (!tournamentId) {
		
		if (document.getElementById("tournamentStatus"))
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

	// Listen for tournament state updates
	socket.off("tournament:state");
	socket.on("tournament:state", ({ tournamentId: tid, tournament }) => {
		if (tid !== tournamentId) return;
		this._renderTournament(tournament);
	});
		
	// Listen for match start: go to Pong view
	socket.off("match:started");
	socket.on("match:started", (info) => {
		// info: { gameId, player1, player2, tournamentId }
		if (info.tournamentId && info.tournamentId !== tournamentId) return;
		
		// store into CONTEXT so pong view can display names / use gameId
		CONTEXT.gameId = info.gameId;
		CONTEXT.leftName = info.player1;
		CONTEXT.rightName = info.player2;
		CONTEXT.gameMode = 1; // tournament is 1v1 matches sequentially
		CONTEXT.tournamentId = tournamentId; // for "back to tournament" link

		// Navigate to pong view
		window.history.pushState({}, "", "/pong"); // reuse existing Pong view
		window.dispatchEvent(new PopStateEvent("popstate"));
	});

	// Tournament ended
	socket.off("tournament:ended");
	socket.on("tournament:ended", ({ tournamentId: tid, winner }) => {
		if (tid !== tournamentId) return;
		const winnerLine = document.getElementById("winnerLine");
		winnerLine.classList.remove("hidden");
		winnerLine.textContent = `Winner: ${winner}`;
		CONTEXT.tournamentId = null; // clear current tournament
	});

	// Ask server for state immediately (optional but recommended)
	socket.emit("tournament:getState", { tournamentId });
	}

	_extractTournamentId() {
	// if your router passes params, use them
	if (this.tournamentId) return this.tournamentId;

	const storedTournamentId = sessionStorage.getItem("currentTournamentId");
	if (storedTournamentId) return storedTournamentId;
	return null;
	}

	_renderTournament(tournament) {
	const statusElement = document.getElementById("tournamentStatus");
	const currentMatchElement = document.getElementById("currentMatch");
	const bracketElement = document.getElementById("bracket");

	if (statusElement === null || currentMatchElement === null || bracketElement === null) {
		console.error("Tournament view elements not found in DOM.");
		return;
	}

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
	}
}
