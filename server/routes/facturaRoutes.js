const express = require("express");
const router = express.Router();
const FacturaController = require("../../controllers/server/facturaController");

// GET /api/facturas/codigo - Generar código secuencial de factura
router.get("/codigo", FacturaController.generarCodigo);

// GET /api/facturas - Obtener todas las facturas
router.get("/", FacturaController.getAll);

// GET /api/facturas/estado/:estado - Obtener facturas por estado
router.get("/estado/:estado", FacturaController.getByEstado);

// GET /api/facturas/cliente/cedula/:cedula - Buscar facturas por cédula del cliente
router.get("/cliente/cedula/:cedula", FacturaController.getByClienteCedula);

// GET /api/facturas/cliente/:idCliente - Obtener facturas por idCliente
router.get("/cliente/:idCliente", FacturaController.getByCliente);

// GET /api/facturas/:id - Obtener factura por ID
router.get("/:id", FacturaController.getById);

// GET /api/facturas/:id/detalles - Obtener detalles de una factura
router.get("/:id/detalles", FacturaController.getDetalles);

// POST /api/facturas - Crear una nueva factura con detalles
router.post("/", FacturaController.create);

// POST /api/facturas/:id/detalles - Agregar un detalle a una factura existente
router.post("/:id/detalles", FacturaController.addDetalle);

// PUT /api/facturas/:id - Actualizar factura (sin detalles)
router.put("/:id", FacturaController.update);

// PUT /api/facturas/:id/detalles/reemplazar - Reemplazar todos los detalles de una factura
router.put("/:id/detalles/reemplazar", FacturaController.replaceDetalles);

// PUT /api/facturas/detalles/:idDetalle - Actualizar un detalle específico
router.put("/detalles/:idDetalle", FacturaController.updateDetalle);

// PATCH /api/facturas/:id/estado - Actualizar estado de la factura
router.patch("/:id/estado", FacturaController.updateEstado);

// DELETE /api/facturas/detalles/:idDetalle - Eliminar un detalle específico
router.delete("/detalles/:idDetalle", FacturaController.deleteDetalle);

// DELETE /api/facturas/:id - Eliminar factura y sus detalles
router.delete("/:id", FacturaController.delete);

module.exports = router;
