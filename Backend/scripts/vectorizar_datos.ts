// =====================================================
// vectorizar_datos.ts  (metodo ESTANDAR: embeddings de IA)
// Vectoriza SOLO las filas cuyo campo "embedding" esta en
// NULL en las tablas con campo vectorial
// (Usuarios, Vehiculos, Reservas, Servicios_Tecnicos,
//  Estaciones_Carga):
//   1. Concatena todos los campos de la fila en texto
//      ("columna:valor columna:valor ...").
//   2. Llama al modelo de embeddings de Google Gemini
//      (gemini-embedding-001/002) y obtiene un vector
//      semantico de DIM dimensiones.
//   3. Guarda ese vector en la columna "embedding".
//
// Como omite las filas ya vectorizadas (embedding != NULL),
// se puede reejecutar tras cada alta: solo procesa las filas
// nuevas que todavia no tienen vector.
//
// Asi, mas adelante el backend puede hacer busquedas por
// similitud (operador <=> de pgvector), pasar el contexto
// a la IA del chatbot y devolver la respuesta al frontend.
//
// SI la API key no esta configurada, usa un fallback de
// feature hashing local (deterministico, sin IA).
// La clave se lee del .env del Backend (carpeta superior):
//   API_KEY_GOOGLE_AI_STUDIO=...   (o GEMINI_API_KEY=...)
//
// Uso (desde la carpeta Backend/scripts/):
//   set PGPASSWORD=tu_password
//   npx ts-node vectorizar_datos.ts
//
// Conexion por variables de entorno (o defaults):
//   PGHOST | PGUSER | PGPORT | PGDATABASE
// Modelo configurable con GEMINI_EMBEDDING_MODEL
// (default "gemini-embedding-001"; tambien disponible
//  "gemini-embedding-2"). Dimension recomendada 768.
// =====================================================

import { createHash } from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

interface Tabla {
    tabla: string;
    pk: string;
}

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DIM = 768;
const API_KEY: string | undefined =
    process.env.API_KEY_GOOGLE_AI_STUDIO || process.env.GEMINI_API_KEY;
const MODELO: string = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const MAX_CHARS = 8000;

const TABLAS: Tabla[] = [
    { tabla: 'Usuarios', pk: 'id_usuario' },
    { tabla: 'Vehiculos', pk: 'id_vehiculo' },
    { tabla: 'Reservas', pk: 'id_reserva' },
    { tabla: 'Servicios_Tecnicos', pk: 'id_servicio' },
    { tabla: 'Estaciones_Carga', pk: 'id_estacion' },
];

function textoDeFila(fila: Record<string, any>, columnas: string[]): string {
    return columnas
        .map((col) => {
            const valor = fila[col];
            if (valor === null || valor === undefined) return null;
            return `${col}:${String(valor)}`;
        })
        .filter((t) => t !== null)
        .join(' ');
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

async function main(): Promise<void> {
    const client = new Client({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || 'QuantumSystemDB',
    });

    await client.connect();
    console.log(
        API_KEY
            ? `Metodo: Gemini (${MODELO})`
            : 'Metodo: fallback local (GEMINI_API_KEY no configurada)'
    );

    for (const { tabla, pk } of TABLAS) {
        const columnasRes = await client.query<{ column_name: string }>(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = $1
              ORDER BY ordinal_position`,
            [tabla]
        );
        const columnas = columnasRes.rows
            .map((c) => c.column_name)
            .filter((c) => c !== 'embedding');

        const selectCols = columnas.map((c) => `"${c}"`).join(', ');
        const filasRes = await client.query(
            `SELECT "${pk}", ${selectCols} FROM "${tabla}" WHERE "embedding" IS NULL`
        );

        let actualizadas = 0;
        let sinTexto = 0;
        let errores = 0;

        await client.query('BEGIN');
        for (const fila of filasRes.rows) {
            let texto = textoDeFila(fila, columnas);
            if (!texto) {
                sinTexto++;
                continue;
            }
            if (texto.length > MAX_CHARS) {
                texto = texto.slice(0, MAX_CHARS);
            }

            try {
                const literal = API_KEY
                    ? await embeddingGemini(texto)
                    : vectorHashing(texto);
                if (!literal) {
                    sinTexto++;
                    continue;
                }
                await client.query(
                    `UPDATE "${tabla}" SET "embedding" = $1::vector WHERE "${pk}" = $2`,
                    [literal, fila[pk]]
                );
                actualizadas++;
                if (API_KEY) await new Promise((r) => setTimeout(r, 120));
            } catch (err) {
                errores++;
                const mensaje = err instanceof Error ? err.message : String(err);
                console.error(`  ${tabla} id=${fila[pk]}: ${mensaje}`);
            }
        }
        await client.query('COMMIT');

        console.log(
            `${tabla}: ${actualizadas} filas vectorizadas` +
                (sinTexto ? `, ${sinTexto} sin texto` : '') +
                (errores ? `, ${errores} con error` : '')
        );
    }

    await client.end();
}

main().catch((err) => {
    const mensaje = err instanceof Error ? err.message : String(err);
    console.error('ERROR:', mensaje);
    process.exit(1);
});