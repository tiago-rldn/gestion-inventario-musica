import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WelcomeBanner from './components/WelcomeBanner'
import StatCards from './components/StatCards'
import OperationsGrid from './components/OperationsGrid'
import ProductosPorCategoriaChart from './components/ProductosPorCategoriaChart'
import EstadoStockChart from './components/EstadoStockChart'
import ProductosRecientesTable from './components/ProductosRecientesTable'
import AlertasStock from './components/AlertasStock'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Boxes, Package, AlertTriangle, Percent, PackagePlus, PackageMinus,
  SlidersHorizontal, Plus, FolderTree, Search, Edit2, Trash2, Music2,
} from 'lucide-react'
import { getProductos } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import { obtenerUsuarioDelToken } from '../../utils/jwt'

const UMBRAL_STOCK_BAJO = 5

function aplanarCategorias(categorias) {
  return categorias.flatMap((cat) => [cat, ...aplanarCategorias(cat.subcategorias || [])])
}

function estadoStock(cantidad) {
  if (cantidad === 0) return { etiqueta: 'Sin stock', clase: 'bg-red-100 text-red-800' }
  if (cantidad <= UMBRAL_STOCK_BAJO) return { etiqueta: 'Stock bajo', clase: 'bg-amber-100 text-amber-800' }
  return { etiqueta: 'En stock', clase: 'bg-emerald-100 text-emerald-800' }
}

function DashboardPage() {
  const navigate = useNavigate()
  const usuario = obtenerUsuarioDelToken()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [pageProductos, listaCategorias] = await Promise.all([
          getProductos(0, 50),
          getCategorias(),
        ])
        setProductos(pageProductos.content || [])
        setCategorias(listaCategorias)
      } catch (err) {
        setError(err.message || 'Error al cargar los datos')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const {
    stockTotal, conStock, stockBajo, sinStock, categoriasAplanadas,
    datosProductosPorCategoria, datosEstadoStock, productosRecientes, actividadReciente,
  } = useMemo(() => {
    const stockTotal = productos.reduce((acc, p) => acc + (p.cantidadStock || 0), 0)
    const conStock = productos.filter((p) => p.cantidadStock > UMBRAL_STOCK_BAJO)
    const stockBajo = productos.filter((p) => p.cantidadStock > 0 && p.cantidadStock <= UMBRAL_STOCK_BAJO)
    const sinStock = productos.filter((p) => p.cantidadStock === 0)
    const categoriasAplanadas = aplanarCategorias(categorias)

    const datosProductosPorCategoria = categoriasAplanadas.map((c) => ({
      nombre: c.nombre,
      productos: c.cantidadProductos,
    }))

    const datosEstadoStock = [
      { name: 'En stock', value: conStock.length },
      { name: 'Stock bajo', value: stockBajo.length },
      { name: 'Sin stock', value: sinStock.length },
    ].filter((d) => d.value > 0)

    const productosRecientes = productos.slice(0, 5)

    const actividadReciente = stockBajo.slice(0, 4).map((p) => ({
      titulo: `Stock bajo: ${p.nombre}`,
      detalle: `Quedan ${p.cantidadStock} unidades`,
      color: 'bg-warning',
    }))

    return {
      stockTotal, conStock, stockBajo, sinStock, categoriasAplanadas,
      datosProductosPorCategoria, datosEstadoStock, productosRecientes, actividadReciente,
    }
  }, [productos, categorias])

  const COLORES_ESTADO = ['#10b981', '#f59e0b', '#ef4444']

  const statCards = [
    { titulo: 'Total Productos', valor: productos.length, icono: Boxes, fondo: 'bg-violet-100', color: 'text-primary', punto: 'bg-primary', detalle: `${categoriasAplanadas.length} categorías` },
    { titulo: 'Stock Total', valor: stockTotal, icono: Package, fondo: 'bg-emerald-100', color: 'text-success', punto: 'bg-success', detalle: 'unidades en inventario' },
    { titulo: 'Stock Bajo', valor: stockBajo.length, icono: AlertTriangle, fondo: 'bg-amber-100', color: 'text-warning', punto: 'bg-warning', detalle: 'requieren reposición' },
    { titulo: 'Sin Stock', valor: sinStock.length, icono: Percent, fondo: 'bg-red-100', color: 'text-accent', punto: 'bg-accent', detalle: 'productos agotados' },
  ]

  const operaciones = [
    { etiqueta: 'Ingreso', detalle: 'Entrada de stock', icono: PackagePlus, fondo: 'bg-violet-500', contenedor: 'bg-violet-50 border-violet-200 hover:bg-violet-100' },
    { etiqueta: 'Egreso', detalle: 'Salida de stock', icono: PackageMinus, fondo: 'bg-emerald-500', contenedor: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
    { etiqueta: 'Ajuste', detalle: 'Corrección', icono: SlidersHorizontal, fondo: 'bg-fuchsia-500', contenedor: 'bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100' },
    { etiqueta: 'Nuevo Producto', detalle: 'Alta', icono: Plus, fondo: 'bg-amber-500', contenedor: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { etiqueta: 'Categorías', detalle: 'Gestión', icono: FolderTree, fondo: 'bg-rose-500', contenedor: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
    { etiqueta: 'Buscar', detalle: 'Inventario', icono: Search, fondo: 'bg-indigo-500', contenedor: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  ]

  return (
    <div className="space-y-8">
      <WelcomeBanner
        usuario={usuario}
        totalProductos={productos.length}
        totalCategorias={categoriasAplanadas.length}
      />

      <StatCards statCards={statCards} />

      <OperationsGrid operaciones={operaciones} navigate={navigate} />

      <ProductosPorCategoriaChart datosProductosPorCategoria={datosProductosPorCategoria} />

      <EstadoStockChart datosEstadoStock={datosEstadoStock} COLORES_ESTADO={COLORES_ESTADO} />

      <ProductosRecientesTable productos={productosRecientes} navigate={navigate} />

      <AlertasStock actividadReciente={actividadReciente} />
    </div>
  )
}

export default DashboardPage