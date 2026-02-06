# Sistema de Facturación - CRUD con Base de Datos MySQL

## Descripción General

Sistema de Facturación web con arquitectura **MVC** (Modelo-Vista-Controlador) que integra una base de datos **MySQL** a través de un backend **Node.js + Express**. El proyecto mantiene la estructura frontend original (HTML/CSS/JS con validaciones) y agrega una capa de servidor completa para operaciones CRUD contra la base de datos `sistema_facturacion`.

---

## Estructura del Proyecto

```
Sistema-de-Facturacion/
│
├── server/                          # Servidor Node.js
│   ├── server.js                    # Punto de entrada Express (puerto 3000)
│   ├── config/
│   │   └── db.js                    # Conexión MySQL (mysql2)
│   └── routes/
│       ├── clienteRoutes.js         # Rutas API /api/clientes
│       ├── usuarioRoutes.js         # Rutas API /api/usuarios
│       ├── productoRoutes.js        # Rutas API /api/productos
│       ├── metodoPagoRoutes.js      # Rutas API /api/metodo-pago
│       ├── pedidoRoutes.js          # Rutas API /api/pedidos
│       ├── facturaRoutes.js         # Rutas API /api/facturas
│       └── historialRoutes.js       # Rutas API /api/historial
│
├── models/
│   ├── clienteModel.js              # Modelo frontend (localStorage)
│   ├── facturaModel.js              # Modelo frontend (localStorage)
│   ├── productModel.js              # Modelo frontend (localStorage)
│   ├── storageKeys.js               # Constantes localStorage
│   └── server/                      # Modelos backend (MySQL)
│       ├── clienteModel.js          # CRUD tabla Cliente
│       ├── usuarioModel.js          # CRUD tabla Usuario
│       ├── productoModel.js         # CRUD tabla Producto
│       ├── metodoPagoModel.js       # CRUD tabla MetodoPago
│       ├── pedidoModel.js           # CRUD tablas Pedido + DetallePedido
│       ├── facturaModel.js          # CRUD tablas Factura + DetalleFactura
│       └── historialModel.js        # CRUD tabla HistorialFactura
│
├── controllers/
│   ├── clienteController.js         # Controlador frontend (validaciones DOM)
│   ├── facturacionController.js     # Controlador frontend (facturación)
│   ├── historialController.js       # Controlador frontend (historial)
│   ├── loginController.js           # Controlador frontend (login)
│   └── server/                      # Controladores backend (Express handlers)
│       ├── clienteController.js     # Handlers HTTP para Cliente
│       ├── usuarioController.js     # Handlers HTTP para Usuario
│       ├── productoController.js    # Handlers HTTP para Producto
│       ├── metodoPagoController.js  # Handlers HTTP para MetodoPago
│       ├── pedidoController.js      # Handlers HTTP para Pedido
│       ├── facturaController.js     # Handlers HTTP para Factura
│       └── historialController.js   # Handlers HTTP para Historial
│
├── views/
│   ├── form/                        # Páginas HTML
│   │   ├── login.html
│   │   ├── menu.html
│   │   ├── cliente.html
│   │   ├── facturacion.html
│   │   └── historial.html
│   └── style/                       # Hojas de estilo CSS
│       ├── login.css
│       ├── menu.css
│       ├── cliente.css
│       ├── facturacion.css
│       └── historial.css
│
├── index.html                       # Redirección al login
├── package.json                     # Dependencias Node.js
└── README.md                        # Este archivo
```

---

## Base de Datos

La conexión se configura en `server/config/db.js` usando `mysql.createConnection()` de la librería `mysql2` con soporte de promesas.

-- =========================================
-- CLIENTE
-- =========================================
CREATE TABLE Cliente (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL,
    nombre VARCHAR(35) NOT NULL,
    apellido VARCHAR(35) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    fechaNacimiento DATETIME NOT NULL,
    estadoCliente ENUM('ACTIVO','INACTIVO') NOT NULL
);

-- =========================================
-- USUARIO
-- =========================================
CREATE TABLE Usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    rol ENUM('ADMINISTRADOR','FACTURACION','CONTABILIDAD') NOT NULL,
    estadoUsuario ENUM('ACTIVO','INACTIVO') NOT NULL
);

-- =========================================
-- PRODUCTO
-- =========================================
CREATE TABLE Producto (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    precioUnitario DECIMAL(10,2) NOT NULL,
    aplicaIVA BOOLEAN NOT NULL,
    aplicaDescuento BOOLEAN NOT NULL,
    estadoProducto ENUM('ACTIVO','INACTIVO') NOT NULL
);

-- =========================================
-- METODO DE PAGO
-- =========================================
CREATE TABLE MetodoPago (
    idPago INT AUTO_INCREMENT PRIMARY KEY,
    tipoPago ENUM('Efectivo','Tarjeta','Transferencia') NOT NULL,
    disponible BOOLEAN NOT NULL
);

-- =========================================
-- PEDIDO
-- =========================================
CREATE TABLE Pedido (
    idPedido INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    fechaPedido DATETIME NOT NULL,
    fechaEntrega DATETIME NOT NULL,
    subtotalPedido DECIMAL(10,2) NOT NULL,
    valorDescuento DECIMAL(10,2) NOT NULL,
    totalPedido DECIMAL(10,2) NOT NULL,
    estadoPedido ENUM('PENDIENTE','CONFIRMADO','CANCELADO','FACTURADO') NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente)
);

-- =========================================
-- DETALLE PEDIDO
-- =========================================
CREATE TABLE DetallePedido (
    idDetalle INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    idPedido INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotalDetalle DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idProducto) REFERENCES Producto(idProducto),
    FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido)
);

-- =========================================
-- FACTURA
-- =========================================
CREATE TABLE Factura (
    idFactura INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idPago INT NOT NULL,
    idPedido INT NOT NULL,
    fechaFactura DATETIME NOT NULL,
    subtotalFactura DECIMAL(10,2) NOT NULL,
    valorIva DECIMAL(10,2) NOT NULL,
    totalFactura DECIMAL(10,2) NOT NULL,
    estadoFactura ENUM('EMITIDA','ANULADA','RECHAZADA','EN PROCESO') NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idPago) REFERENCES MetodoPago(idPago),
    FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido)
);

-- =========================================
-- DETALLE FACTURA
-- =========================================
CREATE TABLE DetalleFactura (
    idDetalle INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    idFactura INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotalDetalle DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idProducto) REFERENCES Producto(idProducto),
    FOREIGN KEY (idFactura) REFERENCES Factura(idFactura)
);


-- =========================================
-- HISTORIAL FACTURA
-- =========================================
CREATE TABLE HistorialFactura (
    idHistorial INT AUTO_INCREMENT PRIMARY KEY,
    idFactura INT NOT NULL,
    idUsuario INT NOT NULL,
    estadoAnterior ENUM('EMITIDA','ANULADA','RECHAZADA','EN PROCESO') NOT NULL,
    estadoNuevo ENUM('EMITIDA','ANULADA','RECHAZADA','EN PROCESO') NOT NULL,
    fechaCambio DATETIME NOT NULL,
    motivo VARCHAR(255),
    FOREIGN KEY (idFactura) REFERENCES Factura(idFactura),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);


