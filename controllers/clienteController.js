// ========================================
// VALIDACIONES DEL FORMULARIO DE CLIENTE
// ========================================

// Importar modelo (debe estar antes en el HTML)
// <script src="../models/clienteModel.js"></script>

document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.querySelector("form");
  const inputsTexto = document.querySelectorAll('input[type="text"]');

  const inputCedulaRUC = inputsTexto[0];
  const inputNombres = inputsTexto[1];
  const inputApellidos = inputsTexto[2];
  const inputDireccion = inputsTexto[3];
  const inputTelefono = inputsTexto[4];
  const inputFechaNac = document.querySelector('input[type="date"]');

  // ======================
  // EVENTOS
  // ======================

  inputCedulaRUC.addEventListener("input", soloNumeros);
  inputTelefono.addEventListener("input", soloNumeros);
  inputNombres.addEventListener("input", soloLetras);
  inputApellidos.addEventListener("input", soloLetras);

  // Botón Salir
  document.getElementById("btnSalir").addEventListener("click", function () {
    window.location.href = "menu.html";
  });

  // ======================
  // SUBMIT
  // ======================

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const valido = [
      validarCedulaRUC(),
      validarNombres(),
      validarApellidos(),
      validarDireccion(),
      validarTelefono(),
      validarFechaNacimiento(),
    ].every((v) => v === true);

    if (!valido) {
      alert("❌ Corrija los errores antes de continuar");
      return;
    }

    const cedula = inputCedulaRUC.value.trim();

    if (ClienteModel.existe(cedula)) {
      alert("⚠️ Este cliente ya está registrado");
      return;
    }

    // Crear objeto cliente
    const nuevoCliente = {
      cedulaRUC: cedula,
      nombres: inputNombres.value.trim().toUpperCase(),
      apellidos: inputApellidos.value.trim().toUpperCase(),
      direccion: inputDireccion.value.trim().toUpperCase(),
      telefono: inputTelefono.value.trim(),
      fechaNacimiento: inputFechaNac.value,
      fechaRegistro: new Date().toISOString(),
    };

    // Guardar usando el modelo
    ClienteModel.guardarCliente(nuevoCliente);

    sessionStorage.setItem(
      "clienteRegistrado",
      JSON.stringify(nuevoCliente)
    );

    alert("✅ Cliente registrado exitosamente");

    // regresar a factura
    window.location.href = "facturacion.html";
  });

  // ======================
  // VALIDACIONES
  // ======================

  function validarCedulaRUC() {
    const valor = inputCedulaRUC.value.trim();
    limpiarError(inputCedulaRUC);

    if (valor === "") {
      mostrarError(inputCedulaRUC, "La cédula o RUC es obligatoria");
      return false;
    }

    if (valor.length === 10) return validarCedula(valor);
    if (valor.length === 13) return validarRUC(valor);

    mostrarError(inputCedulaRUC, "Debe tener 10 o 13 dígitos");
    return false;
  }

  function validarCedula(cedula) {
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      mostrarError(inputCedulaRUC, "Código de provincia inválido");
      return false;
    }

    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let dig = parseInt(cedula[i]);
      if (i % 2 === 0) {
        dig *= 2;
        if (dig > 9) dig -= 9;
      }
      suma += dig;
    }

    const verificador = (10 - (suma % 10)) % 10;
    if (verificador !== parseInt(cedula[9])) {
      mostrarError(inputCedulaRUC, "Cédula inválida");
      return false;
    }
    return true;
  }

  function validarRUC(ruc) {
    if (!ruc.endsWith("001")) {
      mostrarError(inputCedulaRUC, "El RUC debe terminar en 001");
      return false;
    }
    return validarCedula(ruc.substring(0, 10));
  }

  function validarNombres() {
    return validarTexto(inputNombres, "Los nombres");
  }

  function validarApellidos() {
    return validarTexto(inputApellidos, "Los apellidos");
  }

  function validarTexto(input, campo) {
    const valor = input.value.trim();
    limpiarError(input);

    if (valor === "") {
      mostrarError(input, `${campo} son obligatorios`);
      return false;
    }

    if (valor.length < 3 || valor.length > 50) {
      mostrarError(input, `${campo} deben tener entre 3 y 50 caracteres`);
      return false;
    }

    return true;
  }

  function validarDireccion() {
    const dir = inputDireccion.value.trim();
    limpiarError(inputDireccion);

    if (dir.length < 5) {
      mostrarError(inputDireccion, "Dirección demasiado corta");
      return false;
    }
    return true;
  }

  function validarTelefono() {
    const tel = inputTelefono.value.trim();
    limpiarError(inputTelefono);

    if (tel.length === 10 && tel.startsWith("09")) return true;
    if (
      tel.length === 9 &&
      ["02", "03", "04", "05", "06", "07"].includes(tel.substring(0, 2))
    )
      return true;

    mostrarError(inputTelefono, "Teléfono inválido");
    return false;
  }

  function validarFechaNacimiento() {
    limpiarError(inputFechaNac);

    if (!inputFechaNac.value) {
      mostrarError(inputFechaNac, "Fecha obligatoria");
      return false;
    }

    const fecha = new Date(inputFechaNac.value);
    const edad = new Date().getFullYear() - fecha.getFullYear();

    if (edad < 18 || edad > 80) {
      mostrarError(inputFechaNac, "Edad no permitida");
      return false;
    }
    return true;
  }

  // ======================
  // AUXILIARES
  // ======================

  function mostrarError(input, mensaje) {
    limpiarError(input);
    const span = document.createElement("span");
    span.className = "mensaje-error";
    span.textContent = mensaje;
    span.style.color = "red";
    span.style.fontSize = "12px";
    span.style.display = "block";
    input.parentElement.appendChild(span);
  }

  function limpiarError(input) {
    const e = input.parentElement.querySelector(".mensaje-error");
    if (e) e.remove();
  }

  function soloNumeros(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }

  function soloLetras(e) {
    e.target.value = e.target.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "");
  }
});

document.addEventListener("DOMContentLoaded", () => {

  const cedula = sessionStorage.getItem("cedulaNueva");

  if (cedula) {
      document.getElementById("cedula").value = cedula;

      // Opcional: bloquear para que no la cambien
      document.getElementById("cedula").readOnly = true;

      sessionStorage.removeItem("cedulaNueva");
  }

});

function cargarProductosEnCombo(combo) {
  const model = window.ProductModel || window.ProductoModel;

  const productos = model.obtenerProductos();

  combo.innerHTML =
    `<option value="">-- Seleccione producto --</option>`;

  productos.forEach(p => {
    combo.innerHTML += `
      <option value="${p.id}" data-precio="${p.precio}">
        ${p.nombre}
      </option>`;
  });
}

