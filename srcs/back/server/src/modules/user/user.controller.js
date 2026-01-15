// user.controller.js

//// For File upload
import fs from 'fs';
import path from 'path'; //save path manip
import crypto from 'crypto'; //random file name
import { pipeline } from 'stream/promises'; //file writing
/////
import { createUser, findUserByName, findUserById, alterUser, changePassword, setOnlineStatus, findfriends, findrequests, acceptfriend, alreadyfriend, alreadyrequested, requestfriend, rejectfriend, deletefriend, deletesecret2fa, activate2fa, get2fastatus, saveRefreshToken, findToken, rotateRefreshToken, deleteAllForUser, deleteRefreshToken } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, generate2faToken, generateMatchToken } from "../../utils/token.js";
import { generateSecret, verify2fa } from "../../utils/twofa.js"

export async function registerUserHandler(request, reply) {
	
	const body = request.body;
	const name = await findUserByName(body.name);

	if (name) {	
		return reply.status(409).send({
			message: "Username already used. Try again!",
			errRef:"registerNameTaken"
		});
	};

	//check for error before sending to database 
	try {
		const user = await createUser(body);
		return reply.status(201).send(user);

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
		return reply.status(500).send({
			message: "User info could not be grabbed !",
			error:error
		});
	}
}

export async function loginHandler(request, reply) {
	const body = request.body;

	//use basic authentication schema
	//check if someone is already logged ??

	const user = await findUserByName(body.name);

	if (!user) {
		return reply.status(404).send({
			message: "Invalid name. Try again!",
			errRef:"loginInvalidName"
		});
	};

	const isValidPassword = verifyPassword(
		body.password,
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

		return { require2fa: true, token: tempToken };
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

	setOnlineStatus(user.id, true)

	return { require2fa: false, token: accessToken }
}

export async function loginMatchHandler(request, reply) {
	const body = request.body;

	//use basic authentication schema

	const user = await findUserByName(body.name);

	if (!user) {
		return reply.status(404).send({
			message: "Invalid name. Try again!",
			errRef:"loginMatchUserNotFound"
		});
	};

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

		return { require2fa: true, Token: tempToken };
	}

	const matchToken = generateMatchToken(request.server, user);

	return { require2fa: false, Token: matchToken }

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

		return { matchToken }
	}

	if (!user.auth2fa) {
		await activate2fa(user.id)
		return { message: "2fa activated !" }
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

	await setOnlineStatus(user.id, true)

	return { newAccessToken: accessToken }
}

export async function refreshTokenHandler(request, reply) {
	const token = request.cookies.refresh_token;
	if (!token) return reply.status(412).send({ message: 'Refresh token missing' })

	const stored = await findToken(token)

	reply.clearCookie("refresh_token");

	if (!stored) {
		return reply.status(403).send({ message: "Invalid refresh_token !" });
	}
	
	await setOnlineStatus(stored.user_id, false)

	const now = Date.now()
	if (stored.expires_at < now) {
		await deleteAllForUser(stored.user_id)
		return reply.status(403).send({ message: "Expired refresh_token !" });
	}

	// rotation

	const refreshToken = await rotateRefreshToken(stored.user_id, token)
	const user = await findUserById(stored.user_id);
	const newAccessToken = generateAccessToken(request.server, user);
	reply.setCookie('refresh_token', refreshToken, {
		path: '/',
		// maxAge: 10000,
		maxAge: 14 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	})

	await setOnlineStatus(user.id, true)

	return { newAccessToken }
}

export async function alterUserHandler(request, reply) {

	const body = request.body;	//what we want to change
	const userId = request.user && request.user.id; // who made the request (token)
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !', errRef:"NotAuthUser" });

	const target = await findUserById(userId);
	if (!target) {
		return reply.status(404).send({
			message: "Error ! Couln't find user !", errRef:"alterUserNotFound"
		});
	};

	// Verify password
	const isValidPassword = verifyPassword(
		body.password,
		target.salt,
		target.password);

	if (!isValidPassword) {
		return reply.status(401).send({
			message: "Password is incorrect", errRef:"alterPwdIncorrect"});
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
		return reply.status(500).send({
			message: "Error ! Couln't modify user !", errRef:"alterInnerFail"
		});
	};
	return reply.status(200).send(updatedUser);
}

export async function get2fastatusHandler(request, reply)
{
	const status = await get2fastatus(request.user.id)

	return { twofastatus: status.auth2fa }
}

export async function activate2faHandler(request, reply) {
	
	const user = await findUserById(request.user.id)

	if (user.auth2fa)
	return reply.status(403).send({
		message: "2fa already activated !",
		errRef:"2FAIsAlreadyUp"
	});

	const qrCode = await generateSecret(user.name, user.id)
	return { qrCode }
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
		await setOnlineStatus(request.user.id, false)
		if (token)
			deleteRefreshToken(token)
		reply.clearCookie("refresh_token");
		return reply.status(201).send({ message: "Logged out..." });

	} catch (err) {
		return reply.status(500).send({
			message: "Internal server error on logout !"
		});
	}
	
}

export async function editPasswordHandler(request, reply) { //check twice the password and confirmation
	
	const body = request.body;
	const user = await findUserById(request.user.id);

	if (!user) {
		return reply.status(500).send({
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

	changePassword(user.id, body.newpassword);

	return reply.status(200).send({
		message: "Password edited successfully!"
	});
	// return { newuser } //DO NOT SEND THE ENTIRE USER
}

export async function friendRequestHandler(request, reply) {
	const newfriendname = request.body.friendRequestName;

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

	if (await alreadyfriend(request.user.id, newfriend.id))
	return reply.status(409).send({
		message: "This user is already your friend!",
		errRef:"requestAlreadyFriend"
	});

	await requestfriend(request.user.id, newfriend.id) //try catch ?

	return reply.status(200).send({
		message: "Request sent!"
	});
}

export async function friendAcceptHandler(request, reply) {
	const newfriendname = request.body.friendAcceptName;

	const newfriend = await findUserByName(newfriendname)

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

	await acceptfriend(request.user.id, newfriend.id)

	// return { newfriend } // NO
	return reply.status(201).send({
		message: "New friend added !"
	}); 
}

export async function friendRejectHandler(request, reply) {
	const friendname = request.body.friendrejectname;

	const friend = await findUserByName(friendname)

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

	await rejectfriend(request.user.id, friend.id) // can fail ??????

	return reply.status(201).send({
		message: "Request rejected !"
	}); 
}

export async function friendDeleteHandler(request, reply) {
	const friendname = request.body.frienddeletename;

	const friend = await findUserByName(friendname)

	if (!friend)
	return reply.status(404).send({
		message: "Username doesn't exist. Try again!",
		errRef:"requestUserNotFound"
	});

	if (!await alreadyfriend(request.user.id, friend.id))
	return reply.status(403).send({
		message: "This user is not your friend!",
		errRef:"deteteNotFriends"
	});

	await deletefriend(request.user.id, friend.id)
	return reply.status(200).send({ message: "Friend deleted !" });
} 

export async function getFriendRequestHandler(request, reply) {
	const requestsList = await findrequests(request.user.id)

	// return { requests }
	return reply.status(201).send(requestsList);
}

export async function getFriendsHandler(request, reply) {
	const friendsArray = await findfriends(request.user.id) //check if user.id is read before that ?

	return reply.status(201).send(friendsArray);
}

export async function checkLogStatus(request, reply) {
	return reply.status(200).send({ message: "User is connected !" });
}

export async function uploadProfilePicHandler(request, reply) {

	if (!request.isMultipart || !request.isMultipart()) // we check if it exists first
		return reply.code(400).send({ 
			message: 'Expected multipart/form-data',
			errRef:"uploadNotMultipart"
		});

	const uploadedPic = await request.file(); // first file field
	if (!uploadedPic)
		return reply.code(400).send({
			message: 'No picture uploaded !',
			errRef:"uploadEmptyFileField"
		});

	const mimetype = (uploadedPic.mimetype || '').toLowerCase();
	if (!mimetype || !uploadedPic.filename)
		return reply.code(400).send({
			message: 'Mime type or filename is empty !',
			errRef:"uploadEmptyMimeName"
		});
	if (uploadedPic.filename.length <= 0)
		return reply.code(400).send({
			message: 'Invalid filename ! Must be at least 1 character !',
			errRef:"uploadNameTooShort"
		});
	if (!mimetype.startsWith('image/'))
		return reply.code(400).send({
			message: 'Only images can be uploaded !',
			errRef:"uploadWrongFiletype"
		});

	//file upload part 
	const ext = path.extname(uploadedPic.filename) || '.png'; // if idk, now a png
	const savedFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
	const uploadDir = path.resolve(process.cwd(), 'front', 'src', 'img', 'userPfp');
	await fs.promises.mkdir(uploadDir, { recursive: true });
	const dest = path.join(uploadDir, savedFilename);
	console.log("Final upload : ", dest);
	try {
		await pipeline(uploadedPic.file, fs.createWriteStream(dest));
	}
	catch (err) 
	{
		return reply.code(500).send({ 
			message: 'Failed to write file',
			errRef:"uploadFailedWrite"
		});
	}
	return reply.code(201).send({ path: `./img/userPfp/${savedFilename}` });
}

