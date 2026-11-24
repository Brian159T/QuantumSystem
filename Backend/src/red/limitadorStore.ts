import { Store } from 'express-rate-limit';
import dbPg from '../DB/pg';

const TABLA = 'Rate_Limits';

function crearLimitadorStore(prefijo: string): Store {
    let ventanaMs = 60 * 1000;
    let avisado = false;

    function avisarFallo(error: unknown): void {
        if (avisado) return;
        avisado = true;
        console.warn(
            '[rate-limit] no se pudo usar la BD compartida; se permite el paso:',
            error instanceof Error ? error.message : String(error)
        );
    }

    return {
        prefix: prefijo,
        localKeys: true,
        async init(opciones: any): Promise<void> {
            ventanaMs = opciones?.windowMs || ventanaMs;
            try {
                await dbPg.ejecutar(
                    `CREATE TABLE IF NOT EXISTS "${TABLA}" (
                        "key" TEXT PRIMARY KEY,
                        "count" INTEGER NOT NULL DEFAULT 0,
                        "reset_at" BIGINT NOT NULL
                    )`
                );
            } catch (error) {
                avisarFallo(error);
            }
        },

        async increment(clave: string) {
            const ahora = Date.now();
            try {
                const filas = await dbPg.ejecutar(
                    `SELECT "count", "reset_at" FROM "${TABLA}" WHERE "key" = $1`,
                    [clave]
                );
                const fila = filas[0];

                if (!fila || Number(fila.reset_at) <= ahora) {
                    const reinicio = ahora + ventanaMs;
                    await dbPg.ejecutar(
                        `INSERT INTO "${TABLA}" ("key", "count", "reset_at")
                         VALUES ($1, $2, $3)
                         ON CONFLICT ("key") DO UPDATE SET "count" = $2, "reset_at" = $3`,
                        [clave, 1, reinicio]
                    );
                    return { totalHits: 1, resetTime: new Date(reinicio) };
                }

                const total = Number(fila.count) + 1;
                await dbPg.ejecutar(
                    `UPDATE "${TABLA}" SET "count" = $2 WHERE "key" = $1`,
                    [clave, total]
                );
                return { totalHits: total, resetTime: new Date(Number(fila.reset_at)) };
            } catch (error) {
                avisarFallo(error);
                return { totalHits: 1, resetTime: new Date(ahora + ventanaMs) };
            }
        },

        async decrement(clave: string): Promise<void> {
            try {
                await dbPg.ejecutar(
                    `UPDATE "${TABLA}" SET "count" = GREATEST("count" - 1, 0) WHERE "key" = $1`,
                    [clave]
                );
            } catch (error) {
                avisarFallo(error);
            }
        },

        async resetKey(clave: string): Promise<void> {
            try {
                await dbPg.ejecutar(`DELETE FROM "${TABLA}" WHERE "key" = $1`, [clave]);
            } catch (error) {
                avisarFallo(error);
            }
        },

        async resetAll(): Promise<void> {
            try {
                await dbPg.ejecutar(`DELETE FROM "${TABLA}"`);
            } catch (error) {
                avisarFallo(error);
            }
        },
    };
}

export default crearLimitadorStore;
