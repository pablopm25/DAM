import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  if (usuarioStr) {
    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario && usuario.id) {
        return true; 
      }
    } catch (error) {
      console.error('Error de sesión: Datos corruptos detectados en el navegador.');
      localStorage.removeItem('usuario'); 
    }
  }

  Swal.fire({
    title: 'Acceso Restringido',
    text: 'Inicia sesión para gestionar tu cuenta y tus compras.',
    icon: 'warning',
    confirmButtonText: 'Ir al Login',
    confirmButtonColor: '#0dcaf0',
    background: '#1e293b', 
    color: '#fff'
  }).then(() => {
    router.navigate(['/login']);
  });
  
  return false; 
};