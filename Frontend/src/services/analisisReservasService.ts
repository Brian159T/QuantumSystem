import { peticion } from './apiClient'

interface ReservaAnalitica {
  Fecha_Reserva: string
  Estado: string
  modelo: string
}

export async function obtenerAnalisisReservas() {
  const filas = await peticion<ReservaAnalitica[]>('/reservas')
  if (!Array.isArray(filas) || filas.some(fila => typeof fila.Fecha_Reserva !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fila.Fecha_Reserva))) {
    throw new Error('Las fechas de las reservas no tienen el formato esperado.')
  }
  const ahora = new Date()
  const desde = new Date(ahora)
  desde.setDate(desde.getDate() - 30)
  const fechaLocal = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
  const reservas = filas.filter(fila => fila.Fecha_Reserva >= fechaLocal(desde) && fila.Fecha_Reserva <= fechaLocal(ahora))
  const modelos = new Map<string, number>()
  const dias = new Map<string, number>()
  for (const reserva of reservas) {
    const modelo = reserva.modelo?.trim() || 'Sin modelo'
    modelos.set(modelo, (modelos.get(modelo) ?? 0) + 1)
    dias.set(reserva.Fecha_Reserva, (dias.get(reserva.Fecha_Reserva) ?? 0) + 1)
  }
  const maximoModelo = Math.max(0, ...modelos.values())
  const maximoDia = Math.max(0, ...dias.values())
  return {
    total: reservas.length,
    pendientes: reservas.filter(fila => fila.Estado?.trim().toLowerCase() === 'pendiente').length,
    confirmadas: reservas.filter(fila => ['confirmada', 'entregada'].includes(fila.Estado?.trim().toLowerCase())).length,
    modelosPrincipales: [...modelos].filter(([, total]) => total === maximoModelo).map(([modelo]) => modelo),
    maximoModelo,
    diasPrincipales: [...dias].filter(([, total]) => total === maximoDia).map(([dia]) => dia).sort(),
    maximoDia,
    actualizado: ahora.toLocaleTimeString('es'),
  }
}
