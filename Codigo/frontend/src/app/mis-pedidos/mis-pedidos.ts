import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2'; 

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProductoDetalle {
  nombre: string;
}

interface DetallePedido {
  id?: number;
  producto: ProductoDetalle;
  precio: number;
  cantidad: number;
}

interface Pedido {
  id: number;
  fecha: string;
  total: number;
  estado: string; 
  direccion_envio?: string; 
  detalles: DetallePedido[];
}

interface UsuarioLogueado {
  id: number;
  nombre: string;
  email: string;
  direccion?: string;
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './mis-pedidos.html'
})
export class MisPedidosComponent implements OnInit {
  
  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef); 
  private readonly API_URL = 'http://localhost:8080/api/pedidos/usuario';
  
  pedidos: Pedido[] = [];
  usuario: UsuarioLogueado | null = null;

  pedidoSeleccionado: Pedido | null = null;

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  private cargarDatosUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        this.usuario = JSON.parse(usuarioStr);
        if (this.usuario?.id) {
          this.obtenerHistorial(this.usuario.id);
        }
      } catch (e) {
        localStorage.removeItem('usuario');
      }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión no encontrada',
            text: 'Por favor, inicia sesión para ver tus pedidos.',
            background: '#1e293b', color: '#fff'
        });
    }
  }

  private obtenerHistorial(userId: number) {
    this.http.get<Pedido[]>(`${this.API_URL}/${userId}`)
      .subscribe({
        next: (data) => {
          this.pedidos = data.reverse(); 
          this.cd.detectChanges(); 
        },
        error: (e) => {
            console.error('Error cargando el historial:', e);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No pudimos cargar tu historial. Inténtalo más tarde.',
                background: '#1e293b', color: '#fff',
                confirmButtonColor: '#0dcaf0'
            });
        }
      });
  }

  verDetalles(pedido: Pedido) {
    console.log('👀 Clic detectado. Abriendo pedido:', pedido); 
    this.pedidoSeleccionado = pedido;
    this.cd.detectChanges(); 
  }

  cerrarModal() {
    this.pedidoSeleccionado = null;
    this.cd.detectChanges(); 
  }

  descargarFactura(pedido: Pedido) {
    const doc = new jsPDF();
    const fechaActual = new Date(pedido.fecha).toLocaleDateString('es-ES');

    doc.setFillColor(20, 27, 40); 
    doc.rect(0, 0, 210, 35, 'F'); 

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 202, 240);
    doc.text("COMPONENTES 360", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); 
    doc.setFont("helvetica", "normal");
    doc.text("Factura Oficial de Compra", 195, 16, { align: 'right' });
    doc.text(`Nº Pedido: #${pedido.id}`, 195, 22, { align: 'right' });
    doc.text(`Fecha: ${fechaActual}`, 195, 28, { align: 'right' });

    doc.setTextColor(0, 0, 0); 
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Facturado a:", 14, 50);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Cliente: ${this.usuario?.nombre || 'Cliente Final'}`, 14, 57);
    doc.text(`Email: ${this.usuario?.email || 'N/A'}`, 14, 63);
    doc.text(`Dirección de envío: ${pedido.direccion_envio || this.usuario?.direccion || 'No especificada'}`, 14, 69);

    const filas = pedido.detalles.map((item) => [
      item.producto?.nombre || 'Producto', 
      item.cantidad.toString(),
      `${item.precio.toFixed(2)} €`,
      `${(item.precio * item.cantidad).toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['Artículo', 'Cant.', 'Precio Ud.', 'Subtotal']],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [20, 27, 40], textColor: [255, 255, 255] }, 
      columnStyles: {
        0: { halign: 'left' },   
        1: { halign: 'center' }, 
        2: { halign: 'right' },  
        3: { halign: 'right' }   
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setDrawColor(200, 200, 200);
    doc.line(120, finalY - 8, 195, finalY - 8);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL PAGADO: ${pedido.total.toFixed(2)} €`, 195, finalY, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Gracias por confiar en Componentes 360 para su setup.", 105, 280, { align: 'center' });

    doc.save(`Factura_C360_Pedido_${pedido.id}.pdf`);
    
    Swal.mixin({ 
      toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' 
    }).fire({ icon: 'success', title: 'Factura descargada' });
  }
}