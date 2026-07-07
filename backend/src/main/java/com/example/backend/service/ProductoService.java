package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ActualizarProductoRequest;
import com.example.backend.dto.MovimientoRequest;
import com.example.backend.dto.NewProductoRequest;
import com.example.backend.dto.ProductoDetalleResponse;
import com.example.backend.dto.ProductoResumenResponse;
import com.example.backend.model.Categoria;
import com.example.backend.model.MovimientoStock;
import com.example.backend.model.Producto;
import com.example.backend.model.Usuario;
import com.example.backend.repository.CategoriaRepository;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;



@Service
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, UsuarioRepository usuarioRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public Page<ProductoResumenResponse> getAllProductos(Pageable pageable) {
        return productoRepository.findAll(pageable).map(this::mapearResumenResponse);
    }

    public ProductoDetalleResponse getProductoById(UUID id) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return mapearDetalleResponse(producto);
    }

    @Transactional
    public ProductoDetalleResponse createProducto(NewProductoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Producto producto = new Producto();
        producto.setSku(request.sku());
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setCantidadStock(request.cantidadStock());
        producto.setArtistaBanda(request.artistaBanda());
        producto.setFormatoMusica(request.formatoMusica());
        producto.setTallePrenda(request.tallePrenda());
        producto.setColor(request.color());
        producto.setCategoria(categoria);

        Producto productoGuardado = productoRepository.save(producto);
        return mapearDetalleResponse(productoGuardado);
    }

    public void deleteProducto(UUID id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    public ProductoDetalleResponse updateProducto(UUID id, ActualizarProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (request.sku() != null) producto.setSku(request.sku());
        if (request.nombre() != null) producto.setNombre(request.nombre());
        if (request.descripcion() != null) producto.setDescripcion(request.descripcion());
        if (request.precio() != null) producto.setPrecio(request.precio());
        if (request.artistaBanda() != null) producto.setArtistaBanda(request.artistaBanda());
        if (request.formatoMusica() != null) producto.setFormatoMusica(request.formatoMusica());
        if (request.tallePrenda() != null) producto.setTallePrenda(request.tallePrenda());
        if (request.color() != null) producto.setColor(request.color());

        Producto actualizado = productoRepository.save(producto);
        return mapearDetalleResponse(actualizado);
    }

    @Transactional(readOnly = true)
    public List<ProductoResumenResponse> findProductosPorRamaCategoria(UUID categoriaId) {
        return productoRepository.findProductosPorRamaCategoria(categoriaId).stream()
                .map(this::mapearResumenResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Producto registrarMovimientoStock(UUID productoId, MovimientoRequest request, String username) {
        // 1. Validación de entidades
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en el sistema"));

        // 2. Operatoria matemática según el Enum
        int cantidadActual = producto.getCantidadStock();
        int cantidadMovimiento = request.cantidad();

        switch (request.tipo()) {
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
        movimiento.setTipoMovimiento(request.tipo());
        movimiento.setObservaciones(request.observaciones());
        movimiento.setFechaHora(LocalDateTime.now());
        movimiento.setUsuario(usuario);

        producto.getHistorialStock().add(movimiento);

        // 4. Persistencia transaccional
        return productoRepository.save(producto);
    }

    private ProductoDetalleResponse mapearDetalleResponse(Producto p) {
        return new ProductoDetalleResponse(
                p.getId(), p.getSku(), p.getNombre(), p.getDescripcion(),
                p.getPrecio(), p.getCantidadStock(), p.getArtistaBanda(),
                p.getFormatoMusica(), p.getTallePrenda(), p.getColor()
        );
    }

    private ProductoResumenResponse mapearResumenResponse(Producto p) {
        return new ProductoResumenResponse(
                p.getId(), p.getSku(), p.getNombre(), p.getPrecio(), p.getCantidadStock(),
                p.getArtistaBanda(), p.getFormatoMusica(), p.getTallePrenda(), p.getColor()
        );
    }
}
