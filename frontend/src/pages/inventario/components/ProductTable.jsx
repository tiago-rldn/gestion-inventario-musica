import { Eye, Package } from 'lucide-react'

export default function InventoryPageProductTable({ productosVisibles, estadoStock, abrirModal }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="py-3 px-6 text-left">SKU</th>
              <th className="py-3 px-6 text-left">Producto</th>
              <th className="py-3 px-6 text-left">Artista</th>
              <th className="py-3 px-6 text-left">Precio</th>
              <th className="py-3 px-6 text-left">Stock</th>
              <th className="py-3 px-6 text-left">Estado</th>
              <th className="py-3 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productosVisibles.map((p) => {
              const estado = estadoStock(p.cantidadStock)
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-500 text-sm">#{p.sku}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {p.urlPortada ? (
                        <img src={p.urlPortada} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-violet-300" />
                        </div>
                      )}
                      <span className="font-medium text-sm">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{p.artistaBanda || '—'}</td>
                  <td className="py-4 px-6 text-sm font-medium">${p.precio}</td>
                  <td className="py-4 px-6 text-sm">{p.cantidadStock}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs rounded-full ${estado.clase}`}>{estado.etiqueta}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => abrirModal(p.id)}
                      className="p-2 rounded-lg hover:bg-violet-50 text-primary hover:text-primary-dark transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}