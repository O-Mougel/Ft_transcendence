// app.js

import Fastify from "fastify";
import fjwt from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import websocket from '@fastify/websocket'
import userRoutes from "./modules/user/user.route.js";
import matchRoutes from "./modules/match/match.route.js";
import { userSchemas } from './modules/user/user.schema.js';
import { matchSchemas } from './modules/match/match.schema.js'
import { createAIinvited } from "./modules/user/user.service.js";

const fastify = Fastify({logger: true});

fastify.register(fjwt, {
    secret: process.env.JWT_SECRET
});

fastify.register(websocket);

fastify.decorate('login',
	async (request, reply) => {
		const basic = request.headers.authorization;

		if (!basic || !basic.startsWith("Basic ")) {
			return reply.status(401).send({ message: 'Authentication required', errRef:"authBasicMissing"});
		}

		const auth = basic.split(" ")[1];
		const decoded = atob(auth)
		const splited = decoded.split((":"));
		request.name = splited[0]
		request.password = splited[1]
	}
);

fastify.decorate('authenticate',
	async (request, reply) => {
		try {
			const auth = request.headers.authorization;

			if (!auth || !auth.startsWith("Bearer ")) {
				return reply.status(401).send({ message: 'Authentication required', errRef:"authBearerMissing"});
			}
			
			const refresh_token = request.cookies.refresh_token;

			if (!refresh_token) {
				return reply.status(401).send({ message: 'you are logged out, login first !' })
			}

			const token = auth.split(" ")[1];
			const decoded = fastify.jwt.verify(token);
			if (decoded.type != "access")
				return reply.status(401).send({ message: 'Invalid token to access this path' })
			request.user = decoded;
		}
		catch(err) {

			const errCode = err.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(500).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
		}
	}
);

fastify.decorate('logoutauthenticate',
	async (request, reply) => {
		try {
			const auth = request.headers.authorization;

			if (!auth || !auth.startsWith("Bearer ")) {
				return reply.status(401).send({ message: 'Authentication required' , errRef:"authBearerMissing"});
			}

			const token = auth.split(" ")[1];

			const decoded = fastify.jwt.verify(token)
			if (decoded.scope == "match")
				return reply.status(401).send({ message: 'Invalid token to access this path' })
			request.user = decoded
		}
		catch(err) {

			const errCode = err.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(500).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
		}
	}
);

fastify.decorate('twofaauthenticate',
	async (request, reply) => {
		try {
			const auth = request.headers.authorization;

			if (!auth || !auth.startsWith("Bearer ")) {
				return reply.status(401).send({ message: 'Authentication required', errRef:"authBearerMissing"});
			}

			const token = auth.split(" ")[1];
			const decoded = fastify.jwt.verify(token)

			if (decoded.type != "2fa")
				return reply.status(401).send({ message: "token type is not for 2fa!" })
			request.user = decoded
		}
		catch(err) {

			const errCode = err.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(500).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
		}
	}
);

fastify.decorate('matchauthenticate',
	async (request, reply) => {
		try {
			const auth = request.headers.authorization;

			if (!auth || !auth.startsWith("Bearer ")) {
				return reply.status(401).send({ message: 'Authentication required', errRef:"authBearerMissing"});
			}

			const token = auth.split(" ")[1];

			const decoded = fastify.jwt.verify(token)
			if (decoded.type != "match")
				return reply.status(401).send({ message: 'Invalid token to access this path' })
			request.user = decoded
		}
		catch(err) {

			const errCode = err.code;
			if (errCode === "FAST_JWT_EXPIRED")
				return reply.status(403).send({ message: 'Expired JWT Token !', errRef:"expiredJWT"})
			else if (errCode === "FAST_JWT_MALFORMED") 
				return reply.status(403).send({ message: 'Malformed JWT Token !', errRef:"malformedJWT"})
			else
				return reply.status(500).send({ message: 'Couldn\'t verify JWT Token !', errRef:"authenticateOtherError"})
		}
	}
);

fastify.addHook('preHandler', (req, res, next) => {
    req.jwt = fastify.jwt
    return next()
});

fastify.register(fCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: 'preHandler',
})

await fastify.register(import('@fastify/multipart'), { //import for file upload
  limits: { fileSize: 5 * 1024 * 1024 } // about 5MB
});


async function main() {
    for (const schema of [...userSchemas, ...matchSchemas]) {
        fastify.addSchema(schema);
    }

    fastify.register(userRoutes)
    fastify.register(matchRoutes)
	await createAIinvited();

    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Server listening at http://localhost:3000");
        
    } catch (error) {
        console.error(error);
        process.exit(1);    // exit as failure
    }
}

main();
