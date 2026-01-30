// ==================== FACTURACIÓN ====================
// Importar modelos (deben estar antes en el HTML)
// <script src="../models/clienteModel.js"></script>
// <script src="../models/facturaModel.js"></script>

let clienteActual = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
  generarDatosAutomaticos();
  document.getElementById("btnBuscar").addEventListener("click", buscarCliente);
  document
    .querySelector(".factura-container form")
    .addEventListener("submit", guardarFactura);
  configurarFilaDetalle(document.querySelector(".detalle-factura tbody tr"));
});

function generarDatosAutomaticos() {
  document.getElementById("codigo").value = FacturaModel.generarCodigo();
  const ahora = new Date();
  document.getElementById("fecha").value = ahora.toISOString().split("T")[0];
  document.getElementById("hora").value = ahora.toTimeString().slice(0, 5);
}

// ==================== VALIDACIÓN CÉDULA ECUATORIANA ====================
function validarCedulaEcuatoriana(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  if (parseInt(cedula[2]) >= 6) return false;

  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula[i]) * coef[i];
    if (val > 9) val -= 9;
    suma += val;
  }
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return verificador === parseInt(cedula[9]);
}

// ==================== CLIENTE ====================
function buscarCliente() {
  const cedula = document.getElementById("buscarCliente").value.trim();

  console.log("=== BUSCANDO CLIENTE ===");
  console.log("Cédula buscada:", cedula);

  if (!cedula) {
    alert("Ingrese una cédula o RUC para buscar.");
    return;
  }

  if (cedula.length === 10) {
    if (!validarCedulaEcuatoriana(cedula)) {
      alert("Cédula ecuatoriana inválida.");
      return;
    }
  } else if (cedula.length === 13) {
    if (!validarCedulaEcuatoriana(cedula.substring(0, 10))) {
      alert("RUC inválido (cédula base incorrecta).");
      return;
    }
  } else {
    alert("Ingrese 10 dígitos (cédula) o 13 dígitos (RUC).");
    return;
  }

  console.log("Total clientes:", ClienteModel.obtenerClientes().length);

  const cliente = ClienteModel.buscarPorCedula(cedula);
  console.log("Cliente encontrado:", cliente);

  if (!cliente) {
    console.log("❌ Cliente NO encontrado");
    if (confirm("Cliente no encontrado. ¿Desea registrarlo?")) {
      window.location.href = "cliente.html";
    }
    return;
  }

  console.log("✅ Cliente encontrado, llenando campos...");
  clienteActual = cliente;
  document.getElementById("cedulaCliente").value = cliente.cedulaRUC;
  document.getElementById("nombreCliente").value =
    `${cliente.nombres} ${cliente.apellidos}`;
  document.getElementById("direccionCliente").value = cliente.direccion;
  document.getElementById("telefonoCliente").value = cliente.telefono;
  console.log("=== FIN BÚSQUEDA ===");
}

function limpiarCliente() {
  clienteActual = null;
  document.getElementById("cedulaCliente").value = "";
  document.getElementById("nombreCliente").value = "";
  document.getElementById("direccionCliente").value = "";
  document.getElementById("telefonoCliente").value = "";
}

// ==================== DETALLE ====================
function configurarFilaDetalle(fila) {
  const inputs = fila.querySelectorAll("input");
  inputs[1].addEventListener("input", () => calcularValorFila(fila));
  inputs[2].addEventListener("input", () => calcularValorFila(fila));
  fila.querySelector(".btn-plus").addEventListener("click", agregarFila);
  fila.querySelector(".btn-minus").addEventListener("click", () => eliminarFila(fila));
}

function calcularValorFila(fila) {
  const inputs = fila.querySelectorAll("input");
  const cantidad = parseFloat(inputs[1].value) || 0;
  const precio = parseFloat(inputs[2].value) || 0;
  inputs[3].value = (cantidad * precio).toFixed(2);
  calcularTotales();
}

function agregarFila() {
  const tbody = document.querySelector(".detalle-factura tbody");
  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td><input type="text"></td>
    <td><input type="number"></td>
    <td><input type="number" step="0.01"></td>
    <td><input type="number" readonly></td>
    <td><button type="button" class="btn-plus">+</button></td>
    <td><button type="button" class="btn-minus">-</button></td>
  `;
  tbody.appendChild(nuevaFila);
  configurarFilaDetalle(nuevaFila);
}

function eliminarFila(fila) {
  const tbody = fila.parentElement;

  // Evitar eliminar la última fila
  if (tbody.rows.length > 1) {
    fila.remove();
  }
}


// ==================== CÁLCULOS ====================
function calcularTotales() {
  let subtotal = 0;
  document.querySelectorAll(".detalle-factura tbody tr").forEach((fila) => {
    subtotal += parseFloat(fila.querySelectorAll("input")[3].value) || 0;
  });
  const iva = subtotal * 0.15;
  document.getElementById("subtotal").value = subtotal.toFixed(2);
  document.getElementById("iva").value = iva.toFixed(2);
  document.getElementById("total").value = (subtotal + iva).toFixed(2);
}

// ==================== VALIDACIONES ====================
function validarDetalle(fila) {
  const inputs = fila.querySelectorAll("input");
  if (!inputs[0].value.trim())
    return { valido: false, mensaje: "La descripción es obligatoria." };
  if (!parseFloat(inputs[1].value) || parseFloat(inputs[1].value) <= 0)
    return { valido: false, mensaje: "La cantidad debe ser mayor a 0." };
  if (!parseFloat(inputs[2].value) || parseFloat(inputs[2].value) <= 0)
    return { valido: false, mensaje: "El precio debe ser mayor a $0.00." };
  return { valido: true };
}

// ==================== GUARDAR ====================
function guardarFactura(e) {
  e.preventDefault();

  if (!clienteActual) {
    alert("Debe buscar y seleccionar un cliente válido.");
    return;
  }

  const filas = document.querySelectorAll(".detalle-factura tbody tr");
  let detalles = [];

  for (let fila of filas) {
    const val = validarDetalle(fila);
    if (!val.valido) {
      alert(val.mensaje);
      return;
    }
    const inputs = fila.querySelectorAll("input");
    detalles.push({
      descripcion: inputs[0].value.trim(),
      cantidad: parseFloat(inputs[1].value),
      precio: parseFloat(inputs[2].value),
      valor: parseFloat(inputs[3].value),
    });
  }

  const total = parseFloat(document.getElementById("total").value);
  if (total <= 0) {
    alert("El total debe ser mayor a $0.00.");
    return;
  }

  if (!document.getElementById("formaPago").value) {
    alert("Seleccione una forma de pago.");
    return;
  }

  const factura = {
    codigo: document.getElementById("codigo").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    cliente: clienteActual.cedulaRUC,
    nombre: `${clienteActual.nombres} ${clienteActual.apellidos}`,
    detalles: detalles,
    subtotal: parseFloat(document.getElementById("subtotal").value),
    iva: parseFloat(document.getElementById("iva").value),
    total: total,
    formaPago: document.getElementById("formaPago").value,
    estado: "Pendiente",
  };

  FacturaModel.guardarFactura(factura);

  alert(`Factura ${factura.codigo} guardada exitosamente.`);
  limpiarFormulario();
}

function limpiarFormulario() {
  generarDatosAutomaticos();
  limpiarCliente();
  document.getElementById("buscarCliente").value = "";
  document.querySelector(".detalle-factura tbody").innerHTML = `
    <tr>
      <td><input type="text"></td>
      <td><input type="number"></td>
      <td><input type="number"></td>
      <td><input type="number" readonly></td>
      <td><button type="button" class="btn-plus">+</button></td>
    </tr>
  `;
  configurarFilaDetalle(document.querySelector(".detalle-factura tbody tr"));
  document.getElementById("formaPago").value = "";
  calcularTotales();
}
