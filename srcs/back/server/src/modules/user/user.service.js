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

export async function findUserById(id) {
	const user = await db.user.findUnique({
		where: {
			id: id,
		},
	})

    return user;
}

export async function changeProfileInfo(id, newname, newprofilepicture) {
	const user = await db.user.update({
		where: { id: id },
		data: {
			name: newname,
			avatar: newprofilepicture,
		},
	})
	return user
}

export async function changePassword(id, newpassword) {
  const { hash, salt } = hashPassword(newpassword);

  const user = await db.user.update({
    where: {id: id},
    data:{
      password: hash,
      salt: salt,
    },
  })

  return user;
}
