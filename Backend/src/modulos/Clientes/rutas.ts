import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';

const router = Router();

router.get('/', todos);
router.get('/:id', uno);
router.post('/', agregar);
router.delete('/:id', eliminar);

async function todos(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const items = await controlador.todos();

        respuesta.success(req, res, items, 200);

    } catch (error) {
        next(error);
    }
}

async function uno(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);

        const item = await controlador.uno(id);

        respuesta.success(req, res, item, 200);

    } catch (error) {
        next(error);
    }
}

async function agregar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const body = req.body;

        await controlador.agregar(body);

        respuesta.success(
            req,
            res,
            'Item agregado satisfactoriamente',
            201
        );

    } catch (error) {
        next(error);
    }
}

async function eliminar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);

        await controlador.eliminar({
            id
        });

        respuesta.success(
            req,
            res,
            'Item eliminado satisfactoriamente',
            200
        );

    } catch (error) {
        next(error);
    }
}

export default router;