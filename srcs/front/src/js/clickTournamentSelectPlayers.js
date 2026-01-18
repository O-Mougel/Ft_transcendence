import { setupSocket, getSocket } from "/game/socket.js";

function collectPlayerNames(expectedCount) {
  const names = [];
  for (let i = 1; i <= expectedCount; i++) {
    const element = document.getElementById(`player${i}`);
    if (!element) throw new Error(`Missing input player${i}`);
    names.push(element.value.trim());
  }
  return names;
}

function validateNames(names, expectedCount) {
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

export async function startTournament(expectedCount, event) {
  setupSocket();
  const socket = getSocket();

  event.preventDefault();

  const names = collectPlayerNames(expectedCount);
  const err = validateNames(names, expectedCount);
  if (err) {
    alert(err);
    return;
  }

  console.log("Creating tournament with players:", names);

  socket.emit("tournament:create", { size: expectedCount, names });

  socket.once("tournament:state", ({ tournamentId }) => {
    console.log("Tournament created with ID:", tournamentId);
    sessionStorage.setItem("currentTournamentId", tournamentId);
    window.history.pushState({}, "", `/tournament`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    // sequential model: start first match when ready
    // socket.emit("tournament:nextMatch", { tournamentId });
  });

  socket.once("tournament:error", (e) => {
    alert(e?.message || "Failed to create tournament");
  });
}