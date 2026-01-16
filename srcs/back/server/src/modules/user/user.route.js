// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, check2faHandler, registerUserHandler, dataGrabHandler, alterUserHandler, get2fastatusHandler, activate2faHandler, deactivate2faHandler, editPasswordHandler, friendRequestHandler, friendAcceptHandler, getFriendsHandler, getFriendRequestHandler, friendDeleteHandler, friendRejectHandler, refreshTokenHandler, loginMatchHandler, uploadProfilePicHandler, checkLogStatus } from "./user.controller.js";

async function userRoutes(fastify) {
	fastify.post(
		'/register', 
		{
			schema: {
				body: $ref("createUserSchema"),
				response: {
					201: $ref("loginResponseSchema"),
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
		'/login/loggedUserCheck', 
		{
			preHandler: [fastify.authenticate],
		}, 
		checkLogStatus
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
        loginMatchHandler
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
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					200: $ref("infoGrabResponseSchema"), //reponse et schema de reponse ?
				}
			}
		}, 
		dataGrabHandler
	);

	fastify.post(
		'/profile/edit', 
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("profileChangesSchema"),
				response: {
					200: $ref("profileChangesResponseSchema"), //reponse et schema de reponse ?
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

	fastify.patch(
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

	fastify.patch(
		'/profile/2fa/verify', 
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("twofaSchema"),
				response: {
					201: $ref("twofaResponseSchema"), //reponse et schema de reponse ?
				}
			}
		}, 
		check2faHandler
	);

	fastify.delete(
		'/profile/2fa/deactivate', 
		{
			preHandler: [fastify.authenticate], //reponse et schema de reponse ?
			// schema: {
			//	 body: $ref("profileChangesSchema"),
			//	 response: {
			//		 200: $ref("profileChangesResponseSchema"),
			//	 },
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
				body: $ref("friendRequestSchema"), //reponse et schema de reponse ?
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
				response: {
				    200: $ref("friendAcceptResponseSchema"),
				},
			},
		},
		friendAcceptHandler
	)

	fastify.post(
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
				response: {
				    200: $ref("friendDeleteResponseSchema"),
				},
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
					200: $ref("friendRequestResponseSchema") //reponse et schema de reponse ?
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
					200: $ref("friendsArrayResponseSchema") //reponse et schema de reponse ?
				},
			},
		},
		getFriendsHandler
	)

	fastify.post(
		'/file_upload',
		{
			preHandler: [fastify.authenticate],
			schema: {
				response: {
					201: $ref("fileUploadResponseSchema"),
				}
			}
		},
		uploadProfilePicHandler
	)

}

export default userRoutes;
