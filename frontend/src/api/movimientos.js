import { api } from './http.js'

// Historial de movimientos de un producto (más recientes primero).
export async function getMovimientosPorProducto(productoId) {
  const { data } = await api.get(`/movimientos/producto/${productoId}`)
  return data
}

// Historial de movimientos de stock hechos por un usuario (más recientes primero).
export async function getMovimientosPorUsuario(usuarioId) {
  const { data } = await api.get(`/movimientos/usuario/${usuarioId}`)
  return data
}

// Registra un nuevo movimiento de stock (INGRESO, EGRESO, AJUSTE).
export async function crearMovimiento({ productoId, tipo, cantidad, observaciones }) {
  const { data } = await api.post('/movimientos', { productoId, tipo, cantidad, observaciones })
  return data
}
