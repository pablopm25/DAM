import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
  descripcion: string;
  imagenUrl: string;
}

interface DetallePedido {
  id?: number;
  producto: { nombre: string };
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  fecha: string;
  usuario?: { nombre: string; email: string; direccion?: string }; 
  total: number;
  estado: string;
  detalles: DetallePedido[];
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.css' 
})
export class AdminPedidosComponent implements OnInit {
  
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';

  pedidos: Pedido[] = [];
  listaProductos: Producto[] = []; 
  
  pedidoSeleccionado: Pedido | null = null;

  ngOnInit() {
    this.cargarPedidos();
    this.cargarProductos(); 
  }

  cargarPedidos() {
    this.http.get<Pedido[]>(`${this.API_URL}/pedidos`)
      .subscribe({
        next: (data) => this.pedidos = data,
        error: () => this.notificarError('No se pudieron cargar los pedidos')
      });
  }

  cargarProductos() {
    this.http.get<Producto[]>(`${this.API_URL}/productos`)
      .subscribe({
        next: (data) => this.listaProductos = data,
        error: () => this.notificarError('No se pudo cargar el inventario')
      });
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    const esCancelacion = nuevoEstado === 'CANCELADO';

    Swal.fire({
      title: esCancelacion ? '¿Confirmar cancelación?' : '¿Confirmar envío?',
      text: esCancelacion ? 'El pedido quedará cancelado permanentemente.' : 'El cliente recibirá una notificación y el estado pasará a ENVIADO.',
      icon: esCancelacion ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: esCancelacion ? '#dc3545' : '#0dcaf0',
      cancelButtonColor: '#6c757d',
      confirmButtonText: esCancelacion ? 'Sí, cancelar' : 'Sí, enviar',
      cancelButtonText: 'Atrás',
      background: '#1e293b', color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put(`${this.API_URL}/pedidos/${id}/estado`, { estado: nuevoEstado })
          .subscribe({
            next: () => {
              this.alertaExito(`Pedido marcado como ${nuevoEstado}`);
              this.cargarPedidos();
            },
            error: () => this.notificarError('No se pudo actualizar el estado')
          });
      }
    });
  }

  actualizarStock(id: number, stockNumerico: number) {
    if (isNaN(stockNumerico) || stockNumerico < 0) {
      this.notificarError('El stock debe ser un número válido y mayor o igual a 0');
      return;
    }

    this.http.get<Producto>(`${this.API_URL}/productos/${id}`).subscribe({
      next: (productoDB) => {
        productoDB.stock = stockNumerico; 
        
        this.http.put(`${this.API_URL}/productos/${id}`, productoDB).subscribe({
          next: () => {
            this.alertaExito('Stock actualizado correctamente');
            this.cargarProductos(); 
          },
          error: () => this.notificarError('Error al sincronizar el stock')
        });
      },
      error: () => this.notificarError('No se encontró el producto en la base de datos')
    });
  }

  verDetalles(pedido: Pedido) {
    this.pedidoSeleccionado = pedido;
  }

  cerrarModal() {
    this.pedidoSeleccionado = null;
  }

  private alertaExito(msg: string) {
    Swal.fire({ icon: 'success', title: msg, showConfirmButton: false, timer: 1500, background: '#1e293b', color: '#fff' });
  }

  private notificarError(msg: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: msg, background: '#1e293b', color: '#fff' });
  }
}