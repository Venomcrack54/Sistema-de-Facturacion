const express = require("express");
const router = express.Router();
const PedidoController = require("../../controllers/server/pedidoController");

// GET /api/pedidos - Obtener todos los pedidos
router.get("/", PedidoController.getAll);

// GET /api/pedidos/confirmados - Obtener pedidos confirmados (disponibles para facturar)
router.get("/confirmados", PedidoController.getConfirmados);

// GET /api/pedidos/estado/:estado - Obtener pedidos por estado
router.get("/estado/:estado", PedidoController.getByEstado);

// GET /api/pedidos/cliente/:idCliente - Obtener pedidos por cliente
router.get("/cliente/:idCliente", PedidoController.getByCliente);

// GET /api/pedidos/:id - Obtener pedido por ID
router.get("/:id", PedidoController.getById);

// GET /api/pedidos/:id/detalles - Obtener detalles de un pedido
router.get("/:id/detalles", PedidoController.getDetalles);

// POST /api/pedidos - Crear un nuevo pedido con detalles
router.post("/", PedidoController.create);

// POST /api/pedidos/:id/detalles - Agregar un detalle a un pedido existente
router.post("/:id/detalles", PedidoController.addDetalle);

// PUT /api/pedidos/:id - Actualizar pedido (sin detalles)
router.put("/:id", PedidoController.update);

// PUT /api/pedidos/:id/detalles/reemplazar - Reemplazar todos los detalles de un pedido
router.put("/:id/detalles/reemplazar", PedidoController.replaceDetalles);

// PUT /api/pedidos/detalles/:idDetalle - Actualizar un detalle específico
router.put("/detalles/:idDetalle", PedidoController.updateDetalle);

// PATCH /api/pedidos/:id/estado - Actualizar estado del pedido
router.patch("/:id/estado", PedidoController.updateEstado);

// DELETE /api/pedidos/detalles/:idDetalle - Eliminar un detalle específico
router.delete("/detalles/:idDetalle", PedidoController.deleteDetalle);

// DELETE /api/pedidos/:id - Eliminar pedido y sus detalles
router.delete("/:id", PedidoController.delete);

module.exports = router;
