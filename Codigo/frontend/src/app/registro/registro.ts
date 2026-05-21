import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface NuevoUsuario {
  nombre: string;
  username: string;
  email: string;
  direccion: string; 
  password: string;
  saldo: number;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css' 
})
export class RegistroComponent {

  nuevoUsuario: NuevoUsuario = {
    nombre: '',
    username: '',
    email: '',
    direccion: '', 
    password: '',
    saldo: 1500 
  };

  confirmarPassword = '';
  verPassword = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'http://localhost:8080/api/usuarios/registro';

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  registrar() {
    if (!this.nuevoUsuario.email.endsWith('@gmail.com')) {
      Swal.fire({
        title: 'Email no válido',
        text: 'Solo permitimos el registro con cuentas de @gmail.com',
        icon: 'warning',
        background: '#1e293b', color: '#fff',
        confirmButtonColor: '#fbbf24'
      });
      return; 
    }

    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      Swal.fire({
        title: 'Contraseñas distintas',
        text: 'Las contraseñas no coinciden. Por favor, revísalas.',
        icon: 'error',
        background: '#1e293b', color: '#fff',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (!this.nuevoUsuario.direccion || this.nuevoUsuario.direccion.trim().length === 0) {
      Swal.fire({
        title: 'Falta la dirección',
        text: 'Por favor, introduce una dirección para tus futuros envíos.',
        icon: 'warning',
        background: '#1e293b', color: '#fff',
        confirmButtonColor: '#fbbf24'
      });
      return;
    }

    this.http.post(this.API_URL, this.nuevoUsuario, { responseType: 'text' })
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Cuenta Creada!',
            text: `Te hemos regalado ${this.nuevoUsuario.saldo}€ de saldo inicial. ¡A comprar!`,
            icon: 'success',
            background: '#1e293b', color: '#fff',
            confirmButtonColor: '#0dcaf0'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (e) => {
          console.error('Error al registrar:', e);
          Swal.fire({
            title: 'Error en el Registro',
            text: 'No se pudo crear la cuenta. Es posible que el correo o usuario ya estén en uso.',
            icon: 'error',
            background: '#1e293b', color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }
}