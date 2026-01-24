// Socket.io event type definitions
import type { GameMode, PaddleDirection } from './game.types';

export interface GameStateData {
  ball?: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  paddles?: {
    left?: number;
    right?: number;
    left2?: number;
    right2?: number;
  };
  score?: {
    left: number;
    right: number;
  };
}

export interface GameStartPayload {
  mode: GameMode;
  player1Token?: string;
  player2Token?: string;
  player1?: string;
  player2?: string;
  player3?: string;
  player4?: string;
}

export interface GameMovePayload {
  Paddle: 'left' | 'right' | 'left2' | 'right2';
  Direction: PaddleDirection;
}

export interface GameJoinPayload {
  gameId: string;
}

export interface GameStartedData {
  gameId: string;
  [key: string]: unknown;
}

export interface TournamentCreatePayload {
  size: number;
  names: string[];
}

export interface TournamentStateData {
  tournamentId: string;
  tournament: Tournament;
}

export interface Tournament {
  status: string;
  winner?: string;
  current?: {
    r: number;
    m: number;
  };
  bracket: TournamentMatch[][];
}

export interface TournamentMatch {
  player1?: string;
  player2?: string;
  winner?: string;
  status: string;
}

export interface MatchStartedData {
  tournamentId?: string;
  gameId: string;
  player1: string;
  player2: string;
}

export interface TournamentEndedData {
  tournamentId: string;
  winner: string;
}

export interface TournamentNextMatchPayload {
  tournamentId: string;
}

export interface TournamentLeavePayload {
  tournamentId: string;
}

export interface TournamentGetStatePayload {
  tournamentId: string;
}

export interface TournamentErrorData {
  message?: string;
}

// Socket.io instance type
export interface Socket {
  connected: boolean;
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback?: (...args: unknown[]) => void): void;
  once(event: string, callback: (...args: unknown[]) => void): void;
}
