import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

function DashboardEstadoStockChart({ datosEstadoStock, COLORES_ESTADO }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-dark mb-6">Estado del Stock</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosEstadoStock}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
            >
              {datosEstadoStock.map((entry, index) => (
                <Cell key={entry.name} fill={COLORES_ESTADO[index % COLORES_ESTADO.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DashboardEstadoStockChart