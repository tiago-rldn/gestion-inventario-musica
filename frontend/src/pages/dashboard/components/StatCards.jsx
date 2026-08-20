import { Boxes, Package, AlertTriangle, Percent } from 'lucide-react'

function DashboardStatCards({ statCards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icono = card.icono
        return (
          <div key={card.titulo} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.titulo}</p>
                <p className="text-3xl font-bold text-dark mt-2">{card.valor}</p>
              </div>
              <div className={`w-11 h-11 ${card.fondo} rounded-xl flex items-center justify-center`}>
                <Icono className={card.color} size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${card.punto}`} />
              {card.detalle}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default DashboardStatCards