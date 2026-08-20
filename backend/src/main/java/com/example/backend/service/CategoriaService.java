package com.example.backend.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
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

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<CategoriaTreeResponse> getAllCategorias() {
        List<Categoria> raices = categoriaRepository.findByCategoriaPadreIsNull();
        return raices.stream().map(this::mapearArbol).toList();
    }

    public NewCategoriaResponse getCategoriaById(java.util.UUID id) {
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

    public void deleteCategoria(java.util.UUID id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
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
