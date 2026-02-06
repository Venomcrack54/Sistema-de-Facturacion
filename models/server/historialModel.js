const db = require("../../server/config/db");

const HistorialModel = {
  // Obtener todo el historial
  async getAll() {
    const [rows] = await db.query(
      `SELECT hf.*,
              f.fechaFactura, f.totalFactura, f.estadoFactura,
              u.usuario, u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario
       FROM HistorialFactura hf
       INNER JOIN Factura f ON hf.idFactura = f.idFactura
       INNER JOIN Usuario u ON hf.idUsuario = u.idUsuario
       ORDER BY hf.fechaCambio DESC`,
    );
    return rows;
  },

  // Obtener historial por ID
  async getById(id) {
    const [rows] = await db.query(
      `SELECT hf.*,
              f.fechaFactura, f.totalFactura, f.estadoFactura,
              u.usuario, u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario
       FROM HistorialFactura hf
       INNER JOIN Factura f ON hf.idFactura = f.idFactura
       INNER JOIN Usuario u ON hf.idUsuario = u.idUsuario
       WHERE hf.idHistorial = ?`,
      [id],
    );
    return rows[0] || null;
  },

  // Obtener historial por factura
  async getByFactura(idFactura) {
    const [rows] = await db.query(
      `SELECT hf.*,
              u.usuario, u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario
       FROM HistorialFactura hf
       INNER JOIN Usuario u ON hf.idUsuario = u.idUsuario
       WHERE hf.idFactura = ?
       ORDER BY hf.fechaCambio DESC`,
      [idFactura],
    );
    return rows;
  },

  // Obtener historial por usuario
  async getByUsuario(idUsuario) {
    const [rows] = await db.query(
      `SELECT hf.*,
              f.fechaFactura, f.totalFactura, f.estadoFactura
       FROM HistorialFactura hf
       INNER JOIN Factura f ON hf.idFactura = f.idFactura
       WHERE hf.idUsuario = ?
       ORDER BY hf.fechaCambio DESC`,
      [idUsuario],
    );
    return rows;
  },

  // Obtener historial por rango de fechas
  async getByFechas(fechaInicio, fechaFin) {
    const [rows] = await db.query(
      `SELECT hf.*,
              f.fechaFactura, f.totalFactura, f.estadoFactura,
              u.usuario, u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario
       FROM HistorialFactura hf
       INNER JOIN Factura f ON hf.idFactura = f.idFactura
       INNER JOIN Usuario u ON hf.idUsuario = u.idUsuario
       WHERE hf.fechaCambio BETWEEN ? AND ?
       ORDER BY hf.fechaCambio DESC`,
      [fechaInicio, fechaFin],
    );
    return rows;
  },

  // Crear un registro de historial
  async create(historial) {
    const { idFactura, idUsuario, estadoAnterior, estadoNuevo, motivo } =
      historial;
    const fechaCambio = new Date();
    const [result] = await db.query(
      `INSERT INTO HistorialFactura (idFactura, idUsuario, estadoAnterior, estadoNuevo, fechaCambio, motivo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        idFactura,
        idUsuario,
        estadoAnterior,
        estadoNuevo,
        fechaCambio,
        motivo || null,
      ],
    );
    return {
      idHistorial: result.insertId,
      idFactura,
      idUsuario,
      estadoAnterior,
      estadoNuevo,
      fechaCambio,
      motivo: motivo || null,
    };
  },

  // Eliminar un registro de historial
  async delete(id) {
    const [result] = await db.query(
      "DELETE FROM HistorialFactura WHERE idHistorial = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar todo el historial de una factura
  async deleteByFactura(idFactura) {
    const [result] = await db.query(
      "DELETE FROM HistorialFactura WHERE idFactura = ?",
      [idFactura],
    );
    return result.affectedRows;
  },

  // Eliminar todo el historial de un usuario
  async deleteByUsuario(idUsuario) {
    const [result] = await db.query(
      "DELETE FROM HistorialFactura WHERE idUsuario = ?",
      [idUsuario],
    );
    return result.affectedRows;
  },
};

module.exports = HistorialModel;
