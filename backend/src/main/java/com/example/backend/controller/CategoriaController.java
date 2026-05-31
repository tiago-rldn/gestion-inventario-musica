package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CategoriaTreeResponse;
import com.example.backend.dto.NewCategoriaRequest;
import com.example.backend.dto.NewCategoriaResponse;
import com.example.backend.service.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaTreeResponse>> getAllCategorias() {
        return ResponseEntity.ok(categoriaService.getAllCategorias());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewCategoriaResponse> getCategoriaById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoriaService.getCategoriaById(id));
    }

    @PostMapping
    public ResponseEntity<NewCategoriaResponse> createCategoria(@RequestBody NewCategoriaRequest categoria) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.createCategoria(categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoria(@PathVariable UUID id) {
        categoriaService.deleteCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
