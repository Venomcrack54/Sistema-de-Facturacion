const express = require("express");
const router = express.Router();
const MetodoPagoController = require("../../controllers/server/metodoPagoController");

// GET /api/metodo-pago - Obtener todos los métodos de pago
router.get("/", MetodoPagoController.getAll);

// GET /api/metodo-pago/disponibles - Obtener solo los métodos de pago disponibles
router.get("/disponibles", MetodoPagoController.getAvailable);

// GET /api/metodo-pago/tipo/:tipoPago - Buscar método de pago por tipo
router.get("/tipo/:tipoPago", MetodoPagoController.getByTipo);

// GET /api/metodo-pago/:id - Obtener método de pago por ID
router.get("/:id", MetodoPagoController.getById);

// POST /api/metodo-pago - Crear un nuevo método de pago
router.post("/", MetodoPagoController.create);

// PUT /api/metodo-pago/:id - Actualizar método de pago
router.put("/:id", MetodoPagoController.update);

// PATCH /api/metodo-pago/:id/toggle - Cambiar disponibilidad
router.patch("/:id/toggle", MetodoPagoController.toggleDisponible);

// DELETE /api/metodo-pago/:id - Eliminar método de pago
router.delete("/:id", MetodoPagoController.delete);

module.exports = router;
