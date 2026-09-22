import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LogoutButton() {
  const { cerrarSesion } = useAuth()

  return (
    <button
      className="boton boton--secundario boton--compacto"
      onClick={cerrarSesion}
      title="Cerrar sesión"
    >
      <LogOut size={15} />
      Salir
    </button>
  )
}