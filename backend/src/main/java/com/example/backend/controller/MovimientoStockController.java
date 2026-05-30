package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.MovimientoStock;
import com.example.backend.service.MovimientoStockService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoStockController {

    private final MovimientoStockService movimientoStockService;

    public MovimientoStockController(MovimientoStockService movimientoStockService) {
        this.movimientoStockService = movimientoStockService;
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoStock>> obtenerPorProducto(@PathVariable UUID productoId) {
        return ResponseEntity.ok(movimientoStockService.obtenerPorProducto(productoId));
    }

    @PostMapping
    public ResponseEntity<MovimientoStock> registrarMovimiento(@RequestBody MovimientoStock movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoStockService.registrarMovimiento(movimiento));
    }
}
