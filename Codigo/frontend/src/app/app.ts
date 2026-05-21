import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CarritoService } from './carrito.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  private router = inject(Router);
  private carritoService = inject(CarritoService); 

  private _mockUsuario: any = undefined;
  private _mockCantidad: number | undefined = undefined;

  get usuarioSesion() {
    if (this._mockUsuario !== undefined) return this._mockUsuario;
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  set usuarioSesion(val: any) {
    this._mockUsuario = val;
  }

  get cantidadCarrito(): number {
    if (this._mockCantidad !== undefined) return this._mockCantidad;
    
    if (!this.carritoService) return 0;
    
    return this.carritoService.obtenerCarrito()
               .reduce((total, item) => total + item.cantidad, 0);
  }

  set cantidadCarrito(val: number) {
    this._mockCantidad = val;
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a iniciar sesión para realizar compras.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#64748b',  
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#1e293b', 
      color: '#fff' 
    }).then((result) => {
      if (result.isConfirmed) {
        
        localStorage.removeItem('usuario');
        this.carritoService.limpiarCarrito();

        this._mockUsuario = undefined;
        this._mockCantidad = undefined;

        Swal.mixin({
          toast: true, 
          position: 'top-end', 
          showConfirmButton: false, 
          timer: 1500,
          background: '#1e293b', 
          color: '#fff'
        }).fire({ icon: 'success', title: 'Sesión cerrada correctamente' });

        this.router.navigate(['/']); 
      }
    });
  }
}