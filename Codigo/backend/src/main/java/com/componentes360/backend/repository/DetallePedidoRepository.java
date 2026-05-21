package com.componentes360.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.componentes360.backend.model.DetallePedido;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    
    List<DetallePedido> findByPedidoId(Long pedidoId);

    List<DetallePedido> findByProductoId(Long productoId);
}