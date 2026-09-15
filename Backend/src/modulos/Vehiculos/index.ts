import db from '../../DB/mysql';
import crearControlador from './controlador';

const controlador = crearControlador(db);

export default controlador;