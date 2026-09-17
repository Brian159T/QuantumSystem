import { createHash } from 'crypto';

// Servicio compartido de embeddings (Gemini + fallback local).
// Lo usan los modulos al guardar (POST/PUT) para poblar la columna
// "embedding" de cada fila, y comparte logica con
// Backend/scripts/vectorizar_datos.ts (mismo formato de texto,
// mismo modelo y dimension).
//
// SI la API key no esta configurada usa un fallback de feature
// hashing local (deterministico, sin IA). La clave se lee del .env:
//   API_KEY_GOOGLE_AI_STUDIO=...   (o GEMINI_API_KEY=...)
// Modelo configurable con GEMINI_EMBEDDING_MODEL
// (default "gemini-embedding-001"). Dimension recomendada 768.

const DIM = 768;
const API_KEY: string | undefined =
    process.env.API_KEY_GOOGLE_AI_STUDIO || process.env.GEMINI_API_KEY;
const MODELO: string = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const MAX_CHARS = 8000;

// Convierte un objeto en texto "columna:valor columna:valor ..."
// (mismo formato que un objeto fila del vectorizador).
function textoDeObjeto(objeto: Record<string, any>): string {
    return Object.keys(objeto)
        .filter((clave) => clave !== 'embedding')
        .map((clave) => {
            const valor = objeto[clave];
            if (valor === null || valor === undefined || typeof valor === 'object') {
                return null;
            }
            return `${clave}:${String(valor)}`;
        })
        .filter((t): t is string => t !== null)
        .join(' ');
}

// Texto de la fila "efectiva" de una actualizacion: la fila actual
// de la BD combinada con los cambios del PUT (ignora campos undefined).
function textoDeActualizacion(
    actual: Record<string, any>,
    cambios: Record<string, any>
): string {
    const combinada: Record<string, any> = { ...actual };
    Object.keys(cambios).forEach((clave) => {
        if (cambios[clave] !== undefined) combinada[clave] = cambios[clave];
    });
    return textoDeObjeto(combinada);
}

// ---------- Metodo estandar: Gemini (semantico) ----------
async function embeddingGemini(texto: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:embedContent?key=${API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${MODELO}`,
            content: { parts: [{ text: texto }] },
            outputDimensionality: DIM,
        }),
    });
    const data: any = await res.json();
    if (!res.ok) {
        throw new Error(`Gemini ${res.status}: ${JSON.stringify(data)}`);
    }
    const vector = data?.embedding?.values;
    if (!Array.isArray(vector)) {
        throw new Error('Gemini no devolvio valores de embedding');
    }
    return `[${vector.map((v: number) => Number(v).toFixed(6)).join(',')}]`;
}

// ---------- Fallback local (sin IA, deterministico) ----------
function vectorHashing(texto: string): string | null {
    const tokens = texto
        .toLowerCase()
        .split(/[^a-z0-9áéíóúüñãõ]+/u)
        .filter(Boolean);

    if (tokens.length === 0) return null;

    const vec = new Float64Array(DIM);
    for (const token of tokens) {
        const d = createHash('sha1').update(token, 'utf8').digest();
        const indice = d.readUInt32BE(0) % DIM;
        const signo = (d[4] & 1) === 0 ? 1 : -1;
        vec[indice] += signo;
    }

    let norma = 0;
    for (let i = 0; i < DIM; i++) norma += vec[i] * vec[i];
    norma = Math.sqrt(norma);
    if (norma === 0) return null;

    for (let i = 0; i < DIM; i++) vec[i] /= norma;
    return `[${Array.from(vec, (v) => v.toFixed(6)).join(',')}]`;
}

// Vectoriza un texto y devuelve el literal listo para la columna
// "embedding" ("[0.1,0.2,...]") o null si no hubo texto o fallo.
async function vectorizar(texto: string): Promise<string | null> {
    if (!texto) return null;
    const recortado = texto.length > MAX_CHARS ? texto.slice(0, MAX_CHARS) : texto;
    try {
        return API_KEY ? await embeddingGemini(recortado) : vectorHashing(recortado);
    } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err);
        console.error('[embeddings] no se pudo vectorizar:', mensaje);
        return null;
    }
}

// Convierte un objeto en su vector en una sola llamada.
async function embeddingDeObjeto(objeto: Record<string, any>): Promise<string | null> {
    return vectorizar(textoDeObjeto(objeto));
}

// Vector de una actualizacion: fila actual + cambios del PUT.
async function embeddingDeActualizacion(
    actual: Record<string, any>,
    cambios: Record<string, any>
): Promise<string | null> {
    return vectorizar(textoDeActualizacion(actual, cambios));
}

export default {
    textoDeObjeto,
    textoDeActualizacion,
    vectorizar,
    embeddingDeObjeto,
    embeddingDeActualizacion,
};