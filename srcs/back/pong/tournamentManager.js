import { time } from "console";
import { TOURNAMENT_TIMEOUT } from "./config.js";

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
      status: "pending", // pending|ready|playing|done|aborted
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
  if (!score || typeof score.left !== "number" || typeof score.right !== "number") return match.player1;
 
  if (score.left === score.right) return match.player1;
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

    const cleanedArray = names.map(n => String(n ?? "").trim())
    if (cleanedArray.some(n => n.length === 0)) throw new Error("All names must be non-empty");

    const loweredNames = cleanedArray.map(n => n.toLowerCase());
    if (new Set(loweredNames).size !== loweredNames.length) throw new Error("Names must be unique");

    // if lower than 3 or greater than 13 or contain invalid chars
    for (const name of cleanedArray) {
      if (name.length < 3 || name.length > 13 || !/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error("Names must be 3-13 characters long and contain only letters, numbers, and underscores");
      }
    }

    const tournamentId = generateTournamentId();
    const mainPlayerName = cleanedArray[0];
    const players = randomizeNames(cleanedArray);

    setTimeout(() => {
      this.deleteTournament(tournamentId);
    }, TOURNAMENT_TIMEOUT);

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
    if (tournament.current) {
      this.onGameStopped(tournament.current.gameId);
      throw new Error("A match was already in progress");
    }

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

  isGameInTournament(gameId) {
    return this.gameToMatch.has(gameId);
  }
  
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
    match.status = "played";

    advanceWinner(tournament, r, m, winnerName);

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
