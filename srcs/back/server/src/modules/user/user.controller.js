// user.controller.js

import { createUser, findUserByName, grabUserByID, alterUser } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";

export async function registerUserHandler(request, reply) {
    const body = request.body;

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
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !' });

    try {
        const user = await grabUserByID(userId);
		if (!user) return reply.code(404).send({ message: 'User not found using access token' });
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

    // Find a user by email 
    const user = await findUserByName(body.name);

    if (!user) {
        return reply.status(400).send({
            message: "Invalid name. Try again!"
        });
    };

    // Verify password
    const isValidPassword = verifyPassword(
        body.password,
        user.salt,
        user.password);

    if (!isValidPassword) {
        return reply.status(400).send({
            message: "Password is incorrect"
        });
    };

    // Generate access token
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

    return { accessToken: token }
}

export async function alterUserHandler(request, reply) {

    const body = request.body;  //what we want to change
	const userId = request.user && request.user.id; // who made the request (token)
	if (!userId) return reply.code(401).send({ message: 'Not authenticated !' });

	const target = await grabUserByID(userId);
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
            message: "Password is incorrect"
        });
    };

	const updatedUser = await alterUser(userId, body.name, body.avatar);
	if (!updatedUser) {
        return reply.status(400).send({
            message: "Error ! Couln't modify user !"
        });
    };
	return reply.status(200).send(updatedUser); // not really needed, just to send something
}

export async function logoutHandler(request, reply) {
    reply.clearCookie('access_token');

    return reply.status(200).send({ message: 'Logout successfully' })
	// i switched 201 into 200 but i'm not sure
}
