import dbMysql from '../../DB/mysql';

const TABLA = 'Servicios_Tecnicos';
const CAMPO_ID = 'id_servicio';

interface ServicioTecnico {

    id_servicio?: number;

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

    function agregar(body: ServicioTecnico) {

        const servicio = {

            id_servicio: body.id_servicio,

            direccion: body.direccion,

            latitud: body.latitud,

            longitud: body.longitud,

            horarios: body.horarios,

            telefono: body.telefono,

            Estado: body.Estado,

        };

        return db.agregar(
            TABLA,
            servicio
        );

    }

    function actualizar(
        id: number,
        body: ServicioTecnico
    ) {

        const servicio = {

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
            servicio
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