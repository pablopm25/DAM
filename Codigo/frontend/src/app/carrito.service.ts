import { Injectable } from '@angular/core';

export interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  categoria?: string;
  cantidad: number; 
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private items: ProductoCarrito[] = [];

  constructor() {
    this.cargarDesdeMemoria();
  }

  private cargarDesdeMemoria() {
    try {
      const guardado = localStorage.getItem('carrito');
      if (guardado) {
        this.items = JSON.parse(guardado);
      }
    } catch (e) {
      console.error('El carrito guardado estaba corrupto. Se ha reiniciado.', e);
      this.items = [];
      this.guardar(); 
    }
  }

  agregarProducto(producto: any) {
    const itemExistente = this.items.find(item => item.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.items.push({ ...producto, cantidad: 1 });
    }
    
    this.guardar();
  }

  obtenerCarrito(): ProductoCarrito[] {
    return this.items;
  }

  actualizarCantidad(productoId: number, cambio: number) {
    const item = this.items.find(i => i.id === productoId);
    if (item) {
      item.cantidad += cambio;
      
      if (item.cantidad <= 0) {
        this.eliminarProducto(productoId);
      } else {
        this.guardar();
      }
    }
  }

  eliminarProducto(productoId: number) {
    this.items = this.items.filter(item => item.id !== productoId);
    this.guardar();
  }

  limpiarCarrito() {
    this.items = [];
    this.guardar();
  }

  obtenerTotal(): number {
    return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  obtenerTotalArticulos(): number {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  private guardar() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }
}