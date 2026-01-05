// user.controller.js

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { createUser, findUserByName, findUserById, alterUser, changePassword, setOnlineStatus, findfriends, findrequests, acceptfriend, alreadyfriend, alreadyrequested, requestfriend, rejectfriend, deletefriend, savesecret2fa, deletesecret2fa, activate2fa, get2fastatus } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";

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

export async function loginHandler(request, reply) {
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
		const tempToken = request.jwt.sign(payload, request.jwt.secret, { expiresIn: "5min" } );

		reply.setCookie('temp_token', tempToken, {
			path: '/',
			maxAge: 1000,
			httpOnly: true,
			secure: true,
		})

		return { require2fa: true, Token: tempToken };
	}

	const payload = {
		id: user.id,
        email: user.email,
        name: user.name,
    }
    const token = request.jwt.sign(payload, request.jwt.secret, { expiresIn: "30min" } );

    reply.setCookie('access_token', token, {
        path: '/',
        maxAge: 1000,
        httpOnly: true,
        secure: true,
    })

	setOnlineStatus(user.id, true)

    return { require2fa: false, Token: token }
}

export async function check2faHandler(request, reply) {
	const code = request.body.code

	// // middleware auth temporaire
	// const payload = verifyTempToken(req.headers.authorization);
	// const userId = payload.userId;
	//
	// const user = await prisma.user.findUnique({ where: { id: userId } });
	//
	//
	//
	//
	//if (request.user.type == "2fa")
	//refuse if no password previousely

	const user = await findUserById(request.user.id)
	if (!user || !user.twofasecret) {
		return reply.status(400).send({
			message: "2fa non configure!"
		});
	};

	const isValid = speakeasy.totp.verify({
		secret: user.twofasecret,
		encoding: 'base32',
		token: code,
		window: 1
	});

	if (!isValid) {
		return reply.status(400).send({
			message: "Code 2FA invalide"
		});
	}

	if (!user.auth2fa) {
		await activate2fa(user.id)
		return { message: "2fa activated !" }
	}

	else {
		const payload = {
			id: user.id,
			email: user.email,
			name: user.name,
		}
		const token = request.jwt.sign(payload, request.jwt.secret, { expiresIn: "30min" } );
		reply.clearCookie('temp_token');

		reply.setCookie('access_token', token, {
			path: '/',
			maxAge: 1000,
			httpOnly: true,
			secure: true,
		})

		await setOnlineStatus(user.id, true)

		return { accessToken: token }
	}
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
	// add activation of 2fa authentification
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

export async function activate2faHandler(request, reply) {
	
	const user = await findUserById(request.user.id)

	if (user.auth2fa)
        return reply.status(400).send({
            message: "2fa already activated !"
        });
		
	const secret = speakeasy.generateSecret({
		name: `Ft_transcendence (${user.name})`
	});

	const qrCode = await QRCode.toDataURL(secret.otpauth_url);
	await savesecret2fa(user.id, secret.base32)
	return { qrCode: qrCode }
}

export async function deactivate2faHandler(request, reply) {
	
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
    reply.clearCookie('access_token');

	// setOnlineStatus(request.user.id, false)

    return reply.status(200).send({ message: 'Logout successfully'});
}

export async function editPasswordHandler(request, reply) {
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
