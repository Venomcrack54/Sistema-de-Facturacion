const express = require("express");
const cors = require("cors");
const path = require("path");

// Importar rutas
const clienteRoutes = require("./routes/clienteRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const metodoPagoRoutes = require("./routes/metodoPagoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const facturaRoutes = require("./routes/facturaRoutes");
const historialRoutes = require("./routes/historialRoutes");
const MetodoPagoModel = require("../models/server/metodoPagoModel");

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ARCHIVOS ESTÁTICOS ====================
// Servir el frontend desde la raíz del proyecto
app.use(express.static(path.join(__dirname, "..")));

// ==================== RUTAS API ====================
// Usuario = Login (acceso). Cliente = Registro para facturas.
app.use("/api/clientes", clienteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/metodo-pago", metodoPagoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/historial", historialRoutes);

// Seed suave: asegurar métodos de pago por defecto
MetodoPagoModel.ensureDefaults().catch((e) => {
  console.warn("WARN: no se pudieron asegurar métodos de pago por defecto:", e?.message);
});

// ==================== RUTA RAÍZ ====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ==================== MANEJO DE ERRORES ====================
app.use((err, req, res, next) => {
  console.error("Error del servidor:", err.stack);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}/views/form/login.html`);
});
