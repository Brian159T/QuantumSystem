import dbPg from '../../DB/pg';
import bcrypt from 'bcrypt';
import auth from '../../auth';
import error from '../../middleware/errors';
import { hashContrasena, requiereRehash } from '../../auth/password';

interface UsuarioLogin {
    correo: string;
    contrasena: string;
}

interface UsuarioRegistro {
    nombre_usuario: string;
    correo: string;
    contrasena: string;
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_VALIDO = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9._ -]{3,50}$/;
const HASH_FALSO = bcrypt.hashSync('contrasena-inexistente', 10);

function usuarioPublico(usuario: any): any {
    return {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        rol: usuario.rol,
    };
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    async function login(correo: string, contrasena: string): Promise<any> {
        const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
        const contrasenaLimpia = typeof contrasena === 'string' ? contrasena : '';

        if (!correoLimpio || !contrasenaLimpia) {
            throw error('Correo o contraseña incorrectos', 401);
        }

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

        const resultado = await db.ejecutar(sql, [correoLimpio]);
        const usuario = resultado[0];
        const coincide = await bcrypt.compare(
            contrasenaLimpia,
            usuario?.contrasena || HASH_FALSO
        );

        if (!usuario || !coincide) {
            throw error('Correo o contraseña incorrectos', 401);
        }

        if (requiereRehash(usuario.contrasena)) {
            await db.ejecutar(
                'UPDATE "Usuarios" SET "contrasena" = $1 WHERE "id_usuario" = $2',
                [await hashContrasena(contrasenaLimpia), usuario.id_usuario]
            );
        }

        const token = auth.asignarToken({
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            id_rol: usuario.id_rol,
            rol: usuario.rol,
        });

        return {
            token,
            usuario: usuarioPublico(usuario),
        };
    }

    async function registro(body: UsuarioRegistro): Promise<any> {
        const nombre = typeof body?.nombre_usuario === 'string' ? body.nombre_usuario.trim() : '';
        const correo = typeof body?.correo === 'string' ? body.correo.trim() : '';
        const contrasena = typeof body?.contrasena === 'string' ? body.contrasena : '';

        if (!nombre || !correo || !contrasena) {
            throw error('Todos los campos son obligatorios', 400);
        }

        if (!NOMBRE_VALIDO.test(nombre)) {
            throw error('El nombre de usuario debe tener entre 3 y 50 caracteres validos', 400);
        }

        if (!CORREO_VALIDO.test(correo) || correo.length > 120) {
            throw error('El correo ingresado no es valido', 400);
        }

        if (contrasena.length < 8 || contrasena.length > 72) {
            throw error('La contraseña debe tener entre 8 y 72 caracteres', 400);
        }

        const hash = await hashContrasena(contrasena);

        const existente = await db.ejecutar(
            'SELECT "id_usuario" FROM "Usuarios" WHERE "correo" = $1',
            [correo]
        );

        if (existente.length > 0) {
            throw error('No se pudo completar el registro con esos datos', 409);
        }

        const rol = await db.query('Roles', { Nombre: 'Cliente' });

        if (!rol) {
            throw error('No se encontro el rol Cliente en el sistema', 500);
        }

        const insercion = await db.agregar('Usuarios', {
            nombre_usuario: nombre,
            correo,
            contrasena: hash,
            id_rol: rol.id_rol,
        });

        if (insercion?.rowCount === 0) {
            throw error('No se pudo completar el registro con esos datos', 409);
        }

        const creado = await db.query('Usuarios', { correo });

        if (!creado) {
            throw error('No se pudo completar el registro con esos datos', 500);
        }

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

    async function sesion(id: number): Promise<any> {
        if (!Number.isInteger(id) || id <= 0) {
            throw error('La sesion ya no es valida', 401);
        }

        const sql = `
            SELECT
                u."id_usuario",
                u."nombre_usuario",
                u."correo",
                r."id_rol",
                r."Nombre" AS rol
            FROM "Usuarios" u
            INNER JOIN "Roles" r
                ON u."id_rol" = r."id_rol"
            WHERE u."id_usuario" = $1
        `;

        const resultado = await db.ejecutar(sql, [id]);

        if (resultado.length === 0) {
            throw error('La sesion ya no es valida', 401);
        }

        return usuarioPublico(resultado[0]);
    }

    return {
        login,
        registro,
        sesion,
    };
}
