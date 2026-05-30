package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.ImagenProducto;
import com.example.backend.repository.ImagenProductoRepository;

@Service
public class ImagenProductoService {

    private final ImagenProductoRepository imagenProductoRepository;

    public ImagenProductoService(ImagenProductoRepository imagenProductoRepository) {
        this.imagenProductoRepository = imagenProductoRepository;
    }

    @Transactional(readOnly = true)
    public List<ImagenProducto> obtenerPorProducto(UUID productoId) {
        return imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId);
    }

    @Transactional
    public ImagenProducto guardarImagen(ImagenProducto imagen) {
        return imagenProductoRepository.save(imagen);
    }
}