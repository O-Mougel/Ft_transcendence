// match.controller.js

import { createMatch, showstats } from "./match.service.js";
import { findUserById, alreadyfriend } from "../user/user.service.js";

export async function getMatchsHandler(request, reply) {
    const stats = await showstats(request.user.id)

	return stats;
}

export async function getFriendMatchsHandler(request, reply) {
	const { friendId } = request.params

	const userId = Number(friendId)

	const friend = await findUserById(userId);
	if (!friend) {	
		return reply.status(400).send({
			message: "Friend does not exist in database ! Try again!"
		});
	};

	if (!await alreadyfriend(request.user.id, userId)) {
		return reply.status(400).send({
			message: "This user is not your friend you can't see his stats!"
		});
	}

	const stats = await showstats(userId);

	return stats;
}
