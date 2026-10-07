import dbPg from '../../DB/pg';
import bcrypt from 'bcrypt';
import auth from '../../auth';
import error from '../../middleware/errors';

interface UsuarioLogin {

    correo: string;

    contrasena: string;

}

interface UsuarioRegistro {

    nombre_usuario: string;

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

    async function registro(body: UsuarioRegistro): Promise<any> {

        const nombre = typeof body.nombre_usuario === 'string' ? body.nombre_usuario.trim() : '';

        const correo = typeof body.correo === 'string' ? body.correo.trim() : '';

        const contrasena = typeof body.contrasena === 'string' ? body.contrasena : '';

        if (!nombre || !correo || !contrasena) {
            throw error('Todos los campos son obligatorios', 400);
        }

        if (!correo.includes('@')) {
            throw error('El correo ingresado no es valido', 400);
        }

        const existente = await db.ejecutar(
            'SELECT "id_usuario" FROM "Usuarios" WHERE "correo" = $1',
            [correo]
        );

        if (existente.length > 0) {
            throw error('Ya existe una cuenta con ese correo', 409);
        }

        const rol = await db.query('Roles', { Nombre: 'Cliente' });

        if (!rol) {
            throw error('No se encontro el rol Cliente en el sistema', 500);
        }

        await db.agregar('Usuarios', {

            nombre_usuario: nombre,

            correo,

            contrasena: await bcrypt.hash(contrasena, 5),

            id_rol: rol.id_rol,

        });

        const creado = await db.query('Usuarios', { correo });

        const usuario = {

            id_usuario: creado.id_usuario,

            nombre_usuario: creado.nombre_usuario,

            correo: creado.correo,

            id_rol: creado.id_rol,

            rol: rol.Nombre,

        };

        const token = auth.asignarToken(usuario);

        return {

            token,

            usuario,

        };

    }

    return {

        login,

        registro,

    };

}