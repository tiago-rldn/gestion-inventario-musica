package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.Rol;
import com.example.backend.repository.RolRepository;

@Service
public class RolService {
    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Transactional(readOnly = true)
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }

    @Transactional
    public Rol createRol(Rol rol) {
        return rolRepository.save(rol);
    }
}
