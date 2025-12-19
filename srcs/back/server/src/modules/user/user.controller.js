// user.controller.js

import { createUser, findUserByName, findUserById, changeProfileInfo, changePassword, setOnlineStatus, findfriends, findrequests, acceptfriend, alreadyfriend, alreadyrequested, requestfriend } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";

export async function registerUserHandler(request, reply) { //respect 
    const body = request.body;

    const name = await findUserByName(body.name);

    if (name) {	
        return reply.status(400).send({
            message: "Username already used. Try again!"
        });
    };

    try {
        const user = await createUser(body);
        return reply.status(201).send(user);
        
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            message: "Email address already used. Try again!",
			error:error
        });
    }
}

export async function loginHandler(request, reply) {
    const body = request.body;

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

	//check 2fa and send 2fa if so 

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

    return { accessToken: token }
}

export async function logoutHandler(request, reply) {
    reply.clearCookie('access_token');

	setOnlineStatus(request.user.id, false)

    return reply.status(201).send({ message: 'Logout successfully' })
}

export async function profileHandler(request, reply) {
	return findUserById(request.user.id) //faire une autre fonction qui selectionne seulement ce qu'on veux renvoyer 
}

export async function editProfileHandler(request, reply) {
	const body = request.body;

    const user = await findUserById(request.user.id);

    if (!user) {
        return reply.status(400).send({
            message: "Invalid id. Try again!"
        });
    };

    const newname = await findUserByName(body.newname);

    if (newname) {	
        return reply.status(400).send({
            message: "Username already used. Try again!"
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

	//avoir une meilleur gestion de la profile picture plutot que juste stocker le path ici mais comment faire ??

	const newuser = changeProfileInfo(user.id, body.newname, body.newprofilepicture)

    return { newuser }
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
	const newfriendname = request.body.friendrequestname;

	const newfriend = await findUserByName(newfriendname)

	if (!newfriend)
        return reply.status(400).send({
            message: "Username doesn't exist. Try again!"
        });
	//ne pas se demander soit meme en ami
	
	if (alreadyrequested(request.user.id, newfriend.id))
        return reply.status(400).send({
            message: "You already requested this user as a friend, just be patient and wait for his response"
        });

	if (alreadyfriend(request.user.id, newfriend.id))
        return reply.status(400).send({
            message: "This user is already your friend!"
        });

	requestfriend(request.user.id, newfriend.id)
	
    return { newfriend }
}

export async function friendAcceptHandler(request, reply) {
	const newfriendname = request.body.friendacceptname;

	const newfriend = await findUserByName(newfriendname)

	if (!newfriend)
        return reply.status(400).send({
            message: "Username doesn't exist. Try again!"
        });
	
	if (!alreadyrequested(newfriend.id, request.user.id))
        return reply.status(400).send({
            message: "This user didn't send you request, make one yourself if you want to be friend with him"
        });

	// if (alreadyfriend(request.user.id, newfriend.id))
 //        return reply.status(400).send({
 //            message: "This user is already your friend!"
 //        });

	await acceptfriend(request.user.id, newfriend.id)

	return { newfriend }
}

export async function getFriendRequestHandler(request, reply) {
	const requests = await findrequests(request.user.id)
	
	return { requests }
}

export async function getFriendHandler(request, reply) {
	const friends = await findfriends(request.user.id)

	return { friends }
}
