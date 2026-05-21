package com.componentes360.backend.controller;

import java.math.BigDecimal;
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

import com.componentes360.backend.model.LoginRequest;
import com.componentes360.backend.model.Usuario;
import com.componentes360.backend.repository.UsuarioRepository;
import com.componentes360.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepo;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepo, UsuarioService usuarioService) {
        this.usuarioRepo = usuarioRepo;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepo.findAll();
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            nuevoUsuario.setPassword(null);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest credenciales) {
        try {
            Usuario usuarioAutenticado = usuarioService.autenticarUsuario(credenciales.getEmail(), credenciales.getPassword());
            usuarioAutenticado.setPassword(null); 
            return ResponseEntity.ok(usuarioAutenticado);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/recargar")
    public ResponseEntity<?> recargarSaldo(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return usuarioRepo.findById(id).map(usuario -> {
            Double cantidad = body.get("monto");
            if (cantidad == null || cantidad <= 0) {
                return ResponseEntity.badRequest().body("Monto de recarga inválido");
            }
            
            BigDecimal montoARecargar = BigDecimal.valueOf(cantidad);
            usuario.setSaldo(usuario.getSaldo().add(montoARecargar));
            
            Usuario actualizado = usuarioRepo.save(usuario);
            actualizado.setPassword(null); 
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }
}