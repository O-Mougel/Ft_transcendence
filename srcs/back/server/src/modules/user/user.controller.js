// user.controller.js

//// For File upload
import fs from 'fs';
import path from 'path'; //save path manip
import crypto from 'crypto'; //random file name
import { pipeline } from 'stream/promises'; //file writing
import { fileTypeFromBuffer } from "file-type";
/////
import { createUser, findUserByName, findUserById, alterUser, changePassword, findfriends, findrequests, acceptfriend, alreadyfriend, alreadyrequested, requestfriend, rejectfriend, deletefriend, deletesecret2fa, activate2fa, get2fastatus, saveRefreshToken, findToken, rotateRefreshToken, deleteAllForUser, deleteRefreshToken } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, generate2faToken, generateMatchToken } from "../../utils/token.js";
import { generateSecret, verify2fa } from "../../utils/twofa.js"
import { generate2faMatchToken } from "../../utils/token.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME_TYPES = ["image/png", "image/jpg", "image/gif", "image/jpeg"];

export async function registerUserHandler(request, reply) {

	const body = request.body;
	body.name = body.name.toUpperCase()

	const name = await findUserByName(body.name);

	const { passwordconfirmation, ...rest } = body;
	if (name) {	
		return reply.status(409).send({
			message: "Username already used. Try again!",
			errRef:"registerNameTaken"
		});
	};

	if (body.password != body.passwordconfirmation)
		return reply.status(400).send({
			message: "Password confirmation doesn't match with previous password. Try again!"
		});

	try {
		const user = await createUser({...rest});

		const accessToken = generateAccessToken(request.server, user);
		const refreshToken = generateRefreshToken();

		await saveRefreshToken(user.id, refreshToken)

		reply.setCookie('refresh_token', refreshToken, {
			path: '/',
			maxAge: 14 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: "strict"
		})

		return reply.code(201).send({ require2fa: false, token: accessToken });

	} catch (error) {
		return reply.status(409).send({
			message: "Email address already used !",
			errRef:"registerEmailTaken"
		});
	}
}

export async function dataGrabHandler(request, reply) {

	const userId = request.user && request.user.id;
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !'}); //never called in theory, the fastify decorate does it first

	try {
		const user = await findUserById(userId);
		if (!user) return reply.code(404).send({ message: 'User not found using access token'});
		// fields should be deleted if we send whole user, or instead just send username or stats
		return reply.status(200).send(user);

	} catch (error) {
		console.error(error);
		return reply.status(404).send({
			message: "User info could not be found within database !",
			error:error
		});
	}
}

export async function loginHandler(request, reply) {
	request.name = request.name.toUpperCase()
	const user = await findUserByName(request.name);

	if (!user) {
		return reply.status(404).send({
			message: "User does not exist ! Try again!",
			errRef:"loginInvalidName"
		});
	};

	const isValidPassword = verifyPassword(
		request.password,
		user.salt,
		user.password);

	if (!isValidPassword) {
		return reply.status(401).send({
			message: "Password is incorrect",
			errRef:"loginInvalidPwd"
		});
	};

	if (user.auth2fa) {

		const tempToken = generate2faToken(request.server, user)

		
		return reply.code(201).send({ require2fa: true, token: tempToken });
	}

	const accessToken = generateAccessToken(request.server, user);
	const refreshToken = generateRefreshToken();

	await saveRefreshToken(user.id, refreshToken)

	reply.setCookie('refresh_token', refreshToken, {
		path: '/',
		maxAge: 14 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	})

	return reply.code(201).send({ require2fa: false, token: accessToken});
}

export async function loginMatchHandler(request, reply) {
	const body = request.body;

	const user = await findUserByName(body.name);

	if (!user) {
		return reply.status(404).send({
			message: "Invalid name. Try again!",
			errRef:"loginMatchUserNotFound"
		});
	};

	if (user.id == request.user.id)
		return reply.status(401).send({ //not sure about the error code
			message: "Player 1 already logged. Login with another player!",
			errRef:"loginMatchUserNotP1"
		});

	const isValidPassword = verifyPassword(
		body.password,
		user.salt,
		user.password);

	if (!isValidPassword) {
		return reply.status(401).send({
			message: "Password is incorrect",
			errRef:"loginMatchInvalidPwd"
		});
	};

	if (user.auth2fa) {

		const tempToken = generate2faMatchToken(request.server, user)
		return reply.code(201).send({ require2fa: true, token: tempToken });
	}

	const matchToken = generateMatchToken(request.server, user);

	return reply.code(201).send({ require2fa: false, token: matchToken });

}

export async function check2faHandler(request, reply) {
	const code = request.body.code

	const user = await findUserById(request.user.id)
	if (!user || !user.twofasecret) {
		return reply.status(403).send({
			message: "2fa not configured!",
			errRef:"verify2FANotSetUp"
		});
	};

	const isValid = verify2fa(user.twofasecret, code)

	if (!isValid) {
		return reply.status(401).send({
			message: "Invalid 2FA code",
			errRef:"verifyInvalidCode"
		});
	}

	if (request.user.scope == "match") {
		const matchToken = generateMatchToken(request.server, user);

		return reply.code(200).send({ matchToken });
	}

	if (!user.auth2fa) {
		await activate2fa(user.id)
		return reply.code(200).send({ message: "2fa activated !" });
	}

	const accessToken = generateAccessToken(request.server, user);
	const refreshToken = generateRefreshToken();

	await saveRefreshToken(user.id, refreshToken)

	reply.setCookie('refresh_token', refreshToken, {
		path: '/',
		maxAge: 14 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	})

	return reply.code(201).send({ newAccessToken: accessToken });
}

export async function refreshTokenHandler(request, reply) {
	const token = request.cookies.refresh_token;
	if (!token) return reply.status(403).send({ message: 'Refresh_token cookie is missing !' })

	const stored = await findToken(token)
	
	if (!stored) {
		return reply.status(403).send({ message: "Invalid refresh_token !" });
	}
	
	const now = Date.now()
	if (stored.expires_at < now) {
		await deleteAllForUser(stored.user_id)
		return reply.status(403).send({ message: "Expired refresh_token !" });
	}
	
	// rotation
	reply.clearCookie("refresh_token");
	const refreshToken = await rotateRefreshToken(stored.user_id, token)
	const user = await findUserById(stored.user_id);

	if (!user)
		return reply.status(403).send({ message: "User ID not found in db !" });

	const newAccessToken = generateAccessToken(request.server, user);
	reply.setCookie('refresh_token', refreshToken, {
		path: '/',
		maxAge: 14 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	})

	return reply.code(200).send({newAccessToken: newAccessToken});
}

export async function alterUserHandler(request, reply) {

	const body = request.body;
	body.name = body.name.toUpperCase()
	const userId = request.user && request.user.id;
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !', errRef:"NotAuthUser" });

	const target = await findUserById(userId);
	if (!target) {
		return reply.status(404).send({
			message: "Error ! Couln't find user !", errRef:"alterUserNotFound"
		});
	};

	if (target.name != body.name)
	{
		const newname = await findUserByName(body.name);
		if (newname) {	
			return reply.status(409).send({
				message: "Username already used. Try again!", errRef:"alterUsernameTaken"
			});
		};
	}

	const updatedUser = await alterUser(userId, body.name, body.avatar);
	if (!updatedUser) {
		return reply.status(409).send({
			message: "Error ! Couln't modify user !", errRef:"alterInnerFail"
		});
	};
	return reply.status(200).send(updatedUser);
}

export async function get2fastatusHandler(request, reply)
{
	const status = await get2fastatus(request.user.id)


	return reply.code(200).send({ twofastatus: status.auth2fa });
}

export async function activate2faHandler(request, reply) {
	
	const user = await findUserById(request.user.id)

	if (user.auth2fa)
	return reply.status(403).send({
		message: "2fa already activated !",
		errRef:"2FAIsAlreadyUp"
	});

	const qrCodeSecret = await generateSecret(user.name, user.id)
	return reply.code(200).send({ qrCode: qrCodeSecret });
}

export async function deactivate2faHandler(request, reply) {
	
	const user = await findUserById(request.user.id)

	if (!user.auth2fa)
	return reply.status(403).send({
		message: "2fa already deactivated !",
		errRef:"2FAIsAlreadyDisabled"
	});
	await deletesecret2fa(user.id)
	//send reply that it worked

	return reply.status(200).send({ message: '2fa deactivated successfully'});
}

export async function logoutHandler(request, reply) {

	const token = request.cookies.refreshToken;

	try {
		if (token)
			await deleteRefreshToken(token)
		reply.clearCookie("refresh_token");
		return reply.status(201).send({ message: "Logged out..." });

	} catch (err) {
		return reply.status(403).send({
			message: "Error on logout !"
		});
	}
	
}

export async function editPasswordHandler(request, reply) {
	const body = request.body;
	const user = await findUserById(request.user.id);

	if (!user) {
		return reply.status(404).send({
			message: "User not found in database",
			errRef:"editPasswordInnerFail"
		});
	}

	const isValidPassword = verifyPassword(
		body.oldpassword,
		user.salt,
		user.password);

	if (!isValidPassword) {
		return reply.status(401).send({
			message: "Password is incorrect",
			errRef: "editPwdIncorrectCredentials"
		});
	};

	if (body.password != body.passwordconfirmation) {
		return reply.status(400).send({
			message: "Password confirmation doesn't match with previous password. Try again!"
		});
	}

	await changePassword(user.id, body.newpassword);

	return reply.status(200).send({
		message: "Password edited successfully!"
	});
}

export async function friendRequestHandler(request, reply) {
	const newfriendname = request.body.friendRequestName.toUpperCase();

	const newfriend = await findUserByName(newfriendname)

	if (!newfriend)
	return reply.status(404).send({
		message: "Username doesn't exist. Try again!",
		errRef:"requestUserNotFound"
	});

	if (request.user.id == newfriend.id)
	{
		return reply.status(403).send({
			message: "You can't ask yourself as a friend!",
			errRef:"requestSelfFriend"
		}); 
	}

	if (await alreadyrequested(request.user.id, newfriend.id))
	return reply.status(403).send({
		message: "You already requested this user as a friend, wait for his response first !",
		errRef:"requestStillPending"
	});

	if (await alreadyrequested(newfriend.id, request.user.id))
	return reply.status(422).send({
		message: "This user already sent you a friend request !",
		errRef:"requestDuplicate"
	});

	if (await alreadyfriend(request.user.id, newfriend.id))
	return reply.status(409).send({
		message: "This user is already your friend!",
		errRef:"requestAlreadyFriend"
	});

	await requestfriend(request.user.id, newfriend.id) // can fail ?????? try catch

	return reply.status(200).send({
		message: "Request sent!"
	});
}

function sendToUser(userId, payload) {
	const sockets = userSockets.get(userId);
	if (!sockets) return;

	for (const s of sockets) {
		s.send(JSON.stringify(payload));
	}
}

async function syncPresenceOnFriendAdd(a, b) {

	// A reçoit le statut de B
	if (presenceCount.get(b) > 0) {
		sendToUser(a, {
			type: "presence:update",
			userId: b,
			isOnline: true
		});
	}
	else {
		sendToUser(a, {
			type: "presence:update",
			userId: b,
			isOnline: false
		});
	}

	// B reçoit le statut de A
	if (presenceCount.get(a) > 0) {
		sendToUser(b, {
			type: "presence:update",
			userId: a,
			isOnline:true
		});
	}
	else {
		sendToUser(b, {
			type: "presence:update",
			userId: a,
			isOnline:false
		});
	}
}

export async function friendAcceptHandler(request, reply) {
	const body = request.body;

	const newfriend = await findUserById(body.friendAcceptId)

	if (!newfriend)
	return reply.status(404).send({
		message: "Username doesn't exist. Try again!",
		errRef:"requestUserNotFound"
	});

	if (!await alreadyrequested(newfriend.id, request.user.id))
	return reply.status(403).send({
		message: "This user didn't send you a request, send him one if you want to be friend with him",
		errRef:"requestCantAccept"
	});

	if (await alreadyfriend(request.user.id, newfriend.id))
	return reply.status(409).send({
		message: "This user is already your friend!",
		errRef:"requestAlreadyFriend"
	});

	await acceptfriend(request.user.id, newfriend.id) // can fail ?????? try catch

	await syncPresenceOnFriendAdd(request.user.id, newfriend.id);

	return { friendname: newfriend.name, message: "New friend added !" }; 
}

export async function friendRejectHandler(request, reply) {
	const friendId = request.body.friendRejectId;

	const friend = await findUserById(friendId)

	if (!friend)
	return reply.status(404).send({
		message: "Username doesn't exist. Try again!",
		errRef:"requestUserNotFound"
	});

	if (!await alreadyrequested(friend.id, request.user.id))
	return reply.status(403).send({
		message: "This user didn't send you request",
		errRef:"requestCantAccept"
	});

	if (await alreadyfriend(request.user.id, friend.id))
	return reply.status(409).send({
		message: "This user is already your friend!",
		errRef:"requestAlreadyFriend"
	});

	await rejectfriend(request.user.id, friend.id) // can fail ?????? try catch

	return reply.status(201).send({
		message: "Request rejected !"
	}); 
}

export async function friendDeleteHandler(request, reply) {
	const friendId = request.body.friendDeleteId;

	const friend = await findUserById(friendId)

	if (!friend)
	return reply.status(404).send({
		message: "Username doesn't exist. Try again!",
		errRef:"requestUserNotFound"
	});

	if (!await alreadyfriend(request.user.id, friend.id))
	return reply.status(403).send({
		message: "This user is not your friend!",
		errRef:"deleteNotFriends"
	});

	await deletefriend(request.user.id, friend.id) // can fail ?????? try catch

	return reply.status(200).send({ message: "Friend deleted !", removedName: friend.name });
} 

export async function getFriendRequestHandler(request, reply) {
	const requestsList = await findrequests(request.user.id)

	return reply.status(200).send(requestsList);
}

export async function getFriendsHandler(request, reply) {
	const friendsArray = await findfriends(request.user.id)

	return reply.status(200).send(friendsArray);
}

export async function checkLogStatus(request, reply) {
	return reply.status(200).send({ message: "User is connected !" });
}

export async function uploadProfilePicHandler(request, reply) {

	if (!request.isMultipart || !request.isMultipart())
		return reply.code(400).send({ 
			message: 'Expected multipart/form-data',
			errRef:"uploadNotMultipart"
		});

	const uploadedPic = await request.file();
	if (!uploadedPic) {
		return reply.code(400).send({
			message: "No file uploaded",
			errRef: "uploadNoFile",
		});
	}

	if (!uploadedPic.filename || uploadedPic.filename.trim() === "") {
		return reply.code(400).send({
			message: "Filename cannot be empty !",
			errRef: "uploadNameTooShort",
		});
	}

	if (uploadedPic.file.truncated) {
		return reply.code(400).send({
			message: "File is truncated",
			errRef: "uploadIncomplete",
		});
	}

	const buffer = await uploadedPic.toBuffer();
	if (buffer.length > MAX_FILE_SIZE) {
		return reply.code(413).send({
			message: "File exceeds size limit",
			errRef: "uploadTooLarge",
		});
	}

	const type = await fileTypeFromBuffer(buffer);
	if (!type || !type.mime) {
		return reply.code(400).send({
			message: "Invalid image format",
			errRef: "uploadInvalidSignature",
		});
	}
	if (!ALLOWED_MIME_TYPES.includes(type.mime)) {
		return reply.code(415).send({
			message: "Unauthorized file format",
			errRef: "uploadWrongFiletype",
		});
	}

	
	const ext = path.extname(uploadedPic.filename);
	const savedFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
	
	try {
		const uploadDir = path.resolve(process.cwd(), 'front', 'src', 'img', 'userPfp');
		await fs.promises.mkdir(uploadDir, { recursive: true });
	
		const filePath = path.join(uploadDir, savedFilename);
	
		await fs.promises.writeFile(filePath, buffer);
	} catch (err) {
		return reply.code(403).send({
			message: "Failed to save file",
			errRef: "uploadWriteFailed",
		});
	}
	return reply.code(201).send({ path: `./img/userPfp/${savedFilename}` });
}

async function getFriends(userId) {
  const friends = await findfriends(userId)

  const ids = friends.friends.map(f => f.id);
  friendsCache.set(userId, ids);
  return ids;
}

async function notifyFriends(userId, online) {
  const friends = await getFriends(userId);

  const payload = JSON.stringify({ //use zod
    type: "friend_presence",
    userId,
    online,
  });

  for (const friendId of friends) {
    const sockets = userSockets.get(friendId);
    if (!sockets) continue;

    for (const ws of sockets) {
      ws.send(payload);
    }
  }
}

async function onlineFriend(userId, socket) {
	
	const friendIds = await getFriends(userId);

	const onlineFriends = friendIds.filter(fid =>
		presenceCount.get(fid) > 0
	);

	socket.send(JSON.stringify({
		type: "presence:snapshot",
		onlineFriends
	}));

}

const userSockets = new Map(); // userId -> Set<ws>
const presenceCount = new Map(); // userId -> number
const friendsCache = new Map(); // userId -> number[]

export async function webSocketHandler(connection, request) {
	const socket = connection.socket;
	const token = request.query.token;

	if (!token) {
		socket.close(1008, 'Missing token');
		return;
	}

	let user;
	try {
		const decoded = request.server.jwt.verify(token);
		if (decoded.type != "access"){
		socket.close(1008, 'Invalid token');
		return;
		}
		user = decoded;
	} catch {
		socket.close(1008, 'Invalid token');
		return;
	}

	const userId = user.id;

	// 🔹 envoyer l’état actuel des amis à l’utilisateur qui vient de se connecter
	await onlineFriend(userId, socket)


	// sockets
	if (!userSockets.has(userId)){
		userSockets.set(userId, new Set());
	}
	userSockets.get(userId).add(socket);

	// compteur
	presenceCount.set(userId, (presenceCount.get(userId) ?? 0) + 1);

	// broadcastPresence
	if (presenceCount.get(userId) == 1) {
		await notifyFriends(userId, true);
	}

	socket.on('close', async () => {
		userSockets.get(userId)?.delete(socket);

		const count = presenceCount.get(userId) - 1;
		if (count == 0) {
			presenceCount.delete(userId);
			await notifyFriends(userId, false);
		} else {
			presenceCount.set(userId, count);
		}
	});
}
