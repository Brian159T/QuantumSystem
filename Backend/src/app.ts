import express from 'express';
import config from './config';
import morgan from 'morgan';
import cors from 'cors';

import clientes from './modulos/Clientes/rutas';
import usuarios from './modulos/Usuarios/rutas';
import auth from './modulos/auth/rutas';

import error from './red/errors';
import vehiculos from './modulos/Vehiculos/rutas';
import serviciosTecnicos from './modulos/Servicios_Tecnicos/rutas';
import estacionesCarga from './modulos/Estaciones_Carga/rutas';
import colores from './modulos/Colores/rutas';
import reservas from './modulos/Reservas/rutas';
import vehiculosColores from './modulos/Vehiculos_Colores/rutas';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use('/api/vehiculos', vehiculos);
app.use('/api/servicios-tecnicos', serviciosTecnicos);
app.use('/api/estaciones-carga', estacionesCarga);
app.use('/api/colores', colores);
app.use('/api/reservas', reservas);
app.use('/api/vehiculos-colores', vehiculosColores);
// Manejo de errores
app.use(error);

export default app;