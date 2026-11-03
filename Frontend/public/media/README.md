# Fotos y video del frontend

Coloca los archivos en esta carpeta y edita `src/config/multimedia.ts`.
Las rutas publicas empiezan con `/media/` (sin `public`). Tambien se aceptan URLs HTTPS.

```ts
export const MULTIMEDIA = {
  inicio: '/media/inicio.webp',
  experiencia: '/media/experiencia.webp',
  videoVehiculos: '/media/vehiculos.mp4',
  portadaVideo: '/media/portada.webp',
}
export const FOTOS_VEHICULOS: Record<string, string> = {
  '1': '/media/modelo-1.webp', // id_vehiculo real de la API
}
```

Deja una ruta vacia para conservar el espacio reservado sin solicitudes rotas.
Video recomendado: MP4 H.264 sin pista de audio. Se reproduce en ciclo, silenciado y dentro de la pagina; incluye pausa y respeta movimiento reducido.
Las imagenes generales usan recorte centrado 2:1; las fotos del catalogo se muestran completas.
No se crean modelos ficticios: los modelos y sus colores siguen viniendo de la API.
