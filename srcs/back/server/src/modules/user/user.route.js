// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, registerUserHandler } from "./user.controller.js";

async function userRoutes(fastify) {
    fastify.post(
        '/userCreation', 
        {
            schema: {
                body: $ref("createUserSchema"),
                response: {
                    201: $ref("createUserResponseSchema"),
                },
            },
        }, 
        registerUserHandler,
    );

	fastify.post(
        '/login', 
        {
            schema: {
                body: $ref("loginSchema"),
                response: {
                    201: $ref("loginResponseSchema"),
                }
            }
        }, 
        loginHandler //add basic authentication scheme base 64 name:password in header
    );

    fastify.delete(
        '/logout',
        {
            preHandler: [fastify.authenticate],
        },
        logoutHandler
    )
}

export default userRoutes;
