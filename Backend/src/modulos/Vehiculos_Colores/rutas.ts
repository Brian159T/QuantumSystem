import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';

const router = Router();

router.get('/', todos);
router.get('/vehiculo/:idVehiculo', coloresDeVehiculo);
router.get('/color/:idColor', vehiculosDeColor);
router.post('/', agregar);
router.delete('/:idVehiculo/color/:idColor', eliminar);

async function todos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const items = await controlador.todos();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        next(error);
    }
}

async function coloresDeVehiculo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const idVehiculo = Number(req.params.idVehiculo);
        const items = await controlador.coloresDeVehiculo(idVehiculo);
        respuesta.success(req, res, items, 200);
    } catch (error) {
        next(error);
    }
}

async function vehiculosDeColor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const idColor = Number(req.params.idColor);
        const items = await controlador.vehiculosDeColor(idColor);
        respuesta.success(req, res, items, 200);
    } catch (error) {
        next(error);
    }
}

async function agregar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const body = req.body;
        console.log('========== POST /api/vehiculos-colores ==========');
        console.log('Body:', body);
        await controlador.agregar(body);
        respuesta.success(req, res, 'Relación vehículo-color agregada satisfactoriamente', 201);
    } catch (error) {
        next(error);
    }
}

async function eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const idVehiculo = Number(req.params.idVehiculo);
        const idColor = Number(req.params.idColor);
        console.log('========== DELETE /api/vehiculos-colores ==========');
        console.log('idVehiculo:', idVehiculo, 'idColor:', idColor);
        await controlador.eliminar(idVehiculo, idColor);
        respuesta.success(req, res, 'Relación vehículo-color eliminada satisfactoriamente', 200);
    } catch (error) {
        next(error);
    }
}

export default router;