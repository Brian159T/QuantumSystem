import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GrafanaPanel from '../../components/GrafanaPanel';
import EncabezadoPrivado from '../../components/EncabezadoPrivado';
import { URL_PANELES_GRAFANA } from '../../../Config/grafana';
import {
  obtenerReporteGraficos,
  type ReporteGraficos,
  type TipoReporte,
} from '../../../Model/ReportesService';
import { descargarReportePdf } from '../../../Utils/ReportesPdf';
import { styles } from '../../../styles/ReportesAdministrador.styles';

const PANELES: {
  tipo: TipoReporte;
  categoria: string;
  titulo: string;
  descripcion: string;
  icono: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  {
    tipo: 'reservas',
    categoria: 'RESERVAS Y VENTAS',
    titulo: 'Evolucion de reservas',
    descripcion: 'Comportamiento de las reservas en los ultimos 30 dias.',
    icono: 'chart-line',
  },
  {
    tipo: 'estaciones',
    categoria: 'RED DE CARGA',
    titulo: 'Estaciones de carga',
    descripcion: 'Estado de las estaciones registradas en la red.',
    icono: 'ev-station',
  },
  {
    tipo: 'modelo',
    categoria: 'PREFERENCIA DE MODELOS',
    titulo: 'Modelo mas reservado',
    descripcion: 'Ranking de modelos segun reservas.',
    icono: 'car-multiple',
  },
  {
    tipo: 'red',
    categoria: 'RED DE CARGA',
    titulo: 'Grafico de estaciones de carga',
    descripcion: 'Vista complementaria del estado de la red.',
    icono: 'chart-bar',
  },
];

export default function ReportesAdministradorScreen() {
  const [reporte, setReporte] = useState<ReporteGraficos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const resultado = await obtenerReporteGraficos();
        if (activo) {
          setReporte(resultado);
          setError('');
        }
      } catch (err) {
        if (activo)
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los reportes.');
      } finally {
        if (activo) setCargando(false);
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  async function descargar(tipo: TipoReporte) {
    if (!reporte) return;
    try {
      await descargarReportePdf(reporte, tipo);
    } catch {
      Alert.alert('Reporte', 'No se pudo generar el PDF.');
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}>
        <EncabezadoPrivado
          titulo="Reportes y graficos"
          descripcion="Consulta los paneles de Grafana y descarga reportes basados en PostgreSQL."
          administrador
        />
        <View style={styles.encabezado}>
          <Text style={styles.ceja}>CENTRO DE ANALISIS</Text>
          <Text style={styles.titulo}>Reportes administrativos</Text>
          <Text style={styles.subtitulo}>
            La tabla y la interpretacion del PDF usan la misma API de reportes que la web.
          </Text>
        </View>
        {cargando && <ActivityIndicator color="#9DB69D" />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {PANELES.map((panel) => (
          <View key={panel.tipo} style={styles.tarjeta}>
            <View style={styles.tarjetaCabecera}>
              <Text style={styles.categoria}>{panel.categoria}</Text>
              <Text style={styles.tituloGrafico}>
                <MaterialCommunityIcons name={panel.icono} size={18} color="#9DB69D" />{' '}
                {panel.titulo}
              </Text>
              <Text style={styles.descripcionGrafico}>{panel.descripcion}</Text>
            </View>
            <GrafanaPanel url={URL_PANELES_GRAFANA[panel.tipo]} titulo={panel.titulo} />
            <View style={styles.acciones}>
              <TouchableOpacity
                style={styles.boton}
                onPress={() => void descargar(panel.tipo)}
                disabled={!reporte}>
                <Text style={styles.botonTexto}>Descargar reporte PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {!cargando && !error && (
          <Text style={styles.estado}>Datos actualizados desde el backend.</Text>
        )}
      </ScrollView>
    </View>
  );
}
