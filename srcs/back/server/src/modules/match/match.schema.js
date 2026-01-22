// match.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const getMatchResponseSchema = z.object({
  matchsnb: z.number(),
  winrate: z.number(),
  biggest_streak: z.number(),
  longestMatch: z.number()
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
	createdAt: z.date()
});

const getMatchHistoryResponseSchema = z.object({
	matchs: z.array(matchItemSchema)
});

export const { schemas: matchSchemas, $ref } = buildJsonSchemas({
	getMatchResponseSchema,
	getMatchHistoryResponseSchema
	},
	{ $id: 'matchSchemas' }, 
);
