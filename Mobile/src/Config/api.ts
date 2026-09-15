import Constants from 'expo-constants'

const host = Constants.expoConfig?.hostUri?.split(':')[0]

if (!host) {
  throw new Error('No se pudo detectar la IP del servidor')
}

export const API_URL = `http://${host}:4000/api`