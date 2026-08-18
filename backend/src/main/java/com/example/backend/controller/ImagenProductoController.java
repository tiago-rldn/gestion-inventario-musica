package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.ImagenResponse;
import com.example.backend.service.ImagenProductoService;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenProductoController {

    private final ImagenProductoService imagenProductoService;

    public ImagenProductoController(ImagenProductoService imagenProductoService) {
        this.imagenProductoService = imagenProductoService;
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<ImagenResponse>> getImagenesByProducto(@PathVariable UUID productoId) {
        return ResponseEntity.ok(imagenProductoService.obtenerPorProducto(productoId));
    }

    @PostMapping("/upload")
    public ResponseEntity<ImagenResponse> subirImagen(
            @RequestPart("file") MultipartFile file,
            @RequestParam("productoId") UUID productoId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imagenProductoService.subirImagenMultipart(file, productoId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImagen(@PathVariable UUID id) {
        imagenProductoService.eliminarImagen(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/principal")
    public ResponseEntity<ImagenResponse> setImagenPrincipal(@PathVariable UUID id) {
        return ResponseEntity.ok(imagenProductoService.establecerComoPrincipal(id));
    }

    @PutMapping("/{id}/orden")
    public ResponseEntity<ImagenResponse> cambiarOrden(@PathVariable UUID id, @RequestParam Integer nuevoOrden) {
        return ResponseEntity.ok(imagenProductoService.cambiarOrden(id, nuevoOrden));
    }
}