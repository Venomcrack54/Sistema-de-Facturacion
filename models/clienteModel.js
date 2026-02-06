// ==================== MODELO CLIENTE (FRONTEND → API → MySQL) ====================
// MVC: Este modelo se conecta SOLO al backend (API REST), que guarda en MySQL.
// NO usa localStorage para clientes.

// API_BASE compartida entre scripts (evita: redeclaration of const API_BASE)
if (typeof window !== "undefined") {
  window.API_BASE =
    window.API_BASE ||
    (window.location.origin && window.location.origin.startsWith("http")
      ? window.location.origin
      : "http://localhost:3000");
}
var API_BASE =
  (typeof window !== "undefined" && window.API_BASE) || "http://localhost:3000";

const ClienteModel = {
  // Obtener todos los clientes activos
  async obtenerClientes() {
    try {
      const resp = await fetch(`${API_BASE}/api/clientes`);
      const json = await resp.json();
      if (json.success) return json.data;
      console.error("Error al obtener clientes:", json.message);
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener clientes:", error);
      return [];
    }
  },

  // Guardar un nuevo cliente
  // Recibe: { cedulaRUC, nombres, apellidos, direccion, telefono, correo, fechaNacimiento }
  async guardarCliente(cliente) {
    try {
      const body = {
        cedula: cliente.cedulaRUC || cliente.cedula,
        nombre: cliente.nombres || cliente.nombre,
        apellido: cliente.apellidos || cliente.apellido,
        telefono: cliente.telefono,
        correo: cliente.correo || "sin-correo@mail.com",
        direccion: cliente.direccion,
        fechaNacimiento: cliente.fechaNacimiento,
      };

      const resp = await fetch(`${API_BASE}/api/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();

      if (json.success) {
        return json.data; // Retorna el cliente creado con su idCliente
      }

      // Si es conflicto (ya existe)
      if (resp.status === 409) {
        return { error: true, message: json.message, duplicado: true };
      }

      return { error: true, message: json.message };
    } catch (error) {
      console.error("Error de conexión al guardar cliente:", error);
      return { error: true, message: "No se pudo conectar al servidor" };
    }
  },

  // Buscar cliente por cédula o RUC
  async buscarPorCedula(cedula) {
    try {
      const resp = await fetch(`${API_BASE}/api/clientes/cedula/${cedula}`);

      if (resp.status === 404) return null;

      const json = await resp.json();
      if (json.success) {
        // Mapear campos del backend al formato que espera el frontend
        const c = json.data;
        return {
          idCliente: c.idCliente,
          cedulaRUC: c.cedula,
          cedula: c.cedula,
          nombres: c.nombre,
          nombre: c.nombre,
          apellidos: c.apellido,
          apellido: c.apellido,
          direccion: c.direccion,
          telefono: c.telefono,
          correo: c.correo,
          fechaNacimiento: c.fechaNacimiento,
          estadoCliente: c.estadoCliente,
        };
      }
      return null;
    } catch (error) {
      console.error("Error de conexión al buscar cliente:", error);
      return null;
    }
  },

  // Verificar si existe un cliente por cédula
  async existe(cedula) {
    try {
      const resp = await fetch(`${API_BASE}/api/clientes/existe/${cedula}`);
      const json = await resp.json();
      if (json.success) return json.data.existe;
      return false;
    } catch (error) {
      console.error("Error de conexión al verificar cliente:", error);
      return false;
    }
  },

  // Obtener cliente por ID
  async obtenerPorId(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/clientes/${id}`);
      if (resp.status === 404) return null;
      const json = await resp.json();
      if (json.success) {
        const c = json.data;
        return {
          idCliente: c.idCliente,
          cedulaRUC: c.cedula,
          cedula: c.cedula,
          nombres: c.nombre,
          nombre: c.nombre,
          apellidos: c.apellido,
          apellido: c.apellido,
          direccion: c.direccion,
          telefono: c.telefono,
          correo: c.correo,
          fechaNacimiento: c.fechaNacimiento,
          estadoCliente: c.estadoCliente,
        };
      }
      return null;
    } catch (error) {
      console.error("Error de conexión al obtener cliente por ID:", error);
      return null;
    }
  },

  // Actualizar cliente
  async actualizarCliente(id, datos) {
    try {
      const body = {
        cedula: datos.cedulaRUC || datos.cedula,
        nombre: datos.nombres || datos.nombre,
        apellido: datos.apellidos || datos.apellido,
        telefono: datos.telefono,
        correo: datos.correo || "sin-correo@mail.com",
        direccion: datos.direccion,
        fechaNacimiento: datos.fechaNacimiento,
        estadoCliente: datos.estadoCliente || "ACTIVO",
      };

      const resp = await fetch(`${API_BASE}/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al actualizar cliente:", error);
      return false;
    }
  },

  // Eliminar cliente (borrado lógico)
  async eliminarCliente(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/clientes/${id}`, {
        method: "DELETE",
      });
      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al eliminar cliente:", error);
      return false;
    }
  },
};
