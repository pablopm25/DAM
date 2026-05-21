import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; 
import { CarritoService, ProductoCarrito } from '../carrito.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {

  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = 'http://localhost:8080/api';

  items: ProductoCarrito[] = [];
  total: number = 0;

  ngOnInit() {
    this.actualizarDatos();
  }

  modificarCantidad(productoId: number, cambio: number) {
    this.carritoService.actualizarCantidad(productoId, cambio);
    this.actualizarDatos();
  }

  eliminarItem(productoId: number) {
    this.carritoService.eliminarProducto(productoId); 
    this.actualizarDatos(); 
    this.mostrarToast('warning', 'Producto eliminado');
  }

  private actualizarDatos() {
    this.items = this.carritoService.obtenerCarrito();
    this.calcularTotal();
  }

  calcularTotal() {
    const rawTotal = this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    this.total = Math.round((rawTotal + Number.EPSILON) * 100) / 100;
  }

  getTotalArticulos(): number {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  async comprar() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      this.solicitarLogin();
      return;
    }

    if (this.items.length === 0) {
      Swal.fire('Carrito vacío', 'Añade productos antes de pagar', 'info');
      return;
    }

    let usuario = JSON.parse(usuarioGuardado);

    if (!usuario.direccion || usuario.direccion.trim().length === 0) {
      const { value: nuevaDireccion } = await Swal.fire({
        title: '📦 Dirección de envío',
        input: 'text',
        inputLabel: 'No tienes una dirección guardada. ¿Dónde enviamos tu pedido?',
        inputPlaceholder: 'Escribe tu dirección aquí...',
        background: '#1e293b', color: '#fff',
        confirmButtonColor: '#0ea5e9',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      });

      if (nuevaDireccion && nuevaDireccion.trim().length > 0) {
        usuario.direccion = nuevaDireccion;
        localStorage.setItem('usuario', JSON.stringify(usuario));
      } else {
        return; 
      }
    }

    const pedidoDTO = {
      fecha: new Date().toISOString(),
      estado: 'PENDIENTE',
      usuario: { id: usuario.id },
      direccionEnvio: usuario.direccion,
      total: this.total,
      detalles: this.items.map(item => ({
        producto: { id: item.id },
        cantidad: item.cantidad, 
        precio: item.precio
      }))
    };

    this.http.post(`${this.API_URL}/pedidos`, pedidoDTO, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.finalizarCompra(usuario);
        },
        error: (e) => {
          const msg = e.error && typeof e.error === 'string' ? e.error : 'Saldo insuficiente o error de stock.';
          Swal.fire('Error en la compra', msg, 'error');
        }
      });
  }

  private finalizarCompra(usuario: any) {
    if(usuario.saldo !== undefined) {
      usuario.saldo = Number((usuario.saldo - this.total).toFixed(2)); 
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    Swal.fire({
      title: '¡Compra Exitosa!',
      text: 'Tu pedido se ha procesado. Puedes descargar la factura en Mis Pedidos.',
      icon: 'success',
      confirmButtonText: 'Ir a Mis Pedidos',
      confirmButtonColor: '#198754',
      background: '#1e293b', color: '#fff'
    }).then(() => {
      this.carritoService.limpiarCarrito();
      this.router.navigate(['/mis-pedidos']);
    });
  }

  private solicitarLogin() {
    Swal.fire({
      title: 'Inicia Sesión',
      text: 'Debes estar identificado para comprar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ir al Login',
      cancelButtonColor: '#6c757d',
      confirmButtonColor: '#0dcaf0'
    }).then((result) => {
      if (result.isConfirmed) this.router.navigate(['/login']);
    });
  }

  private mostrarToast(icono: 'info' | 'warning', titulo: string) {
    Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#1e293b',
      color: '#fff'
    }).fire({ icon: icono, title: titulo });
  }
}