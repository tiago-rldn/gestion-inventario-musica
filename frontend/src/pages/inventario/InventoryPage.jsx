import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Search, LayoutGrid, List, Package, AlertTriangle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye,
} from 'lucide-react'
import { getProductos, getProductosPorCategoria } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import ProductModal from '../../components/ProductModal'
import Header from './components/Header'
import Filtros from './components/Filtros'
import ErrorBanner from './components/ErrorBanner'
import ProductGrid from './components/ProductGrid'
import ProductTable from './components/ProductTable'
import Paginador from './components/Paginador'
import ModalIntegration from './components/ModalIntegration'

const UMBRAL_STOCK_BAJO = 5
const OPCIONES_TAMANIO = [12, 24, 48]

function useResponsiveColumns() {
  const [columnas, setColumnas] = useState(4)

  useEffect(() => {
    const calcular = () => {
      const w = window.innerWidth
      if (w < 640) setColumnas(1)
      else if (w < 1024) setColumnas(2)
      else if (w < 1280) setColumnas(3)
      else setColumnas(4)
    }
    calcular()
    window.addEventListener('resize', calcular)
    return () => window.removeEventListener('resize', calcular)
  }, [])

  return columnas
}

function aplanarCategorias(categorias) {
  return categorias.flatMap((cat) => [cat, ...aplanarCategorias(cat.subcategorias || [])])
}

function estadoStock(cantidad) {
  if (cantidad === 0) return { etiqueta: 'Sin stock', clase: 'bg-red-100 text-red-800', punto: 'bg-red-500' }
  if (cantidad <= UMBRAL_STOCK_BAJO) return { etiqueta: 'Stock bajo', clase: 'bg-amber-100 text-amber-800', punto: 'bg-amber-500' }
  return { etiqueta: 'En stock', clase: 'bg-emerald-100 text-emerald-800', punto: 'bg-emerald-500' }
}

function SkeletonGrid({ columnas }) {
  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
      {[...Array(columnas * 3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-100 rounded-lg w-20 animate-pulse" />
              <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonTabla() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-12 bg-gray-50 animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 border-b border-gray-50 animate-pulse flex items-center px-6 gap-4">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-8 bg-gray-100 rounded-lg w-16" />
        </div>
      ))}
    </div>
  )
}

export default function InventoryPage() {
  const columnas = useResponsiveColumns()
  const sizeDefault = columnas * 3

  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState(null)
  const [filtroStock, setFiltroStock] = useState('todos')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(sizeDefault)
  const [totalServerElements, setTotalServerElements] = useState(0)
  const [totalServerPages, setTotalServerPages] = useState(0)
  const [usandoCliente, setUsandoCliente] = useState(false)

  const [vista, setVista] = useState('grid')

  const [productoModalId, setProductoModalId] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    setSize(sizeDefault)
  }, [sizeDefault])

  const hayFiltros = busqueda || filtroStock !== 'todos' || categoriaId !== null

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        if (hayFiltros) {
          let all
          if (categoriaId) {
            all = await getProductosPorCategoria(categoriaId)
          } else {
            const pageData = await getProductos(0, 9999)
            all = pageData.content || []
          }
          if (!cancelado) {
            setTodosLosProductos(all)
            setUsandoCliente(true)
          }
        } else {
          const pageData = await getProductos(page, size)
          if (!cancelado) {
            setTodosLosProductos(pageData.content || [])
            setTotalServerElements(pageData.totalElements || 0)
            setTotalServerPages(pageData.totalPages || 0)
            setUsandoCliente(false)
          }
        }
      } catch (err) {
        if (!cancelado) setError(err.message || 'Error al cargar productos')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [page, size, hayFiltros, categoriaId])

  const productosFiltrados = useMemo(() => {
    if (!usandoCliente || !Array.isArray(todosLosProductos)) return todosLosProductos
    return todosLosProductos.filter((p) => {
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const matchNombre = p.nombre?.toLowerCase().includes(q)
        const matchSku = p.sku?.toLowerCase().includes(q)
        const matchArtista = p.artistaBanda?.toLowerCase().includes(q)
        if (!matchNombre && !matchSku && !matchArtista) return false
      }
      if (filtroStock === 'en_stock' && p.cantidadStock <= UMBRAL_STOCK_BAJO) return false
      if (filtroStock === 'stock_bajo' && (p.cantidadStock === 0 || p.cantidadStock > UMBRAL_STOCK_BAJO)) return false
      if (filtroStock === 'sin_stock' && p.cantidadStock !== 0) return false
      return true
    })
  }, [todosLosProductos, usandoCliente, busqueda, filtroStock])

  const totalPaginas = usandoCliente
    ? Math.ceil(productosFiltrados.length / size)
    : totalServerPages

  const totalElementos = usandoCliente
    ? productosFiltrados.length
    : totalServerElements

  const productosVisibles = useMemo(() => {
    if (usandoCliente && Array.isArray(productosFiltrados)) {
      const start = page * size
      return productosFiltrados.slice(start, start + size)
    }
    // Server mode o datos no disponibles: retornar array garantizado
    return Array.isArray(productosFiltrados) ? productosFiltrados : []
  }, [productosFiltrados, usandoCliente, page, size])

  useEffect(() => {
    setPage(0)
  }, [busqueda, filtroStock, size])

  const categoriasAplanadas = useMemo(() => aplanarCategorias(categorias), [categorias])

  const handleCategoriaChange = (value) => {
    setCategoriaId(value === 'todas' ? null : value)
    setPage(0)
  }

  const abrirModal = (productoId) => {
    setProductoModalId(productoId)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoModalId(null)
  }

  const handleMovimientoExitoso = useCallback(() => {
    const recargar = async () => {
      try {
        if (categoriaId) {
          const productos = await getProductosPorCategoria(categoriaId)
          setTodosLosProductos(productos)
        } else if (!hayFiltros) {
          const pageData = await getProductos(page, size)
          setTodosLosProductos(pageData.content || [])
          setTotalServerElements(pageData.totalElements || 0)
          setTotalServerPages(pageData.totalPages || 0)
        }
      } catch { /* silently ignore */ }
    }
    recargar()
  }, [categoriaId, hayFiltros, page, size])

  return (
    <div className="space-y-6">
      <Header
        titulo="Inventario"
        vista={vista}
        setVista={setVista}
        hayFiltros={hayFiltros}
      />

      <Filtros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categorias={categorias}
        setCategorias={setCategorias}
        categoriaId={categoriaId}
        setCategoriaId={setCategoriaId}
        filtroStock={filtroStock}
        setFiltroStock={setFiltroStock}
        categoriasAplanadas={categoriasAplanadas}
      />

      <ErrorBanner error={error} setError={setError} />

      {cargando ? (
        <SkeletonGrid columnas={columnas} />
      ) : productosVisibles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-dark mb-1">Sin resultados</h3>
          <p className="text-gray-500 text-sm">
            {hayFiltros
              ? 'No se encontraron productos con los filtros aplicados.'
              : 'No hay productos en el inventario.'}
          </p>
        </div>
      ) : vista === 'grid' ? (
        <ProductGrid
          productosVisibles={productosVisibles}
          estadoStock={estadoStock}
          abrirModal={abrirModal}
          vista={vista}
        />
      ) : (
        <ProductTable
          productosVisibles={productosVisibles}
          estadoStock={estadoStock}
          abrirModal={abrirModal}
        />
      )}

      {!cargando && productosVisibles.length > 0 && (
        <Paginador
          page={page}
          totalPaginas={totalPaginas}
          totalElementos={totalElementos}
          size={size}
          setPage={setPage}
          setSize={setSize}
        />
      )}

      <ModalIntegration
        productoModalId={productoModalId}
        setProductoModalId={setProductoModalId}
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        onCerrar={cerrarModal}
        handleMovimientoExitoso={handleMovimientoExitoso}
      />
    </div>
  )
}