import { useRef, useState } from 'react'
import { Upload, Trash2, Star, GripVertical, ImageOff, Loader2, ImagePlus } from 'lucide-react'
import { subirImagen, eliminarImagen, cambiarOrden } from '../../api/imagenes'

const MAX_IMAGENES = 8

export default function ProductoImagenesPanel({ productoId, imagenes, cargando, onCambio }) {
  const fileInputRef = useRef(null)
  const subiendoRef = useRef(false)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [arrastrandoArchivos, setArrastrandoArchivos] = useState(false)

  // Sube uno o varios archivos validando tipo y límite de 8
  const subirArchivos = async (files) => {
    if (subiendoRef.current) return
    const imagenesValidas = files.filter((f) => f.type.startsWith('image/'))
    if (imagenesValidas.length === 0) {
      setError('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP).')
      return
    }

    const cupo = MAX_IMAGENES - imagenes.length
    if (cupo <= 0) {
      setError(`El producto ya tiene el máximo de ${MAX_IMAGENES} imágenes.`)
      return
    }

    const aSubir = imagenesValidas.slice(0, cupo)
    if (imagenesValidas.length > cupo) {
      setError(`Solo se pueden subir ${cupo} imagen(es) más (máximo ${MAX_IMAGENES}).`)
    }

    subiendoRef.current = true
    setSubiendo(true)
    setError('')
    try {
      for (let i = 0; i < aSubir.length; i++) {
        await subirImagen(aSubir[i], productoId)
      }
      onCambio()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al subir la imagen')
    } finally {
      subiendoRef.current = false
      setSubiendo(false)
    }
  }

  const handleSubir = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await subirArchivos(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    setError('')
    try {
      await eliminarImagen(id)
      onCambio()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al eliminar la imagen')
    }
  }

  // Drop sobre una miniatura: sube archivos del sistema o reordena
  const handleDrop = async (e) => {
    e.preventDefault()
    if (e.dataTransfer?.files?.length > 0) {
      e.stopPropagation() // Evita que el contenedor también procese el drop (doble subida)
      setDragIndex(null)
      setOverIndex(null)
      setArrastrandoArchivos(false)
      await subirArchivos(Array.from(e.dataTransfer.files))
      return
    }
    // Reordenamiento interno
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const movida = imagenes[dragIndex]
    setError('')
    try {
      await cambiarOrden(movida.id, overIndex + 1)
      onCambio()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al reordenar las imágenes')
    } finally {
      setDragIndex(null)
      setOverIndex(null)
    }
  }

  // Drag de archivos del sistema sobre el panel
  const handleDragOverArchivos = (e) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      setArrastrandoArchivos(true)
    }
  }

  const handleDragLeaveArchivos = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setArrastrandoArchivos(false)
    }
  }

  const handleDropArchivos = async (e) => {
    e.preventDefault()
    setArrastrandoArchivos(false)
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length === 0) return
    await subirArchivos(files)
  }

  if (cargando) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div
      className="relative p-6 space-y-4"
      onDragOver={handleDragOverArchivos}
      onDragLeave={handleDragLeaveArchivos}
      onDrop={handleDropArchivos}
    >
      {/* Overlay al arrastrar archivos del sistema */}
      {arrastrandoArchivos && (
        <div className="absolute inset-0 z-30 bg-primary/10 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 text-center">
            <ImagePlus size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold text-dark">Soltá las imágenes para subirlas</p>
          </div>
        </div>
      )}

      {/* Header + botón subir */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-dark">Imágenes del producto</h4>
          <p className="text-xs text-gray-500">
            Arrastrá imágenes desde tu explorador o hacé clic en Subir. Máximo {MAX_IMAGENES}.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo || imagenes.length >= MAX_IMAGENES}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {subiendo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {subiendo ? 'Subiendo...' : 'Subir imagen'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSubir}
        />
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {imagenes.length === 0 ? (
        <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center text-gray-400">
            <ImageOff size={32} className="mx-auto mb-2" />
            <p className="text-sm">Sin imágenes. Arrastrá una acá o subí la primera.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imagenes.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => {
                // Si arrastramos archivos del sistema, no mostrar feedback de reorden
                if (e.dataTransfer?.types?.includes('Files') && dragIndex === null) return
                e.preventDefault()
                setOverIndex(idx)
              }}
              onDrop={handleDrop}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab ${
                dragIndex === idx ? 'opacity-50 border-primary' : 'border-transparent'
              } ${overIndex === idx && dragIndex !== null && dragIndex !== idx ? 'border-primary scale-105' : ''}`}
            >
              <img src={img.urlImagen} alt="" className="w-full h-28 object-cover" />
              <div className="absolute top-1 left-1">
                {img.esPortada && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star size={10} /> Portada
                  </span>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-white" />
                <button
                  onClick={() => handleEliminar(img.id)}
                  className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}