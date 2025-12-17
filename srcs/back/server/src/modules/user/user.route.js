// user.route.js

import { $ref } from "./user.schema.js";
import { logoutHandler, loginHandler, registerUserHandler, dataGrabHandler, alterUserHandler } from "./user.controller.js";

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
        '/saveCustomProfileChanges', 
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

	fastify.get(
        '/profileGrab', 
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

	fastify.get(
        '/userCustomizationInfoGrab', 
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

    fastify.delete(
        '/logout',
        {
            preHandler: [fastify.authenticate],
        },
        logoutHandler
    )
}

export default userRoutes;
