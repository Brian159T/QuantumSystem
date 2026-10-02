// Factory del modulo Chatbot, igual que el resto de modulos: permite
// inyectar otra base de datos en pruebas sin tocar el codigo.

import db from '../../DB/pg';
import crearControlador from './controlador';

const controlador = crearControlador(db);

export default controlador;