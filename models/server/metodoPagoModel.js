const db = require("../../server/config/db");

const MetodoPagoModel = {
  // Asegurar métodos por defecto (útil cuando la tabla está vacía)
  // Nota: si el ENUM de MySQL no incluye "Cheque", la inserción de Cheque fallará y se ignora.
  async ensureDefaults() {
    const defaults = ["Efectivo", "Tarjeta", "Transferencia", "Cheque"];

    for (const tipoPago of defaults) {
      try {
        const existe = await MetodoPagoModel.existsByTipo(tipoPago);
        if (!existe) {
          await MetodoPagoModel.create({ tipoPago, disponible: true });
        }
      } catch (err) {
        // No romper el servidor por un método no soportado por ENUM
        console.warn(
          `WARN MetodoPagoModel.ensureDefaults: no se pudo asegurar '${tipoPago}':`,
          err.message,
        );
      }
    }
  },

  // Obtener todos los métodos de pago
  async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM MetodoPago ORDER BY idPago ASC",
    );
    return rows;
  },

  // Obtener solo los métodos de pago disponibles
  async getAvailable() {
    const [rows] = await db.query(
      "SELECT * FROM MetodoPago WHERE disponible = 1 ORDER BY idPago ASC",
    );
    return rows;
  },

  // Obtener método de pago por ID
  async getById(id) {
    const [rows] = await db.query("SELECT * FROM MetodoPago WHERE idPago = ?", [
      id,
    ]);
    return rows[0] || null;
  },

  // Buscar método de pago por tipo
  async getByTipo(tipoPago) {
    const [rows] = await db.query(
      "SELECT * FROM MetodoPago WHERE tipoPago = ?",
      [tipoPago],
    );
    return rows[0] || null;
  },

  // Verificar si existe un método de pago por tipo
  async existsByTipo(tipoPago) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM MetodoPago WHERE tipoPago = ?",
      [tipoPago],
    );
    return rows[0].total > 0;
  },

  // Crear un nuevo método de pago
  async create(metodoPago) {
    const { tipoPago, disponible } = metodoPago;
    const [result] = await db.query(
      "INSERT INTO MetodoPago (tipoPago, disponible) VALUES (?, ?)",
      [tipoPago, disponible ? 1 : 0],
    );
    return {
      idPago: result.insertId,
      tipoPago,
      disponible: disponible ? 1 : 0,
    };
  },

  // Actualizar método de pago
  async update(id, metodoPago) {
    const { tipoPago, disponible } = metodoPago;
    const [result] = await db.query(
      "UPDATE MetodoPago SET tipoPago = ?, disponible = ? WHERE idPago = ?",
      [tipoPago, disponible ? 1 : 0, id],
    );
    return result.affectedRows > 0;
  },

  // Cambiar disponibilidad
  async toggleDisponible(id) {
    const [result] = await db.query(
      "UPDATE MetodoPago SET disponible = NOT disponible WHERE idPago = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar método de pago (borrado físico)
  async delete(id) {
    const [result] = await db.query("DELETE FROM MetodoPago WHERE idPago = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = MetodoPagoModel;
