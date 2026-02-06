// ==================== MODELO PRODUCTO (FRONTEND → API) ====================
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

const ProductoModel = {
  // Obtener todos los productos activos
  async obtenerProductos() {
    try {
      const resp = await fetch(`${API_BASE}/api/productos`);
      const json = await resp.json();
      if (json.success) {
        // Mapear campos del backend al formato que espera el frontend
        return json.data.map((p) => ProductoModel._mapearProducto(p));
      }
      console.error("Error al obtener productos:", json.message);
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener productos:", error);
      return [];
    }
  },

  // Buscar producto por ID
  async buscarPorId(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/productos/${id}`);
      if (resp.status === 404) return null;

      const json = await resp.json();
      if (json.success) {
        return ProductoModel._mapearProducto(json.data);
      }
      return null;
    } catch (error) {
      console.error("Error de conexión al buscar producto:", error);
      return null;
    }
  },

  // Buscar productos por nombre (parcial)
  async buscarPorNombre(nombre) {
    try {
      const resp = await fetch(
        `${API_BASE}/api/productos/buscar/${encodeURIComponent(nombre)}`,
      );
      const json = await resp.json();
      if (json.success) {
        return json.data.map((p) => ProductoModel._mapearProducto(p));
      }
      return [];
    } catch (error) {
      console.error("Error de conexión al buscar productos por nombre:", error);
      return [];
    }
  },

  // Buscar productos por categoría
  async buscarPorCategoria(categoria) {
    try {
      const resp = await fetch(
        `${API_BASE}/api/productos/categoria/${encodeURIComponent(categoria)}`,
      );
      const json = await resp.json();
      if (json.success) {
        return json.data.map((p) => ProductoModel._mapearProducto(p));
      }
      return [];
    } catch (error) {
      console.error(
        "Error de conexión al buscar productos por categoría:",
        error,
      );
      return [];
    }
  },

  // Obtener todos los productos (incluidos inactivos)
  async obtenerTodos() {
    try {
      const resp = await fetch(`${API_BASE}/api/productos/todos`);
      const json = await resp.json();
      if (json.success) {
        return json.data.map((p) => ProductoModel._mapearProducto(p));
      }
      return [];
    } catch (error) {
      console.error("Error de conexión al obtener todos los productos:", error);
      return [];
    }
  },

  // Crear un nuevo producto
  async crearProducto(producto) {
    try {
      const body = {
        nombre: producto.nombre,
        categoria: producto.categoria || "General",
        descripcion: producto.descripcion || producto.nombre,
        precioUnitario: producto.precioUnitario || producto.precio,
        aplicaIVA: producto.aplicaIVA !== undefined ? producto.aplicaIVA : true,
        aplicaDescuento:
          producto.aplicaDescuento !== undefined
            ? producto.aplicaDescuento
            : false,
      };

      const resp = await fetch(`${API_BASE}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();

      if (json.success) {
        return ProductoModel._mapearProducto(json.data);
      }

      return { error: true, message: json.message };
    } catch (error) {
      console.error("Error de conexión al crear producto:", error);
      return { error: true, message: "No se pudo conectar al servidor" };
    }
  },

  // Actualizar un producto
  async actualizarProducto(id, datos) {
    try {
      const body = {
        nombre: datos.nombre,
        categoria: datos.categoria || "General",
        descripcion: datos.descripcion || datos.nombre,
        precioUnitario: datos.precioUnitario || datos.precio,
        aplicaIVA: datos.aplicaIVA !== undefined ? datos.aplicaIVA : true,
        aplicaDescuento:
          datos.aplicaDescuento !== undefined ? datos.aplicaDescuento : false,
        estadoProducto: datos.estadoProducto || "ACTIVO",
      };

      const resp = await fetch(`${API_BASE}/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al actualizar producto:", error);
      return false;
    }
  },

  // Eliminar producto (borrado lógico)
  async eliminarProducto(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/productos/${id}`, {
        method: "DELETE",
      });
      const json = await resp.json();
      return json.success;
    } catch (error) {
      console.error("Error de conexión al eliminar producto:", error);
      return false;
    }
  },

  // ==================== COMPATIBILIDAD ====================

  // Método de compatibilidad: ya no se necesita guardar productos iniciales
  // porque los productos vienen de la base de datos MySQL
  guardarProductosIniciales() {
    console.log(
      "ProductoModel: Los productos se cargan desde el servidor MySQL. No se usa localStorage.",
    );
  },

  // ==================== MAPEO INTERNO ====================

  // Mapear producto del backend al formato que espera el frontend
  _mapearProducto(p) {
    return {
      id: p.idProducto,
      idProducto: p.idProducto,
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion,
      precio: parseFloat(p.precioUnitario),
      precioUnitario: parseFloat(p.precioUnitario),
      aplicaIVA: p.aplicaIVA == 1 || p.aplicaIVA === true,
      aplicaDescuento: p.aplicaDescuento == 1 || p.aplicaDescuento === true,
      estadoProducto: p.estadoProducto,
    };
  },
};

// Ya NO se llama a guardarProductosIniciales() porque los datos vienen de MySQL
