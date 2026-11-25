import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import auth from '../../auth';
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

export default router;
