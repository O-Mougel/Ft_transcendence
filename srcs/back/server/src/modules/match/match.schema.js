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
	name: z.string().min(1),
	avatar: z.string().min(1),
	online: z.boolean(),
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
