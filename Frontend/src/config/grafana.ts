export const URL_PANELES_GRAFANA = {
  reservas: 'http://localhost:3000/d-solo/ad5j5kw/grafico-de-reservas?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s',
  estaciones: 'http://localhost:3000/d-solo/add5j8r/grafico-de-tabla-de-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=1&theme=dark&refresh=10s',
  modelo: 'http://localhost:3000/d-solo/adljdq9/modelo-mas-reservado?from=1794855861776&to=1794859461776&timezone=browser&orgId=1&panelId=1',
  red: 'http://localhost:3000/d-solo/adp8ztg/grafico-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s',
} as const

export function urlRenderGrafana(urlPanel: string): string {
  const url = new URL(urlPanel)
  url.pathname = url.pathname.replace('/d-solo/', '/render/d-solo/')
  url.searchParams.set('width', '1200')
  url.searchParams.set('height', '620')
  url.searchParams.set('dpr', '2')
  return url.toString()
}
