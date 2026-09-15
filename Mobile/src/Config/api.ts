import Constants from 'expo-constants'

const host = Constants.expoConfig?.hostUri?.split(':')[0]

export const API_URL = host
  ? `http://${host}:4000/api`
  : `http://localhost:4000/api`