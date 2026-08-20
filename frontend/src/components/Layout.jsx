import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Disc3, LayoutDashboard, Package, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { obtenerUsuarioDelToken } from '../utils/jwt'

const NAV_ITEMS = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: Package },
]

export function Layout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const usuario = obtenerUsuarioDelToken()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const enlaces = () =>
    NAV_ITEMS.map((item) => {
      const Icono = item.icono
      return (
        <NavLink
          key={item.ruta}
          to={item.ruta}
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Icono size={18} />
          <span>{item.etiqueta}</span>
        </NavLink>
      )
    })

  const sidebar = (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Marca */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-fuchsia-500 rounded-lg flex items-center justify-center">
          <Disc3 className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">ViniloPro</h1>
          <p className="text-[11px] text-slate-400">Inventario Musical</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">{enlaces()}</nav>

      {/* Usuario + logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {(usuario || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{usuario || 'Usuario'}</h4>
            <p className="text-xs text-slate-400">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-light">
      {/* Sidebar desktop fijo */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">{sidebar}</aside>

      {/* Sidebar móvil (drawer) */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar móvil */}
        <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Disc3 className="text-white" size={16} />
            </div>
            <span className="font-bold text-dark">ViniloPro</span>
          </div>
          <button onClick={() => setMenuAbierto(true)} className="p-2 text-gray-600 hover:text-primary">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}