import { api } from './http.js'

// Obtiene el árbol de categorías con cantidadProductos.
export async function getCategorias() {
  const { data } = await api.get('/categorias')
  return data
}