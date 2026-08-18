package com.example.backend.service;

import java.util.List;
import java.util.Map;
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
        return imagenProductoRepository.findByProductoId(productoId).stream()
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

        if (imagen.getPublicIdCloudinary() != null) {
            cloudinaryService.eliminarImagen(imagen.getPublicIdCloudinary());
        }

        imagenProductoRepository.deleteById(id);
    }

    @Transactional
    public ImagenResponse subirImagenMultipart(MultipartFile file, UUID productoId, Boolean esPortada, Integer orden) {
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

        boolean portada = Boolean.TRUE.equals(esPortada);
        if (portada) {
            imagenProductoRepository.desmarcarTodasLasPortadas(producto.getId());
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
            imagen.setOrden(orden != null ? orden : imagenProductoRepository.siguienteOrden(producto.getId()));

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
        ImagenProducto imagen = imagenProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        UUID productoId = imagen.getProducto().getId();

        imagenProductoRepository.desmarcarTodasLasPortadas(productoId);

        ImagenProducto imagenActualizada = imagenProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        imagenActualizada.setEsPortada(true);

        return mapearADto(imagenProductoRepository.save(imagenActualizada));
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