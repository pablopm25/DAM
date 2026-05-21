package com.componentes360.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.componentes360.backend.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findByCategoria(String categoria);

    List<Producto> findByNombreContainingIgnoreCase(String texto);

    List<Producto> findByStockGreaterThan(Integer cantidad);
}