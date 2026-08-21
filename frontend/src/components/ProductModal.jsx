import { useEffect, useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { getProducto } from '../api/productos'
import { getMovimientosPorProducto } from '../api/movimientos'
import ProductoInfoPanel from './producto/ProductoInfoPanel'
import ProductoImagenesPanel from './producto/ProductoImagenesPanel'
import ProductoMovimientosPanel from './producto/ProductoMovimientosPanel'
import ProductoEditarForm from './producto/ProductoEditarForm'

export default function ProductModal({ productoId, abierto, onCerrar, onMovimientoExitoso }) {
  const [pestana, setPestana] = useState('info')
  const [editando, setEditando] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargandoDetalle, setCargandoDetalle] = useState(true)
  const [cargandoMovimientos, setCargandoMovimientos] = useState(true)

  useEffect(() => {
    if (!abierto || !productoId) return
    setPestana('info')
    setEditando(false)
    setDetalle(null)
    setMovimientos([])
    setCargandoDetalle(true)
    setCargandoMovimientos(true)

    const cargar = async () => {
      try {
        const [det, movs] = await Promise.all([
          getProducto(productoId),
          getMovimientosPorProducto(productoId),
        ])
        setDetalle(det)
        setMovimientos(movs)
      } catch {
        // Error silencioso
      } finally {
        setCargandoDetalle(false)
        setCargandoMovimientos(false)
      }
    }
    cargar()
  }, [abierto, productoId])

  const recargarDetalle = async () => {
    try {
      const det = await getProducto(productoId)
      setDetalle(det)
    } catch { /* ignore */ }
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-dark">{detalle?.nombre || 'Cargando...'}</h2>
            <p className="text-sm text-gray-500">{detalle ? `SKU #${detalle.sku}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {detalle && !editando && pestana === 'info' && (
              <button
                onClick={() => setEditando(true)}
                className="px-3 py-2 rounded-lg hover:bg-violet-50 text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium"
              >
                <Pencil size={16} />
                Editar
              </button>
            )}
            <button onClick={onCerrar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { id: 'info', label: 'Información' },
            { id: 'imagenes', label: 'Imágenes' },
            { id: 'movimientos', label: 'Movimientos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setPestana(tab.id); setEditando(false) }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                pestana === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {pestana === 'info' && (
            editando && detalle ? (
              <ProductoEditarForm
                producto={detalle}
                onGuardado={async () => { await recargarDetalle(); setEditando(false) }}
                onCancelar={() => setEditando(false)}
              />
            ) : (
              <ProductoInfoPanel detalle={detalle} cargando={cargandoDetalle} />
            )
          )}

          {pestana === 'imagenes' && (
            <ProductoImagenesPanel
              productoId={productoId}
              imagenes={detalle?.imagenes || []}
              cargando={cargandoDetalle}
              onCambio={recargarDetalle}
            />
          )}

          {pestana === 'movimientos' && (
            <ProductoMovimientosPanel
              productoId={productoId}
              detalle={detalle}
              movimientos={movimientos}
              cargandoMovimientos={cargandoMovimientos}
              onMovimientoExitoso={onMovimientoExitoso}
              onMovimientosActualizados={(movs) => setMovimientos(movs)}
              onDetalleActualizado={recargarDetalle}
            />
          )}
        </div>
      </div>
    </div>
  )
}
