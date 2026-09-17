import dbPg from '../../DB/pg';

const TABLA = 'Vehiculos_Colores';

interface RelacionVehiculoColor {
    id_vehiculo: number;
    id_color: number;
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    function todos() {
        return db.todos(TABLA);
    }

    function coloresDeVehiculo(idVehiculo: number) {
        return db.ejecutar(
            `SELECT c."id_color", c."Color"
             FROM "Vehiculos_Colores" vc
             INNER JOIN "Colores" c ON c."id_color" = vc."id_color"
             WHERE vc."id_vehiculo" = ?`,
            [idVehiculo]
        );
    }

    function vehiculosDeColor(idColor: number) {
        return db.ejecutar(
            `SELECT v."id_vehiculo", v."Nombre_Modelo"
             FROM "Vehiculos_Colores" vc
             INNER JOIN "Vehiculos" v ON v."id_vehiculo" = vc."id_vehiculo"
             WHERE vc."id_color" = ?`,
            [idColor]
        );
    }

    function agregar(body: RelacionVehiculoColor) {
        const relacion = {
            id_vehiculo: body.id_vehiculo,
            id_color: body.id_color,
        };
        return db.agregar(TABLA, relacion);
    }

    function eliminar(idVehiculo: number, idColor: number) {
        return db.ejecutar(
            'DELETE FROM "Vehiculos_Colores" WHERE "id_vehiculo" = ? AND "id_color" = ?',
            [idVehiculo, idColor]
        );
    }

    return {
        todos,
        coloresDeVehiculo,
        vehiculosDeColor,
        agregar,
        eliminar,
    };
}