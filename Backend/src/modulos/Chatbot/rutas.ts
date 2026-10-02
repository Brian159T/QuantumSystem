// Rutas del chatbot.
//
// Nota sobre el streaming: las dos rutas devuelven formatos distintos a
// proposito. "/" usa el sobre uniforme {error,status,body} como todo el
// resto de la API, y "/stream" usa SSE porque el sobre JSON no admite
// escritura parcial. El frontend elige segun quiera o no ir por trozos.

import { Router, Request, Response, NextFunction } from 'express';
import respuesta from '../../red/respuestas';
import controlador from './index';

const router = Router();

router.get('/estado', estado);
router.post('/', preguntar);
router.post('/stream', preguntarEnStream);

// Cabeceras de SSE. X-Accel-Buffering evita que un proxy (Render, nginx)
// acumule la respuesta y la envie de golpe al final.
function cabecerasStream(res: Response): void {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();
}

function emitir(res: Response) {
    return (evento: string, datos: any) => {
        res.write(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`);
    };
}

function estado(req: Request, res: Response): void {
    respuesta.success(req, res, controlador.estado(), 200);
}

async function preguntar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { mensaje, historial } = req.body || {};
        const data = await controlador.preguntar(mensaje, historial);
        respuesta.success(req, res, data, 200);
    } catch (error) {
        next(error);
    }
}

async function preguntarEnStream(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        cabecerasStream(res);
        const enviar = emitir(res);
        const { mensaje, historial } = req.body || {};

        await controlador.preguntarEnStream(mensaje, historial, enviar);
    } catch (error) {
        // Los headers ya salieron, asi que el sobre de error no cabe: se
        // avisa por el propio canal SSE y se cierra.
        const mensaje = error instanceof Error ? error.message : String(error);
        console.error('[chatbot]', mensaje);
        try {
            emitir(res)('error', { mensaje });
        } catch {
            // si el cliente se desconectó, no hay nada mas que hacer
        }
    } finally {
        res.end();
    }
}

export default router;