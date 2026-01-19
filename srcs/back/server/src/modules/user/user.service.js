// user.service.js

import { db } from "../../utils/prisma.js";
import { hashPassword } from "../../utils/hash.js";
import { generateRefreshToken } from "../../utils/token.js";

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

export async function createUser(input) { //check password confirmation here to solve sql injection ??
	const { password, ...rest } = input;

	const { hash, salt } = hashPassword(password);

	const user = await db.user.create({
		data: {...rest, salt, password: hash}
	});

	return user;
}

export async function checkIfUserExists(name) { // if count = 0, doesn't exist
	const result = await db.user.count({
		where: {
			name: name,
		},
	});

	return result;
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

export async function rejectfriend(id, friendid) {
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
}

export async function deletefriend(id, friendid) {
	await db.user.update({
		where: {id: id},
		data: {
			friends: {
				disconnect: {id: friendid},
			},
		},
	}),
	await db.user.update({
		where: {id: friendid},
		data: {
			friends: {
				disconnect: {id: id},
			},
		},
	})
}

export async function findrequests(id) {
	const requests = await db.user.findUnique({
		where: {id: id},
		select: {
			requestOf: {
				select: {
					id: true,
					name: true,
					avatar: true,
					online: true,
				},
			},
		},
	})

	return requests
}

export async function findfriends(id) {
	const friendsObj = await db.user.findUnique({
		where: {id: id},
		select: {
			friends: {
				select: {
					id: true,
					name: true,
					avatar: true,
					online: true,
				},
			},
		},
	})
	
	return friendsObj
}

export async function savesecret2fa(id, secret) {
	await db.user.update({
		where: { id: id },
		data: {
			twofasecret: secret
		}
	});
}

export async function deletesecret2fa(id) {
	await db.user.update({
		where: {
			id: id,
		},
		data: {
			twofasecret: null,
			auth2fa: false,
		},
	})
}

export async function activate2fa(id) {
	await db.user.update({
		where: { id: id },
		data: {
			auth2fa: true
		}
	});
}

export async function get2fastatus(id) {
	const status = await db.user.findUnique({
		where: { id: id },
		select: {
			auth2fa: true
		}
	});
	return status
}

export async function saveRefreshToken(id, token)
{
	await db.refreshTokens.create({
		data:{
			user_id: id,
			token: token,
			expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours
		}
	})
}

export async function findToken(token) {
	return await db.refreshTokens.findUnique({
	where: { token: token }
	})
}

export async function deleteAllForUser(id) {
	await db.refreshTokens.deleteMany ({
	where: { user_id: id }
	})
}

export async function rotateRefreshToken(id, token) {
	deleteRefreshToken(token)
	const newRefreshToken = generateRefreshToken();
	saveRefreshToken(id, newRefreshToken)
	return newRefreshToken
}

export async function deleteRefreshToken(token) {
	await db.refreshTokens.delete({
		where: {
			token: token
		}
	})
}
