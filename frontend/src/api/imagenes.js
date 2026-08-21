import { api } from './http.js'

// Sube una imagen (multipart/form-data) a Cloudinary y la asocia al producto.
export async function subirImagen(file, productoId) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/imagenes/upload', formData, {
    params: { productoId },
  })
  return data
}

// Elimina una imagen (también borra el asset en Cloudinary).
export async function eliminarImagen(id) {
  await api.delete(`/imagenes/${id}`)
}

// Cambia el orden de una imagen (el backend reordena las demás).
export async function cambiarOrden(id, nuevoOrden) {
  const { data } = await api.put(`/imagenes/${id}/orden`, null, {
    params: { nuevoOrden },
  })
  return data
}

// Marca una imagen como principal (orden 1).
export async function establecerPrincipal(id) {
  const { data } = await api.put(`/imagenes/${id}/principal`)
  return data
}
