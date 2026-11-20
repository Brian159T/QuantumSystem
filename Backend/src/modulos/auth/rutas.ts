import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';
import auth from '../../auth';

const router = Router();

router.post('/login', login);
router.post('/registro', registro);
router.post('/logout', logout);
router.get('/sesion', auth.autenticar, sesion);

async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { correo, contrasena } = req.body;

        const data = await controlador.login(correo, contrasena);

        auth.establecerCookie(res, data.token);
        respuesta.success(req, res, data, 200);
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

        respuesta.success(req, res, data, 201);
    } catch (error) {
        next(error);
    }
}

async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        auth.limpiarCookie(res);
        respuesta.success(req, res, 'Sesion cerrada', 200);
    } catch (error) {
        next(error);
    }
}

async function sesion(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = auth.usuarioActual(req)?.id_usuario;
        const usuario = await controlador.sesion(Number(id));

        respuesta.success(req, res, { usuario }, 200);
    } catch (error) {
        next(error);
    }
}

export default router;
