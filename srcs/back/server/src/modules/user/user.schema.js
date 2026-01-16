// user.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const createUserSchema = z.object({
	email: z.string({
		required_error: "Email is required",
		invalid_type_error: "Email is not valid"
	}).email(),
	name: z.string().min(3).max(13).regex(/^[a-zA-Z0-9_]+$/),
	password: z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
	passwordconfirmation: z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
});

const profileChangesSchema = z.object({
	name: z.string().min(3).max(13).regex(/^[a-zA-Z0-9_]+$/),
	password: z.string().min(1),
	avatar: z.string().min(1), //quel pattern verifier ici en regex ??
});

const profileChangesResponseSchema = z.object({
	id: z.number(),
});

const loginSchema = z.object({
	name: z.string().min(1).max(13).regex(/^[a-zA-Z0-9_]+$/), //only one here to allow older accounts but still block empty fields
	password: z.string().min(1).max(32)
});

const loginResponseSchema = z.object({
	require2fa: z.boolean(),
	token: z.string().min(1),
});

const qrCodeReplySchema = z.object({
	qrCode: z.string().min(1).url()
})

const twofaSchema = z.object({
	code: z.string().min(6).max(6).regex(/^[0-9]{6,6}$/),
})

const twofastatusResponseSchema = z.object({
  twofastatus: z.boolean()
})

const twofaResponseSchema = z.object({
	success: z.boolean(),
	message: z.string().min(1)
})

const accessTokenResponseSchema = z.object({
	newAccessToken: z.string().min(1),
});

const infoGrabResponseSchema = z.object({
	id: z.number(),
	email: z.string().min(1),
	name: z.string().min(1),
	avatar: z.string().min(1),
});

const editPasswordSchema = z.object({
	oldpassword: z.string().min(1),
	newpassword: z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),
	newpasswordconfirmation: z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),
})

const friendRequestSchema = z.object({
	friendRequestName: z.string().min(3).max(13).regex(/^[a-zA-Z0-9_]+$/),
})

const friendAcceptSchema = z.object({
	friendAcceptId: z.number()
})

const friendRejectSchema = z.object({
	friendRejectId: z.number()
})

const friendDeleteSchema = z.object({
	friendDeleteId: z.number()
})

const friendItemSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	avatar: z.string().min(1),
	online: z.boolean(),
});

const friendsArrayResponseSchema = z.object({
	friends: z.array(friendItemSchema)
});

const friendRequestItemSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	avatar: z.string().min(1),
	online: z.boolean(),
});

const friendRequestResponseSchema = z.object({
	requestOf: z.array(friendRequestItemSchema)
});

const fileUploadResponseSchema = z.object({
  path: z.string().min(1),
});

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
	createUserSchema,
	loginSchema,
	loginResponseSchema,
	qrCodeReplySchema,
	twofaSchema,
	accessTokenResponseSchema,
	twofaResponseSchema,
	twofastatusResponseSchema,
	infoGrabResponseSchema,
	profileChangesSchema,
	profileChangesResponseSchema,
	editPasswordSchema,
	friendRequestSchema,
	friendAcceptSchema,
	friendItemSchema,
	friendRequestItemSchema,
	friendsArrayResponseSchema,
	friendRequestResponseSchema,
	friendRejectSchema,
	friendDeleteSchema,
	fileUploadResponseSchema,
},
	{ $id: 'userSchemas' },
);
