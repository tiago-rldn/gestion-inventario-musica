package com.example.backend.controller;

import java.security.Principal;
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

import com.example.backend.dto.MovimientoRequest;
import com.example.backend.dto.MovimientoResponse;
import com.example.backend.service.MovimientoStockService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoStockController {

    private final MovimientoStockService movimientoStockService;

    public MovimientoStockController(MovimientoStockService movimientoStockService) {
        this.movimientoStockService = movimientoStockService;
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoResponse>> getMovimientosByProducto(@PathVariable UUID productoId) {
        return ResponseEntity.ok(movimientoStockService.obtenerPorProducto(productoId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<MovimientoResponse>> getMovimientosByUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(movimientoStockService.obtenerPorUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<MovimientoResponse> newMovimiento(
        @RequestBody MovimientoRequest request,
        Principal principal
    ) {
        String username = principal.getName();

        MovimientoResponse response = movimientoStockService.registrarMovimiento(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
