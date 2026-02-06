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
