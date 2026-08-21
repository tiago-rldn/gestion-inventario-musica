import{ api } from './hhtp.js'

// Obtiene todos los usuarios (GET).
export async function getUsuarios() {
  const { data } = await api.get('/usuarios')
  return data
}

// Agrega un nuevo usuario (POST).
export async function agregarUsuario(data) {
  const { data: response } = await api.post('/usuarios', data)
  return response
}