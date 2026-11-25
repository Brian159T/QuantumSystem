import express from 'express';
import config from './config';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import clientes from './modulos/Clientes/rutas';
import usuarios from './modulos/Usuarios/rutas';
import auth from './modulos/auth/rutas';

import manejadorErrores from './red/errors';
import crearError from './middleware/errors';
import crearLimitadorStore from './red/limitadorStore';
import vehiculos from './modulos/Vehiculos/rutas';
import serviciosTecnicos from './modulos/Servicios_Tecnicos/rutas';
import estacionesCarga from './modulos/Estaciones_Carga/rutas';
import colores from './modulos/Colores/rutas';
import reservas from './modulos/Reservas/rutas';
import vehiculosColores from './modulos/Vehiculos_Colores/rutas';
import chatbot from './modulos/Chatbot/rutas';
import reportes from './modulos/Reportes/rutas';

const app = express();

function sobreLimite(mensaje: string) {
    return {
        error: true,
        status: 429,
        body: mensaje,
    };
}

const limitadorGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('general'),
    skip: (req) =>
        req.originalUrl.startsWith('/api/chatbot') ||
        (req.method === 'POST' && req.originalUrl.split('?')[0] === '/api/reservas'),
    keyGenerator: (req) => `general:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Demasiadas peticiones. Intenta mas tarde.'),
});

function claveLogin(ip: string | undefined): string {
    return `login:${ipKeyGenerator(ip ?? 'desconocida')}`;
}

const almacenLogin = crearLimitadorStore('login');

const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 6,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    store: almacenLogin,
    keyGenerator: (req) => `login:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar.'),
});

const limitadorRegistro = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('registro'),
    keyGenerator: (req) => `registro:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Demasiados registros. Intenta mas tarde.'),
});

const limitadorChatbot = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('chatbot'),
    keyGenerator: (req) => `chatbot:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Demasiadas consultas al asistente. Espera un momento.'),
});

const limitadorChatbotRafaga = rateLimit({
    windowMs: 5 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('chatbot-rafaga'),
    keyGenerator: (req) => `chatbot-rafaga:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Estas enviando consultas muy rapido. Espera unos segundos.'),
});

const limitadorReservas = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('reservas'),
    keyGenerator: (req) => `reservas:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Demasiadas reservas. Intenta mas tarde.'),
});

const limitadorReservasRafaga = rateLimit({
    windowMs: 5 * 1000,
    limit: 2,
    standardHeaders: true,
    legacyHeaders: false,
    store: crearLimitadorStore('reservas-rafaga'),
    keyGenerator: (req) => `reservas-rafaga:${ipKeyGenerator(req.ip ?? 'desconocida')}`,
    message: sobreLimite('Estas enviando reservas muy rapido. Espera unos segundos.'),
});

app.disable('x-powered-by');

app.set('trust proxy', config.servidor.trustProxy);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

app.use(
    cors({
        origin(origen, callback) {
            if (!origen || config.cors.origenes.includes(origen)) {
                callback(null, true);
                return;
            }
            callback(crearError('Origen no permitido por CORS', 403));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400,
    })
);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', limitadorGeneral);
app.use('/api/auth/login', limitadorLogin);
app.use('/api/auth/login', (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode < 400) {
            void almacenLogin.resetKey(claveLogin(req.ip));
        }
    });
    next();
});
app.use('/api/auth/registro', limitadorRegistro);
app.use('/api/chatbot', limitadorChatbot);
app.use('/api/chatbot', (req, res, next) => {
    if (req.method === 'POST') {
        limitadorChatbotRafaga(req, res, next);
        return;
    }
    next();
});
app.post('/api/reservas', limitadorReservas, limitadorReservasRafaga);

app.set('port', config.app.port);

app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use('/api/vehiculos', vehiculos);
app.use('/api/servicios-tecnicos', serviciosTecnicos);
app.use('/api/estaciones-carga', estacionesCarga);
app.use('/api/colores', colores);
app.use('/api/reservas', reservas);
app.use('/api/vehiculos-colores', vehiculosColores);
app.use('/api/chatbot', chatbot);
app.use('/api/reportes', reportes);

app.use(manejadorErrores);

export default app;
