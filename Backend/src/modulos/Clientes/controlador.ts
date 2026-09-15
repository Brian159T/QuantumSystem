import dbMysql from '../../DB/mysql';

const TABLA = 'roles';

interface Rol {
    id: number;
    nombre?: string;
    descripcion?: string;
}

export default function (dbInyectada?: any) {

    const db = dbInyectada || dbMysql;

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id: number) {
        return db.uno(TABLA, id);
    }

    function eliminar(body: { id: number }) {
        return db.eliminar(TABLA, body);
    }

    function agregar(body: Rol) {
        return db.agregar(TABLA, body);
    }

    return {
        todos,
        uno,
        eliminar,
        agregar,
    };
}