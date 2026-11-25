import dbPg from '../../DB/pg';

const DIAS_ANALISIS = 30;

export default function (dbInyectada?: any) {
    const db = dbInyectada || dbPg;

    async function graficos() {
        const reservas = await db.ejecutar(
            `SELECT "Fecha_Reserva", "Estado", "modelo"
             FROM "Reservas"
             WHERE "Fecha_Reserva" >= CURRENT_DATE - INTERVAL '${DIAS_ANALISIS} days'
             AND "Fecha_Reserva" <= CURRENT_DATE
             ORDER BY "Fecha_Reserva" ASC`
        );
        const estaciones = await db.ejecutar(
            `SELECT "Estado" FROM "Estaciones_Carga" ORDER BY "id_estacion" ASC`
        );

        const porModelo = new Map<string, number>();
        const porDia = new Map<string, number>();
        let pendientes = 0;
        let confirmadas = 0;
        for (const reserva of reservas) {
            const modelo = String(reserva.modelo || 'Sin modelo').trim();
            const dia = String(reserva.Fecha_Reserva);
            porModelo.set(modelo, (porModelo.get(modelo) || 0) + 1);
            porDia.set(dia, (porDia.get(dia) || 0) + 1);
            const estado = String(reserva.Estado || '').trim().toLowerCase();
            if (estado === 'pendiente') pendientes += 1;
            if (estado === 'confirmada' || estado === 'entregada') confirmadas += 1;
        }
        const maximoModelo = Math.max(0, ...porModelo.values());
        const maximoDia = Math.max(0, ...porDia.values());
        const estados = new Map<string, number>();
        let disponibles = 0;
        let sinEstado = 0;
        for (const estacion of estaciones) {
            const estado = String(estacion.Estado || '').trim().toLowerCase();
            if (estado === 'disponible') disponibles += 1;
            if (!estado) sinEstado += 1;
            const etiqueta = estado || 'sin estado';
            estados.set(etiqueta, (estados.get(etiqueta) || 0) + 1);
        }
        const filasReservas = reservas.map((reserva: any) => [
            String(reserva.Fecha_Reserva),
            String(reserva.modelo || 'Sin modelo'),
            String(reserva.Estado || 'Sin estado'),
        ]);
        const filasEstaciones = [...estados]
            .sort(([a], [b]) => a.localeCompare(b, 'es'))
            .map(([estado, cantidad]) => [estado, String(cantidad)]);
        const filasModelos = [...porModelo]
            .sort(([, a], [, b]) => b - a)
            .map(([modelo, cantidad]) => [modelo, String(cantidad)]);
        return {
            periodoDias: DIAS_ANALISIS,
            actualizado: new Date().toISOString(),
            reservas: {
                total: reservas.length,
                pendientes,
                confirmadas,
                modelosPrincipales: [...porModelo].filter(([, total]) => total === maximoModelo).map(([modelo]) => modelo),
                maximoModelo,
                diasPrincipales: [...porDia].filter(([, total]) => total === maximoDia).map(([dia]) => dia),
                maximoDia,
                modelos: [...porModelo].sort(([, a], [, b]) => b - a),
                dias: [...porDia].sort(([a], [b]) => a.localeCompare(b)),
            },
            estaciones: {
                total: estaciones.length,
                disponibles,
                sinEstado,
                estados: [...estados].sort(([a], [b]) => a.localeCompare(b, 'es')),
            },
            tablas: {
                reservas: { encabezados: ['Fecha', 'Modelo', 'Estado'], filas: filasReservas },
                estaciones: { encabezados: ['Estado', 'Cantidad'], filas: filasEstaciones },
                modelo: { encabezados: ['Modelo', 'Reservas'], filas: filasModelos },
                red: { encabezados: ['Estado', 'Cantidad'], filas: filasEstaciones },
            },
        };
    }

    return { graficos };
}
