package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductoResumenResponse(
    UUID id,
    String sku,
    String nombre,
    BigDecimal precio,
    int cantidadStock,
    String artistaBanda,
    String tallePrenda,
    String color,
    String urlPortada
) {}
