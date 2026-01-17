
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

  // Fill round 0
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

function chooseWinnerFromScore(match, score) {
  // score format in your game state: { left: n, right: n }
  // match.player1 is treated as "left", match.player2 as "right"
  if (!score || typeof score.left !== "number" || typeof score.right !== "number") {
    // fallback: pick player1 if unknown
    return match.player1;
  }
  if (score.left === score.right) return match.player1; // fallback on draw
  return (score.left > score.right) ? match.player1 : match.player2;
}

export class TournamentManager {
  constructor(gameManager) {
    this.gameManager = gameManager;

    this.tournaments = new Map();

    this.gameToMatch = new Map();
  }

  _createTournament(size, names) {
    if (![4, 8, 16].includes(size)) {
      throw new Error("Tournament size must be 4, 8, or 16");
    }
    if (!Array.isArray(names) || names.length !== size) {
      throw new Error(`Expected ${size} player names`);
    }

    const cleaned = names.map(n => String(n ?? "").trim());
    if (cleaned.some(n => n.length === 0)) throw new Error("All names must be non-empty");

    const lowered = cleaned.map(n => n.toLowerCase());
    if (new Set(lowered).size !== lowered.length) throw new Error("Names must be unique");

    const tournamentId = generateTournamentId();
    const players = cleaned;

    const tournament = {
      id: tournamentId,
      size,
      status: "running",      // running|finished
      winner: null,
      players,
      bracket: buildBracket(players, size),
      current: null,          // { r, m, gameId } while playing
    };

    this.tournaments.set(tournamentId, tournament);
    return tournamentId;
  }

  _getTournament(tournamentId) {
    return this.tournaments.get(tournamentId) || null;
  }

  _nextMatch(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "running") throw new Error("Tournament is finished");
    if (tournament.current) throw new Error("A match is already running");

    const next = findNextReadyMatch(tournament);
    if (!next) throw new Error("No ready matches available");

    const { r, m, match } = next;

    // Create/start a new Pong game for this match
    const gameId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    match.status = "playing";
    match.gameId = gameId;

    tournament.current = { r, m, gameId };
    this.gameToMatch.set(gameId, { tournamentId, r, m });

    this.gameManager._ensureGameExist(gameId);
    this.gameManager._startGame(gameId, {
      mode: 1,
      player1: match.player1,
      player2: match.player2,
      // mark as tournament game so GameManager cleanup can be generic
      _tournament: { tournamentId, r, m },
    });

    return {
      tournamentId,
      round: r,
      matchIndex: m,
      gameId,
      player1: match.player1,
      player2: match.player2,
    };
  }

  _onGameOver({ gameId, state }) {
    const mapping = this.gameToMatch.get(gameId);
    if (!mapping) return null;

    const { tournamentId, r, m } = mapping;
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    const match = tournament.bracket[r][m];
    if (!match) return null;

    const winnerName = chooseWinnerFromScore(match, state?.score);

    match.winner = winnerName;
    match.status = "done";

    advanceWinner(tournament, r, m, winnerName);

    // clear current and mapping
    tournament.current = null;
    this.gameToMatch.delete(gameId);

    // finished?
    if (tournament.status === "finished") {
      return { type: "tournamentEnded", tournamentId, winner: tournament.winner };
    }
    return { type: "matchEnded", tournamentId, winner: winnerName };
  }
}
