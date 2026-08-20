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
            SELECT id FROM categorias WHERE id = :categoriaId
            UNION ALL
            SELECT c.id FROM categorias c
            INNER JOIN CategoriaTree ct ON c.categoria_padre_id = ct.id
        )
        SELECT p.* FROM productos p
        INNER JOIN CategoriaTree ct ON p.categoria_id = ct.id
        """, nativeQuery = true)
    List<Producto> findProductosPorRamaCategoria(UUID categoriaId);
}
