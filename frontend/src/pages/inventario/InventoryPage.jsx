import { useEffect, useMemo, useState, useCallback } from 'react'
import { Package } from 'lucide-react'
import { getProductos, getProductosPorCategoria } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import Header from './components/Header'
import Filtros from './components/Filtros'
import ErrorBanner from './components/ErrorBanner'
import ProductGrid from './components/ProductGrid'
import ProductTable from './components/ProductTable'
import Paginador from './components/Paginador'
import ModalIntegration from './components/ModalIntegration'

const UMBRAL_STOCK_BAJO = 5

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

export default function InventoryPage() {
  const columnas = useResponsiveColumns()
  const sizeDefault = columnas * 3

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState(null)
  const [filtroStock, setFiltroStock] = useState('todos')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(sizeDefault)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginasServer, setTotalPaginasServer] = useState(0)

  const [vista, setVista] = useState('grid')

  const [productoModalId, setProductoModalId] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    setSize(sizeDefault)
  }, [sizeDefault])

  // Modo cliente SOLO cuando no hay categoría y hay búsqueda/filtro de stock.
  // Con categoría seleccionada → paginación server-side (igual que "todas").
  const hayFiltrosCliente = busqueda || filtroStock !== 'todos'
  const modoCliente = !categoriaId && hayFiltrosCliente

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        if (modoCliente) {
          // Sin categoría + búsqueda/stock → traer todo y filtrar en cliente
          const pageData = await getProductos(0, 9999)
          if (!cancelado) {
            setProductos(pageData.content || [])
            setTotalElementos(pageData.totalElements || 0)
          }
        } else if (categoriaId) {
          // Categoría seleccionada → paginación server-side (CTE recursivo)
          const pageData = await getProductosPorCategoria(categoriaId, page, size)
          if (!cancelado) {
            setProductos(pageData.content || [])
            setTotalElementos(pageData.totalElements || 0)
            setTotalPaginasServer(pageData.totalPages || 0)
          }
        } else {
          // Sin filtros → paginación server-side general
          const pageData = await getProductos(page, size)
          if (!cancelado) {
            setProductos(pageData.content || [])
            setTotalElementos(pageData.totalElements || 0)
            setTotalPaginasServer(pageData.totalPages || 0)
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
  }, [page, size, modoCliente, categoriaId])

  // Filtrado en cliente (solo en modo cliente)
  const productosFiltrados = useMemo(() => {
    if (!modoCliente || !Array.isArray(productos)) return productos
    return productos.filter((p) => {
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
  }, [productos, modoCliente, busqueda, filtroStock])

  const totalPaginas = modoCliente
    ? Math.max(1, Math.ceil(productosFiltrados.length / size))
    : totalPaginasServer

  // Página segura: nunca excede el rango válido (safety net ante page stale)
  const pageSegura = Math.min(page, Math.max(0, totalPaginas - 1))

  const productosVisibles = useMemo(() => {
    if (modoCliente && Array.isArray(productosFiltrados)) {
      const start = pageSegura * size
      return productosFiltrados.slice(start, start + size)
    }
    return Array.isArray(productosFiltrados) ? productosFiltrados : []
  }, [productosFiltrados, modoCliente, pageSegura, size])

  // Reset de página ante cualquier cambio de filtro o tamaño
  useEffect(() => {
    setPage(0)
  }, [busqueda, filtroStock, size, categoriaId])

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
          const pageData = await getProductosPorCategoria(categoriaId, page, size)
          setProductos(pageData.content || [])
          setTotalElementos(pageData.totalElements || 0)
          setTotalPaginasServer(pageData.totalPages || 0)
        } else if (modoCliente) {
          const pageData = await getProductos(0, 9999)
          setProductos(pageData.content || [])
          setTotalElementos(pageData.totalElements || 0)
        } else {
          const pageData = await getProductos(page, size)
          setProductos(pageData.content || [])
          setTotalElementos(pageData.totalElements || 0)
          setTotalPaginasServer(pageData.totalPages || 0)
        }
      } catch { /* silently ignore */ }
    }
    recargar()
  }, [categoriaId, modoCliente, page, size])

  return (
    <div className="space-y-6">
      <Header
        titulo="Inventario"
        vista={vista}
        setVista={setVista}
        hayFiltros={hayFiltrosCliente || categoriaId !== null}
      />

      <Filtros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categorias={categorias}
        setCategorias={setCategorias}
        categoriaId={categoriaId}
        onCategoriaChange={handleCategoriaChange}
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
            {hayFiltrosCliente || categoriaId !== null
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
          page={pageSegura}
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