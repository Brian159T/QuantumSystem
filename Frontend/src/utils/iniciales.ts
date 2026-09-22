export function obtenerIniciales(nombre: string, fallback = 'U'): string {
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
  return iniciales || fallback
}