package com.componentes360.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.componentes360.backend.model.Producto;
import com.componentes360.backend.repository.ProductoRepository;
import com.componentes360.backend.service.ProductoService;

// Controlador REST que expone los endpoints de Productos. 
// Usa @CrossOrigin para permitir que nuestra app de Angular (Frontend) consuma la API sin bloqueos de seguridad del navegador.
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*") 
public class ProductoController {

    private final ProductoRepository productoRepo;
    private final ProductoService productoService;

    public ProductoController(ProductoRepository productoRepo, ProductoService productoService) {
        this.productoRepo = productoRepo;
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        // Validación defensiva en el Backend. Aunque el formulario de Angular tenga validaciones, 
        // nunca debe fiarse de los datos que llegan del cliente para proteger la integridad de la BBDD.
        if (producto.getPrecio() == null || producto.getPrecio().compareTo(BigDecimal.ZERO) < 0 || 
            producto.getStock() == null || producto.getStock() < 0) {
            return ResponseEntity.badRequest().body("Error: El precio y el stock no pueden ser negativos.");
        }
        return ResponseEntity.ok(productoRepo.save(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto detalles) {
        if (detalles.getPrecio() == null || detalles.getPrecio().compareTo(BigDecimal.ZERO) < 0 || 
            detalles.getStock() == null || detalles.getStock() < 0) {
            return ResponseEntity.badRequest().body("Error: El precio y el stock no pueden ser negativos.");
        }

        return productoRepo.findById(id).map(productoDB -> {
            productoDB.setNombre(detalles.getNombre());
            productoDB.setDescripcion(detalles.getDescripcion());
            productoDB.setPrecio(detalles.getPrecio());
            productoDB.setStock(detalles.getStock());
            productoDB.setCategoria(detalles.getCategoria());
            productoDB.setImagenUrl(detalles.getImagenUrl());
            return ResponseEntity.ok(productoRepo.save(productoDB));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (!productoRepo.existsById(id)) return ResponseEntity.notFound().build();
        productoRepo.deleteById(id);
        return ResponseEntity.noContent().build(); 
    }

    @PostMapping("/import")
    public ResponseEntity<?> importarProductos(@RequestBody List<Producto> productos) {
        try {
            List<Producto> guardados = productoService.importarMasivo(productos);
            return ResponseEntity.ok("Importación exitosa: " + guardados.size() + " productos añadidos.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportarCsv() {
        String csvContent = productoService.generarCsvExportacion();
        byte[] bytes = csvContent.getBytes();

        // Modifica las cabeceras HTTP para instruir al navegador de que la respuesta 
        // no es texto plano, sino un archivo adjunto descargable.
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "inventario_productos.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }
}