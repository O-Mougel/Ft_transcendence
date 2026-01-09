// user.controller.js

import { createUser, findUserByName, findUserById, alterUser, changePassword, setOnlineStatus, findfriends, findrequests, acceptfriend, alreadyfriend, alreadyrequested, requestfriend, rejectfriend, deletefriend, deletesecret2fa, activate2fa, get2fastatus, saveRefreshToken, findToken, rotateRefreshToken, deleteAllForUser } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import { generateSecret, verify2fa } from "../../utils/twofa.js"

export async function registerUserHandler(request, reply) {
	const body = request.body;

	const name = await findUserByName(body.name);
	// const name = await checkIfUserExists(body.name);

	if (name) {	
		return reply.status(400).send({
			message: "Username already used. Try again!"
		});
	};

	//check for error before sending to database 
	try {
		const user = await createUser(body);
		return reply.status(201).send(user);

	} catch (error) {
		console.error(error);
		return reply.status(500).send({
			message: "Email address already used. Try again!", //doesn't cover enough cases
			error:error
		});
	}
}

export async function dataGrabHandler(request, reply) {

	const userId = request.user && request.user.id;
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !' }); //will never fall here 

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

export async function loginHandler(request, reply) { //check twice the password and confirmation
	const body = request.body;

	//use basic authentication schema
	//check if someone is already logged ??

	const user = await findUserByName(body.name);

	if (!user) {
		return reply.status(400).send({
			message: "Invalid name. Try again!"
		});
	};

	const isValidPassword = verifyPassword(
		body.password,
		user.salt,
		user.password);

	if (!isValidPassword) {
		return reply.status(400).send({
			message: "Password is incorrect"
		});
	};

	if (user.auth2fa) {

		const payload = {
			id: user.id,
			type: "2fa"
		}
		const tempToken = request.server.jwt.sign(payload, { expiresIn: "5m" } );

		return { require2fa: true, Token: tempToken };
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

	return { require2fa: false, Token: accessToken }
}

export async function check2faHandler(request, reply) { //y a t il moyen d'arriver ici quand on est pas sense ?? ajouter un check de 2ffa true dans le token
	const code = request.body.code

	const user = await findUserById(request.user.id)
	if (!user || !user.twofasecret) {
		return reply.status(400).send({
			message: "2fa not configured!"
		});
	};

	const isValid = verify2fa(user.twofasecret, code)

	if (!isValid) {
		return reply.status(400).send({
			message: "Invalid 2FA code"
		});
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

	setOnlineStatus(user.id, true)

	return { accessToken }
}

export async function refreshTokenHandler(request, reply) {
	const token = request.cookies.refresh_token;
	if (!token) return reply.status(401).send({ message: 'Refresh token missing' })

	const stored = await findToken(token)

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
	reply.clearCookie("refresh_token");

	const refreshToken = await rotateRefreshToken(stored.user_id, token)
	const user = await findUserById(stored.user_id);
	const newAccessToken = generateAccessToken(request.server, user);

	reply.setCookie('refresh_token', refreshToken, {
		path: '/',
		maxAge: 14 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	})

	await setOnlineStatus(user.id, true)

	return { newAccessToken }
}

export async function alterUserHandler(request, reply) {

	const body = request.body;  //what we want to change
	const userId = request.user && request.user.id; // who made the request (token)
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !' });

	const target = await findUserById(userId);
	if (!target) {
		return reply.status(400).send({
			message: "Error ! Couln't find user !"
		});
	};

	// Verify password
	const isValidPassword = verifyPassword(
		body.password,
		target.salt,
		target.password);

	if (!isValidPassword) {
		return reply.status(400).send({
			message: "Password is incorrect"});
	};

	if (target.name != body.name)
	{
		const newname = await findUserByName(body.name);
		if (newname) {	
			return reply.status(400).send({
				message: "Username already used. Try again!"
			});
		};
	}

	const updatedUser = await alterUser(userId, body.name, body.avatar);
	if (!updatedUser) {
		return reply.status(400).send({
			message: "Error ! Couln't modify user !"
		});
	};
	return reply.status(200).send(updatedUser); // not really needed, just to send something
}

export async function get2fastatusHandler(request, reply)
{
	const status = await get2fastatus(request.user.id)

	return { twofastatus: status.auth2fa }
}

export async function activate2faHandler(request, reply) {//request.user doesn't have auth2fa need to get user
	const user = await findUserById(request.user.id) 

	if (user.auth2fa)
	return reply.status(400).send({
		message: "2fa already activated !"
	});

	const qrCode = await generateSecret(user.name, user.id)
	return { qrCode }
}

export async function deactivate2faHandler(request, reply) { //request.user doesn't have auth2fa need to get user

	const user = await findUserById(request.user.id) 

	if (!user.auth2fa)
	return reply.status(400).send({
		message: "2fa not activated !"
	});
	await deletesecret2fa(user.id)
	//send reply that it worked

	return reply.status(200).send({ message: '2fa deactivated successfully'});
}

export async function logoutHandler(request, reply) {
	const token = request.cookies.refreshToken;

	if (token)
		deleteRefreshToken(token)

	reply.clearCookie("refresh_token");

	setOnlineStatus(request.user.id, false)

	return reply.status(204).send();
}

export async function editPasswordHandler(request, reply) { //check twice the password and confirmation
	const body = request.body;

	const isValidPassword = verifyPassword(
		body.oldpassword,
		user.salt,
		user.password);

	if (!isValidPassword) {
		return reply.status(400).send({
			message: "Password is incorrect"
		});
	};

	const newuser = changePassword(user.id, body.newpassword);

	return { newuser }
}

export async function friendRequestHandler(request, reply) {
	const newfriendname = request.body.friendRequestName;

	const newfriend = await findUserByName(newfriendname)

	if (!newfriend)
	return reply.status(400).send({
		message: "Username doesn't exist. Try again!"
	});

	if (request.user.id == newfriend.id)
	{
		return reply.status(400).send({
			message: "You can't ask yourself as a friend!"
		}); 
	}

	if (await alreadyrequested(request.user.id, newfriend.id))
	return reply.status(400).send({
		message: "You already requested this user as a friend, just be patient and wait for his response"
	});

	if (await alreadyfriend(request.user.id, newfriend.id))
	return reply.status(400).send({
		message: "This user is already your friend!"
	});

	await requestfriend(request.user.id, newfriend.id)

	return { newfriend } // not sure
}

export async function friendAcceptHandler(request, reply) {
	const newfriendname = request.body.friendAcceptName;

	const newfriend = await findUserByName(newfriendname)

	if (!newfriend)
	return reply.status(400).send({
		message: "Username doesn't exist. Try again!"
	});

	if (!await alreadyrequested(newfriend.id, request.user.id))
	return reply.status(400).send({
		message: "This user didn't send you request, make one yourself if you want to be friend with him"
	});

	if (await alreadyfriend(request.user.id, newfriend.id))
	return reply.status(400).send({
		message: "This user is already your friend!"
	});

	await acceptfriend(request.user.id, newfriend.id)

	// return { newfriend } // NOT SURE
	return reply.status(201).send({
		message: "New friend added !"
	}); 
}

export async function friendRejectHandler(request, reply) {
	const friendname = request.body.friendrejectname;

	const friend = await findUserByName(friendname)

	if (!friend)
	return reply.status(400).send({
		message: "Username doesn't exist. Try again!"
	});

	if (!await alreadyrequested(friend.id, request.user.id))
	return reply.status(400).send({
		message: "This user didn't send you request"
	});

	if (await alreadyfriend(request.user.id, friend.id))
	return reply.status(400).send({
		message: "This user is already your friend!"
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
	return reply.status(400).send({
		message: "Username doesn't exist. Try again!"
	});

	if (!await alreadyfriend(request.user.id, friend.id))
	return reply.status(400).send({
		message: "This user is not your friend!"
	});

	await deletefriend(request.user.id, friend.id)
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
