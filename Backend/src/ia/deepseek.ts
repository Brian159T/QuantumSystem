// Proveedor de texto: DeepSeek (destino de pago del roadmap).
//
// NO esta activo: se activa poniendo CHAT_PROVEEDOR=deepseek y
// DEEPSEEK_API_KEY en el .env. Cumple exactamente el mismo contrato que
// Gemini, asi que el controlador del chatbot no cambia ni una linea.
//
// Ojo: DeepSeek exige una cuenta con saldo desde el dia 1 (tras los
// 5M tokens de regalo no deja continuar). Ver docs/Decisiones-tecnicas.md,
// seccion "Modelo de IA del chatbot: decision y plan de migracion".

import {
    MensajeConversacion,
    OpcionesGeneracion,
    Proveedor,
    leerSSE,
} from './tipos';

const URL_API = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

function leerConfiguracion() {
    return {
        clave: process.env.DEEPSEEK_API_KEY,
        modelo: process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-flash',
    };
}

function cuerpo(
    mensajes: MensajeConversacion[],
    opciones: OpcionesGeneracion
) {
    return {
        model: leerConfiguracion().modelo,
        messages: [
            { role: 'system', content: opciones.systemPrompt },
            ...mensajes.map((mensaje) => ({
                role: mensaje.rol,
                content: mensaje.texto,
            })),
        ],
        temperature: opciones.temperatura ?? 0.2,
        max_tokens: opciones.maxTokens ?? 800,
        stream: false,
    };
}

function textoDeEventoDeepseek(evento: any): string | null {
    const eleccion = evento?.choices?.[0];
    const texto = eleccion?.delta?.content ?? eleccion?.message?.content ?? null;
    return texto || null;
}

const proveedor: Proveedor = {
    nombre: 'deepseek',

    get modelo() {
        return leerConfiguracion().modelo;
    },

    async generar(mensajes, opciones) {
        const { clave } = leerConfiguracion();
        if (!clave) throw new Error('Falta DEEPSEEK_API_KEY en el .env');

        const respuesta = await fetch(URL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${clave}`,
            },
            body: JSON.stringify(cuerpo(mensajes, opciones)),
        });

        const datos: any = await respuesta.json().catch(() => null);
        if (!respuesta.ok) {
            throw new Error(
                `DeepSeek ${respuesta.status}: ${
                    datos?.error?.message || 'sin detalle'
                }`
            );
        }

        const texto = datos?.choices?.[0]?.message?.content;
        if (!texto) throw new Error('DeepSeek no devolvio texto');
        return texto;
    },

    async generarEnStream(mensajes, opciones, alEmitir) {
        const { clave } = leerConfiguracion();
        if (!clave) throw new Error('Falta DEEPSEEK_API_KEY en el .env');

        const respuesta = await fetch(URL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${clave}`,
            },
            body: JSON.stringify({ ...cuerpo(mensajes, opciones), stream: true }),
        });

        if (!respuesta.ok) {
            const datos: any = await respuesta.json().catch(() => null);
            throw new Error(
                `DeepSeek ${respuesta.status}: ${
                    datos?.error?.message || 'sin detalle'
                }`
            );
        }

        return leerSSE(respuesta, textoDeEventoDeepseek, alEmitir);
    },
};

export default proveedor;