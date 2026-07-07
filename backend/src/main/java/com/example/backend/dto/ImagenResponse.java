package com.example.backend.dto;

import java.util.UUID;

public record ImagenResponse(
    UUID id,
    UUID productoId,
    String urlImagen,
    Boolean esPortada,
    Integer orden
) {}
