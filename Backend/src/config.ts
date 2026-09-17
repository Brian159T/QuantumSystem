require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const config = {
    app: {
        port: process.env.PORT || 4000, // Si no se encuentra la variable de entorno PORT, se usará el puerto 4000 por defecto
    },
    jwt:{
        secret:process.env.JET_SECRET || 'notasecreta!'


    },
    pg:{
        host:process.env.PGHOST || 'localhost',
        user:process.env.PGUSER || 'postgres',
        password:process.env.PGPASSWORD || '',
        database:process.env.PGDATABASE || 'QuantumSystemDB',
        port:Number(process.env.PGPORT) || 5432,
    }
};
//aqui lo traemos desde las varibles de entorno y si no existele damos el puerto 4000
export default config;