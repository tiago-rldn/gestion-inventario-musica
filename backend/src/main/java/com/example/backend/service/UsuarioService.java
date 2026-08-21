package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.UsuarioTreeResponse;
import com.example.backend.model.Usuario;
import com.example.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioTreeResponse> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream().map(this::mapearArbol).toList();
    }

    @Transactional
    public Usuario createUsuario(Usuario usuario) {
        // Aquí posteriormente se deberá encriptar la contraseña (ej. BCrypt)
        return usuarioRepository.save(usuario);
    }

    private UsuarioTreeResponse mapearArbol(Usuario usuario) {
        return new UsuarioTreeResponse(
                usuario.getId(),
                usuario.getUsername()
        );
    }
}
