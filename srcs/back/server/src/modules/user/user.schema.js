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
	password: z.string(),
	avatar: z.string(), //quel pattern verifier ici en regex ??
});

const profileChangesResponseSchema = z.object({
	id: z.number(),
});

const loginSchema = z.object({
	name: z.string().min(3).max(13).regex(/^[a-zA-Z0-9_]+$/),
	password: z.string().min(8).max(32)
});

const loginResponseSchema = z.object({
	require2fa: z.boolean(),
	token: z.string(),
});

const qrCodeReplySchema = z.object({
	qrCode: z.string().url()
})

const twofaSchema = z.object({
	code: z.string().min(6).max(6).regex(/^[0-9]{6,6}$/),
})

const twofastatusResponseSchema = z.object({
  twofastatus: z.boolean()
})

const twofaResponseSchema = z.object({
	success: z.boolean(),
	message: z.string()
})

const accessTokenResponseSchema = z.object({
	newAccessToken: z.string(),
});

const infoGrabResponseSchema = z.object({
	id: z.number(),
	email: z.string(),
	name: z.string(),
	avatar: z.string(),
});

const editPasswordSchema = z.object({
	oldpassword: z.string(),
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
	name: z.string(),
	avatar: z.string(),
	online: z.boolean(),
});

const friendRequestItemSchema = z.object({
	id: z.number(),
	name: z.string(),
	avatar: z.string(),
	online: z.boolean(),
});

const friendsArrayResponseSchema = z.array(friendItemSchema);  
const friendRequestResponseSchema = z.array(friendRequestItemSchema);

const fileUploadResponseSchema = z.object({
	path: z.string(),
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
