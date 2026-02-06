const PedidoModel = require("../../models/server/pedidoModel");

const PedidoController = {
  // GET /api/pedidos
  async getAll(req, res) {
    try {
      const pedidos = await PedidoModel.getAll();
      res.json({ success: true, data: pedidos });
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener pedidos" });
    }
  },

  // GET /api/pedidos/:id
  async getById(req, res) {
    try {
      const pedido = await PedidoModel.getById(req.params.id);
      if (!pedido) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }
      res.json({ success: true, data: pedido });
    } catch (error) {
      console.error("Error al obtener pedido:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener pedido" });
    }
  },

  // GET /api/pedidos/cliente/:idCliente
  async getByCliente(req, res) {
    try {
      const pedidos = await PedidoModel.getByCliente(req.params.idCliente);
      res.json({ success: true, data: pedidos });
    } catch (error) {
      console.error("Error al obtener pedidos del cliente:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener pedidos del cliente",
        });
    }
  },

  // GET /api/pedidos/estado/:estado
  async getByEstado(req, res) {
    try {
      const estadosValidos = [
        "PENDIENTE",
        "CONFIRMADO",
        "CANCELADO",
        "FACTURADO",
      ];
      const estado = req.params.estado.toUpperCase();

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message:
            "Estado inválido. Debe ser: PENDIENTE, CONFIRMADO, CANCELADO o FACTURADO",
        });
      }

      const pedidos = await PedidoModel.getByEstado(estado);
      res.json({ success: true, data: pedidos });
    } catch (error) {
      console.error("Error al obtener pedidos por estado:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener pedidos por estado",
        });
    }
  },

  // GET /api/pedidos/confirmados
  async getConfirmados(req, res) {
    try {
      const pedidos = await PedidoModel.getConfirmados();
      res.json({ success: true, data: pedidos });
    } catch (error) {
      console.error("Error al obtener pedidos confirmados:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener pedidos confirmados",
        });
    }
  },

  // POST /api/pedidos
  async create(req, res) {
    try {
      const {
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido,
        valorDescuento,
        totalPedido,
        estadoPedido,
        detalles,
      } = req.body;

      if (!idCliente || !fechaPedido || !fechaEntrega) {
        return res.status(400).json({
          success: false,
          message:
            "Cliente, fecha de pedido y fecha de entrega son obligatorios",
        });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El pedido debe tener al menos un detalle",
        });
      }

      for (const d of detalles) {
        if (
          !d.idProducto ||
          !d.descripcion ||
          !d.precio ||
          !d.cantidad ||
          !d.subtotalDetalle
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cada detalle debe tener producto, descripción, precio, cantidad y subtotal",
          });
        }
      }

      const pedido = {
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido: subtotalPedido || 0,
        valorDescuento: valorDescuento || 0,
        totalPedido: totalPedido || 0,
        estadoPedido: estadoPedido || "PENDIENTE",
      };

      const nuevoPedido = await PedidoModel.create(pedido, detalles);

      res.status(201).json({
        success: true,
        data: nuevoPedido,
        message: "Pedido creado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear pedido" });
    }
  },

  // PUT /api/pedidos/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const pedidoExistente = await PedidoModel.getById(id);

      if (!pedidoExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      if (pedidoExistente.estadoPedido === "FACTURADO") {
        return res.status(400).json({
          success: false,
          message: "No se puede modificar un pedido que ya fue facturado",
        });
      }

      const {
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido,
        valorDescuento,
        totalPedido,
        estadoPedido,
      } = req.body;

      if (!idCliente || !fechaPedido || !fechaEntrega) {
        return res.status(400).json({
          success: false,
          message:
            "Cliente, fecha de pedido y fecha de entrega son obligatorios",
        });
      }

      const actualizado = await PedidoModel.update(id, {
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido,
        valorDescuento,
        totalPedido,
        estadoPedido,
      });

      if (actualizado) {
        res.json({ success: true, message: "Pedido actualizado exitosamente" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "No se pudo actualizar el pedido" });
      }
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar pedido" });
    }
  },

  // PATCH /api/pedidos/:id/estado
  async updateEstado(req, res) {
    try {
      const id = req.params.id;
      const { estado } = req.body;

      const estadosValidos = [
        "PENDIENTE",
        "CONFIRMADO",
        "CANCELADO",
        "FACTURADO",
      ];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message:
            "Estado inválido. Debe ser: PENDIENTE, CONFIRMADO, CANCELADO o FACTURADO",
        });
      }

      const pedidoExistente = await PedidoModel.getById(id);
      if (!pedidoExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      if (
        pedidoExistente.estadoPedido === "FACTURADO" &&
        estado !== "FACTURADO"
      ) {
        return res.status(400).json({
          success: false,
          message: "No se puede cambiar el estado de un pedido ya facturado",
        });
      }

      const actualizado = await PedidoModel.updateEstado(id, estado);

      if (actualizado) {
        res.json({
          success: true,
          message: `Estado del pedido actualizado a ${estado}`,
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudo actualizar el estado del pedido",
          });
      }
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al actualizar estado del pedido",
        });
    }
  },

  // DELETE /api/pedidos/:id
  async delete(req, res) {
    try {
      const id = req.params.id;
      const pedidoExistente = await PedidoModel.getById(id);

      if (!pedidoExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      // En vez de bloquear por estado, verificamos si existen facturas que referencien al pedido.
      // Si la factura ya fue eliminada, el pedido se puede borrar aunque tenga estado FACTURADO.
      const facturasAsociadas = await PedidoModel.countFacturasByPedido(id);
      if (facturasAsociadas > 0) {
        return res.status(400).json({
          success: false,
          message:
            "No se puede eliminar un pedido que tiene facturas asociadas. Elimine las facturas primero.",
        });
      }

      const eliminado = await PedidoModel.delete(id);

      if (eliminado) {
        res.json({
          success: true,
          message: "Pedido y sus detalles eliminados exitosamente",
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "No se pudo eliminar el pedido" });
      }
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar pedido. Puede tener facturas asociadas.",
      });
    }
  },

  // ==================== DETALLE PEDIDO ====================

  // GET /api/pedidos/:id/detalles
  async getDetalles(req, res) {
    try {
      const idPedido = req.params.id;
      const pedido = await PedidoModel.getById(idPedido);

      if (!pedido) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      const detalles = await PedidoModel.getDetalles(idPedido);
      res.json({ success: true, data: detalles });
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener detalles del pedido",
        });
    }
  },

  // POST /api/pedidos/:id/detalles
  async addDetalle(req, res) {
    try {
      const idPedido = req.params.id;
      const pedido = await PedidoModel.getById(idPedido);

      if (!pedido) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      if (pedido.estadoPedido === "FACTURADO") {
        return res.status(400).json({
          success: false,
          message: "No se pueden agregar detalles a un pedido facturado",
        });
      }

      const { idProducto, descripcion, precio, cantidad, subtotalDetalle } =
        req.body;

      if (
        !idProducto ||
        !descripcion ||
        !precio ||
        !cantidad ||
        !subtotalDetalle
      ) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos del detalle son obligatorios",
        });
      }

      const nuevoDetalle = await PedidoModel.addDetalle({
        idProducto,
        idPedido: parseInt(idPedido),
        descripcion,
        precio,
        cantidad,
        subtotalDetalle,
      });

      res.status(201).json({
        success: true,
        data: nuevoDetalle,
        message: "Detalle agregado exitosamente",
      });
    } catch (error) {
      console.error("Error al agregar detalle al pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al agregar detalle al pedido",
        });
    }
  },

  // PUT /api/pedidos/detalles/:idDetalle
  async updateDetalle(req, res) {
    try {
      const idDetalle = req.params.idDetalle;
      const { idProducto, descripcion, precio, cantidad, subtotalDetalle } =
        req.body;

      if (
        !idProducto ||
        !descripcion ||
        !precio ||
        !cantidad ||
        !subtotalDetalle
      ) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos del detalle son obligatorios",
        });
      }

      const actualizado = await PedidoModel.updateDetalle(idDetalle, {
        idProducto,
        descripcion,
        precio,
        cantidad,
        subtotalDetalle,
      });

      if (actualizado) {
        res.json({
          success: true,
          message: "Detalle actualizado exitosamente",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Detalle no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar detalle del pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al actualizar detalle del pedido",
        });
    }
  },

  // DELETE /api/pedidos/detalles/:idDetalle
  async deleteDetalle(req, res) {
    try {
      const idDetalle = req.params.idDetalle;
      const eliminado = await PedidoModel.deleteDetalle(idDetalle);

      if (eliminado) {
        res.json({ success: true, message: "Detalle eliminado exitosamente" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Detalle no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar detalle del pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al eliminar detalle del pedido",
        });
    }
  },

  // PUT /api/pedidos/:id/detalles/reemplazar
  async replaceDetalles(req, res) {
    try {
      const idPedido = req.params.id;
      const pedido = await PedidoModel.getById(idPedido);

      if (!pedido) {
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      }

      if (pedido.estadoPedido === "FACTURADO") {
        return res.status(400).json({
          success: false,
          message: "No se pueden reemplazar detalles de un pedido facturado",
        });
      }

      const { detalles } = req.body;

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar al menos un detalle",
        });
      }

      const resultado = await PedidoModel.replaceDetalles(
        parseInt(idPedido),
        detalles,
      );

      if (resultado) {
        res.json({
          success: true,
          message: "Detalles reemplazados exitosamente",
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudieron reemplazar los detalles",
          });
      }
    } catch (error) {
      console.error("Error al reemplazar detalles del pedido:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al reemplazar detalles del pedido",
        });
    }
  },
};

module.exports = PedidoController;
