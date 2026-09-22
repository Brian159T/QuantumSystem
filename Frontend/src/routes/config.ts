export type Rol = 'invitado' | 'cliente' | 'administrador'

export interface Navegacion {
  id: string
  etiqueta: string
  icono: string
}

export const NAVEGACION: Record<Rol, Navegacion[]> = {
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

export const INICIO_POR_ROL: Record<Rol, string> = {
  invitado: 'inicio',
  cliente: 'inicio',
  administrador: 'panel',
}