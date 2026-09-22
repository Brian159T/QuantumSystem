import dbPg from '../../DB/pg';
import bcrypt from 'bcrypt';
import auth from '../../auth';
import error from '../../middleware/errors';

interface UsuarioLogin {

    correo: string;

    contrasena: string;

}

export default function (dbInyectada?: any) {

    const db = dbInyectada || dbPg;

    async function login(
        correo: string,
        contrasena: string
    ): Promise<any> {

        const sql = `
            SELECT
                u."id_usuario",
                u."nombre_usuario",
                u."correo",
                u."contrasena",
                r."id_rol",
                r."Nombre" AS rol
            FROM "Usuarios" u
            INNER JOIN "Roles" r
                ON u."id_rol" = r."id_rol"
            WHERE u."correo" = $1
        `;

        const resultado = await db.ejecutar(sql, [correo]);

        if (resultado.length === 0) {
            throw error('Correo o contraseña incorrectos', 401);
        }

        const usuario = resultado[0];

        const coincide = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!coincide) {
            throw error('Correo o contraseña incorrectos', 401);
        }

        const token = auth.asignarToken({
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            id_rol: usuario.id_rol,
            rol: usuario.rol
        });

        return {

            token,

            usuario: {

                id_usuario: usuario.id_usuario,

                nombre_usuario: usuario.nombre_usuario,

                correo: usuario.correo,

                id_rol: usuario.id_rol,

                rol: usuario.rol

            }

        };

    }

    return {

        login

    };

}