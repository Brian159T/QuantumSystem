require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const config = {
    app: {
        port: process.env.PORT || 4000, // Si no se encuentra la variable de entorno PORT, se usará el puerto 4000 por defecto
    },
    jwt:{
        secret:process.env.JET_SECRET || 'notasecreta!'


    },
    mysql:{
        host:process.env.MYSQL_HOST || 'localhost',
        user:process.env.MYSQL_USER || 'root',
        password:process.env.MYSQL_PASSWORD || '',
        database:process.env.MYSQL_DATABASE || 'quantumdb',
    }
};
//aqui lo traemos desde las varibles de entorno y si no existele damos el puerto 4000
export default config;