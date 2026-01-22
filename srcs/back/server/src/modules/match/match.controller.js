// match.controller.js

import { showstats, getMatchs } from "./match.service.js";
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

export async function getMatchHistoryHandler(request, reply){
	const matchs = await getMatchs(request.user.id)
	const matches = matchs.map(match => ({
		...match,
		win: match.winnerId == request.user.id,
		player2name: match.player2.id == 0 ? match.player2name : match.player2.name,
		player1name: match.player1.name
	}));
	return { matchs: matches }
}

//faire passer tous les matcha dans une fonction qui check le winner et remplace le player2 name si c'est pas le bon
//return matchs
