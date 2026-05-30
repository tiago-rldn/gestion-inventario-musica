package com.example.backend.service;

import com.example.backend.model.MovimientoStock;
import com.example.backend.model.Producto;
import com.example.backend.model.TipoMovimiento;
import com.example.backend.repository.MovimientoStockRepository;
import com.example.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MovimientoStockService {

    private final MovimientoStockRepository movimientoStockRepository;
    private final ProductoRepository productoRepository;

    public MovimientoStockService(MovimientoStockRepository movimientoStockRepository, ProductoRepository productoRepository) {
        this.movimientoStockRepository = movimientoStockRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<MovimientoStock> obtenerPorProducto(UUID productoId) {
        return movimientoStockRepository.findByProductoIdOrderByFechaHoraDesc(productoId);
    }

    @Transactional
    public MovimientoStock registrarMovimiento(MovimientoStock movimiento) {
        // 1. Obtener el producto actual
        Producto producto = productoRepository.findById(movimiento.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // 2. Calcular el nuevo stock basado en el tipo de movimiento
        int stockActual = producto.getCantidadStock() != null ? producto.getCantidadStock() : 0;
        
        if (movimiento.getTipoMovimiento() == TipoMovimiento.INGRESO) {
            producto.setCantidadStock(stockActual + movimiento.getCantidad());
        } else if (movimiento.getTipoMovimiento() == TipoMovimiento.EGRESO) {
            if (stockActual < movimiento.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para realizar el egreso");
            }
            producto.setCantidadStock(stockActual - movimiento.getCantidad());
        } else if (movimiento.getTipoMovimiento() == TipoMovimiento.AJUSTE) {
            producto.setCantidadStock(movimiento.getCantidad()); // Sobrescribe el valor
        }

        // 3. Guardar cambios de forma atómica
        productoRepository.save(producto);
        return movimientoStockRepository.save(movimiento);
    }
}
