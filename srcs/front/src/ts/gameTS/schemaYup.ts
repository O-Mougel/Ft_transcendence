import * as yup from 'yup';

export const gameStateSchema = yup.object({
	paddles: yup.object({
		left: yup.number().required(),
		right: yup.number().required(),
		left2: yup.number().notRequired(),
		right2: yup.number().notRequired(),
	}).required(),
	ball: yup.object({
		radius: yup.number().required(),
		speed: yup.number().required(),
		vx: yup.number().required(),
		vy: yup.number().required(),
		x: yup.number().required(),
		y: yup.number().required(),
	}).required(),
	score: yup.object({
		left: yup.number().required(),
		right: yup.number().required(),
	}).required(),
});

export const gameOverSchema = yup.object({
	left: yup.number().required(),
	right: yup.number().required(),
}).required();

export const gameStartedSchema = yup.object({
	gameId: yup.string().required(),
}).required();

export const standardSchema = yup.object({
	message: yup.string().required(),
}).required();

export const reasonSchema = yup.object({
	reason: yup.string().required(),
}).required();

export const errorSchema = yup.object({
	error: yup.string().required(),
}).required();

const matchSchema = yup.object({
  id: yup.string().required(),
  gameId: yup.string().nullable().defined(),
  player1: yup.string().nullable().defined(),
  player2: yup.string().nullable().defined(),
  winner: yup.string().nullable().defined(),
  status: yup.string().oneOf(["playing", "ready", "pending", "played"]).required(),
});

const currentSchema = yup.object({
    r: yup.number().required(),
    m: yup.number().required(),
    gameId: yup.string().required(),
  }).nullable();

export const tournamentStateSchema = yup.object({
    tournamentId: yup.string().required(),
    tournament: yup.object({
        id: yup.string().required(),
        size: yup.number().oneOf([4, 8, 16]).required(),
        status: yup.string().oneOf(["running", "finished"]).required(),
        winner: yup.string().nullable().defined(),
        players: yup.array().of(yup.string().required()).required(),
        bracket: yup.array().of(yup.array().of(matchSchema.required()).required()).required(),
        mainPlayer: yup.string().required(),
        current: currentSchema.defined(),
    }).required(),
}).required();

export const matchStartedSchema = yup.object({
	tournamentId: yup.string().required(),
	round: yup.number().required(),
	matchIndex: yup.number().required(),
	gameId: yup.string().required(),
	player1: yup.string().required(),
	player2: yup.string().required(),
	startData: yup.object({
		mode: yup.number().oneOf([1]).required(),
		player1: yup.string().required(),
		player2: yup.string().required(),
		tournament: yup.object({
			tournamentId: yup.string().required(),
			r: yup.number().required(),
			m: yup.number().required(),
			size: yup.number().oneOf([4, 8, 16]).required(),
		}).required(),
	}).required(),
}).required();

export const tournamentEndedSchema = yup.object({
	type: yup.string().oneOf(["tournamentEnded"]).required(),
	tournamentId: yup.string().required(),
	winner: yup.string().required(),
}).required();



