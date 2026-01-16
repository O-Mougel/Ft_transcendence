// match.controller.js

import { createMatch, showstats } from "./match.service.js";
import { findUserByName } from "../user/user.service.js";

export async function createMatchHandler(request, reply) {
    const body = request.body;

	//should be caught by zod, but just in case
	if (!body.player1Id || !body.player1score || !body.player2Id || !body.player2score || !body.winnerId || !body.longestStreak || !body.duration)
		return reply.status(400).send({
            message: "Missing parameters, cannot create match!",
        });

	if (body.player1Id == body.player2Id)
		return reply.status(403).send({
            message: "You cannot play against yourself !",
        });
    try {
        const match = await createMatch(body);
        return reply.status(201).send(match);
        
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "User doesn't exist. Try again!",
			error:error
        });
    }
}

export async function getMatchsHandler(request, reply) {
    const stats = await showstats(request.user.id)

	return stats;
}

export async function getFriendMatchsHandler(request, reply) {

	if (!request.body.username)
		return reply.status(400).send({
            message: "Username parameter cannot be empty !",
        });

	const friendName = await findUserByName(request.body.username);
		if (!friendName) {	
			return reply.status(400).send({
				message: "Friend name does not exist in database ! Try again!"
			});
		};

    const stats = await showstats(friendName.id);

	return stats;
}
