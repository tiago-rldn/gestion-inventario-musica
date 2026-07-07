package com.example.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.model.ImagenProducto;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, UUID> {
    List<ImagenProducto> findByProductoIdOrderByOrdenAsc(UUID productoId);

    Collection<ImagenProducto> findByProductoId(UUID productoId);
}
