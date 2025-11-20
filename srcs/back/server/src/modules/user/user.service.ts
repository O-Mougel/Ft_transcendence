// user.service.ts

import { db } from "../../utils/prisma";
import { CreateUserInput } from "./user.schema";
import { hashPassword } from "../../utils/hash.ts";

export async function createUser(input: CreateUserInput) {
    const { password, ...rest } = input;

    const { hash, salt } = hashPassword(password);

    const user = await db.user.create({
        data: {...rest, salt, password: hash}
    });

    return user;
}

export async function findUserByEmail(email: string) {
	const user = await db.user.findUnique({
		where: {
			email: email,
		},
	})

    return user;
}

