package com.example.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.ImagenRequest;
import com.example.backend.dto.ImagenResponse;
import com.example.backend.model.ImagenProducto;
import com.example.backend.model.Producto;
import com.example.backend.repository.ImagenProductoRepository;
import com.example.backend.repository.ProductoRepository;

@Service
public class ImagenProductoService {

    private static final int MAX_IMAGENES_POR_PRODUCTO = 8;

    private static final Logger log = LoggerFactory.getLogger(ImagenProductoService.class);

    private final ImagenProductoRepository imagenProductoRepository;
    private final ProductoRepository productoRepository;
    private final CloudinaryService cloudinaryService;

    public ImagenProductoService(ImagenProductoRepository imagenProductoRepository, ProductoRepository productoRepository, CloudinaryService cloudinaryService) {
        this.imagenProductoRepository = imagenProductoRepository;
        this.productoRepository = productoRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<ImagenResponse> obtenerPorProducto(UUID productoId) {
        return imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId).stream()
                .map(this::mapearADto)
                .toList();
    }

    @Transactional
    public ImagenResponse guardarImagen(ImagenRequest request) {
        Producto producto = productoRepository.findById(request.productoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (request.urlImagen() == null || !esUrlValida(request.urlImagen())) {
            throw new RuntimeException("La URL de la imagen debe ser válida (http/https)");
        }

        long cantidadActual = imagenProductoRepository.countByProductoId(producto.getId());
        if (cantidadActual >= MAX_IMAGENES_POR_PRODUCTO) {
            throw new RuntimeException("El producto ya alcanzó el máximo de " + MAX_IMAGENES_POR_PRODUCTO + " imágenes");
        }

        boolean esPortada = Boolean.TRUE.equals(request.esPortada());
        if (esPortada) {
            imagenProductoRepository.desmarcarTodasLasPortadas(producto.getId());
        }

        ImagenProducto imagen = new ImagenProducto();
        imagen.setProducto(producto);
        imagen.setUrlImagen(request.urlImagen());
        imagen.setEsPortada(esPortada);
        imagen.setOrden(request.orden() != null ? request.orden() : imagenProductoRepository.siguienteOrden(producto.getId()));

        ImagenProducto guardada = imagenProductoRepository.save(imagen);
        return mapearADto(guardada);
    }

    @Transactional
    public void eliminarImagen(UUID id) {
        ImagenProducto imagen = imagenProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        UUID productoId = imagen.getProducto().getId();
        boolean eraPortada = imagen.isPortada();
        String publicId = imagen.getPublicIdCloudinary();

        imagenProductoRepository.deleteById(id);

        if (eraPortada) {
            List<ImagenProducto> restantes = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId);
            if (!restantes.isEmpty()) {
                ImagenProducto nuevaPortada = restantes.get(0);
                imagenProductoRepository.desmarcarTodasLasPortadas(productoId);
                nuevaPortada.setEsPortada(true);
                nuevaPortada.setOrden(1);
                imagenProductoRepository.save(nuevaPortada);

                for (int i = 1; i < restantes.size(); i++) {
                    imagenProductoRepository.actualizarOrden(restantes.get(i).getId(), i + 1);
                }
            }
        } else {
            List<ImagenProducto> restantes = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId);
            for (int i = 0; i < restantes.size(); i++) {
                imagenProductoRepository.actualizarOrden(restantes.get(i).getId(), i + 1);
            }
        }

        if (publicId != null) {
            try {
                cloudinaryService.eliminarImagen(publicId);
            } catch (Exception e) {
                log.warn("Asset huérfano en Cloudinary (no se pudo borrar): {}", publicId, e);
            }
        }
    }

    @Transactional
    public ImagenResponse subirImagenMultipart(MultipartFile file, UUID productoId) {
        log.info(">>> subirImagenMultipart: productoId={}, file={}, size={}, contentType={}",
                 productoId, file.getOriginalFilename(), file.getSize(), file.getContentType());
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (file.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("El archivo debe ser una imagen (JPEG, PNG, WebP)");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("El archivo excede el tamaño máximo de 5MB");
        }

        long cantidadActual = imagenProductoRepository.countByProductoId(producto.getId());
        if (cantidadActual >= MAX_IMAGENES_POR_PRODUCTO) {
            throw new RuntimeException("El producto ya alcanzó el máximo de " + MAX_IMAGENES_POR_PRODUCTO + " imágenes");
        }
        
        boolean portada = false;
        if (cantidadActual == 0) {
            imagenProductoRepository.desmarcarTodasLasPortadas(producto.getId());
            portada = true;
        }

        Map uploadResult;
        try {
            uploadResult = cloudinaryService.subirImagen(file, "productos/" + productoId);
        } catch (RuntimeException e) {
            throw new RuntimeException("Falló la subida a Cloudinary: " + e.getMessage(), e);
        }

        String publicId = (String) uploadResult.get("public_id");
        String secureUrl = (String) uploadResult.get("secure_url");

        try {
            ImagenProducto imagen = new ImagenProducto();
            imagen.setProducto(producto);
            imagen.setUrlImagen(secureUrl);
            imagen.setPublicIdCloudinary(publicId);
            imagen.setEsPortada(portada);
            imagen.setOrden(imagenProductoRepository.siguienteOrden(producto.getId()));

            ImagenProducto guardada = imagenProductoRepository.save(imagen);
            return mapearADto(guardada);
        } catch (Exception e) {
            if (publicId != null) {
                try {
                    cloudinaryService.eliminarImagen(publicId);
                } catch (Exception ex) {
                }
            }
            throw new RuntimeException("Error al guardar la imagen en base de datos", e);
        }
    }

    @Transactional
    public ImagenResponse establecerComoPrincipal(UUID id) {
        return cambiarOrden(id, 1);
    }

    @Transactional
    public ImagenResponse cambiarOrden(UUID id, Integer nuevoOrden) {
        if (nuevoOrden == null || nuevoOrden < 1) {
            throw new RuntimeException("El nuevo orden debe ser mayor o igual a 1");
        }

        ImagenProducto imagen = imagenProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        UUID productoId = imagen.getProducto().getId();
        int ordenActual = imagen.getOrden();

        long totalImagenes = imagenProductoRepository.countByProductoId(productoId);
        if (nuevoOrden > totalImagenes) {
            throw new RuntimeException("El nuevo orden no puede exceder el total de imágenes (" + totalImagenes + ")");
        }

        if (nuevoOrden == ordenActual) {
            return mapearADto(imagen);
        }

        Optional<ImagenProducto> portadaActualOpt = imagenProductoRepository.findPortadaByProductoId(productoId);
        ImagenProducto portadaActual = portadaActualOpt.orElse(null);

        List<ImagenProducto> listaOrdenada = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId);

        ImagenProducto nuevaPortadaCandidata = null;

        if (nuevoOrden < ordenActual) {
            for (ImagenProducto img : listaOrdenada) {
                int o = img.getOrden();
                if (o >= nuevoOrden && o < ordenActual) {
                    imagenProductoRepository.actualizarOrden(img.getId(), o + 1);
                }
            }
        } else {
            for (ImagenProducto img : listaOrdenada) {
                int o = img.getOrden();
                if (o > ordenActual && o <= nuevoOrden) {
                    imagenProductoRepository.actualizarOrden(img.getId(), o - 1);
                    if (ordenActual == 1 && o == 2) {
                        nuevaPortadaCandidata = img;
                    }
                }
            }
        }

        imagen.setOrden(nuevoOrden);

        if (nuevoOrden == 1) {
            imagen.setEsPortada(true);
            if (portadaActual != null && !portadaActual.getId().equals(imagen.getId())) {
                portadaActual.setEsPortada(false);
                portadaActual.setOrden(nuevoOrden + 1);
                imagenProductoRepository.save(portadaActual);
            }
        } else if (imagen.isPortada()) {
            imagen.setEsPortada(false);

            ImagenProducto nuevaPortada = nuevaPortadaCandidata;
            if (nuevaPortada == null) {
                Optional<ImagenProducto> nuevaPortadaOpt = imagenProductoRepository
                        .findByProductoIdOrderByOrdenAsc(productoId)
                        .stream()
                        .filter(img -> img.getOrden() == 1)
                        .findFirst();
                nuevaPortada = nuevaPortadaOpt.orElse(null);
            }

            if (nuevaPortada != null) {
                nuevaPortada.setOrden(1);
                nuevaPortada.setEsPortada(true);
                imagenProductoRepository.save(nuevaPortada);
            }
        }

        ImagenProducto guardada = imagenProductoRepository.save(imagen);
        return mapearADto(guardada);
    }

    private ImagenResponse mapearADto(ImagenProducto imagen) {
        return new ImagenResponse(
                imagen.getId(),
                imagen.getProducto().getId(),
                imagen.getUrlImagen(),
                imagen.isPortada(),
                imagen.getOrden(),
                imagen.getPublicIdCloudinary()
        );
    }

    private boolean esUrlValida(String url) {
        try {
            java.net.URI uri = java.net.URI.create(url);
            return uri.getScheme() != null
                    && (uri.getScheme().equals("http") || uri.getScheme().equals("https"));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}