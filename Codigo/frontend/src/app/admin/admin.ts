import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface Pedido {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  usuario: Usuario;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {

  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef); 

  private readonly API_PRODUCTOS = 'http://localhost:8080/api/productos';
  private readonly API_PEDIDOS = 'http://localhost:8080/api/pedidos';

  productos: Producto[] = [];
  idEditando: number | null = null; 
  productoForm: Producto = this.getFormInicial();

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  filtroPedido: string = '';

  stats = {
    ingresos: 0,
    pendientes: 0,
    totalVentas: 0
  };

  ngOnInit() {
    this.cargarProductos();
    this.cargarTodosLosPedidos();
  }

  // Gestion de Productos
  cargarProductos() {
    this.http.get<Producto[]>(this.API_PRODUCTOS)
      .subscribe({
        next: (data) => {
          this.productos = data;
          this.cd.detectChanges(); 
        }, 
        error: () => this.notificarError('No se pudo cargar la lista de productos')
      });
  }

  guardar() {
    if (!this.productoForm.nombre || this.productoForm.precio <= 0) {
      Swal.fire('Formulario incompleto', 'El nombre es obligatorio y el precio debe ser mayor a 0', 'warning');
      return;
    }
    this.idEditando ? this.actualizar() : this.crear();
  }

  private crear() {
    this.http.post(this.API_PRODUCTOS, this.productoForm).subscribe({
      next: () => { this.alertaExito('Producto creado'); this.resetPagina(); },
      error: () => this.notificarError('Error al crear producto')
    });
  }

  private actualizar() {
    this.http.put(`${this.API_PRODUCTOS}/${this.idEditando}`, this.productoForm).subscribe({
      next: () => { this.alertaExito('Producto actualizado'); this.resetPagina(); },
      error: () => this.notificarError('Error al actualizar')
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      background: '#1e293b', color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.API_PRODUCTOS}/${id}`).subscribe({
          next: () => { this.alertaExito('Eliminado'); this.cargarProductos(); },
          error: () => this.notificarError('No se pudo eliminar')
        });
      }
    });
  }

  editar(p: Producto) {
    this.idEditando = p.id!;
    this.productoForm = { ...p }; 
    this.cd.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // Gestion de Pedidos
  cargarTodosLosPedidos() {
    this.http.get<Pedido[]>(`${this.API_PEDIDOS}/todos`)
      .subscribe({
        next: (data) => {
          this.pedidos = data;
          this.pedidosFiltrados = data;
          this.calcularEstadisticas();
          this.cd.detectChanges();
        },
        error: () => console.error('Error cargando pedidos')
      });
  }

  calcularEstadisticas() {
    this.stats.totalVentas = this.pedidos.length;
    this.stats.ingresos = this.pedidos.reduce((acc, p) => acc + p.total, 0);
    this.stats.pendientes = this.pedidos.filter(p => p.estado === 'PENDIENTE').length;
  }

  filtrarPedidos() {
    const busq = this.filtroPedido.toLowerCase();
    this.pedidosFiltrados = this.pedidos.filter(p => 
      p.id.toString().includes(busq) || 
      p.usuario.nombre.toLowerCase().includes(busq)
    );
  }

  actualizarEstadoPedido(pedido: Pedido, nuevoEstado: string) {
    this.http.put(`${this.API_PEDIDOS}/${pedido.id}/estado`, { estado: nuevoEstado })
      .subscribe({
        next: () => {
          pedido.estado = nuevoEstado;
          this.calcularEstadisticas();

          // Fuerza a Angular a repintar la vista con detectChanges() porque al mutar 
          // el estado del pedido directamente, a veces el selector HTML pierde el binding.
          this.cd.detectChanges();

          const toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
            background: '#1e293b', color: '#fff'
          });
          toast.fire({ icon: 'success', title: `Pedido #${pedido.id} actualizado a ${nuevoEstado}` });
        },
        error: () => {
          this.notificarError('No se pudo cambiar el estado');
          this.cargarTodosLosPedidos();
        }
      });
  }

  // Importacion y Exportacion
  importarJson(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = (e: any) => {
      try {
        const productosImportados = JSON.parse(e.target.result);
        this.http.post(`${this.API_PRODUCTOS}/import`, productosImportados).subscribe({
          next: () => { this.alertaExito('Importado con éxito'); this.cargarProductos(); },
          error: () => this.notificarError('Error al importar')
        });
      } catch (error) {
        Swal.fire('Error', 'Formato JSON inválido', 'error');
      }
    };
    lector.readAsText(archivo);
    event.target.value = '';
  }

  exportarCsv() {
    // Solicita la respuesta como archivo binario puro para poder generar 
    // la descarga del CSV en el navegador del cliente sin necesidad de guardarlo en servidor.
    this.http.get(`${this.API_PRODUCTOS}/export`, { responseType: 'blob' }).subscribe({
      next: (data) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventario_c360.csv';
        a.click();
        this.alertaExito('CSV Descargado');
      },
      error: () => this.notificarError('Error al generar CSV')
    });
  }

  //  Utilidades
  private resetPagina() {
    this.limpiarFormulario();
    this.cargarProductos();
  }

  limpiarFormulario() {
    this.idEditando = null;
    this.productoForm = this.getFormInicial();
  }

  private getFormInicial(): Producto {
    return { nombre: '', descripcion: '', precio: 0, stock: 5, categoria: 'Procesadores', imagenUrl: '' };
  }

  private alertaExito(msg: string) {
    Swal.fire({ icon: 'success', title: msg, showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' });
  }

  private notificarError(msg: string) {
    Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#1e293b', color: '#fff' });
  }
}