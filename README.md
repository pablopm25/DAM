# Componentes 360 - E-commerce B2C (Proyecto DAM)

Plataforma completa de comercio electrónico orientada a la venta de componentes informáticos, gestión de inventario y procesamiento de pedidos de clientes.

Este proyecto fue desarrollado como Trabajo de Fin de Ciclo para la titulación de Desarrollo de Aplicaciones Multiplataforma (DAM), demostrando el manejo de arquitecturas cliente-servidor desacopladas, APIs RESTful, bases de datos relacionales y renderizado dinámico en el lado del cliente.

## Tecnologías Utilizadas

* **Backend:** Java 17, Spring Boot, Maven
* **Base de Datos:** MySQL
* **Frontend:** Node.js, Angular CLI
* **Arquitectura:** Cliente-Servidor desacoplada (API REST)

## Características Principales

* **Sistema de Autenticación y Seguridad:** Login seguro y gestión de sesiones.
* **Gestión de Roles:** Diferenciación estricta de permisos entre Administradores y Clientes.
* **Panel de Administración (Back-Office):** Interfaz privada para la gestión del catálogo de productos, control de stock y seguimiento de usuarios.
* **Área Pública y Carrito (B2C):** Catálogo interactivo, validación logística de envíos y proceso de compra (Checkout) completo.
* **Optimización de Recursos (Client-Side):** Generación algorítmica y vectorial de facturas en PDF directamente en el navegador del cliente para reducir la latencia y la carga del servidor.

## Documentación del Proyecto (Memoria)

Para una comprensión técnica profunda sobre las decisiones de arquitectura, el modelo Entidad-Relación de la base de datos y los flujos de usuario (incluyendo la justificación de la generación de facturas en el cliente), el repositorio incluye la memoria completa del proyecto en la carpeta `Documentación`.

## Instalación y Despliegue en Local

Si deseas probar el proyecto en tu entorno local:

1. **Clona este repositorio:** `git clone https://github.com/pablopm25/DAM.git`

2. **Base de Datos:**
   * Inicia tu servidor MySQL (XAMPP, MAMP o similar) en el puerto 3306.
   * Crea una base de datos vacía llamada `componentes360`.
   * Importa el archivo `componentes360.sql` incluido en el proyecto.

3. **Despliegue del Backend (Spring Boot):**
   * Configura tus credenciales locales en `application.properties` si es necesario.
   * Ejecuta la clase `BackendApplication.java` desde tu IDE o compila con Maven. El servidor se levantará en `http://localhost:8080`.

4. **Despliegue del Frontend (Angular):**
   * Navega a la carpeta del Frontend: `cd Codigo/frontend`
   * Instala las dependencias de Node: `npm install`
   * Levanta el servidor de desarrollo: `ng serve`
   * Accede a la plataforma desde tu navegador en `http://localhost:4200`

---
*Desarrollado por Pablo Pérez Menéndez*
