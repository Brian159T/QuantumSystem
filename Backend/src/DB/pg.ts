import { Pool, types } from 'pg';
import config from '../config';

interface Data {
    id?: number;
    [key: string]: any;
}

const dbConfig = {
    host: config.pg.host,
    user: config.pg.user,
    password: config.pg.password,
    database: config.pg.database,
    port: config.pg.port,
};

const pool = new Pool(dbConfig);

// PostgreSQL devuelve DATE como objeto Date; se mantiene el formato
// string 'YYYY-MM-DD' para no alterar la respuesta que conocen los frontends.
types.setTypeParser(1082, (valor) => valor);

pool.on('error', (err) => {
    console.log('[db error]', err);
});

function verificarConexion(): void {
    pool.query('SELECT 1')
        .then(() => {
            console.log('DB conectada!!!');
        })
        .catch((err: Error) => {
            console.log('[db error]', err);
            setTimeout(verificarConexion, 2000);
        });
}

verificarConexion();

function identificar(nombre: string): string {
    return `"${String(nombre).replace(/"/g, '""')}"`;
}

function lugaresDesde(claves: string[]): string {
    return claves.map((_, i) => `$${i + 1}`).join(', ');
}

function sinIndefinidos(data: Data): string[] {
    return Object.keys(data).filter((clave) => data[clave] !== undefined);
}

// Un valor envuelto en { vector: "..." } se inserta con casteo
// ::vector para la columna "embedding" de pgvector.
function esVector(valor: any): valor is { vector: string } {
    return (
        valor !== null &&
        typeof valor === 'object' &&
        typeof valor.vector === 'string'
    );
}

function todos(tabla: string): Promise<any> {
    return pool
        .query(`SELECT * FROM ${identificar(tabla)}`)
        .then((resultado) => resultado.rows);
}

function uno(
    tabla: string,
    campoId: string,
    id: number
): Promise<any> {
    return pool
        .query(
            `SELECT * FROM ${identificar(tabla)} WHERE ${identificar(campoId)} = $1`,
            [id]
        )
        .then((resultado) => resultado.rows[0]);
}

function agregar(tabla: string, data: Data): Promise<any> {
    const claves = sinIndefinidos(data);

    if (claves.length === 0) {
        return pool.query(`INSERT INTO ${identificar(tabla)} DEFAULT VALUES`);
    }

    const columnas = claves.map(identificar).join(', ');
    const lugares = claves
        .map((clave, i) => `$${i + 1}${esVector(data[clave]) ? '::vector' : ''}`)
        .join(', ');
    const valores = claves.map((clave) =>
        esVector(data[clave]) ? data[clave].vector : data[clave]
    );
    const sql = `INSERT INTO ${identificar(tabla)} (${columnas}) VALUES (${lugares}) ON CONFLICT DO NOTHING`;

    return pool.query(sql, valores);
}

function actualizar(
    tabla: string,
    campoId: string,
    id: number,
    data: Data
): Promise<any> {
    const claves = sinIndefinidos(data);

    if (claves.length === 0) {
        return Promise.resolve({ rowCount: 0 });
    }

    const asignaciones = claves
        .map(
            (clave, i) =>
                `${identificar(clave)} = $${i + 1}${esVector(data[clave]) ? '::vector' : ''}`
        )
        .join(', ');
    const valores = claves.map((clave) =>
        esVector(data[clave]) ? data[clave].vector : data[clave]
    );
    valores.push(id);
    const sql = `UPDATE ${identificar(tabla)} SET ${asignaciones} WHERE ${identificar(campoId)} = $${claves.length + 1}`;

    return pool.query(sql, valores);
}

function eliminar(
    tabla: string,
    campoId: string,
    id: number
): Promise<any> {
    return pool.query(
        `DELETE FROM ${identificar(tabla)} WHERE ${identificar(campoId)} = $1`,
        [id]
    );
}

function query(tabla: string, consulta: Data): Promise<any> {
    const claves = Object.keys(consulta);

    if (claves.length === 0) {
        return pool
            .query(`SELECT * FROM ${identificar(tabla)}`)
            .then((resultado) => resultado.rows[0]);
    }

    const condiciones = claves
        .map((clave, i) => `${identificar(clave)} = $${i + 1}`)
        .join(' AND ');
    const valores = claves.map((clave) => consulta[clave]);

    return pool
        .query(
            `SELECT * FROM ${identificar(tabla)} WHERE ${condiciones}`,
            valores
        )
        .then((resultado) => resultado.rows[0]);
}

// Reemplaza ?? por identificador entre comillas y ? por parámetros $n,
// conservando la forma de escribir SQL de la capa anterior (mysql).
// Si la query no trae ? (p. ej. ya usa $n literal), los valores se pasan tal cual.
function ejecutar(
    sql: string,
    valores: any[] = []
): Promise<any> {
    const esSelect = /^\s*SELECT/i.test(sql);

    if (!sql.includes('?')) {
        return pool
            .query({ text: sql, values: valores })
            .then((resultado) => (esSelect ? resultado.rows : resultado));
    }

    let sqlConvertido = '';
    const parametros: any[] = [];
    let indiceValor = 0;
    let parametro = 0;
    let i = 0;

    while (i < sql.length) {
        const caracter = sql[i];

        if (caracter === '?') {
            if (sql[i + 1] === '?') {
                const identificador = valores[indiceValor++];
                sqlConvertido += identificar(String(identificador));
                i += 2;
                continue;
            }

            parametro += 1;
            parametros.push(valores[indiceValor++]);
            sqlConvertido += `$${parametro}`;
            i += 1;
            continue;
        }

        sqlConvertido += caracter;
        i += 1;
    }

    return pool
        .query({ text: sqlConvertido, values: parametros })
        .then((resultado) => (esSelect ? resultado.rows : resultado));
}

export default {
    todos,
    uno,
    agregar,
    actualizar,
    eliminar,
    query,
    ejecutar
};