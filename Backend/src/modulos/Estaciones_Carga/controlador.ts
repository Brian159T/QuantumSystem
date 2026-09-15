import dbMysql from '../../DB/mysql';

const TABLA = 'Estaciones_Carga';
const CAMPO_ID = 'id_estacion';

interface EstacionCarga {

    id_estacion?: number;

    direccion: string;

    latitud: number;

    longitud: number;

    horarios: string;

    telefono?: string;

    Estado: string;

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

    function agregar(body: EstacionCarga) {

        const estacion = {

            id_estacion: body.id_estacion,

            direccion: body.direccion,

            latitud: body.latitud,

            longitud: body.longitud,

            horarios: body.horarios,

            telefono: body.telefono,

            Estado: body.Estado,

        };

        return db.agregar(
            TABLA,
            estacion
        );

    }

    function actualizar(
        id: number,
        body: EstacionCarga
    ) {

        const estacion = {

            direccion: body.direccion,

            latitud: body.latitud,

            longitud: body.longitud,

            horarios: body.horarios,

            telefono: body.telefono,

            Estado: body.Estado,

        };

        return db.actualizar(
            TABLA,
            CAMPO_ID,
            id,
            estacion
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