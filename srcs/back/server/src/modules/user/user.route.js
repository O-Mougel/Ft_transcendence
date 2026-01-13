// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, check2faHandler, registerUserHandler, dataGrabHandler, alterUserHandler, get2fastatusHandler, activate2faHandler, deactivate2faHandler, editPasswordHandler, friendRequestHandler, friendAcceptHandler, getFriendsHandler, getFriendRequestHandler, friendDeleteHandler, friendRejectHandler, refreshTokenHandler, loginMatchHandler } from "./user.controller.js";

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
        '/login/player2', 
        {
			preHandler: [fastify.authenticate],
            schema: {
                body: $ref("loginSchema"),
                response: {
                    201: $ref("loginResponseSchema"),
                }
            }
        }, 
        loginMatchHandler //add basic authentication scheme base 64 name:password in header
    );

	fastify.post(
        '/login/player2/2fa', 
        {
			preHandler: [fastify.twofaauthenticate],
            schema: {
                body: $ref("twofaSchema"),
                response: {
                    201: $ref("accessTokenResponseSchema"),
                }
            }
        }, 
        check2faHandler
    );

	fastify.post(
        '/login/refresh', 
        {
            schema: {
                response: {
                    201: $ref("accessTokenResponseSchema"),
                }
            }
        }, 
        refreshTokenHandler
    );

	fastify.post(
        '/login/2fa', 
        {
			preHandler: [fastify.twofaauthenticate],
            schema: {
                body: $ref("twofaSchema"),
                response: {
                    201: $ref("accessTokenResponseSchema"),
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

	fastify.get(
        '/profile/2fa', 
        {
			preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: $ref("twofastatusResponseSchema"),
                },
            },
        }, 
        get2fastatusHandler,
    );

	fastify.post(
        '/profile/2fa/activate', 
        {
			preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: $ref("qrCodeReplySchema"),
                },
            },
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
            preHandler: [fastify.logoutauthenticate],
        },
        logoutHandler
    )

	fastify.post(
		'/friend/request',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendRequestSchema"),
			},
		},
		friendRequestHandler // returns newFriend even with no response clause
	)

	fastify.post(
		'/friend/accept',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendAcceptSchema"),
			},
		},
		friendAcceptHandler
	)

	fastify.post(
		'/friend/reject',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendRejectSchema"),
			},
		},
		friendRejectHandler
	)

	fastify.delete(
		'/friend/delete',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendDeleteSchema"),
			},
		},
		friendDeleteHandler
	)

	fastify.get(
		'/friend/requested',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					200: $ref("friendRequestResponseSchema")
				},
			},
		},
		getFriendRequestHandler
	)

	fastify.get(
		'/friend',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					200: $ref("friendsArrayResponseSchema")
				},
			},
		},
		getFriendsHandler
	)

}

export default userRoutes;
