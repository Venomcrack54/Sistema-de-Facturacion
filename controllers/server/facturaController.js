const FacturaModel = require("../../models/server/facturaModel");

const FacturaController = {
  // GET /api/facturas
  async getAll(req, res) {
    try {
      const facturas = await FacturaModel.getAll();
      res.json({ success: true, data: facturas });
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      res.status(500).json({ success: false, message: "Error al obtener facturas" });
    }
  },

  // GET /api/facturas/:id
  async getById(req, res) {
    try {
      const factura = await FacturaModel.getById(req.params.id);
      if (!factura) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }
      res.json({ success: true, data: factura });
    } catch (error) {
      console.error("Error al obtener factura:", error);
      res.status(500).json({ success: false, message: "Error al obtener factura" });
    }
  },

  // GET /api/facturas/cliente/cedula/:cedula
  async getByClienteCedula(req, res) {
    try {
      const facturas = await FacturaModel.getByClienteCedula(req.params.cedula);
      res.json({ success: true, data: facturas });
    } catch (error) {
      console.error("Error al buscar facturas por cédula:", error);
      res.status(500).json({ success: false, message: "Error al buscar facturas por cédula" });
    }
  },

  // GET /api/facturas/cliente/:idCliente
  async getByCliente(req, res) {
    try {
      const facturas = await FacturaModel.getByCliente(req.params.idCliente);
      res.json({ success: true, data: facturas });
    } catch (error) {
      console.error("Error al obtener facturas del cliente:", error);
      res.status(500).json({ success: false, message: "Error al obtener facturas del cliente" });
    }
  },

  // GET /api/facturas/estado/:estado
  async getByEstado(req, res) {
    try {
      const estadosValidos = ["EMITIDA", "ANULADA", "RECHAZADA", "EN PROCESO"];
      const estado = req.params.estado.toUpperCase();

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: "Estado inválido. Debe ser: EMITIDA, ANULADA, RECHAZADA o EN PROCESO"
        });
      }

      const facturas = await FacturaModel.getByEstado(estado);
      res.json({ success: true, data: facturas });
    } catch (error) {
      console.error("Error al obtener facturas por estado:", error);
      res.status(500).json({ success: false, message: "Error al obtener facturas por estado" });
    }
  },

  // GET /api/facturas/codigo
  async generarCodigo(req, res) {
    try {
      const codigo = await FacturaModel.generarCodigo();
      res.json({ success: true, data: { codigo } });
    } catch (error) {
      console.error("Error al generar código de factura:", error);
      res.status(500).json({ success: false, message: "Error al generar código de factura" });
    }
  },

  // POST /api/facturas
  async create(req, res) {
    try {
      const {
        idCliente, idPago, idPedido, fechaFactura,
        subtotalFactura, valorIva, totalFactura, estadoFactura,
        detalles
      } = req.body;

      if (!idCliente || !idPago || !idPedido || !fechaFactura) {
        return res.status(400).json({
          success: false,
          message: "Cliente, método de pago, pedido y fecha de factura son obligatorios"
        });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "La factura debe tener al menos un detalle"
        });
      }

      for (const d of detalles) {
        if (!d.idProducto || !d.descripcion || d.precio === undefined || !d.cantidad || d.subtotalDetalle === undefined) {
          return res.status(400).json({
            success: false,
            message: "Cada detalle debe tener producto, descripción, precio, cantidad y subtotal"
          });
        }
      }

      const factura = {
        idCliente,
        idPago,
        idPedido,
        fechaFactura,
        subtotalFactura: subtotalFactura || 0,
        valorIva: valorIva || 0,
        totalFactura: totalFactura || 0,
        estadoFactura: estadoFactura || "EN PROCESO"
      };

      const nuevaFactura = await FacturaModel.create(factura, detalles);

      res.status(201).json({
        success: true,
        data: nuevaFactura,
        message: "Factura creada exitosamente"
      });
    } catch (error) {
      console.error("Error al crear factura:", error);
      res.status(500).json({ success: false, message: "Error al crear factura" });
    }
  },

  // PUT /api/facturas/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const facturaExistente = await FacturaModel.getById(id);

      if (!facturaExistente) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      if (facturaExistente.estadoFactura === "ANULADA") {
        return res.status(400).json({
          success: false,
          message: "No se puede modificar una factura anulada"
        });
      }

      const {
        idCliente, idPago, idPedido, fechaFactura,
        subtotalFactura, valorIva, totalFactura, estadoFactura
      } = req.body;

      if (!idCliente || !idPago || !idPedido || !fechaFactura) {
        return res.status(400).json({
          success: false,
          message: "Cliente, método de pago, pedido y fecha de factura son obligatorios"
        });
      }

      const actualizado = await FacturaModel.update(id, {
        idCliente, idPago, idPedido, fechaFactura,
        subtotalFactura, valorIva, totalFactura, estadoFactura
      });

      if (actualizado) {
        res.json({ success: true, message: "Factura actualizada exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo actualizar la factura" });
      }
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      res.status(500).json({ success: false, message: "Error al actualizar factura" });
    }
  },

  // PATCH /api/facturas/:id/estado
  async updateEstado(req, res) {
    try {
      const id = req.params.id;
      const { estado } = req.body;

      const estadosValidos = ["EMITIDA", "ANULADA", "RECHAZADA", "EN PROCESO"];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: "Estado inválido. Debe ser: EMITIDA, ANULADA, RECHAZADA o EN PROCESO"
        });
      }

      const facturaExistente = await FacturaModel.getById(id);
      if (!facturaExistente) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      const actualizado = await FacturaModel.updateEstado(id, estado);

      if (actualizado) {
        res.json({ success: true, message: `Estado de la factura actualizado a ${estado}` });
      } else {
        res.status(400).json({ success: false, message: "No se pudo actualizar el estado de la factura" });
      }
    } catch (error) {
      console.error("Error al actualizar estado de la factura:", error);
      res.status(500).json({ success: false, message: "Error al actualizar estado de la factura" });
    }
  },

  // DELETE /api/facturas/:id
  async delete(req, res) {
    try {
      const id = req.params.id;
      const facturaExistente = await FacturaModel.getById(id);

      if (!facturaExistente) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      const eliminado = await FacturaModel.delete(id);

      if (eliminado) {
        res.json({ success: true, message: "Factura, sus detalles y su historial eliminados exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo eliminar la factura" });
      }
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      res.status(500).json({ success: false, message: "Error al eliminar factura" });
    }
  },

  // ==================== DETALLE FACTURA ====================

  // GET /api/facturas/:id/detalles
  async getDetalles(req, res) {
    try {
      const idFactura = req.params.id;
      const factura = await FacturaModel.getById(idFactura);

      if (!factura) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      const detalles = await FacturaModel.getDetalles(idFactura);
      res.json({ success: true, data: detalles });
    } catch (error) {
      console.error("Error al obtener detalles de la factura:", error);
      res.status(500).json({ success: false, message: "Error al obtener detalles de la factura" });
    }
  },

  // POST /api/facturas/:id/detalles
  async addDetalle(req, res) {
    try {
      const idFactura = req.params.id;
      const factura = await FacturaModel.getById(idFactura);

      if (!factura) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      if (factura.estadoFactura === "ANULADA") {
        return res.status(400).json({
          success: false,
          message: "No se pueden agregar detalles a una factura anulada"
        });
      }

      const { idProducto, descripcion, precio, cantidad, subtotalDetalle } = req.body;

      if (!idProducto || !descripcion || precio === undefined || !cantidad || subtotalDetalle === undefined) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos del detalle son obligatorios"
        });
      }

      const nuevoDetalle = await FacturaModel.addDetalle({
        idProducto,
        idFactura: parseInt(idFactura),
        descripcion,
        precio,
        cantidad,
        subtotalDetalle
      });

      res.status(201).json({
        success: true,
        data: nuevoDetalle,
        message: "Detalle agregado exitosamente"
      });
    } catch (error) {
      console.error("Error al agregar detalle a la factura:", error);
      res.status(500).json({ success: false, message: "Error al agregar detalle a la factura" });
    }
  },

  // PUT /api/facturas/detalles/:idDetalle
  async updateDetalle(req, res) {
    try {
      const idDetalle = req.params.idDetalle;
      const { idProducto, descripcion, precio, cantidad, subtotalDetalle } = req.body;

      if (!idProducto || !descripcion || precio === undefined || !cantidad || subtotalDetalle === undefined) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos del detalle son obligatorios"
        });
      }

      const actualizado = await FacturaModel.updateDetalle(idDetalle, {
        idProducto, descripcion, precio, cantidad, subtotalDetalle
      });

      if (actualizado) {
        res.json({ success: true, message: "Detalle actualizado exitosamente" });
      } else {
        res.status(404).json({ success: false, message: "Detalle no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar detalle de la factura:", error);
      res.status(500).json({ success: false, message: "Error al actualizar detalle de la factura" });
    }
  },

  // DELETE /api/facturas/detalles/:idDetalle
  async deleteDetalle(req, res) {
    try {
      const idDetalle = req.params.idDetalle;
      const eliminado = await FacturaModel.deleteDetalle(idDetalle);

      if (eliminado) {
        res.json({ success: true, message: "Detalle eliminado exitosamente" });
      } else {
        res.status(404).json({ success: false, message: "Detalle no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar detalle de la factura:", error);
      res.status(500).json({ success: false, message: "Error al eliminar detalle de la factura" });
    }
  },

  // PUT /api/facturas/:id/detalles/reemplazar
  async replaceDetalles(req, res) {
    try {
      const idFactura = req.params.id;
      const factura = await FacturaModel.getById(idFactura);

      if (!factura) {
        return res.status(404).json({ success: false, message: "Factura no encontrada" });
      }

      if (factura.estadoFactura === "ANULADA") {
        return res.status(400).json({
          success: false,
          message: "No se pueden reemplazar detalles de una factura anulada"
        });
      }

      const { detalles } = req.body;

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar al menos un detalle"
        });
      }

      const resultado = await FacturaModel.replaceDetalles(parseInt(idFactura), detalles);

      if (resultado) {
        res.json({ success: true, message: "Detalles reemplazados exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudieron reemplazar los detalles" });
      }
    } catch (error) {
      console.error("Error al reemplazar detalles de la factura:", error);
      res.status(500).json({ success: false, message: "Error al reemplazar detalles de la factura" });
    }
  }
};

module.exports = FacturaController;
