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
			finish: true,
		},
	})

	if(matchsnb == 0) // if never played before
	{
		return { matchsnb:0, winrate:0, biggest_streak:0, longestMatch:0 } // we need numbers for zod schema
	}
	
	const win = await db.match.count({
		where: {
			winnerId: id,
			finish: true,
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
			finish: true,
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
	let biggest_streak;
	let longestMatch;
	if (result)
	{
		biggest_streak = result._max.longestStreak ?? 0;
		longestMatch = result._max.duration ?? 0;
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
		orderBy: {
			createdAt: 'desc',
		},
	})
	return matchs
}
