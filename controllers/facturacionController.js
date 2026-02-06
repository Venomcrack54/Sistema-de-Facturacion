// ==================== FACTURACIÓN - CONECTADO AL BACKEND ====================

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

let clienteActual = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", async () => {
  await generarDatosAutomaticos();

  // Cargar combos de productos desde la BD
  const combos = document.querySelectorAll(".combo-producto");
  for (const combo of combos) {
    await cargarProductosEnCombo(combo);
  }

  // Cargar métodos de pago desde la BD
  await cargarMetodosPago();

  // Si viene un cliente recién registrado desde cliente.html
  const clienteDesdeRegistro = sessionStorage.getItem("clienteRegistrado");
  if (clienteDesdeRegistro) {
    const cliente = JSON.parse(clienteDesdeRegistro);
    clienteActual = cliente;

    document.getElementById("cedulaCliente").value =
      cliente.cedulaRUC || cliente.cedula || "";
    document.getElementById("nombreCliente").value = (
      (cliente.nombres || cliente.nombre || "") +
      " " +
      (cliente.apellidos || cliente.apellido || "")
    ).trim();
    document.getElementById("direccionCliente").value = cliente.direccion || "";
    document.getElementById("telefonoCliente").value = cliente.telefono || "";

    sessionStorage.removeItem("clienteRegistrado");
  }

  // Eventos
  document.getElementById("btnBuscar").addEventListener("click", buscarCliente);

  document.querySelector("form").addEventListener("submit", guardarFactura);

  // Configurar la primera fila de detalle
  const primeraFila = document.querySelector(".detalle-factura tbody tr");
  if (primeraFila) {
    configurarFilaDetalle(primeraFila);
  }
});

// ==================== DATOS AUTOMÁTICOS ====================
async function generarDatosAutomaticos() {
  try {
    const codigo = await FacturaModel.generarCodigo();
    document.getElementById("codigo").value = codigo;
  } catch (error) {
    console.error("Error al generar código:", error);
    document.getElementById("codigo").value = "FAC-001";
  }

  const ahora = new Date();
  document.getElementById("fecha").value = ahora.toISOString().split("T")[0];
  document.getElementById("hora").value = ahora.toTimeString().slice(0, 5);
}

// ==================== CARGAR MÉTODOS DE PAGO DESDE BD ====================
async function cargarMetodosPago() {
  const select = document.getElementById("formaPago");
  if (!select) return;

  try {
    // Traer TODOS para que la “checklist” muestre Tarjeta/Cheque aunque estén inactivos
    const resp = await fetch(`${API_BASE}/api/metodo-pago`);
    const json = await resp.json();

    // Siempre reconstruir el select para evitar opciones “fantasma”
    select.innerHTML = '<option value="">-- Seleccione forma de pago --</option>';

    const metodos = json.success && Array.isArray(json.data) ? json.data : [];

    // 1) Pintar lo que viene de BD (deshabilitar si disponible = 0)
    metodos.forEach((mp) => {
      const option = document.createElement("option");
      option.value = mp.idPago; // IMPORTANTE: debe ser idPago para guardar factura
      option.textContent = mp.tipoPago;
      option.dataset.tipo = mp.tipoPago;
      if (mp.disponible === 0 || mp.disponible === false) {
        option.disabled = true;
        option.textContent = `${mp.tipoPago} (no disponible)`;
      }
      select.appendChild(option);
    });

    // 2) Asegurar que la checklist muestre estas opciones, aunque no existan en BD
    // (si no existen, quedan deshabilitadas)
    const checklist = ["Efectivo", "Tarjeta", "Cheque", "Transferencia"];
    const existentes = new Set(metodos.map((m) => String(m.tipoPago || "").trim()));
    checklist.forEach((tipo) => {
      if (existentes.has(tipo)) return;
      const opt = document.createElement("option");
      opt.value = "";
      opt.disabled = true;
      opt.textContent = `${tipo} (no configurado en BD)`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar métodos de pago:", error);
  }
}

// ==================== CARGAR PRODUCTOS EN COMBO DESDE BD ====================
async function cargarProductosEnCombo(combo) {
  try {
    const productos = await ProductoModel.obtenerProductos();

    combo.innerHTML = '<option value="">-- Seleccione producto --</option>';

    productos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.idProducto || p.id;
      option.dataset.precio = p.precioUnitario || p.precio;
      option.textContent = p.nombre;
      combo.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// ==================== BUSCAR CLIENTE ====================
async function buscarCliente() {
  const cedula = document.getElementById("buscarCliente").value.trim();

  if (!cedula) {
    alert("Ingrese una cédula para buscar.");
    return;
  }
  if (!/^\d{10}$/.test(cedula)) {
    alert("Ingrese una cédula válida de 10 dígitos.");
    return;
  }

  try {
    const cliente = await ClienteModel.buscarPorCedula(cedula);

    if (!cliente) {
      if (
        confirm(
          "Cliente no encontrado en la base de datos. ¿Desea registrarlo?",
        )
      ) {
        sessionStorage.setItem("cedulaNueva", cedula);
        window.location.href = "cliente.html";
      }
      return;
    }

    clienteActual = cliente;

    document.getElementById("cedulaCliente").value =
      cliente.cedulaRUC || cliente.cedula || "";
    document.getElementById("nombreCliente").value = (
      (cliente.nombres || cliente.nombre || "") +
      " " +
      (cliente.apellidos || cliente.apellido || "")
    ).trim();
    document.getElementById("direccionCliente").value = cliente.direccion || "";
    document.getElementById("telefonoCliente").value = cliente.telefono || "";
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    alert("❌ Error de conexión al buscar el cliente.");
  }
}

// ==================== CONFIGURAR FILA DE DETALLE ====================
function configurarFilaDetalle(fila) {
  const combo = fila.querySelector(".combo-producto");
  const cantidad = fila.querySelector(".cantidad");
  const precio = fila.querySelector(".precio");

  if (combo) {
    combo.addEventListener("change", () => {
      const op = combo.selectedOptions[0];
      precio.value = op?.dataset?.precio || "";
      calcularValorFila(fila);
    });
  }

  if (cantidad) {
    cantidad.addEventListener("input", () => calcularValorFila(fila));
  }

  const btnPlus = fila.querySelector(".btn-plus");
  const btnMinus = fila.querySelector(".btn-minus");

  if (btnPlus) {
    btnPlus.addEventListener("click", agregarFila);
  }

  if (btnMinus) {
    btnMinus.addEventListener("click", () => eliminarFila(fila));
  }
}

function calcularValorFila(fila) {
  const cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
  const precio = parseFloat(fila.querySelector(".precio").value) || 0;
  fila.querySelector(".valor").value = (cantidad * precio).toFixed(2);
  calcularTotales();
}

// ==================== AGREGAR / ELIMINAR FILA ====================
async function agregarFila() {
  const tbody = document.querySelector(".detalle-factura tbody");

  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td>
      <select class="combo-producto"></select>
    </td>
    <td>
      <input type="number" class="cantidad" min="1">
    </td>
    <td>
      <input type="number" class="precio" readonly>
    </td>
    <td>
      <input type="number" class="valor" readonly>
    </td>
    <td>
      <button type="button" class="btn-plus">+</button>
    </td>
    <td>
      <button type="button" class="btn-minus">-</button>
    </td>
  `;

  tbody.appendChild(nuevaFila);

  const combo = nuevaFila.querySelector(".combo-producto");
  await cargarProductosEnCombo(combo);

  configurarFilaDetalle(nuevaFila);
}

function eliminarFila(fila) {
  const tbody = fila.parentElement;
  if (tbody.rows.length > 1) {
    fila.remove();
  }
  calcularTotales();
}

// ==================== TOTALES ====================
function calcularTotales() {
  let subtotal = 0;

  document.querySelectorAll(".valor").forEach((v) => {
    subtotal += parseFloat(v.value) || 0;
  });

  const iva = subtotal * 0.15;

  document.getElementById("subtotal").value = subtotal.toFixed(2);
  document.getElementById("iva").value = iva.toFixed(2);
  document.getElementById("total").value = (subtotal + iva).toFixed(2);
}

// ==================== OBTENER DETALLES ====================
function obtenerDetalles() {
  const detalles = [];

  const filas = document.querySelectorAll(".detalle-factura tbody tr");

  filas.forEach((fila) => {
    const combo = fila.querySelector(".combo-producto");
    const cantidad = fila.querySelector(".cantidad");
    const precio = fila.querySelector(".precio");
    const valor = fila.querySelector(".valor");

    if (!combo || !combo.value) return;

    const item = {
      idProducto: parseInt(combo.value),
      descripcion: combo.selectedOptions[0].text.trim(),
      cantidad: Number(cantidad.value) || 0,
      precio: Number(precio.value) || 0,
      valor: Number(valor.value) || 0,
      subtotalDetalle: Number(valor.value) || 0,
    };

    detalles.push(item);
  });

  return detalles;
}

// ==================== GUARDAR FACTURA ====================
async function guardarFactura(e) {
  e.preventDefault();

  if (!clienteActual) {
    alert("Debe seleccionar un cliente");
    return;
  }

  const total = parseFloat(document.getElementById("total").value);

  if (!total || total <= 0) {
    alert("El total debe ser mayor a 0");
    return;
  }

  const detalles = obtenerDetalles();

  if (detalles.length === 0) {
    alert("Debe agregar al menos un producto al detalle");
    return;
  }

  const formaPagoSelect = document.getElementById("formaPago");
  const idPago = parseInt(formaPagoSelect.value);

  if (!idPago) {
    alert("Debe seleccionar una forma de pago");
    return;
  }

  // Obtener el idCliente - puede venir del backend o del objeto mapeado
  const idCliente = clienteActual.idCliente || clienteActual.id;

  if (!idCliente) {
    alert("Error: No se pudo identificar al cliente. Búsquelo nuevamente.");
    return;
  }

  const facturaCompleta = {
    idCliente: idCliente,
    idPago: idPago,
    fecha: document.getElementById("fecha").value,
    subtotal: parseFloat(document.getElementById("subtotal").value) || 0,
    iva: parseFloat(document.getElementById("iva").value) || 0,
    total: total,
    estadoFactura: "EMITIDA",
    detalles: detalles,
  };

  try {
    const resultado = await FacturaModel.guardarFactura(facturaCompleta);

    if (resultado && resultado.error) {
      alert("❌ " + resultado.message);
      return;
    }

    alert("✅ Factura guardada exitosamente en la base de datos");

    // Registrar en historial si hay sesión activa
    await registrarHistorial(resultado);

    await limpiarFormulario();
  } catch (error) {
    console.error("Error al guardar factura:", error);
    alert("❌ Error de conexión al guardar la factura.");
  }
}

// ==================== REGISTRAR HISTORIAL ====================
async function registrarHistorial(facturaCreada) {
  try {
    const sesion = sessionStorage.getItem("sesionActiva");
    if (!sesion) return;

    const sesionData = JSON.parse(sesion);
    const idUsuario = sesionData.idUsuario;
    if (!idUsuario) return;

    const idFactura = facturaCreada.idFactura;
    if (!idFactura) return;

    await fetch(`${API_BASE}/api/historial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idFactura: idFactura,
        idUsuario: idUsuario,
        estadoAnterior: "EN PROCESO",
        estadoNuevo: "EMITIDA",
        motivo: "Factura creada desde el sistema",
      }),
    });
  } catch (error) {
    console.error("Error al registrar historial (no crítico):", error);
  }
}

// ==================== LIMPIAR FORMULARIO ====================
async function limpiarFormulario() {
  await generarDatosAutomaticos();

  clienteActual = null;

  document.getElementById("buscarCliente").value = "";
  document.getElementById("cedulaCliente").value = "";
  document.getElementById("nombreCliente").value = "";
  document.getElementById("direccionCliente").value = "";
  document.getElementById("telefonoCliente").value = "";

  document.getElementById("subtotal").value = "";
  document.getElementById("iva").value = "";
  document.getElementById("total").value = "";

  document.getElementById("formaPago").value = "";

  // Limpiar tabla de detalles y agregar una fila nueva
  document.querySelector(".detalle-factura tbody").innerHTML = "";
  await agregarFila();
}
