import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';

const router = Router();

router.get('/', todos);
router.get('/:id', uno);
router.post('/', agregar);
router.put('/:id', actualizar);
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

        console.log('========== POST /api/vehiculos ==========');
        console.log('Headers:', req.headers);
        console.log('Body recibido:', req.body);

        const body = req.body;

        await controlador.agregar(body);

        respuesta.success(
            req,
            res,
            'Vehículo agregado satisfactoriamente',
            201
        );

    } catch (error) {

        console.error(error);

        next(error);

    }

}

async function actualizar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    try {

        const id = Number(req.params.id);

        const body = req.body;

        console.log('========== PUT /api/vehiculos ==========');
        console.log('ID:', id);
        console.log('Body:', body);

        await controlador.actualizar(
            id,
            body
        );

        respuesta.success(
            req,
            res,
            'Vehículo actualizado satisfactoriamente',
            200
        );

    } catch (error) {

        console.error(error);

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

        console.log('========== DELETE /api/vehiculos ==========');
        console.log('ID:', id);

        await controlador.eliminar(id);

        respuesta.success(
            req,
            res,
            'Vehículo eliminado satisfactoriamente',
            200
        );

    } catch (error) {

        console.error(error);

        next(error);

    }

}

export default router;