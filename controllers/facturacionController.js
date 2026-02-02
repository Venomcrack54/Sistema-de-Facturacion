// ==================== FACTURACIÓN ====================
// Importar modelos (deben estar antes en el HTML)
// <script src="../models/clienteModel.js"></script>
// <script src="../models/facturaModel.js"></script>

// ==================== FACTURACIÓN ====================
let clienteActual = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {

  generarDatosAutomaticos();

  // Cargar combos existentes al iniciar
  document.querySelectorAll(".combo-producto")
    .forEach(cargarProductosEnCombo);

  const clienteDesdeRegistro =
    sessionStorage.getItem("clienteRegistrado");

  if (clienteDesdeRegistro) {

    const cliente = JSON.parse(clienteDesdeRegistro);

    clienteActual = cliente;

    document.getElementById("cedulaCliente").value =
      cliente.cedulaRUC;

    document.getElementById("nombreCliente").value =
      cliente.nombres + " " + cliente.apellidos;

    document.getElementById("direccionCliente").value =
      cliente.direccion;

    document.getElementById("telefonoCliente").value =
      cliente.telefono;

    sessionStorage.removeItem("clienteRegistrado");
  }

  document.getElementById("btnBuscar")
    .addEventListener("click", buscarCliente);

  document.querySelector("form")
    .addEventListener("submit", guardarFactura);

  configurarFilaDetalle(
    document.querySelector(".detalle-factura tbody tr")
  );
});

// ==================== DATOS AUTOMÁTICOS ====================
function generarDatosAutomaticos() {

  document.getElementById("codigo").value =
    FacturaModel.generarCodigo();

  const ahora = new Date();

  document.getElementById("fecha").value =
    ahora.toISOString().split("T")[0];

  document.getElementById("hora").value =
    ahora.toTimeString().slice(0, 5);
}

// ==================== CLIENTE ====================
function buscarCliente() {

  const cedula =
    document.getElementById("buscarCliente").value.trim();

  if (!cedula) {
    alert("Ingrese una cédula o RUC para buscar.");
    return;
  }

  const cliente =
    ClienteModel.buscarPorCedula(cedula);

  if (!cliente) {

    if (confirm("Cliente no encontrado. ¿Desea registrarlo?")) {

      sessionStorage.setItem("cedulaNueva", cedula);

      window.location.href = "cliente.html";
    }
    return;
  }

  clienteActual = cliente;

  document.getElementById("cedulaCliente").value =
    cliente.cedulaRUC;

  document.getElementById("nombreCliente").value =
    cliente.nombres + " " + cliente.apellidos;

  document.getElementById("direccionCliente").value =
    cliente.direccion;

  document.getElementById("telefonoCliente").value =
    cliente.telefono;
}

// ==================== DETALLE ====================
function configurarFilaDetalle(fila) {

  const combo = fila.querySelector(".combo-producto");
  const cantidad = fila.querySelector(".cantidad");
  const precio = fila.querySelector(".precio");

  combo.addEventListener("change", () => {

    const op = combo.selectedOptions[0];

    precio.value = op?.dataset?.precio || "";

    calcularValorFila(fila);
  });

  cantidad.addEventListener("input", () =>
    calcularValorFila(fila)
  );

  fila.querySelector(".btn-plus")
    .addEventListener("click", agregarFila);

  fila.querySelector(".btn-minus")
    .addEventListener("click", () =>
      eliminarFila(fila)
    );
}

function calcularValorFila(fila) {

  const cantidad =
    parseFloat(fila.querySelector(".cantidad").value) || 0;

  const precio =
    parseFloat(fila.querySelector(".precio").value) || 0;

  fila.querySelector(".valor").value =
    (cantidad * precio).toFixed(2);

  calcularTotales();
}

// ==================== AGREGAR FILA ====================
function agregarFila() {

  const tbody =
    document.querySelector(".detalle-factura tbody");

  const nuevaFila =
    document.createElement("tr");

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

  const combo =
    nuevaFila.querySelector(".combo-producto");

  cargarProductosEnCombo(combo);

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

  document.querySelectorAll(".valor")
    .forEach(v => {
      subtotal += parseFloat(v.value) || 0;
    });

  const iva = subtotal * 0.15;

  document.getElementById("subtotal").value =
    subtotal.toFixed(2);

  document.getElementById("iva").value =
    iva.toFixed(2);

  document.getElementById("total").value =
    (subtotal + iva).toFixed(2);
}

// ==================== GUARDAR ====================
function guardarFactura(e) {

  e.preventDefault();

  if (!clienteActual) {
    alert("Debe seleccionar un cliente");
    return;
  }

  const total =
    parseFloat(document.getElementById("total").value);

  if (total <= 0) {
    alert("El total debe ser mayor a 0");
    return;
  }

  const facturaCompleta = {

    codigo:
      document.getElementById("codigo").value,

    fecha:
      document.getElementById("fecha").value,

    hora:
      document.getElementById("hora").value,

    cliente:
      clienteActual.cedulaRUC,

    nombre:
      clienteActual.nombres + " " + clienteActual.apellidos,

    subtotal:
      parseFloat(document.getElementById("subtotal").value),

    iva:
      parseFloat(document.getElementById("iva").value),

    total: total,

    formaPago:
      document.getElementById("formaPago").value,

    estado: "Pendiente",

    detalles: obtenerDetalles()
  };

  FacturaModel.guardarFactura(facturaCompleta);

  alert("Factura guardada correctamente");

  limpiarFormulario();
}

// ==================== LIMPIAR ====================
function limpiarFormulario() {

  generarDatosAutomaticos();

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

  document.querySelector(".detalle-factura tbody").innerHTML = "";

  agregarFila();
}

// ==================== CARGAR PRODUCTOS ====================
function cargarProductosEnCombo(combo) {

  const productos = ProductoModel.obtenerProductos();

  console.log("Productos cargados:", productos); // ← para probar

  combo.innerHTML =
    `<option value="">-- Seleccione producto --</option>`;

  productos.forEach(p => {
    combo.innerHTML += `
      <option value="${p.id}" data-precio="${p.precio}">
        ${p.nombre}
      </option>`;
  });
}

// ==================== OBTENER DETALLES ====================
function obtenerDetalles() {

  const detalles = [];

  const filas =
    document.querySelectorAll(".detalle-factura tbody tr");

  filas.forEach(fila => {

    const combo = fila.querySelector(".combo-producto");
    const cantidad = fila.querySelector(".cantidad");
    const precio = fila.querySelector(".precio");
    const valor = fila.querySelector(".valor");

    if (!combo || !combo.value) return;

    const item = {
      descripcion: combo.selectedOptions[0].text,
      cantidad: Number(cantidad.value) || 0,
      precio: Number(precio.value) || 0,
      valor: Number(valor.value) || 0
    };

    detalles.push(item);
  });

  return detalles;
}


const clienteDesdeRegistro =
  sessionStorage.getItem("clienteRegistrado");

if (clienteDesdeRegistro) {

  const cliente = JSON.parse(clienteDesdeRegistro);

  console.log("Cargando cliente en factura:", cliente);

  clienteActual = cliente;

  const c = document.getElementById("cedulaCliente");
  const n = document.getElementById("nombreCliente");
  const d = document.getElementById("direccionCliente");
  const t = document.getElementById("telefonoCliente");

  if (c) c.value = cliente.cedulaRUC || "";
  if (n) n.value = (cliente.nombres || "") + " " + (cliente.apellidos || "");
  if (d) d.value = cliente.direccion || "";
  if (t) t.value = cliente.telefono || "";

  sessionStorage.removeItem("clienteRegistrado");
}
