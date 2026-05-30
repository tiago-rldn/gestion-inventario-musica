package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ImagenProducto;
import com.example.backend.service.ImagenProductoService;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenProductoController {

    private final ImagenProductoService imagenProductoService;

    public ImagenProductoController(ImagenProductoService imagenProductoService) {
        this.imagenProductoService = imagenProductoService;
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<ImagenProducto>> getImagenesByProducto(@PathVariable UUID productoId) {
        return ResponseEntity.ok(imagenProductoService.obtenerPorProducto(productoId));
    }

    @PostMapping
    public ResponseEntity<ImagenProducto> createImagen(@RequestBody ImagenProducto imagen) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imagenProductoService.guardarImagen(imagen));
    }
}
