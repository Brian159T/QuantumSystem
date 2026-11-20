import bcrypt from 'bcrypt';

export const SALT_ROUNDS = 10;

export function hashContrasena(contrasena: string): Promise<string> {
    return bcrypt.hash(contrasena, SALT_ROUNDS);
}

export function requiereRehash(hash: string): boolean {
    try {
        return bcrypt.getRounds(hash) < SALT_ROUNDS;
    } catch {
        return false;
    }
}
