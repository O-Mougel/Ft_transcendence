// match.route.js

import { $ref } from "./match.schema.js";
import { createMatchHandler, getMatchsHandler } from "./match.controller.js";

async function matchRoutes(fastify) {
	fastify.post(
		'/match',
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
		'/match',
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
}

export default matchRoutes;
