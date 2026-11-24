import jwt, { JsonWebTokenError, JwtPayload, SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import error from '../middleware/errors';
import respuesta from '../red/respuestas';
import dbPg from '../DB/pg';

const secret = config.jwt.secret;
const NOMBRE_COOKIE = 'quantum_token';
const esProduccion = process.env.NODE_ENV === 'production';

export interface UsuarioToken extends JwtPayload {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
    id_rol: number;
    rol: string;
}

function duracionCookie(): number {
    const coincidencia = /^(\d+)([smhd])$/.exec(config.jwt.expiracion);
    if (!coincidencia) return 8 * 60 * 60 * 1000;
    const factores: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    return Number(coincidencia[1]) * (factores[coincidencia[2]] || factores.h);
}

function opcionesCookie() {
    return {
        httpOnly: true,
        secure: esProduccion,
        sameSite: esProduccion ? ('none' as const) : ('lax' as const),
        path: '/api',
    };
}

function establecerCookie(res: Response, token: string): void {
    res.cookie(NOMBRE_COOKIE, token, { ...opcionesCookie(), maxAge: duracionCookie() });
}

function limpiarCookie(res: Response): void {
    res.clearCookie(NOMBRE_COOKIE, opcionesCookie());
}

function asignarToken(data: object): string {
    return jwt.sign(data, secret, {
        expiresIn: config.jwt.expiracion as SignOptions['expiresIn'],
    });
}

function verificarToken(token: string): UsuarioToken {
    try {
        return jwt.verify(token, secret, { algorithms: ['HS256'] }) as UsuarioToken;
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            throw error('La sesion ya no es valida', 401);
        }
        throw err;
    }
}

function obtenerToken(req: Request): string {
    const autorizacion = req.headers.authorization || '';

    if (autorizacion) {
        if (!autorizacion.startsWith('Bearer ')) {
            throw error('Formato inválido', 401);
        }
        const token = autorizacion.slice('Bearer '.length).trim();
        if (token) return token;
    }

    const deCookie = (req as any).cookies?.[NOMBRE_COOKIE];
    if (typeof deCookie === 'string' && deCookie) return deCookie;

    throw error('No viene token', 401);
}

function decodificar(req: Request): UsuarioToken {
    const usuario = verificarToken(obtenerToken(req));
    (req as any).user = usuario;
    return usuario;
}

function usuarioActual(req: Request): UsuarioToken | undefined {
    return (req as any).user;
}

function esAdministrador(usuario: UsuarioToken | undefined): boolean {
    if (!usuario) return false;
    if (usuario.id_rol === 1) return true;
    const rol = String(usuario.rol || '').toLowerCase();
    return rol === 'administrador' || rol === 'admin';
}

async function rolEnBase(idUsuario: number): Promise<{ id_rol: number; rol: string } | null> {
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) return null;
    const filas = await dbPg.ejecutar(
        `SELECT r."id_rol", r."Nombre" AS rol
         FROM "Usuarios" u
         INNER JOIN "Roles" r ON u."id_rol" = r."id_rol"
         WHERE u."id_usuario" = $1`,
        [idUsuario]
    );
    return filas[0] || null;
}

function esSesionInvalida(err: unknown): boolean {
    return Number((err as { statusCode?: number })?.statusCode) === 401;
}

function responderSesionInvalida(req: Request, res: Response): void {
    limpiarCookie(res);
    respuesta.error(req, res, 'La sesion ya no es valida', 401);
}

function autenticar(req: Request, res: Response, next: NextFunction): void {
    try {
        decodificar(req);
        next();
    } catch (err) {
        if (esSesionInvalida(err)) {
            responderSesionInvalida(req, res);
            return;
        }
        next(err);
    }
}

async function soloAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const delToken = usuarioActual(req) || decodificar(req);
        const actual = await rolEnBase(Number(delToken.id_usuario));

        if (!actual) {
            throw error('La sesion ya no es valida', 401);
        }

        const usuario: UsuarioToken = {
            ...delToken,
            id_rol: Number(actual.id_rol),
            rol: String(actual.rol),
        };
        (req as any).user = usuario;

        if (!esAdministrador(usuario)) {
            throw error('No tienes privilegios para hacer esto', 403);
        }

        next();
    } catch (err) {
        if (esSesionInvalida(err)) {
            responderSesionInvalida(req, res);
            return;
        }
        next(err);
    }
}

export default {
    asignarToken,
    verificarToken,
    decodificar,
    autenticar,
    soloAdmin,
    usuarioActual,
    esAdministrador,
    establecerCookie,
    limpiarCookie,
};

export {
    asignarToken,
    verificarToken,
    autenticar,
    soloAdmin,
    usuarioActual,
    esAdministrador,
    establecerCookie,
    limpiarCookie,
};
