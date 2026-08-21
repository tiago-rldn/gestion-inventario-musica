import { api } from './http.js'

// Normaliza la respuesta: acepta Page de Spring ({content, totalElements, totalPages})
// o un array crudo (backend sin reiniciar). Garantiza el contrato {content, totalElements, totalPages}.
function normalizarPage(data, size) {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / size)),
    }
  }
  return data || { content: [], totalElements: 0, totalPages: 0 }
}

// Obtiene productos paginados. Devuelve la Page de Spring: { content, totalElements, totalPages, ... }.
export async function getProductos(page = 0, size = 10) {
  const { data } = await api.get('/productos', { params: { page, size } })
  return normalizarPage(data, size)
}

// Obtiene un producto por ID con toda la info (descripción, imágenes, etc.).
export async function getProducto(id) {
  const { data } = await api.get(`/productos/${id}`)
  return data
}

// Obtiene productos de una categoría y sus subcategorías, paginado (CTE recursivo en backend).
export async function getProductosPorCategoria(categoriaId, page = 0, size = 12) {
  const { data } = await api.get(`/productos/categoria/${categoriaId}`, { params: { page, size } })
  return normalizarPage(data, size)
}

// Actualiza los datos de un producto (PUT).
export async function actualizarProducto(id, data) {
  const { data: response } = await api.put(`/productos/${id}`, data)
  return response
}
