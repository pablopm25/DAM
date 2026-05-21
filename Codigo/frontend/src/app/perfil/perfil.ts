import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html'
})
export class PerfilComponent implements OnInit {
  private http = inject(HttpClient);
  usuario: any = null;

  ngOnInit() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) this.usuario = JSON.parse(userJson);
  }

  recargar(monto: number) {
    this.http.put(`http://localhost:8080/api/usuarios/${this.usuario.id}/recargar`, { monto })
      .subscribe({
        next: (usuarioActualizado: any) => {
          this.usuario = usuarioActualizado;
          localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
          
          Swal.fire({
            icon: 'success',
            title: '¡Saldo Recargado!',
            text: `Has añadido ${monto}€ a tu cuenta.`,
            background: '#1e293b', color: '#fff', confirmButtonColor: '#0dcaf0'
          });
        },
        error: () => Swal.fire('Error', 'No se pudo procesar la recarga', 'error')
      });
  }
}