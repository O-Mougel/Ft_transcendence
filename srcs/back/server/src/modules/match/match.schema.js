// match.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

// const createMatchSchema = z.object({
//     player1Id: z.number(),
// 	player1score: z.number(),
//     player2Id: z.number(),
// 	player2score: z.number(),
// 	winnerId: z.number(),
//     longestStreak: z.number(),
//     duration: z.number()
// });

// const createMatchResponseSchema = z.object({
//     id: z.number(),
// 	createdAt: z.string(),
// });

const getMatchResponseSchema = z.object({
  matchsnb: z.number(),
  winrate: z.number(),
  biggest_streak: z.number(),
  longestMatch: z.number()
});

const getFriendMatchSchema = z.object({
  username: z.string()
});

export const { schemas: matchSchemas, $ref } = buildJsonSchemas({
	// createMatchSchema,
	// createMatchResponseSchema,
	getFriendMatchSchema,
  	getMatchResponseSchema
	},
	{ $id: 'matchSchemas' }, 
);

