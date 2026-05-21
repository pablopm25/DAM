package com.componentes360.backend.service;

import java.math.BigDecimal;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.componentes360.backend.model.Usuario;
import com.componentes360.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    public Usuario registrarUsuario(Usuario usuario) throws Exception {
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty() || 
            usuario.getUsername() == null || usuario.getUsername().trim().isEmpty() ||
            usuario.getEmail() == null || usuario.getEmail().trim().isEmpty() ||
            usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new Exception("Faltan datos obligatorios para el registro (Nombre, Usuario, Email o Password).");
        }

        if (usuarioRepo.findByEmail(usuario.getEmail()).isPresent()) {
            throw new Exception("El email ya está registrado.");
        }

        String hashPassword = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(hashPassword);

        usuario.setRol("CLIENTE");
        usuario.setSaldo(new BigDecimal("1500.00")); 

        return usuarioRepo.save(usuario);
    }

    public Usuario autenticarUsuario(String email, String password) throws Exception {
        Usuario usuarioDB = usuarioRepo.findByEmail(email)
                .orElseThrow(() -> new Exception("Credenciales incorrectas."));

        if (!passwordEncoder.matches(password, usuarioDB.getPassword())) {
            throw new Exception("Credenciales incorrectas.");
        }
        
        return usuarioDB;
    }
}