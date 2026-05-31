package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.MovimientoRequest;
import com.example.backend.dto.MovimientoResponse;
import com.example.backend.model.MovimientoStock;
import com.example.backend.model.Producto;
import com.example.backend.model.Usuario;
import com.example.backend.repository.MovimientoStockRepository;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;

@Service
public class MovimientoStockService {

    private final MovimientoStockRepository movimientoStockRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public MovimientoStockService(MovimientoStockRepository movimientoStockRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.movimientoStockRepository = movimientoStockRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> obtenerPorProducto(UUID productoId) {
        List<MovimientoStock> historial = movimientoStockRepository.findByProductoIdOrderByFechaHoraDesc(productoId);
        return historial.stream()
                .map(this::mapearMovimiento)
                .toList();
    }

    @Transactional
    public MovimientoResponse registrarMovimiento(MovimientoRequest request, String username) {
        // 1. Obtener el producto actual y el usuario
        Producto producto = productoRepository.findById(request.productoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        // 2. Calcular el nuevo stock basado en el tipo de movimiento
        int stockActual = producto.getCantidadStock() != null ? producto.getCantidadStock() : 0;
        int cantidad = request.cantidad();

        switch (request.tipo()) {
            case INGRESO:
                producto.setCantidadStock(stockActual + cantidad);
                break;
            case EGRESO:
                if (stockActual < cantidad) {
                    throw new RuntimeException("Stock insuficiente para realizar el egreso");
                }
                producto.setCantidadStock(stockActual - cantidad);
                break;
            case AJUSTE:
                producto.setCantidadStock(request.cantidad());
                break;
            default:
                throw new IllegalArgumentException("Tipo de movimiento no válido");
        }

        MovimientoStock movimiento = new MovimientoStock();
        movimiento.setProducto(producto);
        movimiento.setUsuario(usuario);
        movimiento.setCantidad(request.cantidad());
        movimiento.setTipoMovimiento(request.tipo());
        movimiento.setObservaciones(request.observaciones());
        movimiento.setFechaHora(LocalDateTime.now());

        MovimientoStock guardado = movimientoStockRepository.save(movimiento);
        return mapearMovimiento(guardado);
    }

    private MovimientoResponse mapearMovimiento(MovimientoStock m) {
        return new MovimientoResponse(
                m.getId(),
                m.getTipoMovimiento().name(),
                m.getCantidad(),
                m.getFechaHora(),
                m.getObservaciones(),
                m.getProducto().getId(),
                m.getUsuario().getId()
        );
    }
}
