import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../carrito.service';
import Swal from 'sweetalert2'; 
import { FormsModule } from '@angular/forms'; 

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl: string;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {
  
  private http = inject(HttpClient);
  private router = inject(Router); 
  private carritoService = inject(CarritoService);
  private cd = inject(ChangeDetectorRef);
  
  private readonly API_URL = 'http://localhost:8080/api/productos';

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  
  terminoBusqueda: string = ''; 
  categoriaActiva: string = 'TODOS'; 

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<Producto[]>(this.API_URL)
      .subscribe({
        next: (datos) => {
          const datosLimpios = datos.map(p => {
            if (!p.imagenUrl || p.imagenUrl.includes('.zip') || !p.imagenUrl.startsWith('http')) {
               p.imagenUrl = 'assets/placeholder.jpg'; 
            }
            return p;
          });

          this.productos = datosLimpios;
          this.productosFiltrados = [...datosLimpios]; 
          this.cd.detectChanges(); 
        },
        error: (e) => {
          console.error('Error al cargar catálogo:', e);
          Swal.fire({
            title: 'Error de conexión', 
            text: 'No se pudo conectar con el servidor de Componentes 360', 
            icon: 'error',
            background: '#1e293b', color: '#fff'
          });
        }
      });
  }

  filtrarPorBusqueda() {
    const texto = this.terminoBusqueda.toLowerCase();
    this.categoriaActiva = 'TODOS'; 
    
    this.productosFiltrados = this.productos.filter(p => 
      p.nombre.toLowerCase().includes(texto) || 
      p.descripcion.toLowerCase().includes(texto) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto))
    );
  }

  filtrar(categoriaBoton: string) {
    this.terminoBusqueda = '';
    this.categoriaActiva = categoriaBoton; 
    
    if (categoriaBoton === 'TODOS') {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(p => {
        if (!p.categoria) return false;
        
        const catDB = p.categoria.toLowerCase();

        switch (categoriaBoton) {
          case 'Gráficas':
            return catDB.includes('gráfi') || catDB.includes('grafi') || catDB.includes('gpu') || catDB.includes('tarjeta');
            
          case 'Procesadores':
            return catDB.includes('procesador') || catDB.includes('cpu') || catDB.includes('intel') || catDB.includes('amd');
            
          case 'Placas Base':
            return catDB.includes('placa') || catDB.includes('mother') || catDB.includes('base');
            
          case 'RAM':
            return catDB.includes('ram') || catDB.includes('memoria');

          case 'SSD':
            return catDB.includes('ssd') || catDB.includes('disco') || catDB.includes('m.2') || catDB.includes('almacenamiento');
            
          default:
            return catDB === categoriaBoton.toLowerCase();
        }
      });
    }
    this.cd.detectChanges();
  }

  agregar(producto: Producto) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario) {
       Swal.fire({
         title: 'Inicia Sesión',
         text: 'Necesitas una cuenta activa para añadir componentes al carrito.',
         icon: 'warning',
         background: '#1e293b',
         color: '#fff',
         showCancelButton: true,
         confirmButtonText: 'Ir al Login',
         cancelButtonText: 'Seguir mirando',
         confirmButtonColor: '#38bdf8'
       }).then((result) => {
         if (result.isConfirmed) {
           this.router.navigate(['/login']);
         }
       });
       return;
    }

    if (producto.stock > 0) {
      this.carritoService.agregarProducto(producto);

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1e293b',
        color: '#fff'
      });

      Toast.fire({
        icon: 'success',
        title: `<span style="color: #38bdf8;">${producto.nombre}</span> añadido`
      });

    } else {
      Swal.fire({
        title: 'Stock Agotado',
        text: 'Este componente no está disponible actualmente.',
        icon: 'info',
        background: '#1e293b', color: '#fff'
      });
    }
  }

  verDetalles(p: Producto) {
    Swal.fire({
      title: `<span style="color: #38bdf8">${p.nombre}</span>`,
      html: `<p style="text-align: left;">${p.descripcion}</p>`,
      imageUrl: p.imagenUrl,
      imageHeight: 250,
      background: '#1e293b', 
      color: '#fff',
      showCloseButton: true,
      confirmButtonColor: '#38bdf8'
    });
  }
}