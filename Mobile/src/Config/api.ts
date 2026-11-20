import Constants from 'expo-constants';

const configurada = process.env.EXPO_PUBLIC_API_URL?.trim();
const hostDesarrollo = __DEV__ ? Constants.expoConfig?.hostUri?.split(':')[0] : undefined;

export const API_URL =
  configurada ||
  (hostDesarrollo ? `http://${hostDesarrollo}:4000/api` : 'http://localhost:4000/api');

if (!__DEV__ && !API_URL.startsWith('https://')) {
  throw new Error('Configura EXPO_PUBLIC_API_URL con una URL https para produccion');
}
