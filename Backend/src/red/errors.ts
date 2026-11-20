import { Request, Response, NextFunction } from 'express';
import respuesta from './respuestas';

function errors(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('[error]', err);

    const status = Number(err?.statusCode) || 500;
    const mensaje =
        status >= 500
            ? 'Error interno del servidor'
            : err?.message || 'Solicitud invalida';

    respuesta.error(req, res, mensaje, status);
}

export default errors;
