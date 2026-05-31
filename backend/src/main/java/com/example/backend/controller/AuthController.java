package com.example.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Usuario;
import com.example.backend.repository.UsuarioRepository;
import com.example.backend.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
   public ResponseEntity<?> login(@RequestBody Usuario credenciales) {
        // Validación simplificada de credenciales (en producción deben estar encriptadas con BCrypt)
        Usuario usuarioDB = usuarioRepository.findByUsername(credenciales.getUsername())
                .orElse(null);

        if (usuarioDB != null && usuarioDB.getPassword().equals(credenciales.getPassword())) {
            String token = jwtService.generateToken(usuarioDB.getUsername());
            return ResponseEntity.ok(Map.of("token", token));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
    }
}
