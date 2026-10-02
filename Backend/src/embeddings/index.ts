import { createHash } from 'crypto';

// Servicio compartido de embeddings (Gemini + fallback local).
// Lo usan los modulos al guardar (POST/PUT) para poblar la columna
// "embedding" de cada fila, y comparte logica con
// Backend/scripts/vectorizar_datos.ts (mismo texto, mismo modelo,
// misma dimension).
//
// SEGURIDAD: solo se vectorizan las tablas de la allowlist
// COLUMNAS_POR_TABLA, y solo con las columnas listadas en ella.
// Cualquier otra tabla se rechaza: "Usuarios" (correo, hash bcrypt)
// y "Reservas" (nombres, cedula_identidad) quedan fuera por
// construccion, no por configuracion. Ver docs/Decisiones-tecnicas.md,
// seccion "Plan de seguridad: dejar de enviar datos personales a Gemini".
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

// Allowlist: unica fuente de verdad de que sale del servidor.
// Las columnas listadas son las que aportan significado semantico
// para el chatbot del catalogo. Cualquier columna no listada
// (ids, correos, cedulas, contrasenas, telefonos) no sale nunca.
const COLUMNAS_POR_TABLA: Record<string, string[]> = {
    Vehiculos: [
        'Nombre_Modelo',
        'Tipo',
        'Autonomia',
        'Capacidad_Bateria',
        'Velocidad_Maxima',
        'Carga_Rapida',
        'Tiempo_Carga_Normal',
        'Traccion',
        'Nro_Asientos',
        'Precio_USD',
    ],
    Servicios_Tecnicos: ['direccion', 'horarios', 'Estado', 'latitud', 'longitud'],
    Estaciones_Carga: ['direccion', 'horarios', 'Estado', 'latitud', 'longitud'],
};

// Denylist: segunda capa de defensa sobre el texto ya armado, por si
// un dato personal se colara dentro de una columna permitida
// (por ejemplo un correo escrito dentro de "horarios").
// Si algo coincide, NO se llama a Gemini y se avisa por consola.
const PATRONES_PROHIBIDOS: { patron: RegExp; motivo: string }[] = [
    { patron: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, motivo: 'correo' },
    { patron: /\b\d{7,14}\b/, motivo: 'numero de documento o telefono' },
    { patron: /contrase|contrasena|password|clave_hash|secret/i, motivo: 'clave' },
];

// Si no hay clave, vectorizar cae al feature hashing local: vectores de
// 768 dims con el formato correcto pero SIN significado semantico. Quien
// dependa de que el vector signifique algo (el RAG del chatbot) debe
// comprobar esto antes y fallar en vez de devolver basura creible.
function hayClave(): boolean {
    return Boolean(API_KEY);
}

function tablaPermitida(tabla: string): boolean {
    return Object.prototype.hasOwnProperty.call(COLUMNAS_POR_TABLA, tabla);
}

function columnasPermitidas(tabla: string): string[] {
    return COLUMNAS_POR_TABLA[tabla] ? COLUMNAS_POR_TABLA[tabla].slice() : [];
}

function contieneProhibido(texto: string): string | null {
    for (const { patron, motivo } of PATRONES_PROHIBIDOS) {
        if (patron.test(texto)) return motivo;
    }
    return null;
}

// Convierte una fila en texto "columna:valor columna:valor ...".
// Solo usa las columnas de la allowlist de la tabla indicada.
function textoDeFila(
    tabla: string,
    fila: Record<string, any>
): string | null {
    if (!tablaPermitida(tabla)) {
        console.warn(
            `[embeddings] tabla "${tabla}" fuera de la allowlist: no se vectoriza`
        );
        return null;
    }

    const texto = columnasPermitidas(tabla)
        .map((columna) => {
            const valor = fila[columna];
            if (valor === null || valor === undefined || typeof valor === 'object') {
                return null;
            }
            return `${columna}:${String(valor)}`;
        })
        .filter((t): t is string => t !== null)
        .join(' ');

    if (!texto) return null;

    const motivo = contieneProhibido(texto);
    if (motivo) {
        console.error(
            `[embeddings] bloqueado el envio a Gemini en "${tabla}": parece contener un ${motivo}`
        );
        return null;
    }

    return texto;
}

// Texto de la fila "efectiva" de una actualizacion: la fila actual
// de la BD combinada con los cambios del PUT (ignora campos undefined).
function textoDeActualizacion(
    tabla: string,
    actual: Record<string, any>,
    cambios: Record<string, any>
): string | null {
    const combinada: Record<string, any> = { ...actual };
    Object.keys(cambios).forEach((clave) => {
        if (cambios[clave] !== undefined) combinada[clave] = cambios[clave];
    });
    return textoDeFila(tabla, combinada);
}

// ---------- Metodo estandar: Gemini (semantico) ----------
async function embeddingGemini(texto: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:embedContent`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY as string,
        },
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

// Vector de una fila de una tabla permitida.
async function embeddingDeFila(
    tabla: string,
    fila: Record<string, any>
): Promise<string | null> {
    return vectorizar(textoDeFila(tabla, fila) || '');
}

// Vector de una actualizacion: fila actual + cambios del PUT.
async function embeddingDeActualizacion(
    tabla: string,
    actual: Record<string, any>,
    cambios: Record<string, any>
): Promise<string | null> {
    return vectorizar(textoDeActualizacion(tabla, actual, cambios) || '');
}

export default {
    hayClave,
    tablaPermitida,
    columnasPermitidas,
    contieneProhibido,
    textoDeFila,
    textoDeActualizacion,
    vectorizar,
    embeddingDeFila,
    embeddingDeActualizacion,
};

export {
    COLUMNAS_POR_TABLA,
    PATRONES_PROHIBIDOS,
    hayClave,
    tablaPermitida,
    columnasPermitidas,
    contieneProhibido,
    textoDeFila,
    textoDeActualizacion,
    vectorizar,
    DIM,
    MODELO,
    MAX_CHARS,
};