// =====================================================
// vectorizar_datos.ts  (metodo ESTANDAR: embeddings de IA)
// Vectoriza SOLO las filas cuyo campo "embedding" esta en
// NULL en las 3 tablas con campo vectorial y datos no personales
// (Vehiculos, Servicios_Tecnicos, Estaciones_Carga):
//   1. Arma el texto de la fila con la ALLOWLIST de columnas
//      compartida con src/embeddings/index.ts
//      ("columna:valor columna:valor ...").
//   2. Llama al modelo de embeddings de Google Gemini
//      (gemini-embedding-001) y obtiene un vector
//      semantico de DIM dimensiones.
//   3. Guarda ese vector en la columna "embedding".
//
// SEGURIDAD: "Usuarios" y "Reservas" quedan FUERA a proposito
// (contienen correo, hash de contrasena, nombres y cedula).
// El texto se valida con la denylist compartida antes de salir.
// Ver docs/Decisiones-tecnicas.md, seccion "Plan de seguridad:
// dejar de enviar datos personales a Gemini".
//
// Como omite las filas ya vectorizadas (embedding != NULL),
// se puede reejecutar tras cada alta: solo procesa las filas
// nuevas que todavia no tienen vector.
//
// Asi, el backend puede hacer busquedas por similitud
// (operador <=> de pgvector), pasar el contexto a la IA del
// chatbot y devolver la respuesta al frontend.
//
// SI la API key no esta configurada, usa un fallback de
// feature hashing local (deterministico, sin IA).
// La clave se lee del .env del Backend (carpeta superior):
//   API_KEY_GOOGLE_AI_STUDIO=...   (o GEMINI_API_KEY=...)
//
// Uso (desde la carpeta Backend/):
//   npx ts-node scripts/vectorizar_datos.ts
//
// Conexion por variables de entorno (o defaults):
//   PGHOST | PGUSER | PGPORT | PGDATABASE
// Modelo configurable con GEMINI_EMBEDDING_MODEL
// (default "gemini-embedding-001"). Dimension recomendada 768.
// =====================================================

import { createHash } from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';
import { COLUMNAS_POR_TABLA, textoDeFila, contieneProhibido } from '../src/embeddings';

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

// Las unicas tablas que el backend vectoriza. La allowlist de
// columnas vive en src/embeddings/index.ts y es la misma que
// usan los controladores en los POST/PUT.
const TABLAS: Tabla[] = [
    { tabla: 'Vehiculos', pk: 'id_vehiculo' },
    { tabla: 'Servicios_Tecnicos', pk: 'id_servicio' },
    { tabla: 'Estaciones_Carga', pk: 'id_estacion' },
];

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
        const columnas = COLUMNAS_POR_TABLA[tabla];

        if (!columnas) {
            console.log(`${tabla}: sin allowlist de columnas, se omite`);
            continue;
        }

        const selectCols = columnas.map((c) => `"${c}"`).join(', ');
        const filasRes = await client.query(
            `SELECT "${pk}", ${selectCols} FROM "${tabla}" WHERE "embedding" IS NULL`
        );

        let actualizadas = 0;
        let sinTexto = 0;
        let bloqueados = 0;
        let errores = 0;

        await client.query('BEGIN');
        for (const fila of filasRes.rows) {
            const textoBase = textoDeFila(tabla, fila);
            if (!textoBase) {
                sinTexto++;
                continue;
            }
            let texto = textoBase;
            if (texto.length > MAX_CHARS) {
                texto = texto.slice(0, MAX_CHARS);
            }

            if (contieneProhibido(texto)) {
                bloqueados++;
                console.error(`  ${tabla} id=${fila[pk]}: bloqueado por la denylist`);
                continue;
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
                (bloqueados ? `, ${bloqueados} bloqueadas por la denylist` : '') +
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