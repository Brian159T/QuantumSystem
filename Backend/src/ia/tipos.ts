// Contrato comun a todos los proveedores de IA.
//
// El resto del backend NUNCA habla con Gemini ni con DeepSeek
// directamente: siempre habla con un "Proveedor". Asi migrar de
// proveedor es cambiar CHAT_PROVEEDOR en el .env, no reescribir codigo.

export interface MensajeConversacion {
    rol: 'user' | 'assistant';
    texto: string;
}

export interface OpcionesGeneracion {
    systemPrompt: string;
    temperatura?: number;
    maxTokens?: number;
}

export interface Proveedor {
    // Identificador corto: "gemini" | "deepseek"
    nombre: string;
    // Modelo en uso, tal cual viene del .env
    modelo: string;
    // El backend responde entero, sin streaming (mas simple de testear)
    generar(
        mensajes: MensajeConversacion[],
        opciones: OpcionesGeneracion
    ): Promise<string>;
    // Responde por trozos; alEmitir se llama con cada fragmento de texto.
    // Devuelve la respuesta completa.
    generarEnStream(
        mensajes: MensajeConversacion[],
        opciones: OpcionesGeneracion,
        alEmitir: (trozo: string) => void
    ): Promise<string>;
}

// Lee un stream SSE de la API y entrega cada trozo de texto.
// Compartido por los dos proveedores porque ambos responden con SSE.
export async function leerSSE(
    respuesta: Response,
    extraerTexto: (evento: any) => string | null,
    alEmitir: (trozo: string) => void
): Promise<string> {
    const cuerpo = respuesta.body;

    if (!cuerpo) {
        throw new Error('La API de IA no devolvio stream');
    }

    const lector = cuerpo.getReader();
    const decodificador = new TextDecoder();
    let buffer = '';
    let acumulado = '';

    const procesar = (bloque: string) => {
        for (const linea of bloque.split('\n')) {
            const trimmed = linea.trim();
            if (!trimmed.startsWith('data:')) continue;
            const datos = trimmed.slice(5).trim();
            if (!datos || datos === '[DONE]') continue;
            try {
                const texto = extraerTexto(JSON.parse(datos));
                if (texto) {
                    acumulado += texto;
                    alEmitir(texto);
                }
            } catch {
                // Un trozo ilegible no debe tumbar la respuesta entera
            }
        }
    };

    try {
        for (;;) {
            const { done, value } = await lector.read();
            if (done) break;
            buffer += decodificador.decode(value, { stream: true });
            const bloques = buffer.split('\n\n');
            buffer = bloques.pop() ?? '';
            bloques.forEach(procesar);
        }
        procesar(buffer);
    } finally {
        lector.releaseLock();
    }

    return acumulado;
}