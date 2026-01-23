import Ball from "./ball.js";
import Paddle from "./paddle.js";
import type { GameContext, GameMode } from '../types/game.types';

export const CONTEXT: GameContext = {
	// HTML elements
	canvas: null,
	ctx: null,
	startButton: null,
	backButton: null,
	score: null,

	// Game objects
	ball: null,
	leftPaddle: null,
	rightPaddle: null,
	leftPaddle2: null,
	rightPaddle2: null,

	// Game state
	isGameStarted: false,
	gameId: null,
	keysPressed: new Set<string>(),
	updateIntervalId: null,
	controlsBound: false,
	gameMode: 0 as GameMode,
	tournamentId: null,

	// Dimensions
	PADDLE_WIDTH: 10,
	PADDLE_HEIGHT: 80,
	BALL_RADIUS: 10,
	GAME_WIDTH: 800,
	GAME_HEIGHT: 500,
};

export function createGameElements(): void {
	const { GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PADDLE_WIDTH, PADDLE_HEIGHT } = CONTEXT;

	const width_ratio = GAME_WIDTH / 800;
	const height_ratio = GAME_HEIGHT / 500;

	CONTEXT.ball = new Ball(
		GAME_WIDTH / 2,
		GAME_HEIGHT / 2,
		BALL_RADIUS * width_ratio,
		"white"
	);

	CONTEXT.leftPaddle = new Paddle(
		10 * width_ratio,
		GAME_HEIGHT / 2,
		PADDLE_WIDTH * width_ratio,
		PADDLE_HEIGHT * height_ratio,
		"dodgerblue"
	);

	CONTEXT.rightPaddle = new Paddle(
		GAME_WIDTH - (10 + PADDLE_WIDTH) * width_ratio,
		GAME_HEIGHT / 2,
		PADDLE_WIDTH * width_ratio,
		PADDLE_HEIGHT * height_ratio,
		"red"
	);

	if (CONTEXT.gameMode !== 2) return;

	CONTEXT.leftPaddle2 = new Paddle(
		GAME_WIDTH / 4 - PADDLE_WIDTH * width_ratio,
		GAME_HEIGHT / 2,
		PADDLE_WIDTH * width_ratio,
		PADDLE_HEIGHT * height_ratio,
		"dodgerblue"
	);

	CONTEXT.rightPaddle2 = new Paddle(
		GAME_WIDTH * 3 / 4,
		GAME_HEIGHT / 2,
		PADDLE_WIDTH * width_ratio,
		PADDLE_HEIGHT * height_ratio,
		"red"
	);

	console.log("Paddles clients positions:", CONTEXT.leftPaddle.x, CONTEXT.leftPaddle2.x, CONTEXT.rightPaddle.x, CONTEXT.rightPaddle2.x);

}
