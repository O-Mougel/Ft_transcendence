// match.route.js

import { $ref } from "./match.schema.js";
import { getMatchsHandler, getFriendMatchsHandler } from "./match.controller.js";

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
}

export default matchRoutes;
