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
	// const input = {
	// 	player1Id: 1,
	// 	player2Id: 0,
	// 	player1Score: 10,
	// 	player2Score: 0,
	// 	winnerId: 1,
	// 	longestStreak: 40,
	// }

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
	
	const win = await db.match.count({
		where: {
			winnerId: id,
		},
	})
	const calc = win / matchsnb * 100; //divide by zero ?
	const winrate = calc.toFixed(2);

	const result = await db.match.aggregate({
		where: {
			OR: [
				{ player1Id: id },
				{ player2Id: id },
			],
		},
		_max: {
			longestStreak: true,
			duration: true,
		}
	});

	console.log("\n\n\n------");
	console.log(matchsnb);
	console.log("\n\n\n------");
	console.log("\n\n\n------");
	console.log(result);
	console.log("-------\n\n\n");
	if (result)
	{
	const biggest_streak = result.max.longestStreak ?? 0;
	const longestMatch = result.max.duration ?? 0;
	}
	else
	{
		biggest_streak = 0;
		longestMatch = 0;
	}
	return { matchsnb, winrate, biggest_streak, longestMatch } 

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
			createdAt: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
	return matchs
}
