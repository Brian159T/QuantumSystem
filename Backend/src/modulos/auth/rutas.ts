import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';

const router = Router();

router.post('/login', login);
router.post('/registro', registro);

async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    try {

        const {

            correo,

            contrasena

        } = req.body;

        const data = await controlador.login(
            correo,
            contrasena
        );

        respuesta.success(
            req,
            res,
            data,
            200
        );

    } catch (error) {

        next(error);

    }

}

async function registro(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    try {

        const data = await controlador.registro(req.body);

        respuesta.success(
            req,
            res,
            data,
            201
        );

    } catch (error) {

        next(error);

    }

}

export default router;