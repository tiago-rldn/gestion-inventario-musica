package com.example.backend.dto;

import java.math.BigDecimal;

public record ActualizarProductoRequest(
    String sku,
    String nombre,
    String descripcion,
    BigDecimal precio,
    String artistaBanda,
    String tallePrenda,
    String color
) {}
