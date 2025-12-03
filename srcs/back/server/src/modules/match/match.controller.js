// match.controller.js

import { createMatch } from "./user.service.js";

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
