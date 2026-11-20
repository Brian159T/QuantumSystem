import dbPg from '../../DB/pg';
import error from '../../middleware/errors';
import { hashContrasena } from '../../auth/password';

const TABLA = 'Usuarios';
const CAMPO_ID = 'id_usuario';
const CAMPOS_PUBLICOS = '"id_usuario", "nombre_usuario", "correo", "id_rol"';
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_VALIDO = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9._ -]{3,50}$/;

interface Usuario {
    nombre_usuario: string;
    correo: string;
    contrasena: string;
    id_rol: number;
}

function validarNombre(nombre: string): void {
    if (!NOMBRE_VALIDO.test(nombre)) {
        throw error('El nombre de usuario debe tener entre 3 y 50 caracteres validos', 400);
    }
}

function validarContrasena(contrasena: string): void {
    if (contrasena.length < 8 || contrasena.length > 72) {
        throw error('La contraseña debe tener entre 8 y 72 caracteres', 400);
    }
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    function todos() {
        return db.ejecutar(
            `SELECT ${CAMPOS_PUBLICOS} FROM "Usuarios" ORDER BY "id_usuario"`
        );
    }

    function uno(id: number) {
        return db
            .ejecutar(
                `SELECT ${CAMPOS_PUBLICOS} FROM "Usuarios" WHERE "id_usuario" = $1`,
                [id]
            )
            .then((filas: any[]) => filas[0]);
    }

    function eliminar(id: number) {
        return db.eliminar(TABLA, CAMPO_ID, id);
    }

    async function agregar(body: Usuario) {
        const nombre =
            typeof body?.nombre_usuario === 'string' ? body.nombre_usuario.trim() : '';
        const correo = typeof body?.correo === 'string' ? body.correo.trim() : '';
        const contrasena = typeof body?.contrasena === 'string' ? body.contrasena : '';
        const idRol = Number(body?.id_rol);

        if (!nombre || !correo || !contrasena) {
            throw error('Nombre, correo, contraseña y rol son obligatorios', 400);
        }

        if (!CORREO_VALIDO.test(correo) || correo.length > 120) {
            throw error('El correo ingresado no es valido', 400);
        }

        if (!Number.isInteger(idRol) || idRol <= 0) {
            throw error('El rol ingresado no es valido', 400);
        }

        validarNombre(nombre);
        validarContrasena(contrasena);

        return db.agregar(TABLA, {
            nombre_usuario: nombre,
            correo,
            contrasena: await hashContrasena(contrasena),
            id_rol: idRol,
        });
    }

    async function actualizar(id: number, body: Usuario) {
        const usuario: any = {
            nombre_usuario:
                typeof body?.nombre_usuario === 'string'
                    ? body.nombre_usuario.trim()
                    : undefined,
            correo: typeof body?.correo === 'string' ? body.correo.trim() : undefined,
            id_rol: body?.id_rol === undefined ? undefined : Number(body.id_rol),
        };

        if (usuario.nombre_usuario !== undefined) {
            validarNombre(usuario.nombre_usuario);
        }

        if (
            usuario.correo !== undefined &&
            (!CORREO_VALIDO.test(usuario.correo) || usuario.correo.length > 120)
        ) {
            throw error('El correo ingresado no es valido', 400);
        }

        if (
            usuario.id_rol !== undefined &&
            (!Number.isInteger(usuario.id_rol) || usuario.id_rol <= 0)
        ) {
            throw error('El rol ingresado no es valido', 400);
        }

        if (typeof body?.contrasena === 'string' && body.contrasena) {
            validarContrasena(body.contrasena);
            usuario.contrasena = await hashContrasena(body.contrasena);
        }

        return db.actualizar(TABLA, CAMPO_ID, id, usuario);
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    };
}
