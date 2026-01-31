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
	gameId: yup.string().min(3).max(24).required(),
}).required();

export const messageSchema = yup.object({
	message: yup.string().max(128).required(),
}).required();

export const reasonSchema = yup.object({
	reason: yup.string().max(128).required(),
}).required();

export const errorSchema = yup.object({
	error: yup.string().max(128).required(),
}).required();

const matchSchema = yup.object({
  id: yup.string().min(1).max(16).required(),
  gameId: yup.string().nullable().defined(),
  player1: yup.string().min(3).max(14).nullable().defined(),
  player2: yup.string().min(3).max(14).nullable().defined(),
  winner: yup.string().min(3).max(14).nullable().defined(),
  status: yup.string().oneOf(["playing", "ready", "pending", "played", "aborted"]).required(),
});

const currentSchema = yup.object({
    r: yup.number().required(),
    m: yup.number().required(),
    gameId: yup.string().min(4).max(24).required(),
  }).nullable();

export const tournamentStateSchema = yup.object({
    tournamentId: yup.string().required(),
    tournament: yup.object({
        id: yup.string().required(),
        size: yup.number().oneOf([4, 8, 16]).required(),
        status: yup.string().oneOf(["running", "finished"]).required(),
        winner: yup.string().min(3).max(14).nullable().defined(),
        players: yup.array().of(yup.string().min(3).max(14).required()).required(),
        bracket: yup.array().of(yup.array().of(matchSchema.required()).required()).required(),
        mainPlayer: yup.string().min(3).max(14).required(),
        current: currentSchema.defined(),
    }).required(),
}).required();

export const matchStartedSchema = yup.object({
	tournamentId: yup.string().required(),
	round: yup.number().required(),
	matchIndex: yup.number().required(),
	gameId: yup.string().required(),
	player1: yup.string().min(3).max(14).required(),
	player2: yup.string().min(3).max(14).required(),
	startData: yup.object({
		mode: yup.number().oneOf([1]).required(),
		player1: yup.string().min(3).max(14).required(),
		player2: yup.string().min(3).max(14).required(),
		tournament: yup.object({
			tournamentId: yup.string().min(3).max(24).required(),
			r: yup.number().required(),
			m: yup.number().required(),
			size: yup.number().oneOf([4, 8, 16]).required(),
		}).required(),
	}).required(),
}).required();

export const tournamentEndedSchema = yup.object({
	type: yup.string().oneOf(["tournamentEnded"]).required(),
	tournamentId: yup.string().min(3).max(24).required(),
	winner: yup.string().required(),
}).required();



