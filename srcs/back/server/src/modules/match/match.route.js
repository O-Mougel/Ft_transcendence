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

	// fastify.post("/match/internal", async (request, reply) => {
 //  		const secret = request.headers["x-internal-secret"];
 //  		if (secret !== process.env.INTERNAL_SERVICE_SECRET) {
 //  		  return reply.code(401).send({ error: "unauthorized" });
 //  		}
	// 
 //  		const { player1Id, player2Id, player1score, player2score } = request.body;
	//
 //    	if (typeof player1Id !== "number" || typeof player2Id !== "number" ||
	// 		typeof player1score !== "number" || typeof player2score !== "number") {
 //    	  return reply.code(400).send({ error: "invalid payload" });
 //    	}
	//
 //    	if (player1score < 0 || player2score < 0) {
 //    	  return reply.code(400).send({ error: "invalid scores" });
 //    	}
	// 
 //  		// validate types/ranges here
 //  		const match = await prisma.match.create({
 //  		  data: { player1Id, player2Id, player1score, player2score },
 //  		});
	// 
 //    	return reply.send({ ok: true, matchId: match.id });
	// });
}

export default matchRoutes;
