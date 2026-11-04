import { useEffect, useState } from 'react'
import '../styles/carrusel-inicio.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import equte from '../../assets/Equte plateado.png'
import e4 from '../../assets/E4 montanero gris.png'
import hunterDoble from '../../assets/ts street hunter pro (doble batería).png'
import hunter from '../../assets/ts street hunter pro.png'

const MODELOS = [
  { imagen: equte, nombre: 'KAIYI EQUTE' },
  { imagen: e4, nombre: 'E4 MONTAÑERO' },
  { imagen: hunterDoble, nombre: 'TS STREET HUNTER PRO · DOBLE BATERÍA' },
  { imagen: hunter, nombre: 'TS STREET HUNTER PRO' },
]

export default function CarruselInicio({ alVerVehiculos }: { alVerVehiculos: () => void }) {
  const [actual, setActual] = useState(0)
  useEffect(() => {
    const intervalo = window.setInterval(() => setActual(indice => (indice + 1) % MODELOS.length), 6000)
    return () => window.clearInterval(intervalo)
  }, [])

  const mover = (paso: number) => {
    setActual(indice => (indice + paso + MODELOS.length) % MODELOS.length)
  }

  return <section className="carrusel-inicio" aria-label="Modelos Quantum" aria-roledescription="carrusel">
    <div className="carrusel-inicio__diapositivas">
      {MODELOS.map((modelo, indice) => <div key={modelo.nombre}
        className={`carrusel-inicio__diapositiva${indice === actual ? ' carrusel-inicio__diapositiva--activa' : ''}`}
        aria-hidden={indice !== actual}>
        <img src={modelo.imagen} alt={modelo.nombre} fetchPriority={indice === 0 ? 'high' : 'auto'} />
      </div>)}
    </div>
    <div className="carrusel-inicio__contenido">
      <p className="editorial__ceja">QUANTUM · MOVILIDAD ELÉCTRICA</p>
      <h1>El futuro se mueve contigo.</h1>
      <p className="editorial__subtitulo">Descubre una nueva forma de recorrer tu mundo.</p>
      <div className="editorial__acciones">
        <button className="boton boton--primario" onClick={alVerVehiculos}>Explorar vehículos</button>
        <a className="boton boton--claro" href="#modelos">Conocer más</a>
      </div>
    </div>
    <div className="carrusel-inicio__pie">
      <span className="carrusel-inicio__modelo" aria-live="off">{MODELOS[actual].nombre}</span>
      <div className="carrusel-inicio__controles">
        <button aria-label="Modelo anterior" onClick={() => mover(-1)}><ChevronLeft size={20} /></button>
        {MODELOS.map((modelo, indice) => <button key={modelo.nombre} className="carrusel-inicio__indicador"
          aria-label={`Ver ${modelo.nombre}`} aria-pressed={actual === indice}
          onClick={() => setActual(indice)}><span /></button>)}
        <button aria-label="Modelo siguiente" onClick={() => mover(1)}><ChevronRight size={20} /></button>
      </div>
    </div>
  </section>
}
