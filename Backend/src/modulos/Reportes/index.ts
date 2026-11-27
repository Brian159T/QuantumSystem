import dbPg from '../../DB/pg';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const DIAS_ANALISIS = 30;
const ANCHURA_GRAFICO = 1000;
const ALTURA_GRAFICO = 420;

type Horizonte = 7 | 30;

function regresionLineal(valores: number[]): { pendiente: number; interseccion: number } {
    const n = valores.length;
    if (n < 2) return { pendiente: 0, interseccion: valores[0] || 0 };
    const mediaX = (n - 1) / 2;
    const mediaY = valores.reduce((total, valor) => total + valor, 0) / n;
    const numerador = valores.reduce((total, valor, indice) => total + (indice - mediaX) * (valor - mediaY), 0);
    const denominador = valores.reduce((total, _, indice) => total + (indice - mediaX) ** 2, 0);
    const pendiente = denominador ? numerador / denominador : 0;
    return { pendiente, interseccion: mediaY - pendiente * mediaX };
}

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

    async function proyeccion(horizonte: Horizonte) {
        const filas = await db.ejecutar(
            `SELECT "Fecha_Reserva", COUNT(*)::int AS "cantidad"
             FROM "Reservas"
             WHERE "Fecha_Reserva" >= CURRENT_DATE - INTERVAL '30 days'
             AND "Fecha_Reserva" <= CURRENT_DATE
             GROUP BY "Fecha_Reserva" ORDER BY "Fecha_Reserva" ASC`
        );
        const hoy = new Date();
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 29);
        const fechaClave = (fecha: Date) => fecha.toISOString().slice(0, 10);
        const cantidades = new Map<string, number>(filas.map((fila: any) => [String(fila.Fecha_Reserva), Number(fila.cantidad)]));
        const historico: { fecha: string; cantidad: number }[] = Array.from({ length: 30 }, (_, indice) => {
            const fecha = new Date(inicio);
            fecha.setDate(inicio.getDate() + indice);
            return { fecha: fechaClave(fecha), cantidad: cantidades.get(fechaClave(fecha)) || 0 };
        });
        const modelo = regresionLineal(historico.map((fila) => fila.cantidad));
        const proyeccion = Array.from({ length: horizonte }, (_, indice) => {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + indice + 1);
            return { fecha: fechaClave(fecha), cantidad: Math.max(0, Number((modelo.interseccion + modelo.pendiente * (29 + indice + 1)).toFixed(2))) };
        });
        const canvas = new ChartJSNodeCanvas({ width: ANCHURA_GRAFICO, height: ALTURA_GRAFICO, backgroundColour: '#edf7f5' });
        const imagen = await canvas.renderToDataURL({
            type: 'line',
            data: {
                labels: [...historico.map((fila) => fila.fecha.slice(5)), ...proyeccion.map((fila) => fila.fecha.slice(5))],
                datasets: [
                    { label: 'Reservas recientes', data: [...historico.map((fila) => fila.cantidad), ...Array(horizonte).fill(null)], borderColor: '#2fb676', backgroundColor: '#2fb676', tension: 0.25 },
                    { label: 'Proyección', data: [...Array(29).fill(null), historico[29].cantidad, ...proyeccion.map((fila) => fila.cantidad)], borderColor: '#1c1c1c', backgroundColor: '#1c1c1c', borderDash: [6, 5], tension: 0.25 },
                ],
            },
            options: { plugins: { legend: { labels: { color: '#1c1c1c' } } }, scales: { x: { ticks: { color: '#1c1c1c' } }, y: { beginAtZero: true, ticks: { color: '#1c1c1c' } } } },
        } as any);
        return { horizonteDias: horizonte, generado: new Date().toISOString(), historico, proyeccion, pendiente: Number(modelo.pendiente.toFixed(4)), imagen };
    }

    return { graficos, proyeccion };
}
