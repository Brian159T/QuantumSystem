import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import auth from '../../auth';
import crearError from '../../middleware/errors';
import crearControlador from './index';

const router = Router();
const controlador = crearControlador();
router.get('/graficos', auth.soloAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        respuesta.success(req, res, await controlador.graficos(), 200);
    } catch (error) {
        next(error);
    }
});
router.get('/proyeccion-reservas', auth.soloAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const valor = Number(req.query.horizonte);
        if (valor !== 7 && valor !== 30) {
            throw crearError('El horizonte debe ser 7 o 30 días', 400);
        }
        respuesta.success(req, res, await controlador.proyeccion(valor), 200);
    } catch (error) {
        next(error);
    }
});

export default router;
