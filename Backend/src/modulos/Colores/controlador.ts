import dbMysql from '../../DB/mysql';

const TABLA = 'Colores';
const CAMPO_ID = 'id_color';

interface Color {
    id_color?: number;
    Color: string;
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbMysql;

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id: number) {
        return db.uno(TABLA, CAMPO_ID, id);
    }

    function eliminar(id: number) {
        return db.eliminar(TABLA, CAMPO_ID, id);
    }

    function agregar(body: Color) {
        const color = {
            id_color: body.id_color,
            Color: body.Color,
        };
        return db.agregar(TABLA, color);
    }

    function actualizar(id: number, body: Color) {
        const color = {
            Color: body.Color,
        };
        return db.actualizar(TABLA, CAMPO_ID, id, color);
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    };
}