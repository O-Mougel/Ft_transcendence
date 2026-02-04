// user.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

export const createUserSchema = z.object({

	name: z.string("Name must be a string !").min(3, "Name must be at least 3 characters long").max(13, "Name cannot be longer than 13 characters").regex(/^[a-zA-Z0-9_]+$/, "Name can only contains letters, numbers and underscores"),
	email: z.string({
		required_error: "Email field cannot be left empty !",
		invalid_type_error: "Email format is not valid !"
	}).email().max(32, "Email cannot be longer than 32 characters"),
	password: z.string().min(8, "Password must be at least 8 character long").max(32, "Password cannot be longer than 32 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain at least 1 uppercase, 1 lowercase, 1 number and a special character"),
	passwordconfirmation: z.string().min(8, "Password must be at least 8 character long").max(32, "Password cannot be longer than 32 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain at least 1 uppercase, 1 lowercase, 1 number and a special character")
});

export const profileChangesSchema = z.object({
	name: z.string("Name must be a string !").min(3, "Name must be at least 3 characters long").max(13, "Name cannot be longer than 13 characters").regex(/^[a-zA-Z0-9_]+$/, "Name can only contains letters, numbers and underscores"),
	avatar: z.string("Path must be a string !").min(1, "Path must be at least 1 character long"),
});

export const profileChangesResponseSchema = z.object({
	id: z.number().min(1, "ID must have at least 1 number"),
});

export const loginSchema = z.object({
	name: z.string("Name must be a string !").min(1, "Name cannot be empty").max(13, "Name cannot be longer than 13 characters").regex(/^[a-zA-Z0-9_]+$/, "Name can only contains letters, numbers and underscores"),
	password: z.string().min(1, "Password cannot be empty").max(32, "Password cannot be longer than 32 characters").regex(/^[\x20-\x7E]+$/, "Password can only contain printable ASCII characters"),
});

export const loginResponseSchema = z.object({
	require2fa: z.boolean("require2fa can only be a boolean !"),
	token: z.string("Token must be a string").min(1, "Token cannot be empty !"),
});

export const qrCodeReplySchema = z.object({
	qrCode: z.string("qrCode must be a base64 string.").min(1, "qrCode cannot be empty !").url()
})

export const twofaSchema = z.object({
	code: z.string("2FA code must be a string format !").min(6, "2FA code must contain 6 numbers.").max(6, "2FA code must contain 6 numbers.").regex(/^[0-9]{6,6}$/, "Only numbers can be used for the 2FA code."),
})

export const twofastatusResponseSchema = z.object({
  twofastatus: z.boolean("2FA status can only be a boolean !")
})

export const twofaResponseSchema = z.object({
	success: z.boolean("2FA status can only be a boolean !"),
	message: z.string().min(1, "string cannot be empty.")
})

export const accessTokenResponseSchema = z.object({
	newAccessToken: z.string().min(1),
});

export const infoGrabResponseSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	avatar: z.string().min(1),
});

export const editPasswordSchema = z.object({
	oldpassword: z.string().min(1).max(32, "Password cannot be longer than 32 characters"),
	newpassword: z.string().min(8, "Password must be at least 8 character long").max(32, "Password cannot be longer than 32 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain at least 1 uppercase, 1 lowercase, 1 number and a special character"),
	newpasswordconfirmation: z.string().min(8, "Password must be at least 8 character long").max(32, "Password cannot be longer than 32 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain at least 1 uppercase, 1 lowercase, 1 number and a special character"),
})

export const friendRequestSchema = z.object({
	friendRequestName: z.string().min(3, "Friend name must be at least 3 characters long.").max(13, "Friend name cannot be longer than 13 characters.").regex(/^[a-zA-Z0-9_]+$/, "Friend name can only contains letters, numbers and underscores"),
})

export const friendAcceptSchema = z.object({
	friendAcceptId: z.number().min(1, "Friend ID cannot be empty !")
})

export const friendAcceptResponseSchema = z.object({
	friendname: z.string(),
	message: z.string()
})

export const friendDeleteResponseSchema = z.object({
	removedName: z.string(),
	message: z.string()
})

export const friendRejectSchema = z.object({
	friendRejectId: z.number().min(1, "Cannot reject request with an empty ID !")
})

export const friendDeleteSchema = z.object({
	friendDeleteId: z.number().min(1, "Cannot delete friend with an empty ID !")
})

export const friendRequestItemSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
});

export const friendRequestResponseSchema = z.object({
	requestOf: z.array(friendRequestItemSchema)
});

export const friendItemSchema = z.object({
	id: z.number(),
	name: z.string().min(1),
	online: z.boolean()
});

export const friendsArrayResponseSchema = z.object({
	friends: z.array(friendItemSchema)
});

export const fileUploadResponseSchema = z.object({
  path: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._-]+$/)
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
	friendAcceptResponseSchema,
	friendDeleteResponseSchema,
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
