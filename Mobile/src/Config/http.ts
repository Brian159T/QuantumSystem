import axios from 'axios'
import { API_URL } from './api'
import { obtenerToken } from './token'

const http = axios.create({ baseURL: API_URL })

http.interceptors.request.use((config) => {
  const token = obtenerToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http
