import { Search } from "lucide-react"

export default function InventoryPageFiltros({
  busqueda, setBusqueda,
  categorias, setCategorias,
  categoriaId, setCategoriaId,
  filtroStock, setFiltroStock,
  categoriasAplanadas
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, SKU o artista..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={categoriaId || 'todas'}
          onChange={(e) => setCategoriaId(e.target.value === 'todas' ? null : e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[180px]"
        >
          <option value="todas">Todas las categorías</option>
          {categoriasAplanadas.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <select
          value={filtroStock}
          onChange={(e) => setFiltroStock(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px]"
        >
          <option value="todos">Todo el inventario</option>
          <option value="en_stock">En stock</option>
          <option value="stock_bajo">Stock bajo</option>
          <option value="sin_stock">Sin stock</option>
        </select>
      </div>
    </div>
  )
}