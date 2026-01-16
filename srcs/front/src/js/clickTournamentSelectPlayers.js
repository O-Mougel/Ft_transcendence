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

// async function startTournament(expectedCount, event) {
//   event.preventDefault();

//   const names = collectPlayerNames(expectedCount);
//   const err = validateNames(names, expectedCount);
//   if (err) {
//     // replace with your UI error display
//     alert(err);
//     return;
//   }

//   console.log("Creating tournament with players:", names);

//   // Option A: send via Socket.IO (recommended for tournament)
//   // socket.emit("tournament:create", { size: expectedCount, names });

// //   Option B: send via HTTP (if you already have an API endpoint)
//   // const res = await fetch("/api/tournament", {
//   //   method: "POST",
//   //   headers: { "Content-Type": "application/json" },
//   //   body: JSON.stringify({ size: expectedCount, names }),
//   // });

//   // if (!res.ok) {
//   //   const msg = await res.text();
//   //   alert(msg || "Failed to create tournament");
//   //   return;
//   // }

//   // const data = await res.json(); // { tournamentId, ... }

//   // // redirect to tournament bracket page
//   // window.history.pushState({}, "", `/tournament/${data.tournamentId}`);
//   // window.dispatchEvent(new PopStateEvent("popstate"));
//   // Requires your socket instance to be accessible here (import it or expose it)
// socket.emit("tournament:create", { size: expectedCount, names });

// // wait once for server confirmation
// socket.once("tournament:created", ({ tournamentId, tournament }) => {
//   // store tournamentId if you need
//   window.history.pushState({}, "", `/tournament/${tournamentId}`);
//   window.dispatchEvent(new PopStateEvent("popstate"));

//   // optionally: show bracket immediately from "tournament"
//   // then start first match (sequential single-client)
//   socket.emit("tournament:nextMatch", { tournamentId });
// });

// // optional: handle errors
// socket.once("error", (err) => {
//   alert(err?.message || "Failed to create tournament");
// });

// }

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
    // window.history.pushState({}, "", `/tournament/${tournamentId}`);
    window.history.pushState({}, "", `/tournament`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    // sequential model: start first match when ready
    // socket.emit("tournament:nextMatch", { tournamentId });
  });

  socket.once("tournament:error", (e) => {
    alert(e?.message || "Failed to create tournament");
  });
}