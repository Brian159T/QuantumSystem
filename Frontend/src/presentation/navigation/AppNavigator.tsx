import { useState } from 'react'
import { Zap, Home, Car, CalendarCheck, PlugZap, Wrench, Siren, LayoutDashboard, Users } from 'lucide-react'
import { AuthProvider } from '../context/AuthProvider'
import { useAuth } from '../context/AuthContext'
import Saludo from '../components/Saludo'
import LoginButton from '../components/LoginButton'
import LogoutButton from '../components/LogoutButton'
import PaginaInicio from '../pages/invitado/PaginaInicio'
import PaginaVehiculos from '../pages/invitado/PaginaVehiculos'
import PaginaReservas from '../pages/invitado/PaginaReservas'
import PaginaInicioCliente from '../pages/cliente/PaginaInicioCliente'
import PaginaEstaciones from '../pages/cliente/PaginaEstaciones'
import PaginaTalleres from '../pages/cliente/PaginaTalleres'
import PaginaEmergencias from '../pages/cliente/PaginaEmergencias'
import PaginaPanel from '../pages/administrador/PaginaPanel'
import PaginaUsuarios from '../pages/administrador/PaginaUsuarios'
import type { Vehiculo } from '../../domain/modelos/Vehiculo'

type Rol = 'invitado' | 'cliente' | 'administrador'

interface Navegacion {
  id: string
  etiqueta: string
  icono: string
}

const NAVEGACION: Record<Rol, Navegacion[]> = {
  invitado: [
    { id: 'inicio', etiqueta: 'Inicio', icono: 'inicio' },
    { id: 'vehiculos', etiqueta: 'Vehículos', icono: 'vehiculos' },
    { id: 'reservas', etiqueta: 'Reservas', icono: 'reservas' },
  ],
  cliente: [
    { id: 'inicio', etiqueta: 'Inicio', icono: 'inicio' },
    { id: 'estaciones', etiqueta: 'Carga', icono: 'estaciones' },
    { id: 'talleres', etiqueta: 'Talleres', icono: 'talleres' },
    { id: 'emergencias', etiqueta: 'Emergencias', icono: 'emergencias' },
  ],
  administrador: [
    { id: 'panel', etiqueta: 'Panel', icono: 'panel' },
    { id: 'usuarios', etiqueta: 'Usuarios', icono: 'usuarios' },
  ],
}

function IconoNav({ nombre }: { nombre: string }) {
  switch (nombre) {
    case 'vehiculos':
      return <Car size={16} />
    case 'reservas':
      return <CalendarCheck size={16} />
    case 'estaciones':
      return <PlugZap size={16} />
    case 'talleres':
      return <Wrench size={16} />
    case 'emergencias':
      return <Siren size={16} />
    case 'panel':
      return <LayoutDashboard size={16} />
    case 'usuarios':
      return <Users size={16} />
    default:
      return <Home size={16} />
  }
}

const INICIO_POR_ROL: Record<Rol, string> = {
  invitado: 'inicio',
  cliente: 'inicio',
  administrador: 'panel',
}

function Aplicacion() {
  const { esInvitado, esCliente, esAdministrador } = useAuth()

  const rol: Rol = esAdministrador ? 'administrador' : esCliente ? 'cliente' : 'invitado'
  const [pantalla, setPantalla] = useState<string>('inicio')
  const [vehiculoParaReservar, setVehiculoParaReservar] = useState<Vehiculo | null>(null)

  const idsValidos = NAVEGACION[rol].map((item) => item.id)
  const pantallaActual = idsValidos.includes(pantalla) ? pantalla : INICIO_POR_ROL[rol]

  const irA = (id: string) => setPantalla(id)

  return (
    <div className={`aplicacion aplicacion--${rol}`}>
      <header className="cabecera-sitio">
        <div className="cabecera-sitio__interior">
          <button className="cabecera-sitio__marca" onClick={() => irA(INICIO_POR_ROL[rol])}>
            <span className="cabecera-sitio__logo">
              <Zap size={18} />
            </span>
            <span className="cabecera-sitio__nombre">QUANTUM</span>
          </button>

          <nav className="cabecera-sitio__nav">
            {NAVEGACION[rol].map((item) => (
              <button
                key={item.id}
                className={`cabecera-sitio__enlace${
                  pantallaActual === item.id ? ' cabecera-sitio__enlace--activo' : ''
                }`}
                onClick={() => irA(item.id)}
              >
                <IconoNav nombre={item.icono} />
                {item.etiqueta}
              </button>
            ))}
          </nav>

          <div className="cabecera-sitio__acciones">
            {esInvitado ? (
              <LoginButton />
            ) : (
              <>
                <Saludo />
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="contenido">
        <div className="contenido__cuerpo">
          {rol === 'invitado' && pantallaActual === 'inicio' && (
            <PaginaInicio alVerVehiculos={() => irA('vehiculos')} />
          )}
          {rol === 'invitado' && pantallaActual === 'vehiculos' && (
            <PaginaVehiculos
              alReservar={(vehiculo) => {
                setVehiculoParaReservar(vehiculo)
                irA('reservas')
              }}
            />
          )}
          {rol === 'invitado' && pantallaActual === 'reservas' && (
            <PaginaReservas vehiculoInicial={vehiculoParaReservar} />
          )}

          {rol === 'cliente' && pantallaActual === 'inicio' && (
            <PaginaInicioCliente alVerEstaciones={() => irA('estaciones')} />
          )}
          {rol === 'cliente' && pantallaActual === 'estaciones' && <PaginaEstaciones />}
          {rol === 'cliente' && pantallaActual === 'talleres' && <PaginaTalleres />}
          {rol === 'cliente' && pantallaActual === 'emergencias' && <PaginaEmergencias />}

          {rol === 'administrador' && pantallaActual === 'panel' && <PaginaPanel />}
          {rol === 'administrador' && pantallaActual === 'usuarios' && <PaginaUsuarios />}
        </div>
      </main>

      <footer className="pie-sitio">
        <span className="pie-sitio__marca">
          <Zap size={13} /> QUANTUM
        </span>
        <span>© {new Date().getFullYear()} Quantum Mobility · Voltus</span>
        <span className="pie-sitio__enlaces">
          Privacidad · Términos · Soporte
        </span>
      </footer>
    </div>
  )
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <Aplicacion />
    </AuthProvider>
  )
}