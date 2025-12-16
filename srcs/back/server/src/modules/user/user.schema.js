// user.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const userCore = {          // define the common user schema
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid"
    }).email(),
    name: z.string()
}

const createUserSchema = z.object({
    ...userCore,        // re-use the userCore object
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

const infoGrabResponseSchema = z.object({
	id: z.number(),
	email: z.string(),
    name: z.string(),
	avatar: z.string(),
});

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
  infoGrabResponseSchema,
},
  { $id: 'userSchemas' },
);
