import { Music2, Plus, Search } from 'lucide-react'

function DashboardPageWelcomeBanner({ usuario, totalProductos, totalCategorias }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary to-fuchsia-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-primary/20">
      <Music2 className="absolute -right-6 -bottom-6 opacity-10" size={180} />
      <p className="text-sm text-white/70">Panel de control</p>
      <h1 className="text-2xl md:text-3xl font-bold mt-1">Hola, {usuario || 'admin'} 👋</h1>
      <p className="mt-2 text-white/80 max-w-md">
        Así está el stock de tu tienda hoy: {totalProductos} productos en {totalCategorias} categorías.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/inventario')}
          className="px-4 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
        <button
          onClick={() => navigate('/inventario')}
          className="px-4 py-2 bg-white/15 text-white font-medium rounded-lg hover:bg-white/25 flex items-center gap-2"
        >
          <Search size={16} />
          Ver inventario
        </button>
      </div>
    </div>
  )
}

export default DashboardPageWelcomeBanner