import dbMysql from '../../DB/mysql';

const TABLA = 'Vehiculos_Colores';
const TABLA_VEHICULOS = 'Vehiculos';
const TABLA_COLORES = 'Colores';

interface RelacionVehiculoColor {
    id_vehiculo: number;
    id_color: number;
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbMysql;

    function todos() {
        return db.todos(TABLA);
    }

    function coloresDeVehiculo(idVehiculo: number) {
        return db.ejecutar(
            `SELECT c.id_color, c.Color
             FROM ?? vc
             INNER JOIN ?? c ON c.id_color = vc.id_color
             WHERE vc.?? = ?`,
            [TABLA, TABLA_COLORES, 'id_vehiculo', idVehiculo]
        );
    }

    function vehiculosDeColor(idColor: number) {
        return db.ejecutar(
            `SELECT v.id_vehiculo, v.Nombre_Modelo
             FROM ?? vc
             INNER JOIN ?? v ON v.?? = vc.?? 
             WHERE vc.?? = ?`,
            [TABLA, TABLA_VEHICULOS, 'id_vehiculo', 'id_vehiculo', 'id_color', idColor]
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
            'DELETE FROM ?? WHERE ?? = ? AND ?? = ?',
            [TABLA, 'id_vehiculo', idVehiculo, 'id_color', idColor]
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