// match.service.js

import { db } from "../../utils/prisma.js";

export async function createUser(input) {
    const { player1Id, player2Id , ...rest } = input;

	const player1 = db.findUnique({
		where: {
			id: player1Id,
		},
	})
	const player2 = db.findUnique({
		where: {
			id: player2Id,
		},
	})
    const match = await db.user.create({
        data: {input, player1, player2}
    });

    return match;
}
