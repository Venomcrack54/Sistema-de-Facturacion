/**
 * UsuarioController - Backend para USUARIO (LOGIN / Acceso al sistema)
 * Los usuarios son empleados/administradores que inician sesión.
 * NO confundir con Cliente (registro para facturas).
 */
const UsuarioModel = require("../../models/server/usuarioModel");

const UsuarioController = {
  // GET /api/usuarios
  async getAll(req, res) {
    try {
      const usuarios = await UsuarioModel.getAll();
      res.json({ success: true, data: usuarios });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener usuarios" });
    }
  },

  // GET /api/usuarios/:id
  async getById(req, res) {
    try {
      const usuario = await UsuarioModel.getById(req.params.id);
      if (!usuario) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener usuario" });
    }
  },

  // GET /api/usuarios/buscar/:usuario
  async getByUsuario(req, res) {
    try {
      const usuario = await UsuarioModel.getByUsuario(req.params.usuario);
      if (!usuario) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
      // No enviar la contraseña
      const { contrasena, ...sinPassword } = usuario;
      res.json({ success: true, data: sinPassword });
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al buscar usuario" });
    }
  },

  // GET /api/usuarios/existe/:usuario
  async existsByUsuario(req, res) {
    try {
      const existe = await UsuarioModel.existsByUsuario(req.params.usuario);
      res.json({ success: true, data: { existe } });
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al verificar usuario" });
    }
  },

  // POST /api/usuarios/login
  async login(req, res) {
    try {
      const { usuario, contrasena } = req.body;

      if (!usuario || !contrasena) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Usuario y contraseña son obligatorios",
          });
      }

      const usuarioEncontrado = await UsuarioModel.login(usuario, contrasena);

      if (!usuarioEncontrado) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Credenciales inválidas o usuario inactivo",
          });
      }

      res.json({
        success: true,
        data: usuarioEncontrado,
        message: "Login exitoso",
      });
    } catch (error) {
      console.error("Error en login:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al iniciar sesión" });
    }
  },

  // POST /api/usuarios
  async create(req, res) {
    try {
      const { usuario, contrasena, nombre, apellido, rol } = req.body;

      // Validaciones básicas del servidor
      if (!usuario || !contrasena || !nombre || !apellido || !rol) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Todos los campos son obligatorios",
          });
      }

      // Validar que el rol sea válido
      const rolesValidos = ["ADMINISTRADOR", "FACTURACION", "CONTABILIDAD"];
      if (!rolesValidos.includes(rol)) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Rol inválido. Debe ser: ADMINISTRADOR, FACTURACION o CONTABILIDAD",
          });
      }

      // Verificar si ya existe
      const existe = await UsuarioModel.existsByUsuario(usuario);
      if (existe) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Ya existe un usuario con ese nombre de usuario",
          });
      }

      const nuevoUsuario = await UsuarioModel.create({
        usuario,
        contrasena,
        nombre,
        apellido,
        rol,
      });

      res
        .status(201)
        .json({
          success: true,
          data: nuevoUsuario,
          message: "Usuario creado exitosamente",
        });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear usuario" });
    }
  },

  // PUT /api/usuarios/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const usuarioExistente = await UsuarioModel.getById(id);

      if (!usuarioExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      const { usuario, contrasena, nombre, apellido, rol, estadoUsuario } =
        req.body;

      if (!usuario || !nombre || !apellido || !rol) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Los campos usuario, nombre, apellido y rol son obligatorios",
          });
      }

      const rolesValidos = ["ADMINISTRADOR", "FACTURACION", "CONTABILIDAD"];
      if (!rolesValidos.includes(rol)) {
        return res
          .status(400)
          .json({ success: false, message: "Rol inválido" });
      }

      const actualizado = await UsuarioModel.update(id, {
        usuario,
        contrasena,
        nombre,
        apellido,
        rol,
        estadoUsuario,
      });

      if (actualizado) {
        res.json({
          success: true,
          message: "Usuario actualizado exitosamente",
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudo actualizar el usuario",
          });
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar usuario" });
    }
  },

  // DELETE /api/usuarios/:id (borrado lógico)
  async delete(req, res) {
    try {
      const id = req.params.id;
      const usuarioExistente = await UsuarioModel.getById(id);

      if (!usuarioExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      const eliminado = await UsuarioModel.delete(id);

      if (eliminado) {
        res.json({
          success: true,
          message: "Usuario desactivado exitosamente",
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudo desactivar el usuario",
          });
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar usuario" });
    }
  },

  // DELETE /api/usuarios/hard/:id (borrado físico)
  async hardDelete(req, res) {
    try {
      const id = req.params.id;
      const eliminado = await UsuarioModel.hardDelete(id);

      if (eliminado) {
        res.json({
          success: true,
          message: "Usuario eliminado permanentemente",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar usuario permanentemente:", error);
      res
        .status(500)
        .json({
          success: false,
          message:
            "Error al eliminar usuario. Puede tener registros asociados.",
        });
    }
  },
};

module.exports = UsuarioController;
