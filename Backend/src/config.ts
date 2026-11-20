import { randomBytes } from 'crypto';

require('dotenv').config();

const esProduccion = process.env.NODE_ENV === 'production';

const SECRETO_LEGADO = process.env.JET_SECRET?.trim();
const secretoConfigurado = process.env.JWT_SECRET?.trim() || SECRETO_LEGADO;

if (esProduccion && !secretoConfigurado) {
    throw new Error('JWT_SECRET es obligatorio en produccion');
}

let secretoTemporal = '';
if (!secretoConfigurado) {
    secretoTemporal = randomBytes(32).toString('hex');
    console.warn('[config] JWT_SECRET no definido: se genero uno temporal de desarrollo');
}

if (!process.env.JWT_SECRET?.trim() && SECRETO_LEGADO) {
    console.warn('[config] JET_SECRET es legado: renombralo a JWT_SECRET');
}

function trustProxy(): boolean | number {
    const valor = process.env.TRUST_PROXY?.trim();
    if (valor === undefined || valor === '') return esProduccion ? 1 : false;
    if (valor === 'true') return true;
    if (valor === 'false') return false;
    return Number(valor) || 0;
}

const ORIGENES_DESARROLLO = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8081',
    'http://localhost:19006',
].join(',');

const origenesCors = (process.env.CORS_ORIGINS || (esProduccion ? '' : ORIGENES_DESARROLLO))
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

if (esProduccion && origenesCors.length === 0) {
    throw new Error('CORS_ORIGINS es obligatorio en produccion');
}

const config = {
    app: {
        port: process.env.PORT || 4000,
    },
    jwt: {
        secret: secretoConfigurado || secretoTemporal,
        expiracion: process.env.JWT_EXPIRACION || '8h',
    },
    cors: {
        origenes: origenesCors,
    },
    servidor: {
        trustProxy: trustProxy(),
    },
    pg: {
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'QuantumSystemDB',
        port: Number(process.env.PGPORT) || 5432,
    },
};

export default config;
