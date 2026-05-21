package com.componentes360.backend.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.componentes360.backend.model.Producto;
import com.componentes360.backend.model.Usuario;
import com.componentes360.backend.repository.ProductoRepository;
import com.componentes360.backend.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepo, ProductoRepository productoRepo) {
        return args -> {
            // Inicialización de Usuarios 
            if (usuarioRepo.count() == 0) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setEmail("admin@test.com");
                admin.setPassword("$2a$10$XURPShQNCsLjp1ESc2laoObo9QZDhxz73hJPaEv7/cBha4pk0AgP."); 
                admin.setRol("ADMIN");
                admin.setSaldo(new BigDecimal("0.00"));
                
                Usuario cliente = new Usuario();
                cliente.setNombre("Juan");
                cliente.setEmail("juan@gmail.com");
                cliente.setPassword("$2a$10$XURPShQNCsLjp1ESc2laoObo9QZDhxz73hJPaEv7/cBha4pk0AgP.");
                cliente.setRol("CLIENTE");
                cliente.setSaldo(new BigDecimal("1500.00")); 

                usuarioRepo.saveAll(List.of(admin, cliente));
                System.out.println("✅ Usuarios de prueba (Admin y Juan) creados correctamente.");
            }

            // Inicialización del Catálogo Completo
            if (productoRepo.count() == 0) {
                Producto p1 = new Producto();
                p1.setNombre("Procesador Intel i9");
                p1.setDescripcion("Procesador de última generación para alto rendimiento.");
                p1.setPrecio(new BigDecimal("450.50"));
                p1.setStock(8);
                p1.setCategoria("Procesadores");
                p1.setImagenUrl("https://img.pccomponentes.com/articles/1058/10581023/1255-intel-core-i9-14900k-32ghz-6ghz-box.jpg");

                Producto p2 = new Producto();
                p2.setNombre("Tarjeta Gráfica RTX 4060");
                p2.setDescripcion("Gráfica potente para gaming 1080p y 1440p.");
                p2.setPrecio(new BigDecimal("320.00"));
                p2.setStock(0);
                p2.setCategoria("Gráficas");
                p2.setImagenUrl("https://img.pccomponentes.com/articles/1073/10735344/1271-msi-geforce-rtx-4060-ventus-2x-black-oc-8gb-gddr6-dlss3.jpg");

                Producto p3 = new Producto();
                p3.setNombre("RTX 4080 Super");
                p3.setDescripcion("Gráfica de gama alta para 4K ultra.");
                p3.setPrecio(new BigDecimal("1150.00"));
                p3.setStock(5);
                p3.setCategoria("Gráficas");
                p3.setImagenUrl("https://img.pccomponentes.com/articles/1081/10811719/1376-gigabyte-geforce-rtx-4080-super-windforce-v2-16gb-gddr6x-dlss3.jpg");

                Producto p4 = new Producto();
                p4.setNombre("Ryzen 7 7800X3D");
                p4.setDescripcion("El mejor procesador para juegos actualmente.");
                p4.setPrecio(new BigDecimal("399.00"));
                p4.setStock(11);
                p4.setCategoria("Procesadores");
                p4.setImagenUrl("https://img.pccomponentes.com/articles/1067/10673322/1650-amd-ryzen-7-7800x3d-42-ghz-5-ghz-box-sin-ventilador.jpg");

                Producto p5 = new Producto();
                p5.setNombre("Corsair Vengeance 32GB");
                p5.setDescripcion("RAM DDR5 6000MHz con iluminación RGB.");
                p5.setPrecio(new BigDecimal("145.00"));
                p5.setStock(20);
                p5.setCategoria("RAM");
                p5.setImagenUrl("https://img.pccomponentes.com/articles/1043/10433947/1468-corsair-vengeance-rgb-ddr5-6000mhz-32gb-2x16gb-cl36-optimizada-amd.jpg");

                Producto p6 = new Producto();
                p6.setNombre("Samsung 990 Pro 2TB");
                p6.setDescripcion("SSD NVMe ultra rápido para cargas instantáneas.");
                p6.setPrecio(new BigDecimal("180.00"));
                p6.setStock(15);
                p6.setCategoria("Almacenamiento");
                p6.setImagenUrl("https://img.pccomponentes.com/articles/1057/10579991/1709-samsung-990-pro-2tb-pcie-40-nvme-m2.jpg");

                productoRepo.saveAll(List.of(p1, p2, p3, p4, p5, p6));
                System.out.println("✅ Catálogo inicializado de forma segura.");
            }
        };
    }
}