import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  
  estaLogueado: boolean = false;
  private router = inject(Router); 

  ngOnInit() {
    this.verificarSesion();
  }

  private verificarSesion() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const user = JSON.parse(usuarioStr);
        this.estaLogueado = !!(user && user.id);
      } catch (e) {
        localStorage.removeItem('usuario');
        this.estaLogueado = false;
      }
    } else {
      this.estaLogueado = false;
    }
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Tendrás que volver a identificarte para realizar compras.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#1e293b', 
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuario'); 
        this.estaLogueado = false; 
        
        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          background: '#1e293b',
          color: '#fff'
        }).fire({ icon: 'success', title: 'Hasta pronto 👋' });
        
        this.router.navigate(['/']);
      }
    });
  }
}