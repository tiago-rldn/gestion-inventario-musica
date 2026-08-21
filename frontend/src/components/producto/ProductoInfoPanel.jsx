import { useState } from 'react'
import { Tag, Music2, DollarSign, Package, Shirt, Palette, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'

const UMBRAL_STOCK_BAJO = 5

function estadoStock(cantidad) {
  if (cantidad === 0) return { etiqueta: 'Sin stock', clase: 'bg-red-100 text-red-800' }
  if (cantidad <= UMBRAL_STOCK_BAJO) return { etiqueta: 'Stock bajo', clase: 'bg-amber-100 text-amber-800' }
  return { etiqueta: 'En stock', clase: 'bg-emerald-100 text-emerald-800' }
}

export default function ProductoInfoPanel({ detalle, cargando }) {
  const [imagenIndex, setImagenIndex] = useState(0)

  if (cargando) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!detalle) return <p className="text-center text-gray-500 py-8">No se pudo cargar el producto.</p>

  const imagenes = detalle.imagenes || []
  const totalImagenes = imagenes.length
  const imagenActual = imagenes[imagenIndex] || null

  const imagenAnterior = () => setImagenIndex((prev) => (prev === 0 ? totalImagenes - 1 : prev - 1))
  const imagenSiguiente = () => setImagenIndex((prev) => (prev === totalImagenes - 1 ? 0 : prev + 1))

  // Filtrar atributos vacíos: si un valor es null/undefined/'' no se muestra
  const infoFilas = [
    { icono: Tag, label: 'SKU', value: `#${detalle.sku}` },
    { icono: Music2, label: 'Artista / Banda', value: detalle.artistaBanda },
    { icono: DollarSign, label: 'Precio', value: `$${detalle.precio}` },
    { icono: Package, label: 'Stock actual', value: `${detalle.cantidadStock} unidades` },
    { icono: Shirt, label: 'Talle / Prenda', value: detalle.tallePrenda },
    { icono: Palette, label: 'Color', value: detalle.color },
  ].filter((fila) => fila.value !== null && fila.value !== undefined && fila.value !== '')

  return (
    <div className="flex flex-col md:flex-row">
      {/* Panel izquierdo: carrusel de imágenes */}
      <div className="md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-gray-100">
        {totalImagenes > 0 ? (
          <div className="space-y-3">
            <div className="relative group">
              <img
                src={imagenActual?.urlImagen}
                alt={detalle.nombre}
                className="w-full h-64 md:h-80 object-cover rounded-xl"
              />
              {totalImagenes > 1 && (
                <>
                  <button
                    onClick={imagenAnterior}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={imagenSiguiente}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                    {imagenIndex + 1} / {totalImagenes}
                  </span>
                </>
              )}
            </div>

            {totalImagenes > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagenes.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setImagenIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === imagenIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.urlImagen} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
            <div className="text-center text-gray-400">
              <ImageOff size={32} className="mx-auto mb-2" />
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${estadoStock(detalle.cantidadStock).clase}`}>
            {estadoStock(detalle.cantidadStock).etiqueta}
          </span>
        </div>
      </div>

      {/* Panel derecho: detalles con atributos filtrados */}
      <div className="md:w-3/5 p-6 space-y-4">
        <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
          {infoFilas.map((fila) => {
            const Icono = fila.icono
            return (
              <div key={fila.label} className="flex items-center gap-3 px-4 py-3">
                <Icono size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 w-28">{fila.label}</span>
                <span className="text-sm font-medium text-dark">{fila.value}</span>
              </div>
            )
          })}
        </div>

        {detalle.descripcion && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción</h4>
            <p className="text-sm text-dark bg-gray-50 rounded-xl p-4 whitespace-pre-line">{detalle.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
