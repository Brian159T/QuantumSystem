import dbMysql from '../../DB/mysql';
import bcrypt from 'bcrypt';
import auth from '../../auth';

interface UsuarioLogin {

    correo: string;

    contrasena: string;

}

export default function (dbInyectada?: any) {

    const db = dbInyectada || dbMysql;

    async function login(
        correo: string,
        contrasena: string
    ): Promise<any> {

        const sql = `
            SELECT
                u.id_usuario,
                u.nombre_usuario,
                u.correo,
                u.contrasena,
                r.id_rol,
                r.Nombre AS rol
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            WHERE u.correo = ?
        `;

        const resultado = await db.ejecutar(sql, [correo]);

        if (resultado.length === 0) {
            throw new Error('Correo o contraseña incorrectos');
        }

        const usuario = resultado[0];

        const coincide = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!coincide) {
            throw new Error('Correo o contraseña incorrectos');
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