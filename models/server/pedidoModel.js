const db = require("../../server/config/db");

const PedidoModel = {
  // Obtener todos los pedidos con datos del cliente
  async getAll() {
    const [rows] = await db.query(
      `SELECT p.*, c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente
       FROM Pedido p
       INNER JOIN Cliente c ON p.idCliente = c.idCliente
       ORDER BY p.idPedido DESC`,
    );
    return rows;
  },

  // Obtener pedido por ID con datos del cliente
  async getById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente
       FROM Pedido p
       INNER JOIN Cliente c ON p.idCliente = c.idCliente
       WHERE p.idPedido = ?`,
      [id],
    );
    return rows[0] || null;
  },

  // Obtener pedidos por cliente
  async getByCliente(idCliente) {
    const [rows] = await db.query(
      `SELECT p.*, c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente
       FROM Pedido p
       INNER JOIN Cliente c ON p.idCliente = c.idCliente
       WHERE p.idCliente = ?
       ORDER BY p.idPedido DESC`,
      [idCliente],
    );
    return rows;
  },

  // Obtener pedidos por estado
  async getByEstado(estado) {
    const [rows] = await db.query(
      `SELECT p.*, c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente
       FROM Pedido p
       INNER JOIN Cliente c ON p.idCliente = c.idCliente
       WHERE p.estadoPedido = ?
       ORDER BY p.idPedido DESC`,
      [estado],
    );
    return rows;
  },

  // Obtener pedidos CONFIRMADOS (disponibles para facturar)
  async getConfirmados() {
    const [rows] = await db.query(
      `SELECT p.*, c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente
       FROM Pedido p
       INNER JOIN Cliente c ON p.idCliente = c.idCliente
       WHERE p.estadoPedido = 'CONFIRMADO'
       ORDER BY p.idPedido DESC`,
    );
    return rows;
  },

  // Crear pedido con sus detalles (transacción)
  async create(pedido, detalles) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      const {
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido,
        valorDescuento,
        totalPedido,
        estadoPedido,
      } = pedido;

      const [resultPedido] = await conn.query(
        `INSERT INTO Pedido (idCliente, fechaPedido, fechaEntrega, subtotalPedido, valorDescuento, totalPedido, estadoPedido)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idCliente,
          fechaPedido,
          fechaEntrega,
          subtotalPedido,
          valorDescuento || 0,
          totalPedido,
          estadoPedido || "PENDIENTE",
        ],
      );

      const idPedido = resultPedido.insertId;

      // Insertar los detalles del pedido
      if (detalles && detalles.length > 0) {
        const valoresDetalle = detalles.map((d) => [
          d.idProducto,
          idPedido,
          d.descripcion,
          d.precio,
          d.cantidad,
          d.subtotalDetalle,
        ]);

        await conn.query(
          `INSERT INTO DetallePedido (idProducto, idPedido, descripcion, precio, cantidad, subtotalDetalle)
           VALUES ?`,
          [valoresDetalle],
        );
      }

      await conn.query("COMMIT");

      return { idPedido, ...pedido, estadoPedido: estadoPedido || "PENDIENTE" };
    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }
  },

  // Actualizar pedido (sin detalles)
  async update(id, pedido) {
    const {
      idCliente,
      fechaPedido,
      fechaEntrega,
      subtotalPedido,
      valorDescuento,
      totalPedido,
      estadoPedido,
    } = pedido;
    const [result] = await db.query(
      `UPDATE Pedido
       SET idCliente = ?, fechaPedido = ?, fechaEntrega = ?, subtotalPedido = ?, valorDescuento = ?, totalPedido = ?, estadoPedido = ?
       WHERE idPedido = ?`,
      [
        idCliente,
        fechaPedido,
        fechaEntrega,
        subtotalPedido,
        valorDescuento,
        totalPedido,
        estadoPedido,
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  // Contar facturas que referencian a este pedido
  async countFacturasByPedido(id) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM Factura WHERE idPedido = ?",
      [id],
    );
    return rows[0].total;
  },

  // Actualizar estado del pedido
  async updateEstado(id, estado) {
    const [result] = await db.query(
      "UPDATE Pedido SET estadoPedido = ? WHERE idPedido = ?",
      [estado, id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar pedido y sus detalles (transacción)
  async delete(id) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      await conn.query("DELETE FROM DetallePedido WHERE idPedido = ?", [id]);
      const [result] = await conn.query(
        "DELETE FROM Pedido WHERE idPedido = ?",
        [id],
      );

      await conn.query("COMMIT");

      return result.affectedRows > 0;
    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }
  },

  // ==================== DETALLE PEDIDO ====================

  // Obtener detalles de un pedido con datos del producto
  async getDetalles(idPedido) {
    const [rows] = await db.query(
      `SELECT dp.*, pr.nombre AS nombreProducto, pr.categoria, pr.precioUnitario, pr.aplicaIVA, pr.aplicaDescuento
       FROM DetallePedido dp
       INNER JOIN Producto pr ON dp.idProducto = pr.idProducto
       WHERE dp.idPedido = ?
       ORDER BY dp.idDetalle ASC`,
      [idPedido],
    );
    return rows;
  },

  // Agregar un detalle a un pedido existente
  async addDetalle(detalle) {
    const {
      idProducto,
      idPedido,
      descripcion,
      precio,
      cantidad,
      subtotalDetalle,
    } = detalle;
    const [result] = await db.query(
      `INSERT INTO DetallePedido (idProducto, idPedido, descripcion, precio, cantidad, subtotalDetalle)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idProducto, idPedido, descripcion, precio, cantidad, subtotalDetalle],
    );
    return { idDetalle: result.insertId, ...detalle };
  },

  // Actualizar un detalle
  async updateDetalle(idDetalle, detalle) {
    const { idProducto, descripcion, precio, cantidad, subtotalDetalle } =
      detalle;
    const [result] = await db.query(
      `UPDATE DetallePedido
       SET idProducto = ?, descripcion = ?, precio = ?, cantidad = ?, subtotalDetalle = ?
       WHERE idDetalle = ?`,
      [idProducto, descripcion, precio, cantidad, subtotalDetalle, idDetalle],
    );
    return result.affectedRows > 0;
  },

  // Eliminar un detalle
  async deleteDetalle(idDetalle) {
    const [result] = await db.query(
      "DELETE FROM DetallePedido WHERE idDetalle = ?",
      [idDetalle],
    );
    return result.affectedRows > 0;
  },

  // Eliminar todos los detalles de un pedido
  async deleteAllDetalles(idPedido) {
    const [result] = await db.query(
      "DELETE FROM DetallePedido WHERE idPedido = ?",
      [idPedido],
    );
    return result.affectedRows;
  },

  // Reemplazar todos los detalles de un pedido (transacción)
  async replaceDetalles(idPedido, detalles) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      // Eliminar detalles existentes
      await conn.query("DELETE FROM DetallePedido WHERE idPedido = ?", [
        idPedido,
      ]);

      // Insertar nuevos detalles
      if (detalles && detalles.length > 0) {
        const valoresDetalle = detalles.map((d) => [
          d.idProducto,
          idPedido,
          d.descripcion,
          d.precio,
          d.cantidad,
          d.subtotalDetalle,
        ]);

        await conn.query(
          `INSERT INTO DetallePedido (idProducto, idPedido, descripcion, precio, cantidad, subtotalDetalle)
           VALUES ?`,
          [valoresDetalle],
        );
      }

      await conn.query("COMMIT");

      return true;
    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }
  },
};

module.exports = PedidoModel;
