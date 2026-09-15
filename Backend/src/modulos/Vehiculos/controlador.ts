import dbMysql from '../../DB/mysql';

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

    const db = dbInyectada || dbMysql;

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
            `SELECT c.id_color, c.Color
             FROM Vehiculos_Colores vc
             INNER JOIN Colores c ON c.id_color = vc.id_color
             WHERE vc.id_vehiculo = ?`,
            [id]
        );
        return { ...vehiculo, colores };
    }

    async function enriquecerConColores(vehiculos: any[]) {
        if (!vehiculos.length) {
            return [];
        }
        const relaciones = await db.ejecutar(
            `SELECT vc.id_vehiculo, c.id_color, c.Color
             FROM Vehiculos_Colores vc
             INNER JOIN Colores c ON c.id_color = vc.id_color`
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

    function agregar(body: Vehiculo) {

        const vehiculo = {

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

        return db.agregar(
            TABLA,
            vehiculo
        );

    }

    function actualizar(
        id: number,
        body: Vehiculo
    ) {

        const vehiculo = {

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