package com.example.backend.dto;

import java.util.UUID;

public record ImagenRequest(
    UUID productoId,
    String urlImagen,
    Boolean esPortada,
    Integer orden
) {}
