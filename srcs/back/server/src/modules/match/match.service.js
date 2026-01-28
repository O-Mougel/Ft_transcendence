// match.service.js

import { db } from "../../utils/prisma.js";

export async function createMatch(input) //player1Id, player2Id(only in ranked), player1Score, player2Score, winnerId (-1 if aborted), longestStreak, duration, finish, type, other value if they are existent 
{
	const match = await db.match.create({
        data: input
    });

    return match;
}

export async function showstats(id) {
	const matchsnb = await db.match.count({
		where: {
			OR: [
				{ player1Id: id },
				{ player2Id: id },
			],
		},
	})

	if(matchsnb == 0) // if never played before
	{
		return { matchsnb:0, winrate:0, biggest_streak:0, longestMatch:0 } // we need numbers for zod schema
	}
	
	const winmatchnb = await db.match.count({
		where: {
			winnerId: id,
		},
	})
	const calc = win / matchsnb * 100; //divide by zero ?
	const winrate = calc.toFixed(2);

	const lastmatchs = await db.matchfindMany({
		where: {
			OR: [
				{ player1Id: id },
				{ player2Id: id },
			],
		},
		select: {
			player1Id: true,
			player2Id: true,
			player1Score: true,
			player2Score: true,
			longestStreak: true,
			duration: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
		take: 10,
	})

	const last10matchs = lastmatchs.map(match => ({
		...match,
		diffScore: match.player1Id == request.user.id ? match.player1Score - match.player2Score : match.player2Score - match.player1Score,
	}));

	return { matchsnb, winmatchnb, winrate, last10matchs } 
}

export async function getMatchs(id) {
	const matchs = await db.match.findMany({
		where: {
			OR: [
				{ player1Id: id },
				{ player2Id: id },
			],
		},
		select: {
			id: true,
			player1: {
				select: {
					name: true,
				},
			},
			player2: {
				select: {
					id: true,
					name: true,
				},
			},
			player1Score: true,
			player2Score: true,
			winnerId: true,
			type: true,
			player2name: true,
			round: true,
			duration: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
	return matchs
}
