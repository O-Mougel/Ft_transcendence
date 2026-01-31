export type GameMode = 0 | 1 | 2 | 3; // 0=AI, 1=2P local, 2=4P, 3=Ranked
export type PaddleDirection = 'up' | 'down' | 'none';

export interface BallProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  spawnX: number;
  spawnY: number;
}

export interface PaddleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
  speed: number;
  direction: PaddleDirection;
  spawnX: number;
  spawnY: number;
}

export interface IBall {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  spawnX: number;
  spawnY: number;
  draw(ctx: CanvasRenderingContext2D): void;
  reset(): void;
}

export interface IPaddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
  speed: number;
  direction: PaddleDirection;
  spawnX: number;
  spawnY: number;
  draw(ctx: CanvasRenderingContext2D): void;
  reset(): void;
}

export interface GameContext {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  startButton: HTMLButtonElement | null;
  backButton: HTMLButtonElement | null;
  score: HTMLElement | null;

  ball: IBall | null;
  leftPaddle: IPaddle | null;
  rightPaddle: IPaddle | null;
  leftPaddle2: IPaddle | null;
  rightPaddle2: IPaddle | null;

  isGameStarted: boolean;
  gameId: string | null;
  keysPressed: Set<string>;
  updateIntervalId: number | null;
  controlsBound: boolean;
  gameMode: GameMode;
  tournamentId: string | null;

  PADDLE_WIDTH: number;
  PADDLE_HEIGHT: number;
  BALL_RADIUS: number;
  GAME_WIDTH: number;
  GAME_HEIGHT: number;
  scale?: number;

  leftName?: string;
  rightName?: string;
}

export interface GameInitOptions {
  mode: GameMode;
  gameId?: string | null;
}

export interface ScoreData {
  left: number;
  right: number;
}

export interface GameOverData {
  winner?: string;
  left: number;
  right: number;
}
