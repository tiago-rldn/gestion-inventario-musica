import { Edit2, Trash2, Plus } from 'lucide-react'

function DashboardProductosRecientesTable({ productos, navigate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-dark mb-4 md:mb-0">Inventario Reciente</h2>
        <button
          onClick={() => navigate('/inventario')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Ver todos</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="py-3 px-6 text-left">SKU</th>
              <th className="py-3 px-6 text-left">Producto</th>
              <th className="py-3 px-6 text-left">Precio</th>
              <th className="py-3 px-6 text-left">Stock</th>
              <th className="py-3 px-6 text-left">Estado</th>
              <th className="py-3 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p) => {
              const UMBRAL_STOCK_BAJO = 5
              if (p.cantidadStock === 0) {
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-500">#{p.sku}</td>
                    <td className="py-4 px-6 font-medium">{p.nombre}</td>
                    <td className="py-4 px-6">${p.precio}</td>
                    <td className="py-4 px-6">{p.cantidadStock}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">Sin stock</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary-dark">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-accent hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }
              if (p.cantidadStock <= UMBRAL_STOCK_BAJO) {
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-500">#{p.sku}</td>
                    <td className="py-4 px-6 font-medium">{p.nombre}</td>
                    <td className="py-4 px-6">${p.precio}</td>
                    <td className="py-4 px-6">{p.cantidadStock}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Stock bajo</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary-dark">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-accent hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-500">#{p.sku}</td>
                  <td className="py-4 px-6 font-medium">{p.nombre}</td>
                  <td className="py-4 px-6">${p.precio}</td>
                  <td className="py-4 px-6">{p.cantidadStock}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">En stock</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="text-primary hover:text-primary-dark">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-accent hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default DashboardProductosRecientesTable