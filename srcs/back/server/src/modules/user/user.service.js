// user.service.js

import { db } from "../../utils/prisma.js";
import { hashPassword } from "../../utils/hash.js";

export async function grabUserByID(userId) {  //grabs every field from given id

	const user = await db.user.findUnique({
		where: { id: Number(userId) },
	})

	return user;
}

export async function alterUser(id, newName, newPath) { // add a check to see if new username exists already

	const user = await db.user.update({
		where: {
			id: id,
		},
		data: {
			name: newName,
			avatar: newPath,
		},
	})

	return (user);
}

export async function createUser(input) {
	const { password, ...rest } = input;

	const { hash, salt } = hashPassword(password);

	const user = await db.user.create({
			data: {...rest, salt, password: hash}
	});

	return user;
}

export async function findUserByName(name) { //grabs every field from given name
	const user = await db.user.findUnique({
		where: {
			name: name,
		},
	})

		return user;
}
