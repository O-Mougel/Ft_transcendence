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

export async function setOnlineStatus(id, status) {
	await db.user.update({
		where: { id: id },
		data: {
			online: status,
		},
	})
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

//update 2fa

export async function alreadyrequested(id, friendid) {
	const user = await db.user.findFirst({
		where: {
			id: id,
			request: {
				some: {id: friendid},
			},
		},
		select: {id: true},
	})

	return user
}

export async function alreadyfriend(id, friendid) {
	const user = await db.user.findFirst({
		where: {
			id: id,
			friends: {
				some: {id: friendid},
			},
		},
		select: {id: true},
	})

	return user
}

export async function requestfriend(id, friendid) {
	await db.user.update({
		where: {id: id},
		data: {
			request: {
				connect: {id: friendid},
			},
		},
	})
}

export async function acceptfriend(id, friendid) {
	await db.user.update({
		where: {id: id},
		data: {
			request: {
				disconnect: {id: friendid},
			},
		},
	}),
	await db.user.update({
		where: {id: friendid},
		data: {
			request: {
				disconnect: {id: id},
			},
		},
	})
	await db.user.update({
		where: {id: id},
		data: {
			friends: {
				connect: {id: friendid},
			},
		},
	}),
	await db.user.update({
		where: {id: friendid},
		data: {
			friends: {
				connect: {id: id},
			},
		},
	})
}

export async function findrequests(id) {
	const requests = await db.user.findUnique({
		where: {id: id},
		select: {
			requestOf: true,
		},
	})
	
	return requests
}

export async function findfriends(id) {
	const friends = await db.user.findUnique({
		where: {id: id},
		select: {
			friends: {
        select: {
          name: true,
          avatar: true,
          online: true,
        },
      },
		},
	})
	
	return friends
}
