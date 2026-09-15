import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import config from '../config';
import error from '../middleware/errors';

const secret = config.jwt.secret;

function asignarToken(data: object): string {
    return jwt.sign(data, secret);
}

function verificarToken(token: string): string | JwtPayload {
    return jwt.verify(token, secret);
}

const chequearToken = {
    confirmarToken(req: Request, id?: number): void {

        const decodificado = decodificarCabecera(req);

        if (
            id !== undefined &&
            typeof decodificado !== 'string' &&
            decodificado.id !== id
        ) {
            throw error('No tienes privilegios para hacer esto', 401);
        }
    },
};

function obtenerToken(autorizacion: string): string {

    if (!autorizacion) {
        throw error('No viene token', 401);
    }

    if (!autorizacion.startsWith('Bearer ')) {
        throw error('Formato inválido', 401);
    }

    return autorizacion.replace('Bearer ', '');
}

function decodificarCabecera(req: Request): string | JwtPayload {

    const autorizacion = req.headers.authorization || '';

    const token = obtenerToken(autorizacion);

    const decodificado = verificarToken(token);

    (req as any).user = decodificado;

    return decodificado;
}

export default {
    asignarToken,
    chequearToken,
};