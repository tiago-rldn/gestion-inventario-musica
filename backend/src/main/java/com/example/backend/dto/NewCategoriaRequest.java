package com.example.backend.dto;

import java.util.UUID;

public record NewCategoriaRequest(
    String nombre, 
    String descripcion, 
    UUID categoriaPadreId
) {}
