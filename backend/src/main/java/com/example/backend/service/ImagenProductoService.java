package com.example.backend.service;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ImagenRequest;
import com.example.backend.dto.ImagenResponse;
import com.example.backend.model.ImagenProducto;
import com.example.backend.model.Producto;
import com.example.backend.repository.ImagenProductoRepository;
import com.example.backend.repository.ProductoRepository;

@Service
public class ImagenProductoService {

    private final ImagenProductoRepository imagenProductoRepository;
    private final ProductoRepository productoRepository;

    public ImagenProductoService(ImagenProductoRepository imagenProductoRepository, ProductoRepository productoRepository) {
        this.imagenProductoRepository = imagenProductoRepository;
        this.productoRepository = productoRepository;
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

        // Regla de negocio: Si esta imagen es principal, desmarcamos las anteriores
        if (request.esPortada()) {
            desmarcarPrincipales(producto.getId());
        }

        ImagenProducto imagen = new ImagenProducto();
        imagen.setProducto(producto);
        imagen.setUrlImagen(request.urlImagen());
        imagen.setEsPortada(request.esPortada());
        imagen.setOrden(request.orden());

        ImagenProducto guardada = imagenProductoRepository.save(imagen);
        return mapearADto(guardada);
    }

    @Transactional
    public void eliminarImagen(UUID id) {
        if (!imagenProductoRepository.existsById(id)) {
            throw new RuntimeException("Imagen no encontrada");
        }
        imagenProductoRepository.deleteById(id);
    }

    @Transactional
    public ImagenResponse establecerComoPrincipal(UUID id) {
        ImagenProducto imagen = imagenProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        
        desmarcarPrincipales(imagen.getProducto().getId());
        
        imagen.setEsPortada(true);
        return mapearADto(imagenProductoRepository.save(imagen));
    }

    private void desmarcarPrincipales(UUID productoId) {
        Collection<ImagenProducto> imagenes = imagenProductoRepository.findByProductoId(productoId);
        for (ImagenProducto img : imagenes) {
            if (img.isPortada()) {
                img.setEsPortada(false);
                imagenProductoRepository.save(img);
            }
        }
    }

    private ImagenResponse mapearADto(ImagenProducto imagen) {
        return new ImagenResponse(
                imagen.getId(),
                imagen.getProducto().getId(),
                imagen.getUrlImagen(),
                imagen.isPortada(),
                imagen.getOrden()
        );
    }
}