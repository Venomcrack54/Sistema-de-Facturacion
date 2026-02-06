// ==================== MODELO FACTURA (FRONTEND → API) ====================
// Todas las operaciones ahora se conectan al backend via fetch()

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

const FacturaModel = {
  // Obtener todas las facturas
  async obtenerFacturas() {
    try {
      const resp = await fetch(`${API_BASE}/api/facturas`);
      const json = await resp.json();
      if (json.success) {
        // Mapear campos del backend al formato que espera el frontend
        return json.data.map((f) => FacturaModel._mapearFactura(f));
      }
      console.error("Error al obtener facturas:", json.message);
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener facturas:", error);
      return [];
    }
  },

  // Guardar una nueva factura (crea pedido + factura en el backend)
  async guardarFactura(factura) {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      // 1) Crear el Pedido primero (el backend requiere un pedido asociado)
      const pedidoBody = {
        idCliente: factura.idCliente,
        fechaPedido: factura.fecha || hoy,
        fechaEntrega: factura.fecha || hoy,
        subtotalPedido: factura.subtotal || 0,
        valorDescuento: 0,
        totalPedido: factura.total || 0,
        estadoPedido: "CONFIRMADO",
        detalles: (factura.detalles || []).map((d) => ({
          idProducto: d.idProducto,
          descripcion: d.descripcion,
          precio: d.precio,
          cantidad: d.cantidad,
          subtotalDetalle:
            d.subtotalDetalle || d.valor || d.precio * d.cantidad,
        })),
      };

      const respPedido = await fetch(`${API_BASE}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoBody),
      });

      const jsonPedido = await respPedido.json();

      if (!jsonPedido.success) {
        console.error("Error al crear pedido:", jsonPedido.message);
        return {
          error: true,
          message: "Error al crear pedido: " + jsonPedido.message,
        };
      }

      const idPedido = jsonPedido.data.idPedido;

      // 2) Crear la Factura vinculada al pedido
      const facturaBody = {
        idCliente: factura.idCliente,
        idPago: factura.idPago,
        idPedido: idPedido,
        fechaFactura: factura.fecha || hoy,
        subtotalFactura: factura.subtotal || 0,
        valorIva: factura.iva || 0,
        totalFactura: factura.total || 0,
        estadoFactura: factura.estadoFactura || "EMITIDA",
        detalles: (factura.detalles || []).map((d) => ({
          idProducto: d.idProducto,
          descripcion: d.descripcion,
          precio: d.precio,
          cantidad: d.cantidad,
          subtotalDetalle:
            d.subtotalDetalle || d.valor || d.precio * d.cantidad,
        })),
      };

      const respFactura = await fetch(`${API_BASE}/api/facturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaBody),
      });

      const jsonFactura = await respFactura.json();

      if (jsonFactura.success) {
        return jsonFactura.data;
      }

      console.error("Error al crear factura:", jsonFactura.message);
      return {
        error: true,
        message: "Error al crear factura: " + jsonFactura.message,
      };
    } catch (error) {
      console.error("Error de conexión al guardar factura:", error);
      return { error: true, message: "No se pudo conectar al servidor" };
    }
  },

  // Buscar factura por ID
  async buscarPorId(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/facturas/${id}`);
      if (resp.status === 404) return null;

      const json = await resp.json();
      if (json.success) {
        return FacturaModel._mapearFactura(json.data);
      }
      return null;
    } catch (error) {
      console.error("Error de conexión al buscar factura:", error);
      return null;
    }
  },

  // Alias para compatibilidad con el código anterior
  async buscarPorCodigo(codigo) {
    // Si es un número, buscar directo por ID
    const id = parseInt(codigo);
    if (!isNaN(id)) {
      return await this.buscarPorId(id);
    }

    // Si es formato FAC-XXX, extraer el número
    const match = codigo.match(/FAC-(\d+)/i);
    if (match) {
      const num = parseInt(match[1]);
      // Buscar entre todas las facturas (el "código" es solo secuencial)
      const facturas = await this.obtenerFacturas();
      // Intentar encontrar por posición o buscar por id cercano
      const encontrada = facturas.find(
        (f) => f.idFactura === num || f.codigo === codigo,
      );
      return encontrada || null;
    }

    return null;
  },

  // Buscar facturas por cédula del cliente
  async buscarPorCliente(cedula) {
    try {
      const resp = await fetch(
        `${API_BASE}/api/facturas/cliente/cedula/${cedula}`,
      );
      const json = await resp.json();
      if (json.success) {
        return json.data.map((f) => FacturaModel._mapearFactura(f));
      }
      return [];
    } catch (error) {
      console.error("Error de conexión al buscar facturas por cliente:", error);
      return [];
    }
  },

  // Generar código secuencial de factura
  async generarCodigo() {
    try {
      const resp = await fetch(`${API_BASE}/api/facturas/codigo`);
      const json = await resp.json();
      if (json.success) return json.data.codigo;
      return "FAC-001";
    } catch (error) {
      console.error("Error de conexión al generar código:", error);
      return "FAC-001";
    }
  },

  // Actualizar estado de la factura
  async actualizarEstado(idFactura, estado) {
    try {
      // Mapear estados del frontend al backend
      const estadoMapeado = FacturaModel._mapearEstadoAlBackend(estado);

      const resp = await fetch(`${API_BASE}/api/facturas/${idFactura}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoMapeado }),
      });

      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al actualizar estado:", error);
      return false;
    }
  },

  // Actualizar factura completa (sin detalles)
  async actualizarFactura(idFactura, datos) {
    try {
      const resp = await fetch(`${API_BASE}/api/facturas/${idFactura}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al actualizar factura:", error);
      return false;
    }
  },

  // Eliminar factura y sus detalles
  async eliminarFactura(idFactura) {
    try {
      const resp = await fetch(`${API_BASE}/api/facturas/${idFactura}`, {
        method: "DELETE",
      });

      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al eliminar factura:", error);
      return false;
    }
  },

  // Obtener detalles de una factura
  async obtenerDetalles(idFactura) {
    try {
      const resp = await fetch(
        `${API_BASE}/api/facturas/${idFactura}/detalles`,
      );
      const json = await resp.json();
      if (json.success) {
        return json.data.map((d) => ({
          idDetalle: d.idDetalle,
          idProducto: d.idProducto,
          descripcion: d.descripcion || d.nombreProducto,
          cantidad: d.cantidad,
          precio: d.precio,
          valor: d.subtotalDetalle,
          subtotalDetalle: d.subtotalDetalle,
          nombreProducto: d.nombreProducto,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener detalles:", error);
      return [];
    }
  },

  // Obtener facturas por estado
  async obtenerPorEstado(estado) {
    try {
      const estadoMapeado = FacturaModel._mapearEstadoAlBackend(estado);
      const resp = await fetch(
        `${API_BASE}/api/facturas/estado/${estadoMapeado}`,
      );
      const json = await resp.json();
      if (json.success) {
        return json.data.map((f) => FacturaModel._mapearFactura(f));
      }
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener facturas por estado:", error);
      return [];
    }
  },

  // ==================== MAPEOS INTERNOS ====================

  // Mapear factura del backend al formato del frontend
  _mapearFactura(f) {
    return {
      idFactura: f.idFactura,
      codigo: "FAC-" + String(f.idFactura).padStart(3, "0"),
      fecha: f.fechaFactura ? f.fechaFactura.split("T")[0] : "",
      hora: f.fechaFactura
        ? new Date(f.fechaFactura).toTimeString().slice(0, 5)
        : "",
      cliente: f.cedula || "",
      idCliente: f.idCliente,
      nombre:
        ((f.nombreCliente || "") + " " + (f.apellidoCliente || "")).trim() ||
        "",
      subtotal: f.subtotalFactura,
      iva: f.valorIva,
      total: f.totalFactura,
      formaPago: f.tipoPago || "",
      idPago: f.idPago,
      idPedido: f.idPedido,
      estado: FacturaModel._mapearEstadoAlFrontend(f.estadoFactura),
      estadoFactura: f.estadoFactura,
    };
  },

  // Mapear estado del backend al frontend
  _mapearEstadoAlFrontend(estado) {
    const mapa = {
      EMITIDA: "Pagada",
      "EN PROCESO": "Pendiente",
      ANULADA: "Anulada",
      RECHAZADA: "Rechazada",
    };
    return mapa[estado] || estado;
  },

  // Mapear estado del frontend al backend
  _mapearEstadoAlBackend(estado) {
    const mapa = {
      Pagada: "EMITIDA",
      Pendiente: "EN PROCESO",
      Anulada: "ANULADA",
      Rechazada: "RECHAZADA",
      // Si ya viene en formato backend, dejarlo
      EMITIDA: "EMITIDA",
      "EN PROCESO": "EN PROCESO",
      ANULADA: "ANULADA",
      RECHAZADA: "RECHAZADA",
    };
    return mapa[estado] || estado;
  },
};
