import http from '../Config/http';

export type TipoReporte = 'reservas' | 'estaciones' | 'modelo' | 'red';

export interface TablaReporte {
  encabezados: string[];
  filas: string[][];
}

export interface ReporteGraficos {
  periodoDias: number;
  actualizado: string;
  reservas: {
    total: number;
    pendientes: number;
    confirmadas: number;
    modelosPrincipales: string[];
    maximoModelo: number;
    diasPrincipales: string[];
    maximoDia: number;
  };
  estaciones: {
    total: number;
    disponibles: number;
    sinEstado: number;
    estados: [string, number][];
  };
  tablas: Record<TipoReporte, TablaReporte>;
}

export async function obtenerReporteGraficos(): Promise<ReporteGraficos> {
  const respuesta = await http.get('/reportes/graficos');
  return respuesta.data.body as ReporteGraficos;
}
