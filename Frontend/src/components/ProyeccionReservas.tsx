import { ChartNoAxesCombined, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { peticion } from '../services/apiClient'

export interface Proyeccion { horizonteDias: 7 | 30; pendiente: number; imagen: string; proyeccion: { fecha: string; cantidad: number }[] }
interface Props { alActualizar?: (datos: Proyeccion | null) => void }

export default function ProyeccionReservas({ alActualizar }: Props) {
  const [horizonte, setHorizonte] = useState<7 | 30>(7)
  const [datos, setDatos] = useState<Proyeccion | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    void peticion<Proyeccion>(`/reportes/proyeccion-reservas?horizonte=${horizonte}`)
      .then((resultado) => { if (activo) { setDatos(resultado); alActualizar?.(resultado); setError('') } })
      .catch((fallo: unknown) => { if (activo) setError(fallo instanceof Error ? fallo.message : 'No se pudo calcular la proyección') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [horizonte, alActualizar])

  return <section className="grafico-tarjeta grafico-tarjeta--amplia proyeccion-reservas" aria-labelledby="titulo-proyeccion">
    <header className="grafico-tarjeta__cabecera">
      <div className="grafico-tarjeta__icono"><ChartNoAxesCombined size={21} /></div>
      <div><p className="graficos-ceja">PLANIFICACIÓN</p><h3 id="titulo-proyeccion">Proyección de Reservas</h3><p className="grafico-tarjeta__descripcion">Regresión lineal calculada con las reservas diarias más recientes de la base de datos.</p></div>
    </header>
    <div className="proyeccion-reservas__controles" role="group" aria-label="Horizonte de proyección">
      <span>Proyectar hacia:</span>
      <button className={`boton boton--compacto${horizonte === 7 ? ' chip--activo' : ''}`} onClick={() => setHorizonte(7)}>7 días</button>
      <button className={`boton boton--compacto${horizonte === 30 ? ' chip--activo' : ''}`} onClick={() => setHorizonte(30)}>1 mes</button>
    </div>
    <div className="grafico-tarjeta__espacio proyeccion-reservas__espacio">
      {cargando && <LoaderCircle className="proyeccion-reservas__cargando" size={28} />}
      {error && <p className="alerta alerta--error">{error}</p>}
      {!cargando && !error && datos && <img src={datos.imagen} alt={`Gráfico de proyección de reservas a ${datos.horizonteDias} días`} />}
    </div>
    {datos && !error && <footer className="grafico-tarjeta__pie">Tendencia lineal: {datos.pendiente >= 0 ? '+' : ''}{datos.pendiente} reservas por día · Fuente: tabla Reservas</footer>}
  </section>
}
