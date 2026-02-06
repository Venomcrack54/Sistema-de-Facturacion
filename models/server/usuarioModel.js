/**
 * UsuarioModel - Usuarios para LOGIN (acceso al sistema)
 * Tabla Usuario. NO confundir con Cliente (facturas).
 */
const db = require("../../server/config/db");

const UsuarioModel = {
  // Obtener todos los usuarios activos
  async getAll() {
    const [rows] = await db.query(
      "SELECT idUsuario, usuario, nombre, apellido, rol, estadoUsuario FROM Usuario WHERE estadoUsuario = 'ACTIVO' ORDER BY idUsuario DESC",
    );
    return rows;
  },

  // Obtener usuario por ID
  async getById(id) {
    const [rows] = await db.query(
      "SELECT idUsuario, usuario, nombre, apellido, rol, estadoUsuario FROM Usuario WHERE idUsuario = ?",
      [id],
    );
    return rows[0] || null;
  },

  // Buscar usuario por nombre de usuario
  async getByUsuario(usuario) {
    const [rows] = await db.query("SELECT * FROM Usuario WHERE usuario = ?", [
      usuario,
    ]);
    return rows[0] || null;
  },

  // Verificar si existe un usuario por nombre de usuario
  async existsByUsuario(usuario) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM Usuario WHERE usuario = ?",
      [usuario],
    );
    return rows[0].total > 0;
  },

  // Login: buscar usuario por nombre de usuario y contraseña
  async login(usuario, contrasena) {
    const [rows] = await db.query(
      "SELECT idUsuario, usuario, nombre, apellido, rol, estadoUsuario FROM Usuario WHERE usuario = ? AND contrasena = ? AND estadoUsuario = 'ACTIVO'",
      [usuario, contrasena],
    );
    return rows[0] || null;
  },

  // Crear un nuevo usuario
  async create(usuario) {
    const {
      usuario: nombreUsuario,
      contrasena,
      nombre,
      apellido,
      rol,
    } = usuario;
    const [result] = await db.query(
      `INSERT INTO Usuario (usuario, contrasena, nombre, apellido, rol, estadoUsuario)
       VALUES (?, ?, ?, ?, ?, 'ACTIVO')`,
      [nombreUsuario, contrasena, nombre, apellido, rol],
    );
    return {
      idUsuario: result.insertId,
      usuario: nombreUsuario,
      nombre,
      apellido,
      rol,
      estadoUsuario: "ACTIVO",
    };
  },

  // Actualizar usuario
  async update(id, usuario) {
    const {
      usuario: nombreUsuario,
      contrasena,
      nombre,
      apellido,
      rol,
      estadoUsuario,
    } = usuario;

    // Si se envía contraseña, actualizarla también
    if (contrasena) {
      const [result] = await db.query(
        `UPDATE Usuario
         SET usuario = ?, contrasena = ?, nombre = ?, apellido = ?, rol = ?, estadoUsuario = ?
         WHERE idUsuario = ?`,
        [
          nombreUsuario,
          contrasena,
          nombre,
          apellido,
          rol,
          estadoUsuario || "ACTIVO",
          id,
        ],
      );
      return result.affectedRows > 0;
    }

    // Sin contraseña, no modificarla
    const [result] = await db.query(
      `UPDATE Usuario
       SET usuario = ?, nombre = ?, apellido = ?, rol = ?, estadoUsuario = ?
       WHERE idUsuario = ?`,
      [nombreUsuario, nombre, apellido, rol, estadoUsuario || "ACTIVO", id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar usuario (borrado lógico)
  async delete(id) {
    const [result] = await db.query(
      "UPDATE Usuario SET estadoUsuario = 'INACTIVO' WHERE idUsuario = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar usuario (borrado físico)
  async hardDelete(id) {
    const [result] = await db.query("DELETE FROM Usuario WHERE idUsuario = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = UsuarioModel;
