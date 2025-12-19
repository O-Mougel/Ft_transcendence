// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, registerUserHandler, profileHandler, editProfileHandler, editPasswordHandler, friendRequestHandler, friendAcceptHandler, getFriendHandler, getFriendRequestHandler } from "./user.controller.js";

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
        loginHandler //add basic authentication scheme base 64 name:password in header
    );

    fastify.delete(
        '/logout',
        {
            preHandler: [fastify.authenticate],
        },
        logoutHandler
    )

	fastify.get(
		'/profile',
		{
            preHandler: [fastify.authenticate], //faire un scheme de reponse 
		},
		profileHandler
	)

	fastify.post(
		'/profile/edit',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("editProfileSchema"),
				response: {
					201: $ref("editProfileResponseSchema")
				},
			},
		},
		editProfileHandler
	)

	fastify.post(
		'/profile/password',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("editPasswordSchema"), //reponse et schema de reponse ?
			},
		},
		editPasswordHandler
	)

	fastify.post(
		'/friend/request',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendRequestSchema"), //reponse et schema de reponse ?
			},
		},
		friendRequestHandler
	)

	fastify.post(
		'/friend/accept',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendAcceptSchema"), //reponse et schema de reponse ?
			},
		},
		friendAcceptHandler
	)

	fastify.get(
		'/friend/requested',
		{
			preHandler: [fastify.authenticate],
			// schema: {
			// 	response: {
			// 		200: $ref("friendRequestResponseSchema")
			// 	},
			// },
		},
		getFriendRequestHandler
	)

	fastify.get(
		'/friend',
		{
			preHandler: [fastify.authenticate],
			// schema: {
			// 	response: {
			// 		200: $ref("friendResponseSchema")
			// 	},
			// },
		},
		getFriendHandler
	)

	//ajouter reject and delete friend

}

export default userRoutes;
