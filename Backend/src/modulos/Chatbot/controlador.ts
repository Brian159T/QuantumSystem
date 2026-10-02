// Modulo Chatbot:_endpoint del asistente con IA.
//
// POST /            -> respuesta completa en el sobre {error,status,body}
// POST /stream      -> SSE, la respuesta llega por trozos mientras se genera
// GET  /estado      -> proveedor, modelo y si el chat puede funcionar
//
// El controlador no sabe quien es el proveedor de IA ni como se buscan las
// filas: eso vive en src/ia y src/rag respectively. Aqui solo se orquestan
// los tres pasos (recuperar contexto -> pedir respuesta -> devolverla).

import dbPg from '../../DB/pg';
import error from '../../middleware/errors';
import ia, { estado as estadoProveedor } from '../../ia';
import rag from '../../rag';

const MAX_MENSAJES_HISTORIAL = 6;
const MAX_LARGO_PREGUNTA = 500;
const MAX_LARGO_TURNO = 1000;

export interface Turno {
    rol: 'user' | 'assistant';
    texto: string;
}

// El historial llega del cliente, asi que se sanea: solo rol user/assistant
// y texto plano recortado. Nunca se interpola en SQL ni se reenvia crudo.
function limpiarHistorial(entrada: any): Turno[] {
    if (!Array.isArray(entrada)) return [];
    return entrada
        .slice(-MAX_MENSAJES_HISTORIAL)
        .map((turno: any): Turno => ({
            rol: turno?.rol === 'assistant' ? 'assistant' : 'user',
            texto: String(turno?.texto ?? '').slice(0, MAX_LARGO_TURNO).trim(),
        }))
        .filter((turno) => turno.texto.length > 0);
}

function limpiarPregunta(mensaje: any): string {
    return String(mensaje ?? '')
        .slice(0, MAX_LARGO_PREGUNTA)
        .trim();
}

// Paso 1 y 2: recuperar el contexto en la base y armar lo que se le pide
// al modelo. Se separa de la escritura porque en modo streaming los
// headers se escriben antes de tener la respuesta.
async function preparar(mensaje: any, historial: any) {
    const pregunta = limpiarPregunta(mensaje);

    if (!pregunta) {
        throw error('Escribe una pregunta para el asistente', 400);
    }

    const turnos = limpiarHistorial(historial);
    const recuperacion = await rag.recuperar(pregunta);
    const contexto = rag.construirContexto(recuperacion.fuentes);

    return {
        pregunta,
        contexto,
        systemPrompt: rag.promptSistema(contexto),
        mensajes: rag.construirMensajes(pregunta, turnos),
        fuentes: recuperacion.fuentes,
    };
}

// POST /api/chatbot: la respuesta entera de una vez (mas simple de testear).
async function preguntar(mensaje: any, historial: any): Promise<any> {
    const preparado = await preparar(mensaje, historial);

    const texto = await ia.generar(preparado.mensajes, {
        systemPrompt: preparado.systemPrompt,
    });

    return {
        texto,
        fuentes: preparado.fuentes,
        proveedor: ia.nombre,
        modelo: ia.modelo,
    };
}

// POST /api/chatbot/stream: delega cada fragmento al escritor de la ruta.
// Si recuperar o generar falla, el error sube por la ruta y ahi se
// convierte en evento "error" (los headers ya salieron, asi que no se
// puede responder con el sobre JSON).
async function preguntarEnStream(
    mensaje: any,
    historial: any,
    alEmitir: (evento: string, datos: any) => void
): Promise<{ texto: string; fuentes: any[] }> {
    const preparado = await preparar(mensaje, historial);

    alEmitir('contexto', {
        fuentes: preparado.fuentes,
        proveedor: ia.nombre,
        modelo: ia.modelo,
    });

    const texto = await ia.generarEnStream(
        preparado.mensajes,
        { systemPrompt: preparado.systemPrompt },
        (trozo) => alEmitir('token', { texto: trozo })
    );

    alEmitir('fin', { texto, fuentes: preparado.fuentes });

    return { texto, fuentes: preparado.fuentes };
}

// GET /api/chatbot/estado: la UI lo usa para mostrar "En linea" o el
// motivo por el que el chat no va a funcionar.
function estado(): any {
    const info = estadoProveedor();

    return {
        enLinea: info.tieneClave,
        proveedor: info.proveedor,
        modelo: info.modelo,
        ragOperativo: info.ragOperativo,
        tablasIndexadas: rag.tablasIndexables(),
        mensaje: info.tieneClave
            ? 'Asistente listo'
            : 'Asistente sin configurar: falta la clave de IA en el backend',
    };
}

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    return {
        preguntar,
        preguntarEnStream,
        estado,
    };
}