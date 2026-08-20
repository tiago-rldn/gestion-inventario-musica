import { api } from './http.js'

// Obtiene productos paginados. Devuelve la Page de Spring: { content, totalElements, totalPages, ... }.
export async function getProductos(page = 0, size = 10) {
  const { data } = await api.get('/productos', { params: { page, size } })
  return data
}

// Obtiene un producto por ID con toda la info (descripción, imágenes, etc.).
export async function getProducto(id) {
  const { data } = await api.get(`/productos/${id}`)
  return data
}

// Obtiene todos los productos de una categoría y sus subcategorías (CTE recursivo en backend).
export async function getProductosPorCategoria(categoriaId) {
  const { data } = await api.get(`/productos/categoria/${categoriaId}`)
  return data
}
