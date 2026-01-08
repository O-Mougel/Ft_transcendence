// match.route.js

import { $ref } from "./match.schema.js";
import { createMatchHandler, getMatchsHandler, getFriendMatchsHandler } from "./match.controller.js";

async function matchRoutes(fastify) {
	fastify.post(
		'/match/create',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("createMatchSchema"),
				response: {
					201: $ref("createMatchResponseSchema")
				},
			},
		},
		createMatchHandler,
	)

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

	fastify.post(
		'/match/others',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("getFriendMatchSchema"),
				response: {
					201: $ref("getMatchResponseSchema")
				},
			},
		},
		getFriendMatchsHandler,
	)
}

export default matchRoutes;
