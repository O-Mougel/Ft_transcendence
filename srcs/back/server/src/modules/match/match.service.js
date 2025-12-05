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

export async function getMatchs(playerId) {
	return db.user.findUnique({
		where: { id: playerId },
		include: {
			matchesAsPlayer1: true,
			matchesAsPlayer2: true
		}
	});
}
