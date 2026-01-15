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

 //jusqu'a quel point je dois parser tous les schema avec du regex ??? ou juste l'autentification et l'edition du profile ??

const profileChangesSchema = z.object({
	name: z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/),//, "Only uppercase alphanumeric characters and underscore allowed")
	//name: z.string().regex(/^[A-Z0-9_]{3,20}$/, {
	// 	message: "3–20 chars, uppercase, numbers, underscore only"
	// }),
	password: z.string().min(1), //est-ce que check regex ici aussi ?? peut-etre a suprimer ou a crypter
	avatar: z.string().min(1), //quel pattern verifier ici en regex ??
});

const profileChangesResponseSchema = z.object({
	id: z.number(),
});

const loginSchema = z.object({ //a supprimer 
	name: z.string().min(1),
	password: z.string().min(1)
});

const loginResponseSchema = z.object({
	require2fa: z.boolean(),
	token: z.string().min(1),
});

const qrCodeReplySchema = z.object({
	qrCode: z.string().min(1).url()
})

const twofaSchema = z.object({
	code: z.string().min(1).max(6), //regex 6 digit long 
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
	newpassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),
	newpasswordconfirmation: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Password must contain uppercase, lowercase, number and special character"),
})

const friendRequestSchema = z.object({
	friendRequestName: z.string().min(1).max(13),
})

const friendAcceptSchema = z.object({
	friendAcceptName: z.string().min(1),
})

const friendRejectSchema = z.object({
	friendrejectname: z.string().min(1),
})

const friendDeleteSchema = z.object({
	frienddeletename: z.string().min(1).max(13),
})

const friendItemSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().min(1),
  online: z.boolean(),
});

const friendRequestItemSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().min(1),
  online: z.boolean(),
});

const friendsArrayResponseSchema = z.array(friendItemSchema);  
const friendRequestResponseSchema = z.array(friendRequestItemSchema);

const fileUploadResponseSchema = z.object({
  path: z.string().min(1),
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
