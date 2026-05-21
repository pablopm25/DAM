package com.componentes360.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.componentes360.backend.model.Producto;
import com.componentes360.backend.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepo;

    public ProductoService(ProductoRepository productoRepo) {
        this.productoRepo = productoRepo;
    }

    public List<Producto> importarMasivo(List<Producto> productos) throws Exception {
        long invalidos = productos.stream()
            .filter(p -> p.getPrecio() == null || 
                         p.getPrecio().compareTo(BigDecimal.ZERO) < 0 || 
                         p.getStock() == null || 
                         p.getStock() < 0)
            .count();

        if (invalidos > 0) {
            throw new Exception("El lote contiene " + invalidos + " productos con valores negativos o nulos.");
        }

        return productoRepo.saveAll(productos);
    }

    public String generarCsvExportacion() {
        List<Producto> productos = productoRepo.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID;Nombre;Categoria;Precio;Stock\n"); 

        for (Producto p : productos) {
            csv.append(p.getId()).append(";")
               .append(p.getNombre()).append(";")
               .append(p.getCategoria()).append(";")
               .append(p.getPrecio()).append(";")
               .append(p.getStock()).append("\n");
        }
        return csv.toString();
    }
}