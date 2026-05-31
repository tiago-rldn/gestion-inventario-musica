package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record NewProductoRequest(
    String sku,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer cantidadStock,
    String artistaBanda,
    String formatoMusica,
    String tallePrenda,
    String color,
    UUID categoriaId
) {}
