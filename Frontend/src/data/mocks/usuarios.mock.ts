import type { UsuarioAdministracion } from '../../domain/modelos/Usuario'

export const mocksUsuarios: UsuarioAdministracion[] = [
  {
    id: '1',
    name: 'Camila Rojas',
    email: 'camila.rojas@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '12 Mar 2025',
  },
  {
    id: '2',
    name: 'Daniel Quispe',
    email: 'daniel.quispe@mail.com',
    role: 'Administrador',
    status: 'Activo',
    vehicles: 0,
    joinedAt: '02 Ene 2024',
  },
  {
    id: '3',
    name: 'Fernanda Vargas',
    email: 'fernanda.vargas@mail.com',
    role: 'Usuario',
    status: 'Suspendido',
    vehicles: 2,
    joinedAt: '28 Jun 2025',
  },
  {
    id: '4',
    name: 'Jorge Mamani',
    email: 'jorge.mamani@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '15 Nov 2024',
  },
  {
    id: '5',
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '30 Abr 2025',
  },
]