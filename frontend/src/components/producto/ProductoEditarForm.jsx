import { useState } from 'react'
import { Save, X, AlertTriangle, Loader2 } from 'lucide-react'
import { actualizarProducto } from '../../api/productos'

export default function ProductoEditarForm({ producto, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    sku: producto.sku || '',
    nombre: producto.nombre || '',
    descripcion: producto.descripcion || '',
    precio: producto.precio ?? '',
    artistaBanda: producto.artistaBanda || '',
    tallePrenda: producto.tallePrenda || '',
    color: producto.color || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await actualizarProducto(producto.id, {
        ...form,
        precio: form.precio === '' ? null : Number(form.precio),
        descripcion: form.descripcion || null,
        artistaBanda: form.artistaBanda || null,
        tallePrenda: form.tallePrenda || null,
        color: form.color || null,
      })
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar los cambios')
    } finally {
      setGuardando(false)
    }
  }

  const campos = [
    { campo: 'sku', label: 'SKU', type: 'text', required: true },
    { campo: 'nombre', label: 'Nombre', type: 'text', required: true },
    { campo: 'descripcion', label: 'Descripción', type: 'textarea' },
    { campo: 'precio', label: 'Precio', type: 'number', required: true, step: '0.01' },
    { campo: 'artistaBanda', label: 'Artista / Banda', type: 'text' },
    { campo: 'tallePrenda', label: 'Talle / Prenda', type: 'text' },
    { campo: 'color', label: 'Color', type: 'text' },
  ]

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h4 className="text-sm font-semibold text-dark">Editar producto</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campos.map((c) => (
          <div key={c.campo} className={c.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {c.label} {c.required && '*'}
            </label>
            {c.type === 'textarea' ? (
              <textarea
                value={form[c.campo]}
                onChange={handleChange(c.campo)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            ) : (
              <input
                type={c.type}
                value={form[c.campo]}
                onChange={handleChange(c.campo)}
                required={c.required}
                step={c.step}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        >
          <X size={16} />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
