import { Package } from 'lucide-react'

export default function InventoryPageProductGrid({ productosVisibles, estadoStock, abrirModal, vista }) {
  const columnas = vista === 'grid' ? 3 : 1
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columnas} gap-4`}>
      {productosVisibles.map((p) => {
        const estado = estadoStock(p.cantidadStock)
        return (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
            onClick={() => abrirModal(p.id)}
          >
            {p.urlPortada ? (
              <div className="relative h-48 overflow-hidden">
                <img src={p.urlPortada} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className={`absolute top-2 right-2 px-2 py-0.5 text-[11px] font-medium rounded-full ${estado.clase}`}>
                  {estado.etiqueta}
                </span>
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center relative">
                <Package size={32} className="text-violet-200" />
                <span className={`absolute top-2 right-2 px-2 py-0.5 text-[11px] font-medium rounded-full ${estado.clase}`}>
                  {estado.etiqueta}
                </span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-dark text-sm truncate">{p.nombre}</h3>
                  {p.artistaBanda && (
                    <p className="text-xs text-gray-500 truncate">{p.artistaBanda}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">${p.precio}</span>
                <span className="text-xs text-gray-500">Stock: {p.cantidadStock}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${estado.punto}`} />
                <span className="text-[11px] text-gray-400">#{p.sku}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}