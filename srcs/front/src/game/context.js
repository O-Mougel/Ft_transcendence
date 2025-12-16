import Ball from "./ball.js";
import Paddle from "./paddle.js";

export const CONTEXT = {
	// HTML elements
	canvas: null,
	ctx: null,
	startButton: null,
	score: null,

	// Game objects
	ball: null,
	leftPaddle: null,
	rightPaddle: null,
	leftPaddle2: null,
	rightPaddle2: null,

	// Game state
	isGameStarted: false,
	keysPressed: new Set(),
	updateIntervalId: null,
	controlsBound: false,
	gameMode: 1, // or 2

	// Dimensions
	GAME_WIDTH: 800,
	GAME_HEIGHT: 500,
};

export function createGameElements() {
	const { GAME_WIDTH, GAME_HEIGHT } = CONTEXT;

	CONTEXT.ball = new Ball(
		GAME_WIDTH / 2,
		GAME_HEIGHT / 2,
		(10 / 800) * GAME_WIDTH,
		"white"
	);

	CONTEXT.leftPaddle = new Paddle(
		(10 / 800) * GAME_WIDTH,
		GAME_HEIGHT / 2,
		(10 / 800) * GAME_WIDTH,
		(80 / 500) * GAME_HEIGHT,
		"dodgerblue"
	);

	CONTEXT.rightPaddle = new Paddle(
		CONTEXT.GAME_WIDTH - (20 / 800) * GAME_WIDTH,
		GAME_HEIGHT / 2,
		(10 / 800) * GAME_WIDTH,
		(80 / 500) * GAME_HEIGHT,
		"red"
	);

	if (CONTEXT.gameMode !== 2) return;
	
	CONTEXT.leftPaddle2 = new Paddle(
		CONTEXT.GAME_WIDTH / 4 + (10 / 800) * GAME_WIDTH,
		GAME_HEIGHT / 2,
		(10 / 800) * GAME_WIDTH,
		(80 / 500) * GAME_HEIGHT,
		"dodgerblue"
	);

	CONTEXT.rightPaddle2 = new Paddle(
		3 * CONTEXT.GAME_WIDTH / 4 - (20 / 800) * GAME_WIDTH,
		GAME_HEIGHT / 2,
		(10 / 800) * GAME_WIDTH,
		(80 / 500) * GAME_HEIGHT,
		"red"
	);

}