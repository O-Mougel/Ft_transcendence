// user.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const userCore = {
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid"
    }).email(),
    name: z.string()
}

const createUserSchema = z.object({
    ...userCore,
    password: z.string({
        required_error: "Password is required"
    })
});//.min(4).max(24); <- regex

const createUserResponseSchema = z.object({
    id: z.number(),
    ...userCore,
});

const loginSchema = z.object({
    name: z.string(),        
    password: z.string()
});

const loginResponseSchema = z.object({
    accessToken: z.string(),
});

//response get profile schema 

const editProfileSchema = z.object({
	newname: z.string(),
	newprofilepicture: z.string(),
	password: z.string()
})

const editProfileResponseSchema = z.object({
    id: z.number(),
    ...userCore,
})

const editPasswordSchema = z.object({
	oldpassword: z.string(),
	newpassword: z.string(),
})

const friendRequestSchema = z.object({
	friendrequestname: z.string(),
})

const friendAcceptSchema = z.object({
	friendacceptname: z.string(),
})

// const friendSchema = z.object({
// 	name: z.string(),
// 	avatar: z.string(),
// 	online: z.boolean(),
// })
//
// const friendRequestResponseSchema = z.object({
// 	requests: friendSchema.array(),
// })
//
// const friendResponseSchema = z.object({
// 	friends: friendSchema.array(),
// })

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
	createUserSchema,
	createUserResponseSchema,
	loginSchema,
	loginResponseSchema,
	editProfileSchema,
	editProfileResponseSchema,
	editPasswordSchema,
	friendRequestSchema,
	friendAcceptSchema,
	// friendResponseSchema,
	// friendRequestResponseSchema,
},
  { $id: 'userSchemas' },
);
