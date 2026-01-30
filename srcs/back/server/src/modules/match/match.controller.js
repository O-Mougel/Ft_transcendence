// match.controller.js

import { showstats, getMatchs } from "./match.service.js";
import { findUserById, alreadyfriend } from "../user/user.service.js";
import { addHours } from "date-fns";

export async function getMatchsHandler(request, reply) {
    const stats = await showstats(request.user.id)

	return stats;
}

export async function getFriendMatchsHandler(request, reply) { //check friend id et pas de ciuwbrg
	const { friendId } = request.params

	const userId = Number(friendId)

	if (!userId)
		return reply.status(400).send({
			message: "invalid friend id ! Try again!"
		});

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
	const matches = matchs.map(match => {
		if(match.player2.id == request.user.id) {
			const temp = match.player1;
			match.player1 = match.player2;
			match.player2 = temp;
			const tempscore = match.player1Score;
			match.player1Score = match.player2Score;
			match.player2Score = tempscore;
		}
		return {
		...match,
		win: match.winnerId == request.user.id,
		player2name: match.player2.id == 0 ? match.player2name : match.player2.name,
		player1name: match.player1.name,
		createdAt: addHours(new Date(match.createdAt), 1).toLocaleString("fr-FR", {day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}});

	return { match: matches }
}
