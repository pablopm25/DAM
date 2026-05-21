import { Routes } from '@angular/router';
import { HomeComponent } from './home/home'; 
import { CatalogoComponent } from './catalogo/catalogo';
import { LoginComponent } from './login/login';
import { CarritoComponent } from './carrito/carrito';
import { RegistroComponent } from './registro/registro';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos'; 
import { MisPedidosComponent } from './mis-pedidos/mis-pedidos'; 
import { AdminComponent } from './admin/admin'; 
import { PerfilComponent } from './perfil/perfil';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] }, 

  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin-pedidos', component: AdminPedidosComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];