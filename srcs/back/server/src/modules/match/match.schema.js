// match.schema.ts

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const createMatchSchema = z.object({
    player1id: z.number(),
	player1score: z.number(),
    player2id: z.number(),
	player2score: z.number(),
});

const createMatchResponseSchema = z.object({
    id: z.number(),
	createdAt: z.string(),
});

export const { schemas: matchSchemas, $ref } = buildJsonSchemas({
	createMatchSchema,
	createMatchResponseSchema,
});
