import dbMysql from '../../DB/mysql';
import bcrypt from 'bcrypt';

const TABLA = 'Usuarios';
const CAMPO_ID = 'id_usuario';

interface Usuario {

    id_usuario?: number;

    nombre_usuario: string;

    correo: string;

    contrasena: string;

    id_rol: number;

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

    async function agregar(body: Usuario) {

        const usuario = {

            id_usuario: body.id_usuario,

            nombre_usuario: body.nombre_usuario,

            correo: body.correo,

            contrasena: await bcrypt.hash(
                body.contrasena,
                5
            ),

            id_rol: body.id_rol,

        };

        return db.agregar(
            TABLA,
            usuario
        );

    }

    async function actualizar(
        id: number,
        body: Usuario
    ) {

        const usuario: any = {

            nombre_usuario: body.nombre_usuario,

            correo: body.correo,

            id_rol: body.id_rol,

        };

        if (body.contrasena) {

            usuario.contrasena = await bcrypt.hash(
                body.contrasena,
                5
            );

        }

        return db.actualizar(
            TABLA,
            CAMPO_ID,
            id,
            usuario
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