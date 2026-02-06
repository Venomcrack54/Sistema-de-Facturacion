/**
 * Rutas API para USUARIO (Login / Acceso al sistema)
 * Usuarios = empleados que inician sesión. NO confundir con Cliente.
 */
const express = require("express");
const router = express.Router();
const UsuarioController = require("../../controllers/server/usuarioController");

// POST /api/usuarios/login - Iniciar sesión
router.post("/login", UsuarioController.login);

// GET /api/usuarios - Obtener todos los usuarios activos
router.get("/", UsuarioController.getAll);

// GET /api/usuarios/existe/:usuario - Verificar si existe un usuario
router.get("/existe/:usuario", UsuarioController.existsByUsuario);

// GET /api/usuarios/buscar/:usuario - Buscar usuario por nombre de usuario
router.get("/buscar/:usuario", UsuarioController.getByUsuario);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get("/:id", UsuarioController.getById);

// POST /api/usuarios - Crear un nuevo usuario
router.post("/", UsuarioController.create);

// PUT /api/usuarios/:id - Actualizar usuario
router.put("/:id", UsuarioController.update);

// DELETE /api/usuarios/hard/:id - Borrado físico
router.delete("/hard/:id", UsuarioController.hardDelete);

// DELETE /api/usuarios/:id - Borrado lógico (desactivar)
router.delete("/:id", UsuarioController.delete);

module.exports = router;
