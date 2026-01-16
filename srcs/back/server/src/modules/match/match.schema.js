// match.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const getMatchResponseSchema = z.object({
  matchsnb: z.number(),
  winrate: z.number(),
  biggest_streak: z.number(),
  longestMatch: z.number()
});

export const { schemas: matchSchemas, $ref } = buildJsonSchemas({
  	getMatchResponseSchema
	},
	{ $id: 'matchSchemas' }, 
);

