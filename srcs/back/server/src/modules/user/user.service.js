// user.service.js

import { db } from "../../utils/prisma.js";
import { hashPassword } from "../../utils/hash.js";

export async function grabUserByID(userId) {

	const user = await db.user.findUnique({
		where: { id: Number(userId) },
		select: {
			id: true,
			email: true,
			name: true,
			avatar: true,
		},
	})

	return user;
}


export async function createUser(input) {
	const { password, ...rest } = input;

	const { hash, salt } = hashPassword(password);

	const user = await db.user.create({
			data: {...rest, salt, password: hash}
	});

	return user;
}

export async function findUserByName(name) {
	const user = await db.user.findUnique({
		where: {
			name: name,
		},
	})

		return user;
}
