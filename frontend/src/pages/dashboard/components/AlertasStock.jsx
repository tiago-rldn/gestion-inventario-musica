import { AlertTriangle } from 'lucide-react'

function DashboardAlertasStock({ actividadReciente }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-dark">Alertas de Stock</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {actividadReciente.length === 0 && (
          <p className="p-6 text-gray-500 text-sm">No hay productos con stock bajo. Todo en orden.</p>
        )}
        {actividadReciente.map((act, index) => {
          const Icono = AlertTriangle
          return (
            <div key={index} className="p-6 flex items-start space-x-4">
              <div className={`w-10 h-10 ${act.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icono className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{act.titulo}</h4>
                <p className="text-gray-600 text-sm mt-1">{act.detalle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardAlertasStock