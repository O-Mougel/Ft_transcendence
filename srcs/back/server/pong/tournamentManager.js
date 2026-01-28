
function generateTournamentId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildBracket(players, size) {
  const rounds = Math.log2(size);

  const bracket = Array.from({ length: rounds }, (_unused, roundIndex) => {
    const matchesThisRound = size / (2 ** (roundIndex + 1));
    return Array.from({ length: matchesThisRound }, (_unused, matchIndex) => ({
      id: `r${roundIndex}-m${matchIndex}`,
      gameId: null,
      player1: null,
      player2: null,
      winner: null,
      status: "pending", // pending|ready|playing|done
    }));
  });

  for (let matchIndex = 0; matchIndex < size / 2; matchIndex++) {
    bracket[0][matchIndex].player1 = players[matchIndex * 2];
    bracket[0][matchIndex].player2 = players[matchIndex * 2 + 1];
    bracket[0][matchIndex].status = "ready";
  }

  return bracket;
}

function advanceWinner(tournament, roundIndex, matchIndex, winnerId) {
  if (roundIndex + 1 >= tournament.bracket.length) {
    tournament.status = "finished";
    tournament.winner = winnerId;
    return;
  }

  const nextRoundId = roundIndex + 1;
  const nextMatchId = Math.floor(matchIndex / 2);
  const nextMatch = tournament.bracket[nextRoundId][nextMatchId];

  if (matchIndex % 2 === 0) nextMatch.player1 = winnerId;
  else nextMatch.player2 = winnerId;

  if (nextMatch.player1 && nextMatch.player2) nextMatch.status = "ready";
}

function findNextReadyMatch(tournament) {
  for (let roundIndex = 0; roundIndex < tournament.bracket.length; roundIndex++) {
    for (let matchIndex = 0; matchIndex < tournament.bracket[roundIndex].length; matchIndex++) {
      const match = tournament.bracket[roundIndex][matchIndex];
      if (match.status === "ready") return { r: roundIndex, m: matchIndex, match };
    }
  }
  return null;
}

function chooseWinner(match, score) {
  if (!score || typeof score.left !== "number" || typeof score.right !== "number") return match.player1; // fallback on invalid score
 
  if (score.left === score.right) return match.player1; // fallback on draw
  return (score.left >= score.right) ? match.player1 : match.player2;
}

function randomizeNames(names) {
  const array = names.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export class TournamentManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.tournaments = new Map();
    this.gameToMatch = new Map();
    this.tournamentSize = null;
    this.mainPlayerName = null;
  }

  createTournament(size, names) {
    if (![4, 8, 16].includes(size)) throw new Error("Tournament size must be 4, 8, or 16");
    this.tournamentSize = size;
    if (!Array.isArray(names) || names.length !== size) throw new Error(`Expected ${size} player names`);

    const cleanedArray = names.map(n => String(n ?? "").trim()); // ensure strings and trim whitespace
    if (cleanedArray.some(n => n.length === 0)) throw new Error("All names must be non-empty"); // If some (at leat one) name is empty

    const loweredNames = cleanedArray.map(n => n.toLowerCase()); // case-insensitive check for uniqueness
    if (new Set(loweredNames).size !== loweredNames.length) throw new Error("Names must be unique"); // If there are duplicates after cleaning (different array size)

    const tournamentId = generateTournamentId();
    const mainPlayerName = cleanedArray[0];
    const players = randomizeNames(cleanedArray);

    const tournament = {
      id: tournamentId,
      size,
      status: "running",
      winner: null,
      players,
      bracket: buildBracket(players, size),
      mainPlayer: mainPlayerName,
      current: null,
    };

    this.tournaments.set(tournamentId, tournament);
    return tournamentId;
  }

  getTournament(tournamentId) {
    return this.tournaments.get(tournamentId) || null;
  }

  nextMatch(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "running") throw new Error("Tournament is finished");
    if (tournament.current) throw new Error("A match is already running");

    const next = findNextReadyMatch(tournament);
    if (!next) throw new Error("No ready matches available");

    const { r: roundIndex, m: matchIndex, match } = next;

    const gameId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    match.status = "playing";
    match.gameId = gameId;

    tournament.current = { r: roundIndex, m: matchIndex, gameId };
    this.gameToMatch.set(gameId, { tournamentId, r: roundIndex, m: matchIndex });

    return {
      tournamentId,
      round: roundIndex,
      matchIndex: matchIndex,
      gameId,
      player1: match.player1,
      player2: match.player2,
      startData: {
        mode: 1,
        player1: match.player1,
        player2: match.player2,
        tournament: { tournamentId, r: roundIndex, m: matchIndex, size: tournament.size},
      },
    };

  }
  
  // matchAborted(match, state) {
  //   match.status = "aborted";
  //   match.winner = chooseWinner(match, state.score);
  // }
  onGameStopped(gameId) {
    const mapping = this.gameToMatch.get(gameId);
    if (!mapping) return;

    const { tournamentId, r, m } = mapping;
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const match = tournament.bracket[r][m];
    if (!match) return;

    match.status = "aborted";
    match.winner = chooseWinner(match, { score: { left: 0, right: 0 } });

    advanceWinner(tournament, r, m, match.winner);

    // clear current and mapping
    tournament.current = null;
    this.gameToMatch.delete(gameId);

    if (tournament.status === "finished") {
      return { type: "tournamentEnded", tournamentId, winner: tournament.winner };
    }
    return { type: "matchEnded", tournamentId, winner: match.winner };
  }

  onGameOver({ gameId, state }) {
    const mapping = this.gameToMatch.get(gameId);
    if (!mapping) return null;

    const { tournamentId, r, m } = mapping;
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    const match = tournament.bracket[r][m];
    if (!match) return null;

    const winnerName = chooseWinner(match, state.score);

    match.winner = winnerName;
    match.status = "Played";

    advanceWinner(tournament, r, m, winnerName);

    // clear current and mapping
    tournament.current = null;
    this.gameToMatch.delete(gameId);

    if (tournament.status === "finished") {
      return { type: "tournamentEnded", tournamentId, winner: tournament.winner };
    }
    return { type: "matchEnded", tournamentId, winner: winnerName };
  }

  deleteTournament(tournamentId) {
    console.log("Deleting tournament:", tournamentId);
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return false;

    // Clean up any ongoing match mappings
    for (const round of tournament.bracket) {
      for (const match of round) {
        if (match.gameId) {
          this.gameToMatch.delete(match.gameId);
        }
      }
    }

    this.tournaments.delete(tournamentId);
    return true;
  }
}
