import { setupSocket, getSocket } from "../gameTS/socket.js";
import { alertBoxMsg, backToDefaultPage } from "./userLog.js";
import { messageSchema } from "../gameTS/schemaYup.js";
import { router } from "./index.js";

interface TournamentStateEvent {
	tournamentId: string;
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

	if (names.some(n => n.length === 0)) return "All player names must be filled !";

	const lowered = names.map(n => n.toUpperCase());
	const set = new Set(lowered);
	if (set.size !== lowered.length) return "Player names must be unique !";

	if (names.some(n => n.length > 13)) return "Player names must be 13 characters max !";

	return null;
}

export async function startTournament(expectedCount: number, event: Event): Promise<void> {
	const socket = setupSocket();
	if (!socket) {
		alertBoxMsg("❌ Unable to establish socket connection");
		await backToDefaultPage();
		return;
	}

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
		window.history.pushState(null, "", `/tournament`);
		router();
	});

	socket.once("tournament:error", (message: unknown) => {
		try {
			const result = messageSchema.validateSync(message);
			alertBoxMsg("❌ " + result.message);
			if (window.sessionStorage.getItem("currentTournamentId"))
				window.sessionStorage.removeItem("currentTournamentId");
			backToDefaultPage();
		}
		catch (err) {
			alertBoxMsg("❌ Invalid tournament message received");
			console.error("Could not validate tournament info !");
			if (window.sessionStorage.getItem("currentTournamentId"))
				window.sessionStorage.removeItem("currentTournamentId");
			backToDefaultPage();
		}
	});
}
