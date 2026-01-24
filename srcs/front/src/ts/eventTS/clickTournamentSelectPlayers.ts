import { setupSocket, getSocket } from "../gameTS/socket.js";
import { alertBoxMsg } from "./userLog.js";

interface TournamentStateEvent {
	tournamentId: string;
}

interface TournamentErrorEvent {
	message?: string;
}

function collectPlayerNames(expectedCount: number): string[] {
	const names: string[] = [];
	for (let i = 1; i <= expectedCount; i++) {
		const element = document.getElementById(`player${i}`) as HTMLInputElement | null;
		if (!element) throw new Error(`Missing input player${i}`);
		names.push(element.value.trim());
	}
	return names;
}

function validateNames(names: string[], expectedCount: number): string | null {
	if (names.length !== expectedCount) return `Expected ${expectedCount} players.`;

	if (names.some(n => n.length === 0)) return "All player names must be filled.";

	// avoid duplicates (case-insensitive)
	const lowered = names.map(n => n.toLowerCase());
	const set = new Set(lowered);
	if (set.size !== lowered.length) return "Player names must be unique.";

	// optional: length constraints
	if (names.some(n => n.length > 20)) return "Player names must be <= 20 characters.";

	return null;
}

export async function startTournament(expectedCount: number, event: Event): Promise<void> {
	setupSocket();
	const socket = getSocket();

	event.preventDefault();

	if (!socket) {
		alertBoxMsg("❌ Socket connection not available");
		return;
	}

	const names = collectPlayerNames(expectedCount);
	const err = validateNames(names, expectedCount);
	if (err) {
		alertBoxMsg("❌ " + err);
		return;
	}

	console.log("Creating tournament with players:", names);

	socket.emit("tournament:create", { size: expectedCount, names });

	socket.once("tournament:state", (data: unknown) => {
		const { tournamentId } = data as TournamentStateEvent;
		console.log("Tournament created with ID:", tournamentId);
		sessionStorage.setItem("currentTournamentId", tournamentId);
		window.history.pushState({}, "", `/tournament`);
		window.dispatchEvent(new PopStateEvent("popstate"));
	});

	socket.once("tournament:error", (data: unknown) => {
		const e = data as TournamentErrorEvent;
		alertBoxMsg("❌ " + (e?.message || "Failed to create tournament"));
	});
}
