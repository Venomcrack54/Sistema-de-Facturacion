const ProductoModel = require("../../models/server/productoModel");

const ProductoController = {
  // GET /api/productos
  async getAll(req, res) {
    try {
      const productos = await ProductoModel.getAll();
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ success: false, message: "Error al obtener productos" });
    }
  },

  // GET /api/productos/todos (incluye inactivos)
  async getAllIncludingInactive(req, res) {
    try {
      const productos = await ProductoModel.getAllIncludingInactive();
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error("Error al obtener todos los productos:", error);
      res.status(500).json({ success: false, message: "Error al obtener productos" });
    }
  },

  // GET /api/productos/:id
  async getById(req, res) {
    try {
      const producto = await ProductoModel.getById(req.params.id);
      if (!producto) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }
      res.json({ success: true, data: producto });
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res.status(500).json({ success: false, message: "Error al obtener producto" });
    }
  },

  // GET /api/productos/buscar/:nombre
  async getByNombre(req, res) {
    try {
      const productos = await ProductoModel.getByNombre(req.params.nombre);
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error("Error al buscar productos por nombre:", error);
      res.status(500).json({ success: false, message: "Error al buscar productos" });
    }
  },

  // GET /api/productos/categoria/:categoria
  async getByCategoria(req, res) {
    try {
      const productos = await ProductoModel.getByCategoria(req.params.categoria);
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error("Error al buscar productos por categoría:", error);
      res.status(500).json({ success: false, message: "Error al buscar productos por categoría" });
    }
  },

  // POST /api/productos
  async create(req, res) {
    try {
      const { nombre, categoria, descripcion, precioUnitario, aplicaIVA, aplicaDescuento } = req.body;

      if (!nombre || !categoria || !descripcion || precioUnitario === undefined || precioUnitario === null) {
        return res.status(400).json({
          success: false,
          message: "Los campos nombre, categoría, descripción y precio unitario son obligatorios"
        });
      }

      if (isNaN(precioUnitario) || parseFloat(precioUnitario) < 0) {
        return res.status(400).json({
          success: false,
          message: "El precio unitario debe ser un número positivo"
        });
      }

      const existe = await ProductoModel.existsByNombre(nombre);
      if (existe) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un producto con ese nombre"
        });
      }

      const nuevoProducto = await ProductoModel.create({
        nombre,
        categoria,
        descripcion,
        precioUnitario: parseFloat(precioUnitario),
        aplicaIVA: aplicaIVA !== undefined ? aplicaIVA : true,
        aplicaDescuento: aplicaDescuento !== undefined ? aplicaDescuento : false
      });

      res.status(201).json({
        success: true,
        data: nuevoProducto,
        message: "Producto creado exitosamente"
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({ success: false, message: "Error al crear producto" });
    }
  },

  // PUT /api/productos/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const productoExistente = await ProductoModel.getById(id);

      if (!productoExistente) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }

      const { nombre, categoria, descripcion, precioUnitario, aplicaIVA, aplicaDescuento, estadoProducto } = req.body;

      if (!nombre || !categoria || !descripcion || precioUnitario === undefined || precioUnitario === null) {
        return res.status(400).json({
          success: false,
          message: "Los campos nombre, categoría, descripción y precio unitario son obligatorios"
        });
      }

      if (isNaN(precioUnitario) || parseFloat(precioUnitario) < 0) {
        return res.status(400).json({
          success: false,
          message: "El precio unitario debe ser un número positivo"
        });
      }

      const actualizado = await ProductoModel.update(id, {
        nombre,
        categoria,
        descripcion,
        precioUnitario: parseFloat(precioUnitario),
        aplicaIVA: aplicaIVA !== undefined ? aplicaIVA : true,
        aplicaDescuento: aplicaDescuento !== undefined ? aplicaDescuento : false,
        estadoProducto
      });

      if (actualizado) {
        res.json({ success: true, message: "Producto actualizado exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo actualizar el producto" });
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ success: false, message: "Error al actualizar producto" });
    }
  },

  // DELETE /api/productos/:id (borrado lógico)
  async delete(req, res) {
    try {
      const id = req.params.id;
      const productoExistente = await ProductoModel.getById(id);

      if (!productoExistente) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }

      const eliminado = await ProductoModel.delete(id);

      if (eliminado) {
        res.json({ success: true, message: "Producto desactivado exitosamente" });
      } else {
        res.status(400).json({ success: false, message: "No se pudo desactivar el producto" });
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ success: false, message: "Error al eliminar producto" });
    }
  },

  // DELETE /api/productos/hard/:id (borrado físico)
  async hardDelete(req, res) {
    try {
      const id = req.params.id;
      const eliminado = await ProductoModel.hardDelete(id);

      if (eliminado) {
        res.json({ success: true, message: "Producto eliminado permanentemente" });
      } else {
        res.status(404).json({ success: false, message: "Producto no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar producto permanentemente:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar producto. Puede tener registros asociados."
      });
    }
  }
};

module.exports = ProductoController;
