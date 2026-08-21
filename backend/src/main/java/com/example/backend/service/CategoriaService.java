package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.backend.dto.CategoriaTreeResponse;
import com.example.backend.dto.NewCategoriaRequest;
import com.example.backend.dto.NewCategoriaResponse;
import com.example.backend.model.Categoria;
import com.example.backend.repository.CategoriaRepository;
import com.example.backend.repository.ProductoRepository;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository, ProductoService productoService) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.productoService = productoService;
    }

    public List<CategoriaTreeResponse> getAllCategorias() {
        List<Categoria> raices = categoriaRepository.findByCategoriaPadreIsNull();
        return raices.stream().map(this::mapearArbol).toList();
    }

    public NewCategoriaResponse getCategoriaById(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        productoRepository.findProductosPorRamaCategoria(categoria.getId());
        return mapearRespuesta(categoria);
    }

    public NewCategoriaResponse createCategoria(NewCategoriaRequest categoria) {
        Categoria nuevaCategoria = new Categoria();
        nuevaCategoria.setNombre(categoria.nombre());
        nuevaCategoria.setDescripcion(categoria.descripcion());
        if (categoria.categoriaPadreId() != null) {
            Categoria categoriaPadre = categoriaRepository.findById(categoria.categoriaPadreId())
                    .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada"));
            nuevaCategoria.setCategoriaPadre(categoriaPadre);
        }

        return mapearRespuesta(categoriaRepository.save(nuevaCategoria));
    }

    public NewCategoriaResponse editCategoria(UUID id, NewCategoriaRequest categoria) {
        Categoria categoriaExistente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoriaExistente.setNombre(categoria.nombre());
        categoriaExistente.setDescripcion(categoria.descripcion());

        if (categoria.categoriaPadreId() != null) {
            Categoria categoriaPadre = categoriaRepository.findById(categoria.categoriaPadreId())
                    .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada"));
            categoriaExistente.setCategoriaPadre(categoriaPadre);
        }

        return mapearRespuesta(categoriaRepository.save(categoriaExistente));
    }

    public void deleteCategoria(java.util.UUID id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
        
        // SOFT DELETE de los productos de la categoria y sus subcategorías
        List<UUID> productosIds = productoRepository.findProductosPorRamaCategoria(id).stream()
                .map(producto -> producto.getId())
                .toList();
        for (UUID productoId : productosIds) {
            productoService.deleteProducto(productoId);
        }
    }

    private CategoriaTreeResponse mapearArbol(Categoria cat) {
        productoRepository.findProductosPorRamaCategoria(cat.getId());
        return new CategoriaTreeResponse(
                cat.getId(),
                cat.getNombre(),
                cat.getDescripcion(),
                cat.getSubcategorias().stream().map(this::mapearArbol).toList(),
                productoRepository.findProductosPorRamaCategoria(cat.getId()).size()
        );
    }

    private NewCategoriaResponse mapearRespuesta(Categoria cat) {
        return new NewCategoriaResponse(
                cat.getId(),
                cat.getNombre(),
                cat.getDescripcion(),
                cat.getCategoriaPadre() != null ? cat.getCategoriaPadre().getId() : null
        );
    }
}
