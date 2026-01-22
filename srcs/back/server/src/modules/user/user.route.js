// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, check2faHandler, registerUserHandler, dataGrabHandler, alterUserHandler, get2fastatusHandler, activate2faHandler, deactivate2faHandler, editPasswordHandler, friendRequestHandler, friendAcceptHandler, getFriendsHandler, getFriendRequestHandler, friendDeleteHandler, friendRejectHandler, refreshTokenHandler, loginMatchHandler, uploadProfilePicHandler, checkLogStatus, webSocketHandler } from "./user.controller.js";
/// for safeParse
import { createUserSchema, loginSchema, twofaSchema, profileChangesSchema, editPasswordSchema, friendRequestSchema, friendAcceptSchema, friendRejectSchema, friendDeleteSchema} from "./user.schema.js";
//

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
			preValidation: async (request, reply) => {
				const parsed = createUserSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
		}, 
		registerUserHandler,
	);
	
	fastify.post(
		'/login', 
		{
			preHandler: [fastify.login],
			schema: {
				response: {
					201: $ref("loginResponseSchema"),
				}
			},
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
            },
			preValidation: async (request, reply) => {
				const parsed = loginSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
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
            },
			preValidation: async (request, reply) => {
				const parsed = twofaSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
        }, 
        check2faHandler
    );

	fastify.post(
        '/login/refresh', 
        {
            schema: {
                response: {
                    200: $ref("accessTokenResponseSchema"),
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
            },
			preValidation: async (request, reply) => {
				const parsed = twofaSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
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

	fastify.get(
		'/profile/grab2', 
		{
			preHandler: [fastify.matchauthenticate],
			schema: {
				response: {
					200: $ref("infoGrabResponseSchema"), //reponse et schema de reponse ?
				}
			}
		}, 
		dataGrabHandler
	);

	fastify.patch(
		'/profile/edit', 
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("profileChangesSchema"),
				response: {
					200: $ref("profileChangesResponseSchema"), //reponse et schema de reponse ?
				},
			},
			preValidation: async (request, reply) => {
				const parsed = profileChangesSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
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
			},
			preValidation: async (request, reply) => {
				const parsed = twofaSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
		}, 
		check2faHandler
	);

	fastify.patch(
		'/profile/2fa/deactivate', 
		{
			preHandler: [fastify.authenticate],
		}, 
		deactivate2faHandler,
	);

	fastify.patch(
		'/profile/password',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("editPasswordSchema"),
			},
			preValidation: async (request, reply) => {
				const parsed = editPasswordSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
		},
		editPasswordHandler
	)

    fastify.post(
        '/logout',
        {
            preHandler: [fastify.logoutauthenticate],
        },
        logoutHandler
    )

	fastify.patch(
		'/friend/request',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendRequestSchema"), //reponse et schema de reponse ?
			},
			preValidation: async (request, reply) => {
				const parsed = friendRequestSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
			},
		},
		friendRequestHandler // returns newFriend even with no response clause
	)

	fastify.patch(
		'/friend/accept',
		{
			preHandler: [fastify.authenticate],
			schema: {
				body: $ref("friendAcceptSchema"),
				response: {
				    200: $ref("friendAcceptResponseSchema"),
				},
			},
			preValidation: async (request, reply) => {
				const parsed = friendAcceptSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
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
			preValidation: async (request, reply) => {
				const parsed = friendRejectSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
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
			preValidation: async (request, reply) => {
				const parsed = friendDeleteSchema.safeParse(request.body);
				if (!parsed.success) {
					const errors = parsed.error.issues.map(i => ({ path: i.path, message: i.message }));
					return reply.code(400).send({ statusCode: 400, error: 'Bad request: Incorrect Zod Parsing !', errContext: errors });
				}
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

	fastify.get(
		'/ws/presence', //parser les messages entrants
		{ 
			websocket: true
		},
		webSocketHandler
	)
}

export default userRoutes;
