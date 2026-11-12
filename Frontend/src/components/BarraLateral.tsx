import { useRef } from 'react'
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import logo from '../assets/logo_quantum.png'

interface Props {
  visible: boolean
  alAlternar: () => void
  elementos: { id: string; etiqueta: string; icono: string }[]
  actual: string
  alNavegar: (id: string) => void
  inicio: string
  icono: (nombre: string) => ReactNode
  cuenta: ReactNode
}
export default function BarraLateral({ visible, alAlternar, elementos, actual, alNavegar, inicio, icono, cuenta }: Props) {
  const panel = useRef<HTMLDialogElement>(null)
  const abrir = useRef<HTMLButtonElement>(null)
  const cerrar = () => { panel.current?.close(); abrir.current?.focus() }
  const navegar = (id: string) => { alNavegar(id); if (panel.current?.open) cerrar() }
  const contenido = <>
    <a className="barra-lateral__marca" href={`#${inicio}`} onClick={evento => { evento.preventDefault(); navegar(inicio) }} aria-label="Quantum — Inicio">
      <img src={logo} alt="" /> <span>QUANTUM</span>
    </a>
    <p className="barra-lateral__etiqueta">Tu espacio Quantum</p>
    <nav className="barra-lateral__nav" aria-label="Navegación principal">
      {elementos.map(item => <a key={item.id} href={`#${item.id}`} aria-current={actual === item.id ? 'page' : undefined} onClick={evento => { evento.preventDefault(); navegar(item.id) }}>
        {icono(item.icono)}<span>{item.etiqueta}</span>
      </a>)}
    </nav>
    <div className="barra-lateral__cuenta">{cuenta}</div>
  </>
  return <>
    <button
      type="button"
      className="control-barra-lateral"
      onClick={alAlternar}
      aria-controls="navegacion-escritorio"
      aria-expanded={visible}
      aria-label={visible ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
      title={visible ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
    >
      {visible ? <PanelLeftClose size={20} aria-hidden="true" /> : <PanelLeftOpen size={20} aria-hidden="true" />}
    </button>
    <aside id="navegacion-escritorio" className="barra-lateral" hidden={!visible}>{contenido}</aside>
    <div className="barra-movil"><button ref={abrir} onClick={() => panel.current?.showModal()} aria-label="Abrir navegación"><Menu size={22} /></button><span>QUANTUM</span></div>
    <dialog ref={panel} className="panel-lateral" aria-label="Navegación" onCancel={evento => { evento.preventDefault(); cerrar() }} onClick={evento => { if (evento.target === panel.current) cerrar() }}>
      <div className="panel-lateral__interior"><button className="panel-lateral__cerrar" onClick={cerrar} aria-label="Cerrar navegación"><X size={22} /></button>{contenido}</div>
    </dialog>
  </>
}
