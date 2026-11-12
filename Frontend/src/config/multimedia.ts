import videoInicio from '../../assets/E-QUTE.mp4'
import videoVehiculos from '../../assets/video dentro del auto.mp4'
import videoCarga from '../../assets/carga electrica.mp4'

// Rutas relativas a Frontend/public, assets importados o URLs completas. Vacío = espacio reservado.
export const MULTIMEDIA = {
  inicio: '',
  experiencia: '',
  videoInicio,
  videoVehiculos,
  videoCarga,
  portadaVideo: '',
}

// La clave es el id_vehiculo de la API. Ejemplo: 1: '/media/modelo-1.webp'
export const FOTOS_VEHICULOS: Record<string, string> = {}
