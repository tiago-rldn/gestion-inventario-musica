package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.model.MovimientoStock;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, UUID> {
    List<MovimientoStock> findByProductoIdOrderByFechaHoraDesc(UUID productoId);
    List<MovimientoStock> findByUsuarioIdOrderByFechaHoraDesc(UUID usuarioId);
}
