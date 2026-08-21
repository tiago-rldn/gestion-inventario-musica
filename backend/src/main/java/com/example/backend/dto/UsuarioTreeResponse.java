package com.example.backend.dto;

import java.util.UUID;

public record UsuarioTreeResponse(
        UUID id,
        String username
) {}
