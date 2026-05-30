package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID>{
    Optional<List<Categoria>> findByCategoriaPadreIsNull();
}
