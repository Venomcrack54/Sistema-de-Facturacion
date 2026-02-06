/**
 * ClienteModel - Clientes para facturas (registro de compradores)
 * Tabla Cliente. NO confundir con Usuario (login).
 */
const db = require("../../server/config/db");

const ClienteModel = {
  // Obtener todos los clientes activos
  async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM Cliente WHERE estadoCliente = 'ACTIVO' ORDER BY idCliente DESC",
    );
    return rows;
  },

  // Obtener cliente por ID
  async getById(id) {
    const [rows] = await db.query("SELECT * FROM Cliente WHERE idCliente = ?", [
      id,
    ]);
    return rows[0] || null;
  },

  // Buscar cliente por cédula
  async getByCedula(cedula) {
    const [rows] = await db.query("SELECT * FROM Cliente WHERE cedula = ?", [
      cedula,
    ]);
    return rows[0] || null;
  },

  // Verificar si existe un cliente por cédula
  async existsByCedula(cedula) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM Cliente WHERE cedula = ?",
      [cedula],
    );
    return rows[0].total > 0;
  },

  // Crear un nuevo cliente
  async create(cliente) {
    const {
      cedula,
      nombre,
      apellido,
      telefono,
      correo,
      direccion,
      fechaNacimiento,
    } = cliente;
    // Asegurar formato DATETIME para MySQL (YYYY-MM-DD -> YYYY-MM-DD 00:00:00)
    const fechaMySQL =
      fechaNacimiento && fechaNacimiento.length === 10
        ? fechaNacimiento + " 00:00:00"
        : fechaNacimiento;
    const [result] = await db.query(
      `INSERT INTO Cliente (cedula, nombre, apellido, telefono, correo, direccion, fechaNacimiento, estadoCliente)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [cedula, nombre, apellido, telefono, correo, direccion, fechaMySQL],
    );
    return { idCliente: result.insertId, ...cliente, estadoCliente: "ACTIVO" };
  },

  // Actualizar cliente
  async update(id, cliente) {
    const {
      cedula,
      nombre,
      apellido,
      telefono,
      correo,
      direccion,
      fechaNacimiento,
      estadoCliente,
    } = cliente;
    const fechaMySQL =
      fechaNacimiento && fechaNacimiento.length === 10
        ? fechaNacimiento + " 00:00:00"
        : fechaNacimiento;
    const [result] = await db.query(
      `UPDATE Cliente
       SET cedula = ?, nombre = ?, apellido = ?, telefono = ?, correo = ?, direccion = ?, fechaNacimiento = ?, estadoCliente = ?
       WHERE idCliente = ?`,
      [
        cedula,
        nombre,
        apellido,
        telefono,
        correo,
        direccion,
        fechaMySQL,
        estadoCliente || "ACTIVO",
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  // Eliminar cliente (borrado lógico)
  async delete(id) {
    const [result] = await db.query(
      "UPDATE Cliente SET estadoCliente = 'INACTIVO' WHERE idCliente = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar cliente (borrado físico)
  async hardDelete(id) {
    const [result] = await db.query("DELETE FROM Cliente WHERE idCliente = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = ClienteModel;
