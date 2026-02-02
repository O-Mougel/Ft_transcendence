//twofa.js

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { savesecret2fa } from "../modules/user/user.service.js"

export function verify2fa(twofasecret, code) {
	return speakeasy.totp.verify({
		secret: twofasecret,
		encoding: 'base32',
		token: code,
		window: 1
	});
}

export async function generateSecret(name, id) {
	const secret = speakeasy.generateSecret({
		name: `Ft_transcendence (${name})`
	});

	const qrCode = await QRCode.toDataURL(secret.otpauth_url);
	await savesecret2fa(id, secret.base32)
	return qrCode
}
