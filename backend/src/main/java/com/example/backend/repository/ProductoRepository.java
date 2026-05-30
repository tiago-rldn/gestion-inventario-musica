package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, UUID>{
    @Query(value = """
        WITH RECURSIVE CategoriaTree AS (
            -- Caso base: Selecciona el ID de la categoría inicial solicitada
            SELECT id FROM categorias WHERE id = :categoriaId
            UNION ALL
            -- Paso recursivo: Selecciona los hijos basándose en los padres encontrados en el paso anterior
            SELECT c.id FROM categorias c
            INNER JOIN CategoriaTree ct ON c.categoria_padre_id = ct.id
        )
        -- Consulta final: Extrae todos los productos cuyas categorías estén en el árbol construido
        SELECT p.* FROM productos p
        INNER JOIN CategoriaTree ct ON p.categoria_id = ct.id
        """, nativeQuery = true)
    List<Producto> findProductosPorRamaCategoria(@Param("categoriaId") UUID categoriaId);
}
