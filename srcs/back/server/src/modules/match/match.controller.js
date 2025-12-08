// match.controller.js

import { createMatch, getMatchs } from "./match.service.js";

export async function createMatchHandler(request, reply) {
    const body = request.body;

    try {
        const match = await createMatch(body);
        return reply.status(201).send(match);
        
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "User don't exists. Try again!",
			error:error
        });
    }
}

export async function getMatchsHandler(request, reply) {
    const matchs = await getMatchs(request.user.id)

	return matchs;
}
