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

fastify.decorate(
    'authenticate',
    async (request, reply) => {
        const token = request.cookies.access_token;

        if (!token) {
            return reply.status(401).send({ message: 'Authentication required', errcode:401 })
        }
        const decoded = request.jwt.verify(token)
        request.user = decoded
    }
);

fastify.decorate(
    'twofaauthenticate',
    async (request, reply) => {
        const token = request.cookies.temp_token;

        if (!token) {
            return reply.status(401).send({ message: 'Authentication required', errcode:401 })
        }
        const decoded = request.jwt.verify(token)
        request.user = decoded
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

    fastify.register(userRoutes)//, {prefix: 'api/users'})
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
