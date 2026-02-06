// ==================== HISTORIAL DE FACTURACIÓN - CONECTADO AL BACKEND ====================

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

let facturaSeleccionada = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".btn-buscar button")
    .addEventListener("click", buscarFacturas);
  document.querySelector(".btn-ver").addEventListener("click", verFactura);

  // Asignar IDs a los inputs de búsqueda si no los tienen
  const inputs = document.querySelectorAll(".busqueda input");
  if (inputs[0]) inputs[0].id = "inputCedulaHistorial";
  if (inputs[1]) inputs[1].id = "inputCodigoHistorial";
});

// ==================== VALIDACIONES ====================
function validarCedulaRuc(valor) {
  if (!valor) return { valido: true };
  if (/^\d{10}$/.test(valor) || /^\d{13}$/.test(valor)) return { valido: true };
  return {
    valido: false,
    mensaje: "Cédula (10 dígitos) o RUC (13 dígitos) inválido.",
  };
}

function validarCodigoFactura(valor) {
  if (!valor) return { valido: true };
  // Aceptar formato FAC-XXX o un número directo (ID)
  if (/^FAC-\d{1,}$/i.test(valor) || /^\d+$/.test(valor))
    return { valido: true };
  return {
    valido: false,
    mensaje: "Código debe tener formato FAC-XXX o ser un número de ID.",
  };
}

// ==================== BÚSQUEDA ====================
async function buscarFacturas() {
  const inputCedula = document.getElementById("inputCedulaHistorial");
  const inputCodigo = document.getElementById("inputCodigoHistorial");

  const cedulaRuc = inputCedula ? inputCedula.value.trim() : "";
  const codigo = inputCodigo ? inputCodigo.value.trim() : "";

  // Si ambos tienen valor, priorizar cédula
  if (cedulaRuc && codigo && inputCodigo) {
    inputCodigo.value = "";
  }

  const validCedula = validarCedulaRuc(cedulaRuc);
  if (!validCedula.valido) {
    alert(validCedula.mensaje);
    return;
  }

  const validCodigo = validarCodigoFactura(codigo);
  if (!validCodigo.valido) {
    alert(validCodigo.mensaje);
    return;
  }

  try {
    let resultados = [];

    if (cedulaRuc) {
      // Buscar por cédula del cliente en la BD
      resultados = await FacturaModel.buscarPorCliente(cedulaRuc);
      if (inputCedula) inputCedula.value = "";
    } else if (codigo) {
      // Buscar por código/ID
      let idBuscar = codigo;

      // Si viene en formato FAC-XXX, extraer el número
      const match = codigo.match(/^FAC-(\d+)$/i);
      if (match) {
        idBuscar = parseInt(match[1]);
      }

      const factura = await FacturaModel.buscarPorCodigo(idBuscar);
      resultados = factura ? [factura] : [];
      if (inputCodigo) inputCodigo.value = "";
    } else {
      // Si no hay filtros, traer todas las facturas
      resultados = await FacturaModel.obtenerFacturas();
    }

    mostrarResultados(resultados);
  } catch (error) {
    console.error("Error al buscar facturas:", error);
    alert("❌ Error de conexión al buscar facturas.");
  }
}

// ==================== MOSTRAR RESULTADOS ====================
function mostrarResultados(facturas) {
  const tbody = document.querySelector(".tabla-historial tbody");
  facturaSeleccionada = null;

  if (!facturas || facturas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">No se encontraron facturas.</td></tr>';
    return;
  }

  tbody.innerHTML = facturas
    .map(
      (f) => `
    <tr data-id="${f.idFactura}">
      <td><input type="radio" name="seleccion" data-id="${f.idFactura}"></td>
      <td>${f.codigo || "FAC-" + String(f.idFactura).padStart(3, "0")}</td>
      <td>${f.fecha || ""}</td>
      <td>${f.nombre || ""}</td>
      <td>
        <select class="select-estado" data-id="${f.idFactura}">
          <option value="EMITIDA" ${f.estadoFactura === "EMITIDA" ? "selected" : ""}>Emitida</option>
          <option value="EN PROCESO" ${f.estadoFactura === "EN PROCESO" ? "selected" : ""}>En Proceso</option>
          <option value="ANULADA" ${f.estadoFactura === "ANULADA" ? "selected" : ""}>Anulada</option>
          <option value="RECHAZADA" ${f.estadoFactura === "RECHAZADA" ? "selected" : ""}>Rechazada</option>
        </select>
      </td>
      <td>
        <button type="button" class="btn-del-row" data-id="${f.idFactura}">🗑️</button>
      </td>
    </tr>
  `,
    )
    .join("");

  // Evento para cambiar estado
  tbody.querySelectorAll(".select-estado").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const idFactura = e.target.dataset.id;
      const nuevoEstado = e.target.value;

      try {
        const exito = await FacturaModel.actualizarEstado(
          idFactura,
          nuevoEstado,
        );
        if (exito) {
          // Registrar cambio en historial
          await registrarCambioHistorial(idFactura, nuevoEstado);
          alert(
            `✅ Estado de factura #${idFactura} cambiado a: ${nuevoEstado}`,
          );
        } else {
          alert("❌ No se pudo actualizar el estado.");
        }
      } catch (error) {
        console.error("Error al actualizar estado:", error);
        alert("❌ Error de conexión al actualizar estado.");
      }
    });
  });

  // Evento para seleccionar factura (radio button)
  tbody.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      facturaSeleccionada = e.target.dataset.id;
    });
  });

  // Evento para eliminar factura
  tbody.querySelectorAll(".btn-del-row").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const idFactura = e.target.dataset.id;
      await borrarDirecto(idFactura);
    });
  });
}

// ==================== REGISTRAR CAMBIO EN HISTORIAL ====================
async function registrarCambioHistorial(idFactura, nuevoEstado) {
  try {
    const sesion = sessionStorage.getItem("sesionActiva");
    if (!sesion) return;

    const sesionData = JSON.parse(sesion);
    const idUsuario = sesionData.idUsuario;
    if (!idUsuario) return;

    // Obtener estado anterior de la factura
    const factura = await FacturaModel.buscarPorId(idFactura);
    const estadoAnterior = factura
      ? factura.estadoFactura || "EN PROCESO"
      : "EN PROCESO";

    await fetch(`${API_BASE}/api/historial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idFactura: parseInt(idFactura),
        idUsuario: idUsuario,
        estadoAnterior: estadoAnterior,
        estadoNuevo: nuevoEstado,
        motivo: "Cambio de estado desde historial",
      }),
    });
  } catch (error) {
    console.error("Error al registrar historial (no crítico):", error);
  }
}

// ==================== VER FACTURA ====================
async function verFactura() {
  if (!facturaSeleccionada) {
    alert("Seleccione una factura para visualizar.");
    return;
  }

  try {
    const factura = await FacturaModel.buscarPorId(facturaSeleccionada);

    if (!factura) {
      alert("❌ No se pudo cargar la factura.");
      return;
    }

    // Obtener detalles de la factura
    const detalles = await FacturaModel.obtenerDetalles(facturaSeleccionada);

    let detalleStr = "Sin detalles";
    if (detalles && detalles.length > 0) {
      detalleStr = detalles
        .map(
          (d) =>
            `  - ${d.descripcion || d.nombreProducto}: ${d.cantidad} x $${Number(d.precio).toFixed(2)} = $${Number(d.subtotalDetalle || d.valor).toFixed(2)}`,
        )
        .join("\n");
    }

    const codigo =
      factura.codigo || "FAC-" + String(factura.idFactura).padStart(3, "0");

    alert(
      `📄 FACTURA: ${codigo}\n` +
        `🔑 ID: ${factura.idFactura}\n` +
        `📅 Fecha: ${factura.fecha || ""}\n` +
        `👤 Cliente: ${factura.nombre || ""}\n` +
        `🆔 Cédula/RUC: ${factura.cliente || ""}\n\n` +
        `📦 DETALLE:\n${detalleStr}\n\n` +
        `💰 Subtotal: $${Number(factura.subtotal || 0).toFixed(2)}\n` +
        `💰 IVA: $${Number(factura.iva || 0).toFixed(2)}\n` +
        `💰 Total: $${Number(factura.total || 0).toFixed(2)}\n` +
        `💳 Pago: ${factura.formaPago || ""}\n` +
        `📌 Estado: ${factura.estadoFactura || factura.estado || ""}`,
    );
  } catch (error) {
    console.error("Error al ver factura:", error);
    alert("❌ Error de conexión al cargar la factura.");
  }
}

// ==================== BORRAR FACTURA ====================
async function borrarDirecto(idFactura) {
  if (
    !confirm(
      `¿Está seguro de eliminar la factura #${idFactura}? Esta acción eliminará también sus detalles y su historial.`,
    )
  )
    return;

  try {
    const exito = await FacturaModel.eliminarFactura(idFactura);

    if (exito) {
      facturaSeleccionada = null;
      alert(`✅ Factura #${idFactura} eliminada de la base de datos.`);

      // Recargar la lista
      const facturas = await FacturaModel.obtenerFacturas();
      mostrarResultados(facturas);
    } else {
      alert("❌ No se pudo eliminar la factura.");
    }
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    alert("❌ Error de conexión al eliminar la factura.");
  }
}
