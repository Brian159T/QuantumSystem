import dbPg from '../../DB/pg';
import embeddings from '../../embeddings';

const TABLA = 'Reservas';
const CAMPO_ID = 'id_reserva';

interface Reserva {
    id_reserva?: number;
    Fecha_Reserva: string;
    Estado: string;
    nombres: string;
    apellidos: string;
    cedula_identidad: string;
    modelo: string;
    color: number;
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id: number) {
        return db.uno(TABLA, CAMPO_ID, id);
    }

    function eliminar(id: number) {
        return db.eliminar(TABLA, CAMPO_ID, id);
    }

    async function agregar(body: Reserva) {
        const fechaHoy = new Date().toISOString().slice(0, 10);
        const reserva: any = {
            Fecha_Reserva: body.Fecha_Reserva || fechaHoy,
            Estado: body.Estado || 'Pendiente',
            nombres: body.nombres,
            apellidos: body.apellidos,
            cedula_identidad: body.cedula_identidad,
            modelo: body.modelo,
            color: body.color,
        };
        const literal = await embeddings.embeddingDeObjeto(reserva);
        if (literal) reserva.embedding = { vector: literal };
        return db.agregar(TABLA, reserva);
    }

    async function actualizar(id: number, body: Reserva) {
        const reserva: any = {
            Fecha_Reserva: body.Fecha_Reserva,
            Estado: body.Estado,
            nombres: body.nombres,
            apellidos: body.apellidos,
            cedula_identidad: body.cedula_identidad,
            modelo: body.modelo,
            color: body.color,
        };
        const actual = (await db.uno(TABLA, CAMPO_ID, id)) || {};
        const literal = await embeddings.embeddingDeActualizacion(actual, reserva);
        if (literal) reserva.embedding = { vector: literal };
        return db.actualizar(TABLA, CAMPO_ID, id, reserva);
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    };
}