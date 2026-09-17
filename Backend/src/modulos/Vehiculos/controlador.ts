import dbPg from '../../DB/pg';
import embeddings from '../../embeddings';

const TABLA = 'Vehiculos';
const CAMPO_ID = 'id_vehiculo';

interface Vehiculo {

    id_vehiculo?: number;

    Velocidad_Maxima: string;

    Autonomia: string;

    Tipo: string;

    Carga_Rapida: string;

    Nombre_Modelo: string;

    Capacidad_Bateria: string;

    Tiempo_Carga_Normal: string;

    Traccion: string;

    Nro_Asientos: string;

    id_color: number;

    Precio_USD: number;

}

export default function (dbInyectada?: any) {

    const db = dbInyectada || dbPg;

    async function todos() {
        const vehiculos = await db.todos(TABLA);
        return enriquecerConColores(vehiculos);
    }

    async function uno(id: number) {
        const vehiculo = await db.uno(
            TABLA,
            CAMPO_ID,
            id
        );
        if (!vehiculo) {
            return vehiculo;
        }
        const colores = await db.ejecutar(
            `SELECT c."id_color", c."Color"
             FROM "Vehiculos_Colores" vc
             INNER JOIN "Colores" c ON c."id_color" = vc."id_color"
             WHERE vc."id_vehiculo" = $1`,
            [id]
        );
        return { ...vehiculo, colores };
    }

    async function enriquecerConColores(vehiculos: any[]) {
        if (!vehiculos.length) {
            return [];
        }
        const relaciones = await db.ejecutar(
            `SELECT vc."id_vehiculo", c."id_color", c."Color"
             FROM "Vehiculos_Colores" vc
             INNER JOIN "Colores" c ON c."id_color" = vc."id_color"`
        );
        const coloresPorVehiculo = new Map<number, any[]>();
        relaciones.forEach((r: any) => {
            if (!coloresPorVehiculo.has(r.id_vehiculo)) {
                coloresPorVehiculo.set(r.id_vehiculo, []);
            }
            coloresPorVehiculo.get(r.id_vehiculo)!.push({
                id_color: r.id_color,
                Color: r.Color,
            });
        });
        return vehiculos.map((v: any) => ({
            ...v,
            colores: coloresPorVehiculo.get(v.id_vehiculo) || [],
        }));
    }

    function eliminar(id: number) {

        return db.eliminar(
            TABLA,
            CAMPO_ID,
            id
        );

    }

    async function agregar(body: Vehiculo) {

        const vehiculo: any = {

            id_vehiculo: body.id_vehiculo,

            Velocidad_Maxima: body.Velocidad_Maxima,

            Autonomia: body.Autonomia,

            Tipo: body.Tipo,

            Carga_Rapida: body.Carga_Rapida,

            Nombre_Modelo: body.Nombre_Modelo,

            Capacidad_Bateria: body.Capacidad_Bateria,

            Tiempo_Carga_Normal: body.Tiempo_Carga_Normal,

            Traccion: body.Traccion,

            Nro_Asientos: body.Nro_Asientos,

            id_color: body.id_color,

            Precio_USD: body.Precio_USD,

        };

        const literal = await embeddings.embeddingDeObjeto(vehiculo);
        if (literal) vehiculo.embedding = { vector: literal };

        return db.agregar(
            TABLA,
            vehiculo
        );

    }

    async function actualizar(
        id: number,
        body: Vehiculo
    ) {

        const vehiculo: any = {

            Velocidad_Maxima: body.Velocidad_Maxima,

            Autonomia: body.Autonomia,

            Tipo: body.Tipo,

            Carga_Rapida: body.Carga_Rapida,

            Nombre_Modelo: body.Nombre_Modelo,

            Capacidad_Bateria: body.Capacidad_Bateria,

            Tiempo_Carga_Normal: body.Tiempo_Carga_Normal,

            Traccion: body.Traccion,

            Nro_Asientos: body.Nro_Asientos,

            id_color: body.id_color,

            Precio_USD: body.Precio_USD,

        };

        const actual = (await db.uno(
            TABLA,
            CAMPO_ID,
            id
        )) || {};
        const literal = await embeddings.embeddingDeActualizacion(actual, vehiculo);
        if (literal) vehiculo.embedding = { vector: literal };

        return db.actualizar(
            TABLA,
            CAMPO_ID,
            id,
            vehiculo
        );

    }

    return {

        todos,

        uno,

        agregar,

        actualizar,

        eliminar,

    };

}