import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from 'lucide-react'

export default function InventoryPageHeader({ titulo = 'Inventario', vista, setVista, hayFiltros }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-dark">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {hayFiltros ? 'Productos filtrados' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setVista('grid')}
            className={`p-2 rounded-md transition-colors ${vista === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={`p-2 rounded-md transition-colors ${vista === 'tabla' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}