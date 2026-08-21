import { useState } from 'react'
import { TrendingUp, TrendingDown, SlidersHorizontal, Clock, AlertTriangle } from 'lucide-react'
import { crearMovimiento, getMovimientosPorProducto } from '../../api/movimientos'

const TIPOS_MOVIMIENTO = [
  { valor: 'INGRESO', etiqueta: 'Ingreso', icono: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { valor: 'EGRESO', etiqueta: 'Egreso', icono: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
  { valor: 'AJUSTE', etiqueta: 'Ajuste', icono: SlidersHorizontal, color: 'text-violet-600', bg: 'bg-violet-100' },
]

function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  const d = new Date(fechaISO)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ProductoMovimientosPanel({ productoId, detalle, movimientos, cargandoMovimientos, onMovimientoExitoso, onMovimientosActualizados, onDetalleActualizado }) {
  const [tipo, setTipo] = useState('INGRESO')
  const [cantidad, setCantidad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [exito, setExito] = useState('')

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
      const movs = await getMovimientosPorProducto(productoId)
      onMovimientosActualizados(movs)
      onDetalleActualizado()
      if (onMovimientoExitoso) onMovimientoExitoso()
    } catch (err) {
      setErrorForm(err.response?.data?.message || err.message || 'Error al registrar movimiento')
    } finally {
      setEnviando(false)
    }
  }

  return (
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
  )
}
