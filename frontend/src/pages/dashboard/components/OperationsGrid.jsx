import { PackagePlus, PackageMinus, SlidersHorizontal, Plus, FolderTree, Search } from 'lucide-react'

function DashboardOperationsGrid({ operaciones }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-dark">Operaciones</h2>
        <p className="text-gray-600 text-sm">Acceso rápido a las funciones del inventario</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {operaciones.map((op) => {
          const Icono = op.icono
          return (
            <button
              key={op.etiqueta}
              onClick={() => navigate('/inventario')}
              className={`${op.contenedor} p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`w-11 h-11 ${op.fondo} rounded-xl flex items-center justify-center`}>
                <Icono className="text-white" size={20} />
              </div>
              <span className="font-medium text-sm">{op.etiqueta}</span>
              <span className="text-xs text-gray-500">{op.detalle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardOperationsGrid