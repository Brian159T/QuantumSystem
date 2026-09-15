import { Request, Response } from 'express';

function success(
    req: Request,
    res: Response,
    mensaje: unknown,
    statusCode: number = 200
): void {
    res.status(statusCode).json({
        error: false,
        status: statusCode,
        body: mensaje,
    });
}

function error(
    req: Request,
    res: Response,
    mensaje: unknown,
    statusCode: number = 500
): void {
    res.status(statusCode).json({
        error: true,
        status: statusCode,
        body: mensaje,
    });
}

export default {
    success,
    error,
};