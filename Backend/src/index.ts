import app from './app';
import db from './DB/pg';
//en index inicializamos nuestro servidor y traemos todos los datos desde app.ts

const port = app.get('port');

async function vencerReservasExpiradas(): Promise<void> {
    await db.ejecutar(
        `UPDATE "Reservas"
         SET "Estado" = 'Vencido'
         WHERE "Fecha_expiracion" < CURRENT_DATE
           AND "Estado" NOT IN ('Vencido', 'Cancelada', 'Completada')`
    );
    console.log('Reservas expiradas verificadas al iniciar el backend');
}

app.listen(port, async () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
    try {
        await vencerReservasExpiradas();
    } catch (error) {
        console.error('Error al verificar reservas vencidas:', error);
    }
});

