const express = require("express");
const router = express.Router();
const ProductoController = require("../../controllers/server/productoController");

// GET /api/productos - Obtener todos los productos activos
router.get("/", ProductoController.getAll);

// GET /api/productos/todos - Obtener todos los productos (incluidos inactivos)
router.get("/todos", ProductoController.getAllIncludingInactive);

// GET /api/productos/buscar/:nombre - Buscar productos por nombre
router.get("/buscar/:nombre", ProductoController.getByNombre);

// GET /api/productos/categoria/:categoria - Buscar productos por categoría
router.get("/categoria/:categoria", ProductoController.getByCategoria);

// GET /api/productos/:id - Obtener producto por ID
router.get("/:id", ProductoController.getById);

// POST /api/productos - Crear un nuevo producto
router.post("/", ProductoController.create);

// PUT /api/productos/:id - Actualizar producto
router.put("/:id", ProductoController.update);

// DELETE /api/productos/hard/:id - Borrado físico
router.delete("/hard/:id", ProductoController.hardDelete);

// DELETE /api/productos/:id - Borrado lógico (desactivar)
router.delete("/:id", ProductoController.delete);

module.exports = router;
