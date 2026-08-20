import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function InventoryPagePaginador({ page, totalPaginas, totalElementos, size, setPage, setSize }) {
  if (totalPaginas <= 1) return null

  const OPCIONES_TAMANIO = [12, 24, 48]

  const inicio = page * size + 1
  const fin = Math.min((page + 1) * size, totalElementos)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          Mostrando <span className="font-medium text-dark">{inicio}–{fin}</span> de{' '}
          <span className="font-medium text-dark">{totalElementos}</span>
        </span>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {OPCIONES_TAMANIO.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(0)}
          disabled={page === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        >
          <ChevronLeft size={16} />
        </button>

        {[...Array(totalPaginas).keys()].map((i) => {
          if (i === 0 || i === totalPaginas - 1 || Math.abs(i - page) <= 1) {
            return (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  i === page ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            )
          }
          return null
        })}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPaginas - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setPage(totalPaginas - 1)}
          disabled={page >= totalPaginas - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}