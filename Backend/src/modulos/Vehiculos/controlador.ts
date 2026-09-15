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

}

export default function (dbInyectada?: any) {

    const db = dbInyectada || dbMysql;

    function todos() {

        return db.todos(TABLA);

    }

    function uno(id: number) {

        return db.uno(
            TABLA,
            CAMPO_ID,
            id
        );

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