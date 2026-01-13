// user.schema.js

import * as z from "zod";
import { buildJsonSchemas } from 'fastify-zod';

const userCore = {  // define the common user schema
	email: z.string({
		required_error: "Email is required",
		invalid_type_error: "Email is not valid"
	}).email(),
	name: z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/)//, "Only uppercase alphanumeric characters and underscore allowed")
}

const createUserSchema = z.object({
	...userCore,
	password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),
	passwordconfirmation: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),

});

const createUserResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

const profileChangesSchema = z.object({
	name: z.string().regex(/^[A-Z0-9_]{3,20}$/, {
		message: "3–20 chars, uppercase, numbers, underscore only"
	}),
	password: z.string(),
	avatar: z.string(),
});

const profileChangesResponseSchema = z.object({
	id: z.number(),
});

const loginSchema = z.object({
	name: z.string(),
	password: z.string()
});

const loginResponseSchema = z.object({
	require2fa: z.boolean(),
	token: z.string(),
});

const qrCodeReplySchema = z.object({
	qrCode: z.string().url()
})

const twofaSchema = z.object({
	code: z.string(), //regex 6 digit long 
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
	newpassword: z.string(),
	newpasswordconfirmation: z.string(),
})

const friendRequestSchema = z.object({
	friendRequestName: z.string(),
})

const friendAcceptSchema = z.object({
	friendAcceptName: z.string(),
})

const friendRejectSchema = z.object({
	friendrejectname: z.string(),
})

const friendDeleteSchema = z.object({
	frienddeletename: z.string(),
})

const friendItemSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  online: z.boolean(),
});

const friendRequestItemSchema = z.object({
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
	createUserResponseSchema,
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
	friendsArrayResponseSchema,
	friendRequestResponseSchema,
	friendRequestItemSchema,
	friendRejectSchema,
	friendDeleteSchema,
	fileUploadResponseSchema,
},
  { $id: 'userSchemas' },
);
