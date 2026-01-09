// utils/token.ts

import crypto from 'crypto';

export function generateAccessToken(fastify, user) {
	
	const payload = {
		id: user.id,
        email: user.email,
        name: user.name,
    }

    return fastify.jwt.sign(payload, { expiresIn: "15m" } );
}

export function generateRefreshToken() {
	return crypto.randomBytes(64).toString("hex");
}

