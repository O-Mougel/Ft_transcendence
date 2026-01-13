// utils/token.ts

import crypto from 'crypto';

export function generateAccessToken(fastify, user) {
	
	const payload = {
		id: user.id,
        name: user.name,
		type: "access",
		scope: "all"
    }

    return fastify.jwt.sign(payload, { expiresIn: "15min" } );
}

export function generate2faToken(fastify, user) {
	
	const payload = {
		id: user.id,
        name: user.name,
		type: "2fa",
		scope: "auth"
    }

    return fastify.jwt.sign(payload, { expiresIn: "5m" } );
}

export function generate2faMatchToken(fastify, user) {
	
	const payload = {
		id: user.id,
        name: user.name,
		type: "2fa",
		scope: "match"
    }

    return fastify.jwt.sign(payload, { expiresIn: "5m" } );
}

export function generateMatchToken(fastify, user) {
	
	const payload = {
		id: user.id,
        name: user.name,
		type: "match",
		scope: "match"
    }

    return fastify.jwt.sign(payload, { expiresIn: "30m" } );
}

export function generateRefreshToken() {
	return crypto.randomBytes(64).toString("hex");
}
//
// export function verifyToken(fastify, auth) {
// 	try {
// 		if (!auth || !auth.startsWith("Bearer ")) {
// 			return reply.status(401).send({ message: 'Authentication required'});
// 		}
//
// 		const token = auth.split(" ")[1];
//
// 		const decoded = fastify.jwt.verify(token)
// 		request.user = decoded
// 	} catch(err) {
// 		return reply.status(401).send({ message: 'Invalid or expired JWT'})
// 	}
// }
