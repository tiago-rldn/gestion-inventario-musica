package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.MovimientoRequest;
import com.example.backend.model.MovimientoStock;
import com.example.backend.model.Producto;
import com.example.backend.model.Usuario;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;



@Service
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProductoService(ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    public Producto getProductoById(UUID id) {
        return productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Producto createProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public void deleteProducto(UUID id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Producto> findProductosPorRamaCategoria(UUID categoriaId) {
        return productoRepository.findProductosPorRamaCategoria(categoriaId);
    }

    @Transactional
    public Producto registrarMovimientoStock(UUID productoId, MovimientoRequest request) {
        // 1. Validación de entidades
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Operatoria matemática según el Enum
        int cantidadActual = producto.getCantidadStock();
        int cantidadMovimiento = request.getCantidad();

        switch (request.getTipo()) {
            case EGRESO:
                if (cantidadActual < cantidadMovimiento) {
                    throw new RuntimeException("Stock insuficiente para realizar el egreso. Stock actual: " + cantidadActual);
                }
                producto.setCantidadStock(cantidadActual - cantidadMovimiento);
                break;
            case INGRESO:
                producto.setCantidadStock(cantidadActual + cantidadMovimiento);
                break;
            case AJUSTE:
                // El ajuste sobrescribe el stock actual (ideal para arqueos y conteos físicos)
                producto.setCantidadStock(cantidadMovimiento);
                break;
            default:
                throw new IllegalArgumentException("Tipo de movimiento no soportado.");
        }

        // 3. Creación y vinculación del historial
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.setProducto(producto);
        movimiento.setCantidad(cantidadMovimiento);
        movimiento.setTipoMovimiento(request.getTipo());
        movimiento.setObservaciones(request.getObservaciones());
        movimiento.setFechaHora(LocalDateTime.now());
        movimiento.setUsuario(usuario);

        producto.getHistorialStock().add(movimiento);

        // 4. Persistencia transaccional
        return productoRepository.save(producto);
    }
}
