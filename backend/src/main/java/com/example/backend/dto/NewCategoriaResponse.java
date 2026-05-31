package com.example.backend.dto;

import java.util.UUID;

public record NewCategoriaResponse(
    UUID id,
    String nombre,
    String descripcion,
    UUID categoriaPadreId
) {}
