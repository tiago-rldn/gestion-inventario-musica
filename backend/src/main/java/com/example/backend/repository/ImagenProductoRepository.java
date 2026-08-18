package com.example.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.model.ImagenProducto;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, UUID> {
    List<ImagenProducto> findByProductoIdOrderByOrdenAsc(UUID productoId);

    Collection<ImagenProducto> findByProductoId(UUID productoId);

    @Modifying
    @Query("UPDATE ImagenProducto i SET i.esPortada = false WHERE i.producto.id = :productoId")
    void desmarcarTodasLasPortadas(@Param("productoId") UUID productoId);

    @Query("SELECT COALESCE(MAX(i.orden), 0) + 1 FROM ImagenProducto i WHERE i.producto.id = :productoId")
    Integer siguienteOrden(@Param("productoId") UUID productoId);

    long countByProductoId(UUID productoId);

    @Query("SELECT i FROM ImagenProducto i WHERE i.producto.id = :productoId AND i.esPortada = true")
    Optional<ImagenProducto> findPortadaByProductoId(@Param("productoId") UUID productoId);

    @Modifying
    @Query("UPDATE ImagenProducto i SET i.orden = :nuevoOrden WHERE i.id = :id")
    void actualizarOrden(@Param("id") UUID id, @Param("nuevoOrden") Integer nuevoOrden);
}
