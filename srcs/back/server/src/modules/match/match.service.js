// match.service.js

import { db } from "../../utils/prisma.js";

export async function createMatch(input) //player1Name,player1score,player2Name,player2score,winnerName,longestStreak,duration
{
	const { player1Name, player2Name, winnerName, ...rest } = input;

  player1 = await findUserByName(player1Name)
  player2 = await findUserByName(player2Name)
  winnerId = winnerName == player1Name ? player1.id : player2.id

	const match = await db.match.create({
    data: { player1Id: player1.id, player2Id: player2.id, winnerId, ...rest }
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
