const db = require("../../server/config/db");

const FacturaModel = {
  // Obtener todas las facturas con datos del cliente, pedido y método de pago
  async getAll() {
    const [rows] = await db.query(
      `SELECT f.*,
              c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
              mp.tipoPago,
              p.fechaPedido, p.estadoPedido
       FROM Factura f
       INNER JOIN Cliente c ON f.idCliente = c.idCliente
       INNER JOIN MetodoPago mp ON f.idPago = mp.idPago
       INNER JOIN Pedido p ON f.idPedido = p.idPedido
       ORDER BY f.idFactura DESC`,
    );
    return rows;
  },

  // Obtener factura por ID con relaciones
  async getById(id) {
    const [rows] = await db.query(
      `SELECT f.*,
              c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
              c.telefono, c.direccion, c.correo,
              mp.tipoPago,
              p.fechaPedido, p.estadoPedido
       FROM Factura f
       INNER JOIN Cliente c ON f.idCliente = c.idCliente
       INNER JOIN MetodoPago mp ON f.idPago = mp.idPago
       INNER JOIN Pedido p ON f.idPedido = p.idPedido
       WHERE f.idFactura = ?`,
      [id],
    );
    return rows[0] || null;
  },

  // Buscar facturas por cédula del cliente
  async getByClienteCedula(cedula) {
    const [rows] = await db.query(
      `SELECT f.*,
              c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
              mp.tipoPago,
              p.fechaPedido, p.estadoPedido
       FROM Factura f
       INNER JOIN Cliente c ON f.idCliente = c.idCliente
       INNER JOIN MetodoPago mp ON f.idPago = mp.idPago
       INNER JOIN Pedido p ON f.idPedido = p.idPedido
       WHERE c.cedula = ?
       ORDER BY f.idFactura DESC`,
      [cedula],
    );
    return rows;
  },

  // Buscar facturas por idCliente
  async getByCliente(idCliente) {
    const [rows] = await db.query(
      `SELECT f.*,
              c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
              mp.tipoPago,
              p.fechaPedido, p.estadoPedido
       FROM Factura f
       INNER JOIN Cliente c ON f.idCliente = c.idCliente
       INNER JOIN MetodoPago mp ON f.idPago = mp.idPago
       INNER JOIN Pedido p ON f.idPedido = p.idPedido
       WHERE f.idCliente = ?
       ORDER BY f.idFactura DESC`,
      [idCliente],
    );
    return rows;
  },

  // Buscar facturas por estado
  async getByEstado(estado) {
    const [rows] = await db.query(
      `SELECT f.*,
              c.cedula, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
              mp.tipoPago
       FROM Factura f
       INNER JOIN Cliente c ON f.idCliente = c.idCliente
       INNER JOIN MetodoPago mp ON f.idPago = mp.idPago
       WHERE f.estadoFactura = ?
       ORDER BY f.idFactura DESC`,
      [estado],
    );
    return rows;
  },

  // Generar código secuencial de factura (FAC-001, FAC-002, etc.)
  async generarCodigo() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM Factura");
    const num = rows[0].total + 1;
    return "FAC-" + String(num).padStart(3, "0");
  },

  // Crear factura completa con detalles (transacción)
  async create(factura, detalles) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      const {
        idCliente,
        idPago,
        idPedido,
        fechaFactura,
        subtotalFactura,
        valorIva,
        totalFactura,
        estadoFactura,
      } = factura;

      const [resultFactura] = await conn.query(
        `INSERT INTO Factura (idCliente, idPago, idPedido, fechaFactura, subtotalFactura, valorIva, totalFactura, estadoFactura)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idCliente,
          idPago,
          idPedido,
          fechaFactura,
          subtotalFactura,
          valorIva,
          totalFactura,
          estadoFactura || "EN PROCESO",
        ],
      );

      const idFactura = resultFactura.insertId;

      // Insertar los detalles de la factura
      if (detalles && detalles.length > 0) {
        const valoresDetalle = detalles.map((d) => [
          d.idProducto,
          idFactura,
          d.descripcion,
          d.precio,
          d.cantidad,
          d.subtotalDetalle,
        ]);

        await conn.query(
          `INSERT INTO DetalleFactura (idProducto, idFactura, descripcion, precio, cantidad, subtotalDetalle)
           VALUES ?`,
          [valoresDetalle],
        );
      }

      // Actualizar estado del pedido a FACTURADO
      if (idPedido) {
        await conn.query(
          "UPDATE Pedido SET estadoPedido = 'FACTURADO' WHERE idPedido = ?",
          [idPedido],
        );
      }

      await conn.query("COMMIT");

      return {
        idFactura,
        ...factura,
        estadoFactura: estadoFactura || "EN PROCESO",
      };
    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }
  },

  // Actualizar factura (sin detalles)
  async update(id, factura) {
    const {
      idCliente,
      idPago,
      idPedido,
      fechaFactura,
      subtotalFactura,
      valorIva,
      totalFactura,
      estadoFactura,
    } = factura;
    const [result] = await db.query(
      `UPDATE Factura
       SET idCliente = ?, idPago = ?, idPedido = ?, fechaFactura = ?,
           subtotalFactura = ?, valorIva = ?, totalFactura = ?, estadoFactura = ?
       WHERE idFactura = ?`,
      [
        idCliente,
        idPago,
        idPedido,
        fechaFactura,
        subtotalFactura,
        valorIva,
        totalFactura,
        estadoFactura,
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  // Actualizar solo el estado de la factura
  async updateEstado(id, estado) {
    const [result] = await db.query(
      "UPDATE Factura SET estadoFactura = ? WHERE idFactura = ?",
      [estado, id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar factura y sus detalles (transacción)
  async delete(id) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      // Eliminar historial asociado
      await conn.query("DELETE FROM HistorialFactura WHERE idFactura = ?", [
        id,
      ]);
      // Eliminar detalles de factura
      await conn.query("DELETE FROM DetalleFactura WHERE idFactura = ?", [id]);
      // Eliminar factura
      const [result] = await conn.query(
        "DELETE FROM Factura WHERE idFactura = ?",
        [id],
      );

      await conn.query("COMMIT");

      return result.affectedRows > 0;
    } catch (error) {
      await conn.query("ROLLBACK");
      throw error;
    }
  },

  // ==================== DETALLE FACTURA ====================

  // Obtener detalles de una factura con datos del producto
  async getDetalles(idFactura) {
    const [rows] = await db.query(
      `SELECT df.*, pr.nombre AS nombreProducto, pr.categoria, pr.precioUnitario, pr.aplicaIVA, pr.aplicaDescuento
       FROM DetalleFactura df
       INNER JOIN Producto pr ON df.idProducto = pr.idProducto
       WHERE df.idFactura = ?
       ORDER BY df.idDetalle ASC`,
      [idFactura],
    );
    return rows;
  },

  // Agregar un detalle a una factura existente
  async addDetalle(detalle) {
    const {
      idProducto,
      idFactura,
      descripcion,
      precio,
      cantidad,
      subtotalDetalle,
    } = detalle;
    const [result] = await db.query(
      `INSERT INTO DetalleFactura (idProducto, idFactura, descripcion, precio, cantidad, subtotalDetalle)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idProducto, idFactura, descripcion, precio, cantidad, subtotalDetalle],
    );
    return { idDetalle: result.insertId, ...detalle };
  },

  // Actualizar un detalle
  async updateDetalle(idDetalle, detalle) {
    const { idProducto, descripcion, precio, cantidad, subtotalDetalle } =
      detalle;
    const [result] = await db.query(
      `UPDATE DetalleFactura
       SET idProducto = ?, descripcion = ?, precio = ?, cantidad = ?, subtotalDetalle = ?
       WHERE idDetalle = ?`,
      [idProducto, descripcion, precio, cantidad, subtotalDetalle, idDetalle],
    );
    return result.affectedRows > 0;
  },

  // Eliminar un detalle
  async deleteDetalle(idDetalle) {
    const [result] = await db.query(
      "DELETE FROM DetalleFactura WHERE idDetalle = ?",
      [idDetalle],
    );
    return result.affectedRows > 0;
  },

  // Eliminar todos los detalles de una factura
  async deleteAllDetalles(idFactura) {
    const [result] = await db.query(
      "DELETE FROM DetalleFactura WHERE idFactura = ?",
      [idFactura],
    );
    return result.affectedRows;
  },

  // Reemplazar todos los detalles de una factura (transacción)
  async replaceDetalles(idFactura, detalles) {
    const conn = db;

    try {
      await conn.query("START TRANSACTION");

      // Eliminar detalles existentes
      await conn.query("DELETE FROM DetalleFactura WHERE idFactura = ?", [
        idFactura,
      ]);

      // Insertar nuevos detalles
      if (detalles && detalles.length > 0) {
        const valoresDetalle = detalles.map((d) => [
          d.idProducto,
          idFactura,
          d.descripcion,
          d.precio,
          d.cantidad,
          d.subtotalDetalle,
        ]);

        await conn.query(
          `INSERT INTO DetalleFactura (idProducto, idFactura, descripcion, precio, cantidad, subtotalDetalle)
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

module.exports = FacturaModel;
