import { api } from './http.js'

// Obtiene el árbol de categorías con cantidadProductos.
export async function getCategorias() {
  const { data } = await api.get('/categorias')
  return data
}

// Obtiene una categoría por ID
export async function getCategoria(id) {
  const { data } = await api.get(`/categorias/${id}`)
  return data
}

// Agrega una nueva categoría (POST).
export async function agregarCategoria(data) {
  const { data: response } = await api.post('/categorias', data)
  return response
}

// Actualiza los datos de una categoría (PUT).
/*export async function actualizarCategoria(id, data) {
  const { data: response } = await api.put(`/categorias/${id}`, data)
  return response
} */

// Elimina una categoría por ID (DELETE) (SOFT DELETE).
export async function eliminarCategoria(id) {
  const { data: response } = await api.delete(`/categorias/${id}`)
  return response
}