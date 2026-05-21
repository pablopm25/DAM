import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  // Intercepta la navegación antes de cargar la vista. 
  // Si el usuario no tiene el rol ADMIN, bloquea el renderizado del componente por seguridad.
  if (usuarioStr) {
    try {
      const usuario = JSON.parse(usuarioStr);

      if (usuario?.rol === 'ADMIN') {
        return true; 
      }
    } catch (error) {
      console.error('Error de seguridad: Datos de sesión corruptos detectados.');
    }
  }

  // Si no es administrador o es un usuario anónimo, cancela el acceso, 
  // muestra el aviso visual y lo redirige obligatoriamente a la página principal.
  Swal.fire({
    title: '¡Acceso Restringido!',
    text: 'Esta área es exclusiva para el personal de administración.',
    icon: 'error',
    background: '#1e293b', 
    color: '#fff',
    confirmButtonColor: '#0dcaf0'
  });
  
  router.navigate(['/']);
  return false; 
};