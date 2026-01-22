// match.route.js

import { $ref } from "./match.schema.js";
import { getMatchsHandler, getFriendMatchsHandler, getMatchHistoryHandler } from "./match.controller.js";

async function matchRoutes(fastify) {
	fastify.get(
		'/match/self',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					201: $ref("getMatchResponseSchema")
				},
			},
		},
		getMatchsHandler,
	)

	fastify.get(
		'/match/:friendId',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					201: $ref("getMatchResponseSchema")
				},
			},
		},
		getFriendMatchsHandler,
	)

	fastify.get(
		'/match/history',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					200: $ref("getMatchHistoryResponseSchema")
				},
			},
		},
		getMatchHistoryHandler,
	)
}

export default matchRoutes;
