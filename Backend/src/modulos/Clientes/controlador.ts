import dbPg from '../../DB/pg';

const TABLA = 'Roles';
const CAMPO_ID = 'id_rol';

interface Rol {
    id_rol?: number;
    Nombre: string;
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

    function agregar(body: Rol) {
        const rol = {
            id_rol: body.id_rol,
            Nombre: body.Nombre,
        };
        return db.agregar(TABLA, rol);
    }

    function actualizar(id: number, body: Rol) {
        const rol = {
            Nombre: body.Nombre,
        };
        return db.actualizar(TABLA, CAMPO_ID, id, rol);
    }

    return {
        todos,
        uno,
        eliminar,
        agregar,
        actualizar,
    };
}