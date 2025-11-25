// user.controller.ts

import { createUser, findUserByEmail } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";

export async function registerUserHandler(request, reply) {
    const body = request.body;

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

    // Find a user by email 
    const user = await findUserByEmail(body.email);

    if (!user) {
        return reply.status(400).send({
            message: "Invalid email address. Try again!"
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
    const token = request.jwt.sign(payload);

    reply.setCookie('access_token', token, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,    // for a week
        httpOnly: true,
        secure: true,
    })

    return { accessToken: token }
}
