import { z } from "zod";

export const movementSchema = z.object({
  paddle: z.enum(['left', 'right', 'left2', 'right2'], { message: "Invalid paddle direction" }),
  direction: z.enum(['up', 'down', 'none'], { message: "Invalid direction" }),
});

export const startSchema = z.object({
  mode: z.number().refine((val) => [0, 1, 2, 3].includes(val), { message: "Invalid game mode" }),
  player1Token: z.string().min(1, { message: "player1Token is required" }),
  player2Token: z.string().min(1, { message: "player2Token cannot be empty" }).optional(),
  player2: z.string().min(3, { message: "player2 cannot be empty" }).optional(),

});

export const tournamentCreateSchema = z.object({
  size: z.number().refine((val) => [4, 8, 16].includes(val), { message: "Invalid tournament size" }),
  names: z.array(z.string({ message: "Name must be a string !" } ).min(3, { message: "Name must be at least 3 characters long" }).max(13, { message: "Name cannot be longer than 13 characters"} ).regex(/^[a-zA-Z0-9_]+$/, { message: "Name can only contains letters, numbers and underscores"} )).optional(),
});

export const tournamentGetStateSchema = z.object({
	tournamentId: z.string({ message: "tournamentId must be a string !" }).min(3, { message: "tournamentId is required" }),
});

export const tournamentNextMatchSchema = z.object({
	tournamentId: z.string({ message: "tournamentId must be a string !" }).min(3, { message: "tournamentId is required" }),
});

export const tournamentLeaveSchema = z.object({
	tournamentId: z.string({ message: "tournamentId must be a string !" }).min(3, { message: "tournamentId is required" }),
});

export const sessionRetrieveSchema = z.object({
  tournamentId: z.string({ message: "tournamentId must be a string !" }).min(3, { message: "tournamentId is required" }).optional(),
});
