import { AlertTriangle } from 'lucide-react'

export default function InventoryPageErrorBanner({ error, setError }) {
  if (!error) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
      <AlertTriangle size={20} className="text-red-500" />
      <p className="text-sm text-red-700">{error}</p>
    </div>
  )
}