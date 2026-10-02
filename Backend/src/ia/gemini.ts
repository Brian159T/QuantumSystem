// Proveedor de texto: Google Gemini.
//
// Se usa la API REST con fetch nativo (no hay SDK). La clave va en el
// header x-goog-api-key, nunca en la query string: la query string acaba
// en los logs de cualquier proxy o plataforma.
//
// El modelo SIEMPRE viene del .env (GEMINI_CHAT_MODEL). Si se deja
// "gemini-2.5-flash-lite" la API responde 404 para cuentas nuevas; hoy
// el equivalente vigente y gratuito es "gemini-3.5-flash-lite".

import {
    MensajeConversacion,
    OpcionesGeneracion,
    Proveedor,
    leerSSE,
} from './tipos';

const URL_API = 'https://generativelanguage.googleapis.com/v1beta/models';

interface Configuracion {
    clave: string | undefined;
    modelo: string;
}

function leerConfiguracion(): Configuracion {
    return {
        clave: process.env.API_KEY_GOOGLE_AI_STUDIO || process.env.GEMINI_API_KEY,
        modelo: process.env.GEMINI_CHAT_MODEL || 'gemini-3.5-flash-lite',
    };
}

// Gemini usa "model" para las respuestas del asistente y "user" para las
// del usuario.
function aContents(mensajes: MensajeConversacion[]) {
    return mensajes.map((mensaje) => ({
        role: mensaje.rol === 'assistant' ? 'model' : 'user',
        parts: [{ text: mensaje.texto }],
    }));
}

function cuerpo(
    mensajes: MensajeConversacion[],
    opciones: OpcionesGeneracion
) {
    return {
        systemInstruction: {
            parts: [{ text: opciones.systemPrompt }],
        },
        contents: aContents(mensajes),
        generationConfig: {
            temperature: opciones.temperatura ?? 0.2,
            maxOutputTokens: opciones.maxTokens ?? 800,
        },
    };
}

function url(modelo: string, conStream: boolean): string {
    const metodo = conStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
    return `${URL_API}/${modelo}:${metodo}`;
}

function cabeceras(clave: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'x-goog-api-key': clave,
    };
}

function textoDeEventoGemini(evento: any): string | null {
    const partes = evento?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(partes)) return null;
    const texto = partes.map((p: any) => p?.text ?? '').join('');
    return texto || null;
}

async function revisar(
    respuesta: Response,
    modelo: string
): Promise<any> {
    const datos: any = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        throw new Error(
            `Gemini ${respuesta.status} (${modelo}): ${
                datos?.error?.message || 'sin detalle'
            }`
        );
    }
    return datos;
}

function extraerTextoCompleto(datos: any): string {
    const partes = datos?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(partes)) {
        const motivo = datos?.promptFeedback?.blockReason;
        throw new Error(
            `Gemini no devolvio texto${motivo ? ` (motivo: ${motivo})` : ''}`
        );
    }
    return partes.map((p: any) => p?.text ?? '').join('');
}

const proveedor: Proveedor = {
    nombre: 'gemini',

    get modelo() {
        return leerConfiguracion().modelo;
    },

    async generar(mensajes, opciones) {
        const { clave, modelo } = leerConfiguracion();
        if (!clave) throw new Error('Falta API_KEY_GOOGLE_AI_STUDIO en el .env');

        const respuesta = await fetch(url(modelo, false), {
            method: 'POST',
            headers: cabeceras(clave),
            body: JSON.stringify(cuerpo(mensajes, opciones)),
        });

        return extraerTextoCompleto(await revisar(respuesta, modelo));
    },

    async generarEnStream(mensajes, opciones, alEmitir) {
        const { clave, modelo } = leerConfiguracion();
        if (!clave) throw new Error('Falta API_KEY_GOOGLE_AI_STUDIO en el .env');

        const respuesta = await fetch(url(modelo, true), {
            method: 'POST',
            headers: cabeceras(clave),
            body: JSON.stringify(cuerpo(mensajes, opciones)),
        });

        if (!respuesta.ok) {
            const datos: any = await respuesta.json().catch(() => null);
            throw new Error(
                `Gemini ${respuesta.status} (${modelo}): ${
                    datos?.error?.message || 'sin detalle'
                }`
            );
        }

        return leerSSE(respuesta, textoDeEventoGemini, alEmitir);
    },
};

export default proveedor;