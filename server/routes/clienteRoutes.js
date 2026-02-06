/**
 * Rutas API para CLIENTE (Registro para facturas)
 * Clientes = quienes compran, se usan en facturas. NO confundir con Usuario.
 */
const express = require("express");
const router = express.Router();
const ClienteController = require("../../controllers/server/clienteController");

// GET /api/clientes - Obtener todos los clientes activos
router.get("/", ClienteController.getAll);

// GET /api/clientes/existe/:cedula - Verificar si existe un cliente por cédula
router.get("/existe/:cedula", ClienteController.existsByCedula);

// GET /api/clientes/cedula/:cedula - Buscar cliente por cédula
router.get("/cedula/:cedula", ClienteController.getByCedula);

// GET /api/clientes/:id - Obtener cliente por ID
router.get("/:id", ClienteController.getById);

// POST /api/clientes - Crear un nuevo cliente
router.post("/", ClienteController.create);

// PUT /api/clientes/:id - Actualizar cliente
router.put("/:id", ClienteController.update);

// DELETE /api/clientes/hard/:id - Borrado físico
router.delete("/hard/:id", ClienteController.hardDelete);

// DELETE /api/clientes/:id - Borrado lógico (desactivar)
router.delete("/:id", ClienteController.delete);

module.exports = router;
