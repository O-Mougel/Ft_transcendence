// user.route.ts

import { $ref } from "./match.schema.js";
import { createMatchHandler } from "./user.controller.js";

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
}

export default matchRoutes;
