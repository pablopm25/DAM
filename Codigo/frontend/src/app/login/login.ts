import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  saldo: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  
  loginForm = { email: '', password: '' };

  verPassword = false; 
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'http://localhost:8080/api/usuarios/login';

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  login() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.mostrarAlerta('Faltan datos', 'Por favor, rellena todos los campos.', 'warning');
      return;
    }

    this.http.post<UsuarioResponse>(this.API_URL, this.loginForm)
      .subscribe({
       next: (usuario) => {
          console.log('Datos del usuario que llegan de Java:', usuario);

          usuario.rol = usuario.rol.trim();
          localStorage.setItem('usuario', JSON.stringify(usuario));

          if (usuario.rol.trim() === 'ADMIN' || usuario.rol.trim() === 'ROLE_ADMIN') {
            this.mostrarAlertaExito('Bienvenido Admin', 'Accediendo al panel de gestión...');
            this.router.navigate(['/admin']); 
          } else {
            this.mostrarAlertaExito(`¡Hola, ${usuario.nombre}!`, 'Preparando tu catálogo de componentes...');
            this.router.navigate(['/catalogo']);
          }
        },
        error: () => {
          this.mostrarAlerta('Acceso Denegado', 'El correo o la contraseña son incorrectos.', 'error');
        }
      });
  }

  private mostrarAlertaExito(titulo: string, texto: string) {
    Swal.fire({
      icon: 'success', 
      title: titulo,
      text: texto,
      timer: 1500,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#fff'
    });
  }

  private mostrarAlerta(titulo: string, texto: string, icono: 'error' | 'warning') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#0dcaf0'
    });
  }
}