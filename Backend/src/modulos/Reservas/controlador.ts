import dbPg from '../../DB/pg';
import error from '../../middleware/errors';

// Esta tabla NO se vectoriza a proposito: contiene datos personales
// (nombres, apellidos, cedula_identidad) y el chatbot del catalogo no
// la necesita. Ver docs/Decisiones-tecnicas.md, seccion "Plan de
// seguridad: dejar de enviar datos personales a Gemini".

const TABLA = 'Reservas';
const CAMPO_ID = 'id_reserva';
const CEDULA_VALIDA = /^\d{7,11}$/;

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

    function texto(valor: unknown): string {
        return typeof valor === 'string' ? valor.trim() : '';
    }

    async function agregar(body: Reserva) {
        const nombres = texto(body?.nombres);
        const apellidos = texto(body?.apellidos);
        const cedula = texto(body?.cedula_identidad);
        const modelo = texto(body?.modelo);
        const color = Number(body?.color);

        if (!nombres || !apellidos || !cedula || !modelo) {
            throw error('Nombres, apellidos, cedula, modelo y color son obligatorios', 400);
        }

        if (
            nombres.length > 50 ||
            apellidos.length > 50 ||
            cedula.length > 20 ||
            modelo.length > 50
        ) {
            throw error('Uno de los campos excede el largo permitido', 400);
        }

        if (!Number.isInteger(color) || color <= 0) {
            throw error('El color ingresado no es valido', 400);
        }

        if (!CEDULA_VALIDA.test(cedula)) {
            throw error('La cedula ingresada no es valida', 400);
        }

        const existeColor = await db.query('Colores', { id_color: color });
        if (!existeColor) {
            throw error('El color ingresado no existe', 400);
        }

        const existeModelo = await db.query('Vehiculos', { Nombre_Modelo: modelo });
        if (!existeModelo) {
            throw error('El modelo ingresado no existe', 400);
        }

        const fechaHoy = new Date().toISOString().slice(0, 10);

        return db.agregar(TABLA, {
            Fecha_Reserva: fechaHoy,
            Estado: 'Pendiente',
            nombres,
            apellidos,
            cedula_identidad: cedula,
            modelo,
            color,
        });
    }

    function actualizar(
        id: number,
        body: Reserva
    ) {
        const reserva: any = {
            Fecha_Reserva: body.Fecha_Reserva,
            Estado: body.Estado,
            nombres: body.nombres,
            apellidos: body.apellidos,
            cedula_identidad: body.cedula_identidad,
            modelo: body.modelo,
            color: body.color,
        };
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