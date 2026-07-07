package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ActualizarProductoRequest;
import com.example.backend.dto.NewProductoRequest;
import com.example.backend.dto.ProductoDetalleResponse;
import com.example.backend.dto.ProductoResumenResponse;
import com.example.backend.service.ProductoService;


@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductoResumenResponse>> getAllProductos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productoService.getAllProductos(PageRequest.of(page, size)));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDetalleResponse> getProductoById(@PathVariable UUID id) {
        return ResponseEntity.ok(productoService.getProductoById(id));
    }

    @PostMapping
    public ResponseEntity<ProductoDetalleResponse> createProducto(@RequestBody NewProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.createProducto(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable UUID id) {
        productoService.deleteProducto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResumenResponse>> getProductosPorRamaCategoria(@PathVariable UUID categoriaId) {
        return ResponseEntity.ok((productoService.findProductosPorRamaCategoria(categoriaId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDetalleResponse> updateProducto(@PathVariable UUID id, @RequestBody ActualizarProductoRequest request) {
        return ResponseEntity.ok(productoService.updateProducto(id, request));
    }
}
