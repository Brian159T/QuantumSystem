let token: string | null = null;

export function guardarToken(valor: string): void {
  token = valor;
}

export function obtenerToken(): string | null {
  return token;
}

export function limpiarToken(): void {
  token = null;
}
