// Selector de proveedor de IA.
//
// El unico punto del backend que decide a quien se le pregunta. Todo lo
// demas importa "proveedor" de aqui, asi que cambiar de proveedor es
// cambiar CHAT_PROVEEDOR en el .env (gemini | deepseek), no codigo.
//
// Decision de diseno (docs/Decisiones-tecnicas.md): el nombre del modelo
// SIEMPRE vive en el .env, nunca hardcodeado, aunque hoy haya un solo
// proveedor. Asi migrar de Gemini a DeepSeek es editar una linea.

import { MensajeConversacion, OpcionesGeneracion, Proveedor } from './tipos';
import gemini from './gemini';
import deepseek from './deepseek';

const PROVEEDORES: Record<string, Proveedor> = {
    gemini,
    deepseek,
};

function nombreProveedor(): string {
    return (process.env.CHAT_PROVEEDOR || 'gemini').toLowerCase();
}

function elegirProveedor(): Proveedor {
    const nombre = nombreProveedor();
    const encontrado = PROVEEDORES[nombre];
    if (!encontrado) {
        throw new Error(
            `CHAT_PROVEEDOR="${nombre}" no existe. Opciones: ${Object.keys(
                PROVEEDORES
            ).join(', ')}`
        );
    }
    return encontrado;
}

const proveedor: Proveedor = {
    get nombre() {
        return elegirProveedor().nombre;
    },

    get modelo() {
        return elegirProveedor().modelo;
    },

    generar(mensajes: MensajeConversacion[], opciones: OpcionesGeneracion) {
        return elegirProveedor().generar(mensajes, opciones);
    },

    generarEnStream(
        mensajes: MensajeConversacion[],
        opciones: OpcionesGeneracion,
        alEmitir: (trozo: string) => void
    ) {
        return elegirProveedor().generarEnStream(mensajes, opciones, alEmitir);
    },
};

// Estado para GET /api/chatbot/estado: la UI usa esto para mostrar
// "En linea" o el motivo por el que el chat no va a funcionar.
function estado() {
    const elegido = elegirProveedor();
    const clave =
        elegido.nombre === 'gemini'
            ? process.env.API_KEY_GOOGLE_AI_STUDIO || process.env.GEMINI_API_KEY
            : process.env.DEEPSEEK_API_KEY;

    return {
        proveedor: elegido.nombre,
        modelo: elegido.modelo,
        tieneClave: Boolean(clave),
        ragOperativo:
            Boolean(process.env.API_KEY_GOOGLE_AI_STUDIO || process.env.GEMINI_API_KEY) &&
            process.env.CHAT_RAG !== 'false',
    };
}

export default proveedor;
export { estado };
export * from './tipos';