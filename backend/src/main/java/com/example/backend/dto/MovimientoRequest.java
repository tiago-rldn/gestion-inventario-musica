package com.example.backend.dto;

import java.util.UUID;

import com.example.backend.model.TipoMovimiento;

public record MovimientoRequest(
    UUID productoId,
    TipoMovimiento tipo,
    int cantidad,
    String observaciones
) {}
