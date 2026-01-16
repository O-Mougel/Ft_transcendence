// match.service.js

import { db } from "../../utils/prisma.js";
import { findUserByName } from "../user/user.service.js"

// export async function createMatch(input)
// {
//     const { player1Id, player2Id , ...rest } = input;

// 	const match = await db.match.create({
//         data: {...rest, player1Id, player2Id}
//     });

//     return match;
// }

export async function createMatch(input) //player1name,player1score,player2name,player2score,winnerName,longestStreak,duration
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
	const win = await db.match.count({
		where: {
			winnerId: id
		},
	})
	const calc = win / matchsnb * 100;
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
			duration: true
		}
	});

	const biggest_streak = result._max.longestStreak ?? 0;
	const longestMatch = result._max.duration ?? 0;

	return { matchsnb, winrate, biggest_streak, longestMatch } 
}
