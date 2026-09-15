import auth from '../../auth';
import { Request, Response, NextFunction } from 'express';

export default function chequearAuth() {

    function middleware(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {

        const id = Number(req.body.id);

        auth.chequearToken.confirmarToken(req, id);

        next();
    }

    return middleware;
}