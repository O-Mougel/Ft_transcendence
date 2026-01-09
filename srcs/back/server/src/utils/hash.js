// utils/hash.ts

import crypto from 'crypto';

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")     // (password: crypto.BinaryLike, salt: crypto.BinaryLike, iterations: number, keylen: number, digest: string)
        .toString('hex');

    return { hash, salt };
}

export function verifyPassword(candidatePassword, salt, hash) {
	const candidateHash = crypto
        .pbkdf2Sync(candidatePassword, salt, 1000, 64, "sha512")
        .toString('hex');

    return candidateHash === hash;
}
