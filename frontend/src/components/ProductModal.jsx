import { useEffect, useState } from 'react'
import {
  X, Package, Tag, DollarSign, Hash, Palette, Shirt, Music2,
  TrendingUp, TrendingDown, SlidersHorizontal, Clock, AlertTriangle,
  ImageOff, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { getProducto } from '../api/productos'
import { getMovimientosPorProducto, crearMovimiento } from '../api/movimientos'

const TIPOS_MOVIMIENTO = [
  { valor: 'INGRESO', etiqueta: 'Ingreso', icono: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { valor: 'EGRESO', etiqueta: 'Egreso', icono: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
  { valor: 'AJUSTE', etiqueta: 'Ajuste', icono: SlidersHorizontal, color: 'text-violet-600', bg: 'bg-violet-100' },
]

const UMBRAL_STOCK_BAJO = 5

function estadoStock(cantidad) {
  if (cantidad === 0) return { etiqueta: 'Sin stock', clase: 'bg-red-100 text-red-800' }
  if (cantidad <= UMBRAL_STOCK_BAJO) return { etiqueta: 'Stock bajo', clase: 'bg-amber-100 text-amber-800' }
  return { etiqueta: 'En stock', clase: 'bg-emerald-100 text-emerald-800' }
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  const d = new Date(fechaISO)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ProductModal({ productoId, abierto, onCerrar, onMovimientoExitoso }) {
  const [pestana, setPestana] = useState('info')
  const [detalle, setDetalle] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargandoDetalle, setCargandoDetalle] = useState(true)
  const [cargandoMovimientos, setCargandoMovimientos] = useState(true)

  const [imagenIndex, setImagenIndex] = useState(0)

  const [tipo, setTipo] = useState('INGRESO')
  const [cantidad, setCantidad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    if (!abierto || !productoId) return
    setPestana('info')
    setDetalle(null)
    setMovimientos([])
    setCargandoDetalle(true)
    setCargandoMovimientos(true)
    setImagenIndex(0)
    setTipo('INGRESO')
    setCantidad('')
    setObservaciones('')
    setErrorForm('')
    setExito('')

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

  useEffect(() => {
    setImagenIndex(0)
  }, [detalle])

  const imagenes = detalle?.imagenes || []
  const totalImagenes = imagenes.length
  const imagenActual = imagenes[imagenIndex] || null

  const imagenAnterior = () => {
    setImagenIndex((prev) => (prev === 0 ? totalImagenes - 1 : prev - 1))
  }
  const imagenSiguiente = () => {
    setImagenIndex((prev) => (prev === totalImagenes - 1 ? 0 : prev + 1))
  }

  const handleEnviarMovimiento = async (e) => {
    e.preventDefault()
    setErrorForm('')
    setExito('')

    const cantNum = parseInt(cantidad, 10)
    if (!cantNum || cantNum <= 0) {
      setErrorForm('La cantidad debe ser un número mayor a 0')
      return
    }
    if (tipo === 'EGRESO' && detalle && cantNum > detalle.cantidadStock) {
      setErrorForm(`Stock insuficiente. Stock actual: ${detalle.cantidadStock}`)
      return
    }
    if (!observaciones.trim()) {
      setErrorForm('Las observaciones son obligatorias')
      return
    }

    setEnviando(true)
    try {
      await crearMovimiento({
        productoId,
        tipo,
        cantidad: cantNum,
        observaciones: observaciones.trim(),
      })
      setExito(`Movimiento ${tipo.toLowerCase()} registrado correctamente`)
      setCantidad('')
      setObservaciones('')
      const [det, movs] = await Promise.all([
        getProducto(productoId),
        getMovimientosPorProducto(productoId),
      ])
      setDetalle(det)
      setMovimientos(movs)
      if (onMovimientoExitoso) onMovimientoExitoso()
    } catch (err) {
      setErrorForm(err.response?.data?.message || err.message || 'Error al registrar movimiento')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierto) return null

  const infoFilas = detalle ? [
    { icono: Tag, label: 'SKU', value: `#${detalle.sku}` },
    { icono: Music2, label: 'Artista / Banda', value: detalle.artistaBanda || '—' },
    { icono: DollarSign, label: 'Precio', value: `$${detalle.precio}` },
    { icono: Package, label: 'Stock actual', value: `${detalle.cantidadStock} unidades` },
    { icono: Shirt, label: 'Talle / Prenda', value: detalle.tallePrenda || '—' },
    { icono: Palette, label: 'Color', value: detalle.color || '—' },
  ] : []

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
          <button onClick={onCerrar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { id: 'info', label: 'Información' },
            { id: 'movimientos', label: 'Movimientos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestana(tab.id)}
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
            <div className="flex flex-col md:flex-row">
              {/* Panel izquierdo: Imágenes */}
              <div className="md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-gray-100">
                {cargandoDetalle ? (
                  <div className="space-y-3">
                    <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : totalImagenes > 0 ? (
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

                {detalle && (
                  <div className="mt-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${estadoStock(detalle.cantidadStock).clase}`}>
                      {estadoStock(detalle.cantidadStock).etiqueta}
                    </span>
                  </div>
                )}
              </div>

              {/* Panel derecho: Detalles */}
              <div className="md:w-3/5 p-6">
                {cargandoDetalle ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : detalle ? (
                  <div className="space-y-4">
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
                        <p className="text-sm text-dark bg-gray-50 rounded-xl p-4">{detalle.descripcion}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No se pudo cargar el producto.</p>
                )}
              </div>
            </div>
          )}

          {pestana === 'movimientos' && (
            <div className="p-6 space-y-6">
              {/* Formulario */}
              <form onSubmit={handleEnviarMovimiento} className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-semibold text-dark">Registrar movimiento</h4>

                <div className="grid grid-cols-3 gap-2">
                  {TIPOS_MOVIMIENTO.map((t) => {
                    const Icono = t.icono
                    return (
                      <button
                        key={t.valor}
                        type="button"
                        onClick={() => setTipo(t.valor)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                          tipo === t.valor
                            ? `${t.bg} border-current ${t.color} ring-2 ring-current/20`
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        <Icono size={18} />
                        <span className="text-xs font-medium">{t.etiqueta}</span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Cantidad {tipo === 'AJUSTE' ? '(nuevo stock)' : ''}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder={tipo === 'AJUSTE' ? 'Stock final deseado' : 'Cantidad'}
                    required
                  />
                  {tipo === 'EGRESO' && detalle && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stock actual: <span className="font-medium">{detalle.cantidadStock}</span> unidades
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones *</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={2}
                    placeholder="Motivo del movimiento..."
                    required
                  />
                </div>

                {errorForm && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-700">{errorForm}</p>
                  </div>
                )}
                {exito && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs text-emerald-700">{exito}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar movimiento'
                  )}
                </button>
              </form>

              {/* Historial */}
              <div>
                <h4 className="text-sm font-semibold text-dark mb-3">Historial de movimientos</h4>
                {cargandoMovimientos ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : movimientos.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
                    No hay movimientos registrados para este producto.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {movimientos.map((mov) => {
                      const config = TIPOS_MOVIMIENTO.find((t) => t.valor === mov.tipoMovimiento) || TIPOS_MOVIMIENTO[0]
                      const Icono = config.icono
                      return (
                        <div key={mov.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icono className={config.color} size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${config.color}`}>{config.etiqueta}</span>
                              <span className="text-xs text-gray-500">·</span>
                              <span className="text-xs font-medium text-dark">{mov.cantidad} uds.</span>
                            </div>
                            {mov.observaciones && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">{mov.observaciones}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <Clock size={12} />
                            <span>{formatearFecha(mov.fechaHora)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
