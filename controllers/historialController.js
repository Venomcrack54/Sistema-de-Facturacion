// ==================== HISTORIAL DE FACTURACIÓN ====================
// Importar modelo (debe estar antes en el HTML)
// <script src="../models/facturaModel.js"></script>

let facturaSeleccionada = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".btn-buscar button")
    .addEventListener("click", buscarFacturas);
  document.querySelector(".btn-ver").addEventListener("click", verFactura);
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
  if (/^FAC-\d{3}$/i.test(valor)) return { valido: true };
  return { valido: false, mensaje: "Código debe tener formato FAC-XXX." };
}

// ==================== BÚSQUEDA ====================
function buscarFacturas() {
  const inputs = document.querySelectorAll(".busqueda input");
  const cedulaRuc = inputs[0].value.trim();
  const codigo = inputs[1].value.trim();

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

  let resultados = FacturaModel.obtenerFacturas();

  if (cedulaRuc) {
    resultados = FacturaModel.buscarPorCliente(cedulaRuc);
  }
  if (codigo) {
    const factura = FacturaModel.buscarPorCodigo(codigo);
    resultados = factura ? [factura] : [];
  }

  mostrarResultados(resultados);
}

// ==================== MOSTRAR RESULTADOS ====================
function mostrarResultados(facturas) {
  const tbody = document.querySelector(".tabla-historial tbody");
  facturaSeleccionada = null;

  if (facturas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">No se encontraron facturas.</td></tr>';
    return;
  }

  tbody.innerHTML = facturas
    .map(
      (f) => `
    <tr data-codigo="${f.codigo}">
      <td><input type="radio" name="seleccion" data-codigo="${f.codigo}"></td>
      <td>${f.codigo}</td>
      <td>${f.fecha}</td>
      <td>${f.nombre}</td>
      <td>
        <select class="select-estado" data-codigo="${f.codigo}">
          <option value="Pagada" ${f.estado === "Pagada" ? "selected" : ""}>Pagada</option>
          <option value="Pendiente" ${f.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="Anulada" ${f.estado === "Anulada" ? "selected" : ""}>Anulada</option>
        </select>
      </td>
      <td>
        <button type="button" class="btn-del-row" onclick="borrarDirecto('${f.codigo}')">🗑️</button>
      </td>
    </tr>
  `,
    )
    .join("");

  // Evento para cambiar estado
  tbody.querySelectorAll(".select-estado").forEach((select) => {
    select.addEventListener("change", (e) => {
      const codigo = e.target.dataset.codigo;
      const nuevoEstado = e.target.value;
      FacturaModel.actualizarEstado(codigo, nuevoEstado);
      alert(`Estado de ${codigo} cambiado a: ${nuevoEstado}`);
    });
  });

  // Evento para seleccionar factura
  tbody.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      facturaSeleccionada = e.target.dataset.codigo;
    });
  });
}

// ==================== VER FACTURA ====================
function verFactura() {
  if (!facturaSeleccionada) {
    alert("Seleccione una factura para visualizar.");
    return;
  }

  const factura = FacturaModel.buscarPorCodigo(facturaSeleccionada);
  if (factura) {
    let detalleStr = "";
    if (factura.detalles) {
      detalleStr = factura.detalles
        .map((d) => `  - ${d.descripcion}: ${d.cantidad} x $${d.precio}`)
        .join("\n");
    }

    alert(
      `📄 FACTURA: ${factura.codigo}\n📅 Fecha: ${factura.fecha}\n⏰ Hora: ${factura.hora}\n👤 Cliente: ${factura.nombre}\n🆔 Cédula/RUC: ${factura.cliente}\n\n📦 DETALLE:\n${detalleStr}\n\n💰 Subtotal: $${factura.subtotal}\n💰 IVA: $${factura.iva}\n💰 Total: $${factura.total}\n💳 Pago: ${factura.formaPago}\n📌 Estado: ${factura.estado}`,
    );
  }
}

// ==================== BORRAR FACTURA ====================
function borrarDirecto(codigo) {
  if (!confirm(`¿Está seguro de eliminar la factura ${codigo}?`)) return;

  FacturaModel.eliminarFactura(codigo);
  facturaSeleccionada = null;

  alert(`Factura ${codigo} eliminada.`);
  mostrarResultados(FacturaModel.obtenerFacturas());
}