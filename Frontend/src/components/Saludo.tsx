import { useAuth } from '../hooks/useAuth'
import { obtenerIniciales } from '../utils/iniciales'

export default function Saludo() {
  const { usuario } = useAuth()

  return (
    <div className="saludo">
      <span className="saludo__avatar">{obtenerIniciales(usuario?.nombre_usuario ?? '')}</span>
      <div className="saludo__texto">
        <div className="saludo__nombre">
          Hola, {usuario?.nombre_usuario?.split(' ')[0] ?? 'Usuario'}
        </div>
        <div className="saludo__rol">{usuario?.rol}</div>
      </div>
    </div>
  )
}