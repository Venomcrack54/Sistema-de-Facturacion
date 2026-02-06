/**
 * ClienteController - Backend para CLIENTE (Registro para facturas)
 * Los clientes son quienes compran y aparecen en las facturas.
 * NO confundir con Usuario (login/acceso al sistema).
 */
const ClienteModel = require("../../models/server/clienteModel");

const ClienteController = {
  // GET /api/clientes
  async getAll(req, res) {
    try {
      const clientes = await ClienteModel.getAll();
      res.json({ success: true, data: clientes });
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener clientes" });
    }
  },

  // GET /api/clientes/:id
  async getById(req, res) {
    try {
      const cliente = await ClienteModel.getById(req.params.id);
      if (!cliente) {
        return res
          .status(404)
          .json({ success: false, message: "Cliente no encontrado" });
      }
      res.json({ success: true, data: cliente });
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al obtener cliente" });
    }
  },

  // GET /api/clientes/cedula/:cedula
  async getByCedula(req, res) {
    try {
      const cliente = await ClienteModel.getByCedula(req.params.cedula);
      if (!cliente) {
        return res
          .status(404)
          .json({ success: false, message: "Cliente no encontrado" });
      }
      res.json({ success: true, data: cliente });
    } catch (error) {
      console.error("Error al buscar cliente por cédula:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al buscar cliente" });
    }
  },

  // GET /api/clientes/existe/:cedula
  async existsByCedula(req, res) {
    try {
      const existe = await ClienteModel.existsByCedula(req.params.cedula);
      res.json({ success: true, data: { existe } });
    } catch (error) {
      console.error("Error al verificar cliente:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al verificar cliente" });
    }
  },

  // POST /api/clientes
  async create(req, res) {
    try {
      const {
        cedula,
        nombre,
        apellido,
        telefono,
        correo,
        direccion,
        fechaNacimiento,
      } = req.body;

      // Validaciones básicas (correo opcional, valor por defecto)
      if (
        !cedula ||
        !nombre ||
        !apellido ||
        !telefono ||
        !direccion ||
        !fechaNacimiento
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Cédula, nombre, apellido, teléfono, dirección y fecha de nacimiento son obligatorios",
          });
      }

      const correoFinal = correo && correo.trim() ? correo.trim() : "sin-correo@mail.com";

      // Verificar si ya existe
      const existe = await ClienteModel.existsByCedula(cedula);
      if (existe) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Ya existe un cliente con esa cédula",
          });
      }

      const nuevoCliente = await ClienteModel.create({
        cedula,
        nombre,
        apellido,
        telefono,
        correo: correoFinal,
        direccion,
        fechaNacimiento,
      });

      res
        .status(201)
        .json({
          success: true,
          data: nuevoCliente,
          message: "Cliente creado exitosamente",
        });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear cliente" });
    }
  },

  // PUT /api/clientes/:id
  async update(req, res) {
    try {
      const id = req.params.id;
      const clienteExistente = await ClienteModel.getById(id);

      if (!clienteExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Cliente no encontrado" });
      }

      const {
        cedula,
        nombre,
        apellido,
        telefono,
        correo,
        direccion,
        fechaNacimiento,
        estadoCliente,
      } = req.body;

      if (
        !cedula ||
        !nombre ||
        !apellido ||
        !telefono ||
        !direccion ||
        !fechaNacimiento
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Cédula, nombre, apellido, teléfono, dirección y fecha de nacimiento son obligatorios",
          });
      }

      const correoFinal =
        correo && correo.trim() ? correo.trim() : "sin-correo@mail.com";

      const actualizado = await ClienteModel.update(id, {
        cedula,
        nombre,
        apellido,
        telefono,
        correo: correoFinal,
        direccion,
        fechaNacimiento,
        estadoCliente,
      });

      if (actualizado) {
        res.json({
          success: true,
          message: "Cliente actualizado exitosamente",
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudo actualizar el cliente",
          });
      }
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar cliente" });
    }
  },

  // DELETE /api/clientes/:id (borrado lógico)
  async delete(req, res) {
    try {
      const id = req.params.id;
      const clienteExistente = await ClienteModel.getById(id);

      if (!clienteExistente) {
        return res
          .status(404)
          .json({ success: false, message: "Cliente no encontrado" });
      }

      const eliminado = await ClienteModel.delete(id);

      if (eliminado) {
        res.json({
          success: true,
          message: "Cliente desactivado exitosamente",
        });
      } else {
        res
          .status(400)
          .json({
            success: false,
            message: "No se pudo desactivar el cliente",
          });
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar cliente" });
    }
  },

  // DELETE /api/clientes/hard/:id (borrado físico)
  async hardDelete(req, res) {
    try {
      const id = req.params.id;
      const eliminado = await ClienteModel.hardDelete(id);

      if (eliminado) {
        res.json({
          success: true,
          message: "Cliente eliminado permanentemente",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Cliente no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar cliente permanentemente:", error);
      res
        .status(500)
        .json({
          success: false,
          message:
            "Error al eliminar cliente. Puede tener registros asociados.",
        });
    }
  },
};

module.exports = ClienteController;
