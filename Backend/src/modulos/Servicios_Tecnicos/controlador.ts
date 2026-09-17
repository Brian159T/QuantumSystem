import dbPg from '../../DB/pg';
import embeddings from '../../embeddings';

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

    const db = dbInyectada || dbPg;

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

    async function agregar(body: ServicioTecnico) {

        const servicio: any = {

            id_servicio: body.id_servicio,

            direccion: body.direccion,

            latitud: body.latitud,

            longitud: body.longitud,

            horarios: body.horarios,

            telefono: body.telefono,

            Estado: body.Estado,

        };

        const literal = await embeddings.embeddingDeObjeto(servicio);
        if (literal) servicio.embedding = { vector: literal };

        return db.agregar(
            TABLA,
            servicio
        );

    }

    async function actualizar(
        id: number,
        body: ServicioTecnico
    ) {

        const servicio: any = {

            direccion: body.direccion,

            latitud: body.latitud,

            longitud: body.longitud,

            horarios: body.horarios,

            telefono: body.telefono,

            Estado: body.Estado,

        };

        const actual = (await db.uno(
            TABLA,
            CAMPO_ID,
            id
        )) || {};
        const literal = await embeddings.embeddingDeActualizacion(actual, servicio);
        if (literal) servicio.embedding = { vector: literal };

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