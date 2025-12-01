// user.route.ts

import { $ref } from "./user.schema.js";
import { logoutHandler, getUsersHandler, loginHandler, registerUserHandler } from "./user.controller.js";

async function userRoutes(fastify) {
    fastify.post(
        '/', 
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
        loginHandler
    );

    fastify.get(
        '/',
        {
            preHandler: [fastify.authenticate],
        },
        getUsersHandler
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
