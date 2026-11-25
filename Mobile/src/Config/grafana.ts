import Constants from 'expo-constants';

const hostExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const baseGrafana =
  process.env.EXPO_PUBLIC_GRAFANA_URL?.trim() ||
  (hostExpo ? `http://${hostExpo}:3000` : 'http://localhost:3000');

export const URL_PANELES_GRAFANA = {
  reservas: `${baseGrafana}/d-solo/ad5j5kw/grafico-de-reservas?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s`,
  estaciones: `${baseGrafana}/d-solo/add5j8r/grafico-de-tabla-de-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=1&theme=dark&refresh=10s`,
  modelo: `${baseGrafana}/d-solo/adljdq9/modelo-mas-reservado?from=1794855861776&to=1794859461776&timezone=browser&orgId=1&panelId=1`,
  red: `${baseGrafana}/d-solo/adp8ztg/grafico-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s`,
} as const;
