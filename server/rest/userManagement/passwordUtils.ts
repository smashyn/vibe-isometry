import crypto from 'crypto';
import { serverConfig } from '../../serverConfig';

export function hashPassword(password: string, salt: string = serverConfig.hashSalt): string {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}$${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
    const [salt, hash] = hashed.split('$');
    const hashToCheck = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashToCheck;
}
