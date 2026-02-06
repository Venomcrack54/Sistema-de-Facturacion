const express = require("express");
const router = express.Router();
const HistorialController = require("../../controllers/server/historialController");

// GET /api/historial - Obtener todo el historial
router.get("/", HistorialController.getAll);

// GET /api/historial/fechas?inicio=YYYY-MM-DD&fin=YYYY-MM-DD - Obtener historial por rango de fechas
router.get("/fechas", HistorialController.getByFechas);

// GET /api/historial/factura/:idFactura - Obtener historial por factura
router.get("/factura/:idFactura", HistorialController.getByFactura);

// GET /api/historial/usuario/:idUsuario - Obtener historial por usuario
router.get("/usuario/:idUsuario", HistorialController.getByUsuario);

// GET /api/historial/:id - Obtener registro de historial por ID
router.get("/:id", HistorialController.getById);

// POST /api/historial - Crear un nuevo registro de historial
router.post("/", HistorialController.create);

// DELETE /api/historial/factura/:idFactura - Eliminar todo el historial de una factura
router.delete("/factura/:idFactura", HistorialController.deleteByFactura);

// DELETE /api/historial/usuario/:idUsuario - Eliminar todo el historial de un usuario
router.delete("/usuario/:idUsuario", HistorialController.deleteByUsuario);

// DELETE /api/historial/:id - Eliminar un registro de historial
router.delete("/:id", HistorialController.delete);

module.exports = router;
