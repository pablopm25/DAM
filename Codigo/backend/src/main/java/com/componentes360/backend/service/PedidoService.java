package com.componentes360.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.componentes360.backend.model.DetallePedido;
import com.componentes360.backend.model.Pedido;
import com.componentes360.backend.model.Producto;
import com.componentes360.backend.model.Usuario;
import com.componentes360.backend.repository.PedidoRepository;
import com.componentes360.backend.repository.ProductoRepository;
import com.componentes360.backend.repository.UsuarioRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final ProductoRepository productoRepo;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepo, ProductoRepository productoRepo, UsuarioRepository usuarioRepository) {
        this.pedidoRepo = pedidoRepo;
        this.productoRepo = productoRepo;
        this.usuarioRepository = usuarioRepository;
    }

    // Uso @Transactional para garantizar la integridad ACID. Si salta una excepción 
    // se hace un rollback automático y no quedan datos a medias.
    @Transactional
    public Pedido procesarCompra(Pedido pedido) throws Exception {
        Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId())
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Por seguridad, recalcula el total desde cero consultando la BBDD. 
        // Así evita que el precio pueda ser manipulado desde el Frontend.
        BigDecimal totalCalculadoSeguro = BigDecimal.ZERO;

        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                Producto productoDB = productoRepo.findById(detalle.getProducto().getId())
                        .orElseThrow(() -> new Exception("Producto no existente"));

                if (productoDB.getStock() < detalle.getCantidad()) {
                    throw new Exception("Stock insuficiente para: " + productoDB.getNombre());
                }

                BigDecimal subtotal = productoDB.getPrecio().multiply(new BigDecimal(detalle.getCantidad()));
                totalCalculadoSeguro = totalCalculadoSeguro.add(subtotal);

                detalle.setPrecio(productoDB.getPrecio());
                productoDB.setStock(productoDB.getStock() - detalle.getCantidad());
                productoRepo.save(productoDB);

                detalle.setPedido(pedido);
            }
        }

        if (usuario.getSaldo().compareTo(totalCalculadoSeguro) < 0) {
            throw new Exception("SALDO INSUFICIENTE. Tienes: " + usuario.getSaldo() + "€, y el pedido cuesta: " + totalCalculadoSeguro + "€");
        }

        usuario.setSaldo(usuario.getSaldo().subtract(totalCalculadoSeguro));
        usuarioRepository.save(usuario);

        pedido.setTotal(totalCalculadoSeguro);
        pedido.setUsuario(usuario);
        pedido.setFecha(LocalDateTime.now()); 
        pedido.setEstado("PENDIENTE");

        return pedidoRepo.save(pedido);
    }
}