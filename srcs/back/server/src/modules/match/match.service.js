// match.service.js

import { db } from "../../utils/prisma.js";

export async function createMatch(input)
{
    const { player1Id, player2Id , ...rest } = input;

	const match = await db.match.create({
        data: {...rest, player1Id, player2Id}
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
	const winrate = win / matchsnb * 100
	
	console.log(matchsnb, win, winrate)
	return (matchsnb, win, winrate)
}
