const MetodoPagoModel = require("../../models/server/metodoPagoModel");

const MetodoPagoController = {
  // GET /api/metodo-pago
  async getAll(req, res) {
    try {
      const metodos = await MetodoPagoModel.getAll();
      res.json({ success: true, data: metodos });
    } catch (error) {
      console.error("Error al obtener métodos de pago:", error);
      res.status(500).json({ success: false, message: "Error al obtener métodos de pago" });
    }
  },

  // GET /api/metodo-pago/disponibles
  async getAvailable(req, res) {
    try {
      const metodos = await MetodoPagoModel.getAvailable();
      res.json({ success: true, data: metodos });
    } catch (error) {
      console.error("Error al obtener métodos de pago disponibles:", error);
      res.status(500).json({ success: false, message: "Error al obtener métodos de pago disponibles" });
    }
  },

  // GET /api/metodo-pago/:id
  async getById(req, res) {
    try {
      const metodo = await MetodoPagoModel.getById(req.params.id);
      if (!metodo) {
        return res.status(404).json({ success: false, message: "Método de pago no encontrado" });
      }
      res.json({ success: true, data: metodo });
    } catch (error) {
      console.error("Error al obtener método de pago:", error);
      res.status(500).json({ success: false, message: "Error al obtener método de pago" });
    }
  },

  // GET /api/metodo-pago/tipo/:tipoPago
  async getByTipo(req, res) {
    try {
      const metodo = await MetodoPagoModel.getByTipo(req.params.tipoPago);
      if (!metodo) {
        return res.status(404).json({ success: false, message: "Método de pago no encontrado" });
      }
      res.json({ success: true, data: metodo });
    } catch (error) {
      console.error("Error al buscar método de pago por tipo:", error);
      res.status(500).json({ success: false, message: "Error al buscar método de pago" });
    }
  },

  // POST /api/metodo-pago
  async create(req, res) {
    try {
      const { tipoPago, disponible } = req.body;

      if (!tipoPago) {
        return res.status(400).json({ success: false, message: "El tipo de pago es obligatorio" });
      }

      const tiposValidos = ["Efectivo", "Tarjeta", "Transferencia", "Cheque"];
      if (!tiposValidos.includes(tipoPago)) {
        return res.status(400).json({
          success: false,
          message:
            "Tipo de pago inválido. Debe ser: Efectivo, Tarjeta, Transferencia o Cheque",
        });
      }

      const existe = await MetodoPagoModel.existsByTipo(tipoPago);
      if (existe) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un método de pago con ese tipo"
        });
      }

      const nuevoMetodo = await MetodoPagoModel.create({
        tipoPago,
        disponible: disponible !== undefined ? disponible : true
      });

      res.status(201).json({
        success: true,
        data: nuevoMetodo,
        message: "Método de pago creado exitosamente"
      });
    } catch (error) {
      console.error("Error al crear método de pago:", error);
      res.status(500).json({ success: false, message: "Error al crear método de pago" });
    }
  },

  // PUT /api/metodo-pago/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const metodoExistente = await MetodoPagoModel.getById(id);

      if (!metodoExistente) {
        return res.status(404).json({ success: false, message: "Método de pago no encontrado" });
      }

      const { tipoPago, disponible } = req.body;

      if (!tipoPago) {
        return res.status(400).json({ success: false, message: "El tipo de pago es obligatorio" });
      }

      const tiposValidos = ["Efectivo", "Tarjeta", "Transferencia", "Cheque"];
      if (!tiposValidos.includes(tipoPago)) {
        return res.status(400).json({
          success: false,
          message:
            "Tipo de pago inválido. Debe ser: Efectivo, Tarjeta, Transferencia o Cheque",
        });
      }

      const actualizado = await MetodoPagoModel.update(id, {
        tipoPago,
        disponible: disponible !== undefined ? disponible : true
      });

      if (actualizado) {
        res.json({ success: true, message: "Método de pago actualizado exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo actualizar el método de pago" });
      }
    } catch (error) {
      console.error("Error al actualizar método de pago:", error);
      res.status(500).json({ success: false, message: "Error al actualizar método de pago" });
    }
  },

  // PATCH /api/metodo-pago/:id/toggle
  async toggleDisponible(req, res) {
    try {
      const id = req.params.id;
      const metodoExistente = await MetodoPagoModel.getById(id);

      if (!metodoExistente) {
        return res.status(404).json({ success: false, message: "Método de pago no encontrado" });
      }

      const actualizado = await MetodoPagoModel.toggleDisponible(id);

      if (actualizado) {
        const nuevoEstado = !metodoExistente.disponible;
        res.json({
          success: true,
          message: `Método de pago ${nuevoEstado ? "habilitado" : "deshabilitado"} exitosamente`,
          data: { disponible: nuevoEstado }
        });
      } else {
        res.status(400).json({ success: false, message: "No se pudo cambiar la disponibilidad" });
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      res.status(500).json({ success: false, message: "Error al cambiar disponibilidad del método de pago" });
    }
  },

  // DELETE /api/metodo-pago/:id
  async delete(req, res) {
    try {
      const id = req.params.id;
      const metodoExistente = await MetodoPagoModel.getById(id);

      if (!metodoExistente) {
        return res.status(404).json({ success: false, message: "Método de pago no encontrado" });
      }

      const eliminado = await MetodoPagoModel.delete(id);

      if (eliminado) {
        res.json({ success: true, message: "Método de pago eliminado exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo eliminar el método de pago" });
      }
    } catch (error) {
      console.error("Error al eliminar método de pago:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar método de pago. Puede tener facturas asociadas."
      });
    }
  }
};

module.exports = MetodoPagoController;
