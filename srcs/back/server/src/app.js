// app.js

import Fastify from "fastify";
import fjwt from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import userRoutes from "./modules/user/user.route.js";
import matchRoutes from "./modules/match/match.route.js";
import { userSchemas } from './modules/user/user.schema.js';
import { matchSchemas } from './modules/match/match.schema.js'

const fastify = Fastify({logger: true});

fastify.register(fjwt, {
    secret: process.env.JWT_SECRET
});

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

			const decoded = fastify.jwt.verify(token)
			if (decoded.type != "access")
				return reply.status(401).send({ message: 'Invalid token to access this path' })
			request.user = decoded
		} catch(err) {
			return reply.status(401).send({ message: 'Invalid or expired JWT', errRef:"expiredJWT"})
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
		} catch(err) {
			return reply.status(401).send({ message: 'Invalid or expired JWT', errRef:"expiredJWT"})
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
		} catch(err) {
			console.log(" err:", err);
			return reply.status(401).send({ message: 'Invalid or expired JWT', errRef:"expiredJWT"})
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
		} catch(err) {
			return reply.status(401).send({ message: 'Invalid or expired JWT', errRef:"authBearerMissing"})
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

//if not exist create ia and invited player in database 

async function main() {
    for (const schema of [...userSchemas, ...matchSchemas]) {
        fastify.addSchema(schema);
    }

    fastify.register(userRoutes)
    fastify.register(matchRoutes)

    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Server listening at http://localhost:3000");
        
    } catch (error) {
        console.error(error);
        process.exit(1);    // exit as failure
    }
}

main();
