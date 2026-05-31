package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MovimientoResponse(
    UUID id,
    String tipoMovimiento,
    Integer cantidad,
    LocalDateTime fechaHora,
    String observaciones,
    UUID idProducto,
    UUID idUsuario
) {}
