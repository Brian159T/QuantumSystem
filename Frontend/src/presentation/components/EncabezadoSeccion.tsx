import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface EncabezadoSeccionProps {
  titulo: string
  enlace?: string
  alHacerClicEnlace?: () => void
  contador?: ReactNode
}

export default function EncabezadoSeccion({
  titulo,
  enlace,
  alHacerClicEnlace,
  contador,
}: EncabezadoSeccionProps) {
  return (
    <div className="encabezado-seccion">
      <div>
        <div className="titulo-seccion">{titulo}</div>
        {contador && (
          <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 2 }}>{contador}</div>
        )}
      </div>
      {enlace && (
        <button className="titulo-seccion__enlace" onClick={alHacerClicEnlace}>
          {enlace}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}