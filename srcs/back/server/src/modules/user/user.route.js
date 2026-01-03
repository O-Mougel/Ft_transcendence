// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, check2faHandler, registerUserHandler, dataGrabHandler, alterUserHandler, activate2faHandler, deactivate2faHandler, editPasswordHandler, friendRequestHandler, friendAcceptHandler, getFriendHandler, getFriendRequestHandler, friendDeleteHandler, friendRejectHandler } from "./user.controller.js";

async function userRoutes(fastify) {
    fastify.post(
        '/register', 
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

	fastify.post(
        '/login/2fa', 
        {
			preHandler: [fastify.twofaauthenticate], //forces log to see user profile
            schema: {
                body: $ref("twofaSchema"),
                response: {
                    201: $ref("twofaResponseSchema"),
                }
            }
        }, 
        check2faHandler
    );

	fastify.get(
        '/profile/grab', 
        {
			preHandler: [fastify.authenticate], //forces log to see user profile
            schema: {
                response: {
                    200: $ref("infoGrabResponseSchema"),
                }
            }
        }, 
        dataGrabHandler
    );

	fastify.post(
        '/profile/edit', 
        {
			preHandler: [fastify.authenticate], //forces log to see user profile
            schema: {
                body: $ref("profileChangesSchema"),
                response: {
                    200: $ref("profileChangesResponseSchema"),
                },
            },
        }, 
        alterUserHandler,
    );

	fastify.post(
        '/profile/2fa/activate', 
        {
			preHandler: [fastify.authenticate],
            // schema: {
            //     body: $ref("profileChangesSchema"),
            //     response: {
            //         200: $ref("profileChangesResponseSchema"),
            //     },
            // },
        }, 
        activate2faHandler,
    );

	fastify.post(
        '/profile/2fa/verify', 
        {
			preHandler: [fastify.authenticate],
            schema: {
                body: $ref("twofaSchema"),
                response: {
                    201: $ref("twofaResponseSchema"),
                }
            }
        }, 
        check2faHandler
    );

	fastify.delete(
        '/profile/2fa/deactivate', 
        {
			preHandler: [fastify.authenticate],
            // schema: {
            //     body: $ref("profileChangesSchema"),
            //     response: {
            //         200: $ref("profileChangesResponseSchema"),
            //     },
            // },
        }, 
        deactivate2faHandler,
    );

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

    fastify.delete(
        '/logout',
        {
            preHandler: [fastify.authenticate],
        },
        logoutHandler
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

	fastify.delete(
		'/friend/reject',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendRejectSchema"), //reponse et schema de reponse ?
			},
		},
		friendRejectHandler
	)

	fastify.delete(
		'/friend/delete',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendDeleteSchema"), //reponse et schema de reponse ?
			},
		},
		friendDeleteHandler
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
