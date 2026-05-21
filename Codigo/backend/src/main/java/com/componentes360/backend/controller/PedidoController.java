package com.componentes360.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.componentes360.backend.model.Pedido;
import com.componentes360.backend.repository.PedidoRepository;
import com.componentes360.backend.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoRepository pedidoRepo;
    private final PedidoService pedidoService;

    public PedidoController(PedidoRepository pedidoRepo, PedidoService pedidoService) {
        this.pedidoRepo = pedidoRepo;
        this.pedidoService = pedidoService;
    }

    @GetMapping("/todos")
    public List<Pedido> listarTodosLosPedidos() {
        return pedidoRepo.findAllOrdersWithDetails();
    }

    @GetMapping("/usuario/{id}")
    public List<Pedido> obtenerPedidosPorUsuario(@PathVariable Long id) {
        return pedidoRepo.findByUsuarioIdOrderByFechaDesc(id);
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Pedido pedido) {
        try {
            Pedido pedidoProcesado = pedidoService.procesarCompra(pedido);
            return ResponseEntity.ok("Pedido procesado correctamente con ID: " + pedidoProcesado.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return pedidoRepo.findById(id).map(pedido -> {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado != null) {
                pedido.setEstado(nuevoEstado.toUpperCase());
                pedidoRepo.save(pedido);
                return ResponseEntity.ok(pedido);
            }
            return ResponseEntity.badRequest().body("Error: El estado no puede estar vacío");
        }).orElse(ResponseEntity.notFound().build());
    }
}