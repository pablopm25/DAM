package com.componentes360.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.componentes360.backend.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT DISTINCT p FROM Pedido p JOIN FETCH p.usuario LEFT JOIN FETCH p.detalles ORDER BY p.fecha DESC")
    List<Pedido> findAllOrdersWithDetails();
    
    @Query("SELECT DISTINCT p FROM Pedido p JOIN FETCH p.usuario LEFT JOIN FETCH p.detalles WHERE p.usuario.id = :usuarioId ORDER BY p.fecha DESC")
    List<Pedido> findByUsuarioIdOrderByFechaDesc(@Param("usuarioId") Long usuarioId);

    @Query("SELECT DISTINCT p FROM Pedido p JOIN FETCH p.usuario LEFT JOIN FETCH p.detalles WHERE p.usuario.id = :usuarioId AND p.estado = :estado ORDER BY p.fecha DESC")
    List<Pedido> buscarPedidosPorUsuarioYEstado(@Param("usuarioId") Long usuarioId, @Param("estado") String estado);
}