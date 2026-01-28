// match.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const statsMatchItemSchema = z.object({
	diffScore: z.number(),
	longestStreak: z.number(),
	duration: z.number(),
	createdAt: z.date()
});

const getMatchResponseSchema = z.object({
  matchsnb: z.number(),
  winmatchnb: z.number(),
  winrate: z.number(),
  last10matchs: z.array(statsMatchItemSchema)
});

const matchItemSchema = z.object({
	id: z.number(),
	player1name: z.string(),
	player2name: z.string(),
	player1Score: z.number(), 
	player2Score: z.number(), 
	win: z.boolean(),	   
	type: z.string(),         
	round: z.string(),
	duration: z.number(),
	createdAt: z.date()
});

const getMatchHistoryResponseSchema = z.object({
	match: z.array(matchItemSchema),
});

export const { schemas: matchSchemas, $ref } = buildJsonSchemas({
	getMatchResponseSchema,
	getMatchHistoryResponseSchema
	},
	{ $id: 'matchSchemas' }, 
);
