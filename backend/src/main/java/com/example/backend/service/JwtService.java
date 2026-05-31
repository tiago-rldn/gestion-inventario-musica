package com.example.backend.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String SECRET_KEY = "HFwNnV39ouhDtqcSnSpJBdKNKH1xwBXsutAFrhgslsf";
    private final SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generateToken(String username) {
        // Implementación de generación de token JWT
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token válido por 10 horas
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        // Implementación de validación de token JWT
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true; // Token válido
        } catch (Exception e) {
            return false; // Token inválido
        }
    }

    public String getSubject(String token) {
        // Implementación para obtener el subject (username) del token JWT
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
