package com.example.backend.dto;

import java.util.List;
import java.util.UUID;

public record CategoriaTreeResponse (
    UUID id,
    String nombre,
    String descripcion,
    List<CategoriaTreeResponse> subcategorias,
    int cantidadProductos
) {}
