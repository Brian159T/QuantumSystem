import app from './app';
//en index inicializamos nuestro servidor y traemos todos los datos desde app.ts

const port = app.get('port');

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});

