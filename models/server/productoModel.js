const db = require("../../server/config/db");

const ProductoModel = {
  // Obtener todos los productos activos
  async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM Producto WHERE estadoProducto = 'ACTIVO' ORDER BY idProducto DESC",
    );
    return rows;
  },

  // Obtener todos los productos (incluidos inactivos)
  async getAllIncludingInactive() {
    const [rows] = await db.query(
      "SELECT * FROM Producto ORDER BY idProducto DESC",
    );
    return rows;
  },

  // Obtener producto por ID
  async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM Producto WHERE idProducto = ?",
      [id],
    );
    return rows[0] || null;
  },

  // Buscar productos por nombre (parcial)
  async getByNombre(nombre) {
    const [rows] = await db.query(
      "SELECT * FROM Producto WHERE nombre LIKE ? AND estadoProducto = 'ACTIVO'",
      [`%${nombre}%`],
    );
    return rows;
  },

  // Buscar productos por categoría
  async getByCategoria(categoria) {
    const [rows] = await db.query(
      "SELECT * FROM Producto WHERE categoria = ? AND estadoProducto = 'ACTIVO'",
      [categoria],
    );
    return rows;
  },

  // Verificar si existe un producto por nombre exacto
  async existsByNombre(nombre) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM Producto WHERE nombre = ?",
      [nombre],
    );
    return rows[0].total > 0;
  },

  // Crear un nuevo producto
  async create(producto) {
    const {
      nombre,
      categoria,
      descripcion,
      precioUnitario,
      aplicaIVA,
      aplicaDescuento,
    } = producto;
    const [result] = await db.query(
      `INSERT INTO Producto (nombre, categoria, descripcion, precioUnitario, aplicaIVA, aplicaDescuento, estadoProducto)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        nombre,
        categoria,
        descripcion,
        precioUnitario,
        aplicaIVA ? 1 : 0,
        aplicaDescuento ? 1 : 0,
      ],
    );
    return {
      idProducto: result.insertId,
      ...producto,
      estadoProducto: "ACTIVO",
    };
  },

  // Actualizar producto
  async update(id, producto) {
    const {
      nombre,
      categoria,
      descripcion,
      precioUnitario,
      aplicaIVA,
      aplicaDescuento,
      estadoProducto,
    } = producto;
    const [result] = await db.query(
      `UPDATE Producto
       SET nombre = ?, categoria = ?, descripcion = ?, precioUnitario = ?, aplicaIVA = ?, aplicaDescuento = ?, estadoProducto = ?
       WHERE idProducto = ?`,
      [
        nombre,
        categoria,
        descripcion,
        precioUnitario,
        aplicaIVA ? 1 : 0,
        aplicaDescuento ? 1 : 0,
        estadoProducto || "ACTIVO",
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  // Eliminar producto (borrado lógico)
  async delete(id) {
    const [result] = await db.query(
      "UPDATE Producto SET estadoProducto = 'INACTIVO' WHERE idProducto = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Eliminar producto (borrado físico)
  async hardDelete(id) {
    const [result] = await db.query(
      "DELETE FROM Producto WHERE idProducto = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};

module.exports = ProductoModel;
