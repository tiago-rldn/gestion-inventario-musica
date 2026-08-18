package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.example.backend.dto.ImagenResponse;

public record ProductoDetalleResponse(
    UUID id,
    String sku,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer cantidadStock,
    String artistaBanda,
    String tallePrenda,
    String color,
    List<ImagenResponse> imagenes
) {}
