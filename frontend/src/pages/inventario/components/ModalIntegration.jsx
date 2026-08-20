import ProductModal from '../../../components/ProductModal'

export default function InventoryPageModalIntegration({
  productoModalId,
  setProductoModalId,
  modalAbierto,
  setModalAbierto,
  onCerrar,
  handleMovimientoExitoso
}) {
  return (
    <ProductModal
      productoId={productoModalId}
      abierto={modalAbierto}
      onCerrar={onCerrar}
      onMovimientoExitoso={handleMovimientoExitoso}
    />
  )
}