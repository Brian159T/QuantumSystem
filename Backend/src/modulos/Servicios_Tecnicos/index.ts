import db from '../../DB/pg';
import crearControlador from './controlador';

const controlador = crearControlador(db);

export default controlador;