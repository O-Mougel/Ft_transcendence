// user.service.js

import { db } from "../../utils/prisma.js";
import { hashPassword } from "../../utils/hash.js";

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
