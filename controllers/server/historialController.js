const HistorialModel = require("../../models/server/historialModel");

const HistorialController = {
  // GET /api/historial
  async getAll(req, res) {
    try {
      const historial = await HistorialModel.getAll();
      res.json({ success: true, data: historial });
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ success: false, message: "Error al obtener historial" });
    }
  },

  // GET /api/historial/:id
  async getById(req, res) {
    try {
      const registro = await HistorialModel.getById(req.params.id);
      if (!registro) {
        return res.status(404).json({ success: false, message: "Registro de historial no encontrado" });
      }
      res.json({ success: true, data: registro });
    } catch (error) {
      console.error("Error al obtener registro de historial:", error);
      res.status(500).json({ success: false, message: "Error al obtener registro de historial" });
    }
  },

  // GET /api/historial/factura/:idFactura
  async getByFactura(req, res) {
    try {
      const historial = await HistorialModel.getByFactura(req.params.idFactura);
      res.json({ success: true, data: historial });
    } catch (error) {
      console.error("Error al obtener historial de la factura:", error);
      res.status(500).json({ success: false, message: "Error al obtener historial de la factura" });
    }
  },

  // GET /api/historial/usuario/:idUsuario
  async getByUsuario(req, res) {
    try {
      const historial = await HistorialModel.getByUsuario(req.params.idUsuario);
      res.json({ success: true, data: historial });
    } catch (error) {
      console.error("Error al obtener historial del usuario:", error);
      res.status(500).json({ success: false, message: "Error al obtener historial del usuario" });
    }
  },

  // GET /api/historial/fechas?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
  async getByFechas(req, res) {
    try {
      const { inicio, fin } = req.query;

      if (!inicio || !fin) {
        return res.status(400).json({
          success: false,
          message: "Se requieren los parámetros 'inicio' y 'fin' en formato YYYY-MM-DD"
        });
      }

      const historial = await HistorialModel.getByFechas(inicio, fin);
      res.json({ success: true, data: historial });
    } catch (error) {
      console.error("Error al obtener historial por fechas:", error);
      res.status(500).json({ success: false, message: "Error al obtener historial por fechas" });
    }
  },

  // POST /api/historial
  async create(req, res) {
    try {
      const { idFactura, idUsuario, estadoAnterior, estadoNuevo, motivo } = req.body;

      // Validaciones básicas del servidor
      if (!idFactura || !idUsuario || !estadoAnterior || !estadoNuevo) {
        return res.status(400).json({
          success: false,
          message: "Los campos idFactura, idUsuario, estadoAnterior y estadoNuevo son obligatorios"
        });
      }

      // Validar que los estados sean válidos
      const estadosValidos = ["EMITIDA", "ANULADA", "RECHAZADA", "EN PROCESO"];
      if (!estadosValidos.includes(estadoAnterior)) {
        return res.status(400).json({
          success: false,
          message: "Estado anterior inválido. Debe ser: EMITIDA, ANULADA, RECHAZADA o EN PROCESO"
        });
      }

      if (!estadosValidos.includes(estadoNuevo)) {
        return res.status(400).json({
          success: false,
          message: "Estado nuevo inválido. Debe ser: EMITIDA, ANULADA, RECHAZADA o EN PROCESO"
        });
      }

      const nuevoRegistro = await HistorialModel.create({
        idFactura,
        idUsuario,
        estadoAnterior,
        estadoNuevo,
        motivo: motivo || null
      });

      res.status(201).json({
        success: true,
        data: nuevoRegistro,
        message: "Registro de historial creado exitosamente"
      });
    } catch (error) {
      console.error("Error al crear registro de historial:", error);
      res.status(500).json({ success: false, message: "Error al crear registro de historial" });
    }
  },

  // DELETE /api/historial/:id
  async delete(req, res) {
    try {
      const id = req.params.id;
      const registroExistente = await HistorialModel.getById(id);

      if (!registroExistente) {
        return res.status(404).json({ success: false, message: "Registro de historial no encontrado" });
      }

      const eliminado = await HistorialModel.delete(id);

      if (eliminado) {
        res.json({ success: true, message: "Registro de historial eliminado exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo eliminar el registro de historial" });
      }
    } catch (error) {
      console.error("Error al eliminar registro de historial:", error);
      res.status(500).json({ success: false, message: "Error al eliminar registro de historial" });
    }
  },

  // DELETE /api/historial/factura/:idFactura
  async deleteByFactura(req, res) {
    try {
      const idFactura = req.params.idFactura;
      const cantidad = await HistorialModel.deleteByFactura(idFactura);

      res.json({
        success: true,
        message: `${cantidad} registro(s) de historial eliminado(s) para la factura ${idFactura}`
      });
    } catch (error) {
      console.error("Error al eliminar historial de la factura:", error);
      res.status(500).json({ success: false, message: "Error al eliminar historial de la factura" });
    }
  },

  // DELETE /api/historial/usuario/:idUsuario
  async deleteByUsuario(req, res) {
    try {
      const idUsuario = req.params.idUsuario;
      const cantidad = await HistorialModel.deleteByUsuario(idUsuario);

      res.json({
        success: true,
        message: `${cantidad} registro(s) de historial eliminado(s) para el usuario ${idUsuario}`
      });
    } catch (error) {
      console.error("Error al eliminar historial del usuario:", error);
      res.status(500).json({ success: false, message: "Error al eliminar historial del usuario" });
    }
  }
};

module.exports = HistorialController;
