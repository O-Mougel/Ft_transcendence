import { z } from "zod";

export const movementSchema = z.object({
  paddle: z.string().refine((val) => ['left', 'right', 'left2', 'right2'].includes(val), { message: "Invalid paddle direction" }),
  direction: z.string().refine((val) => ['up', 'down', 'none'].includes(val), { message: "Invalid direction" }),
});

export const startSchema = z.object({
  mode: z.number().refine((val) => [0, 1, 2, 3].includes(val), { message: "Invalid game mode" }),
  player1Token: z.string().min(1, { message: "player1Token is required" }),
  player2: z.string().min(1, { message: "player2 is required" }),
});

export const tournamentCreateSchema = z.object({
  size: z.number().refine((val) => [4, 8, 16].includes(val), { message: "Invalid tournament size" }),
  names: z.array(z.string()).optional(),
});

export const tournamentGetStateSchema = z.object({
	tournamentId: z.string().min(1, { message: "tournamentId is required" }),
});

export const tournamentNextMatchSchema = z.object({
	tournamentId: z.string().min(1, { message: "tournamentId is required" }),
});

export const tournamentLeaveSchema = z.object({
	tournamentId: z.string().min(1, { message: "tournamentId is required" }),
});

export const sessionRetrieveSchema = z.object({
  tournamentId: z.string().min(1, { message: "tournamentId is required" }).optional(),
});
