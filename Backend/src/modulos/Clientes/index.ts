//para poder acceder a cualquier base de datos o cambiar de base de datos
//crearemos un constructor al que le pasaremos la base de datos
//podemos acceder a todas las  funionalidades de crud solo duplicando una carpeta
import db from '../../DB/mysql';
import crearControlador from './controlador';

const controlador = crearControlador(db);

export default controlador;