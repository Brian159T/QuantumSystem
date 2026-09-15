import { Request, Response, NextFunction } from 'express';
import respuesta from './respuestas';

function errors(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.log('[error]', err);

    const message = err.message || 'Error interno';
    const status = err.statusCode || 500;

    respuesta.error(req, res, message, status);
}

export default errors;