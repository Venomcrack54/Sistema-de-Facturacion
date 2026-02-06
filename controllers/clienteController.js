// ========================================
// CONTROLADOR DE CLIENTE - MVC → API → MySQL
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // Avisar si se abre por file:// (no guardará en BD)
  if (window.location.protocol === "file:") {
    alert(
      "⚠️ Para guardar en la base de datos MySQL debe abrir:\nhttp://localhost:3000\n\nInicie el servidor con: npm start"
    );
  }

  const formulario = document.getElementById("formCliente");
  const inputsTexto = document.querySelectorAll('input[type="text"]');

  const inputCedulaRUC = document.getElementById("cedula");
  const inputNombres = document.getElementById("nombres");
  const inputApellidos = document.getElementById("apellidos");
  const inputDireccion = document.getElementById("direccion");
  const inputTelefono = document.getElementById("telefono");
  const inputCorreo = document.getElementById("correo"); // opcional: no está en cliente.html
  const inputFechaNac = document.getElementById("fecha");
  const btnRegistrar = document.querySelector('button[type="submit"]');

  // Si se encuentra un cliente existente en BD, se guardará aquí
  let clienteEncontrado = null;

  // ======================
  // EVENTOS
  // ======================

  inputCedulaRUC.addEventListener("input", soloNumeros);
  inputCedulaRUC.addEventListener("blur", () => {
    // Buscar y autocompletar al salir del campo
    buscarYAutocompletarCliente();
  });
  inputCedulaRUC.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarYAutocompletarCliente();
    }
  });
  inputTelefono.addEventListener("input", soloNumeros);
  inputNombres.addEventListener("input", soloLetras);
  inputApellidos.addEventListener("input", soloLetras);

  // Salir: ahora es un enlace <a href="menu.html"> que funciona sin JS

  // Cargar cédula si viene desde facturación
  const cedula = sessionStorage.getItem("cedulaNueva");
  if (cedula) {
    inputCedulaRUC.value = cedula;
    inputCedulaRUC.readOnly = true;
    sessionStorage.removeItem("cedulaNueva");
  }

  // ======================
  // SUBMIT
  // ======================

  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (window.location.protocol === "file:") {
      alert("Abra http://localhost:3000 para guardar en MySQL");
      return;
    }

    // Si ya cargamos un cliente existente desde BD, no crear duplicado:
    // lo enviamos a facturación para que lo use directamente.
    const cedulaVal = inputCedulaRUC.value.trim();
    if (
      clienteEncontrado &&
      (clienteEncontrado.cedulaRUC === cedulaVal ||
        clienteEncontrado.cedula === cedulaVal)
    ) {
      sessionStorage.setItem(
        "clienteRegistrado",
        JSON.stringify(clienteEncontrado),
      );
      alert("✅ Cliente encontrado. Se cargó para facturación.");
      window.location.href = "facturacion.html";
      return;
    }

    const valido = [
      validarCedulaRUC(),
      validarNombres(),
      validarApellidos(),
      validarDireccion(),
      validarTelefono(),
      validarCorreo(),
      validarFechaNacimiento(),
    ].every((v) => v === true);

    if (!valido) {
      alert("❌ Corrija los errores antes de continuar");
      return;
    }

    try {
      // Verificar si ya existe en la BD
      const existe = await ClienteModel.existe(cedulaVal);

      if (existe) {
        alert("⚠️ Este cliente ya está registrado en la base de datos");
        return;
      }

      // Crear objeto cliente para enviar al backend
      const nuevoCliente = {
        cedulaRUC: cedulaVal,
        nombres: inputNombres.value.trim().toUpperCase(),
        apellidos: inputApellidos.value.trim().toUpperCase(),
        direccion: inputDireccion.value.trim().toUpperCase(),
        telefono: inputTelefono.value.trim(),
        correo: inputCorreo ? inputCorreo.value.trim() : "sin-correo@mail.com",
        fechaNacimiento: inputFechaNac.value,
      };

      // MVC: Modelo llama a API → Backend guarda en MySQL
      const resultado = await ClienteModel.guardarCliente(nuevoCliente);

      if (resultado && resultado.error) {
        alert("❌ Error al registrar cliente: " + resultado.message);
        return;
      }

      if (!resultado || !resultado.idCliente) {
        alert("❌ No se recibió confirmación del servidor. Verifique que npm start esté corriendo.");
        return;
      }

      // Guardar en sessionStorage para que facturación lo reciba
      sessionStorage.setItem(
        "clienteRegistrado",
        JSON.stringify({
          idCliente: resultado.idCliente,
          cedulaRUC: resultado.cedula || cedulaVal,
          cedula: resultado.cedula || cedulaVal,
          nombres: nuevoCliente.nombres,
          apellidos: nuevoCliente.apellidos,
          nombre: nuevoCliente.nombres,
          apellido: nuevoCliente.apellidos,
          direccion: nuevoCliente.direccion,
          telefono: nuevoCliente.telefono,
          correo: nuevoCliente.correo,
          fechaNacimiento: nuevoCliente.fechaNacimiento,
        }),
      );

      alert("✅ Cliente registrado exitosamente en la base de datos");

      // Regresar a facturación
      window.location.href = "facturacion.html";
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      alert(
        "❌ No se pudo conectar al servidor. Asegúrese de que el servidor esté corriendo.",
      );
    }
  });

  // ======================
  // BUSCADOR: AUTOCOMPLETAR
  // ======================

  async function buscarYAutocompletarCliente() {
    const valor = inputCedulaRUC.value.trim();

    // Reset si el usuario cambia la cédula
    clienteEncontrado = null;
    if (btnRegistrar) btnRegistrar.textContent = "Registrar Cliente";

    // Buscar SOLO por CÉDULA (10 dígitos)
    if (valor.length !== 10) return;
    if (!validarCedulaRUC()) return;

    try {
      const cliente = await ClienteModel.buscarPorCedula(valor);
      if (!cliente) return;

      // Guardar para que el submit lo "use" en facturación
      clienteEncontrado = cliente;

      // Autocompletar campos
      inputNombres.value = (cliente.nombres || cliente.nombre || "").toUpperCase();
      inputApellidos.value = (cliente.apellidos || cliente.apellido || "").toUpperCase();
      inputDireccion.value = (cliente.direccion || "").toUpperCase();
      inputTelefono.value = cliente.telefono || "";

      // Fecha: puede venir como DATETIME (YYYY-MM-DD HH:mm:ss) o ISO
      inputFechaNac.value = normalizarFechaParaInput(cliente.fechaNacimiento);

      // UX: indicar que se encontró
      if (btnRegistrar) btnRegistrar.textContent = "Usar Cliente";
    } catch (error) {
      console.error("Error al buscar/autocompletar cliente:", error);
      // No alert fuerte para no molestar; solo consola
    }
  }

  function normalizarFechaParaInput(valorFecha) {
    if (!valorFecha) return "";
    // ISO: 2026-02-06T00:00:00.000Z
    if (typeof valorFecha === "string") {
      if (valorFecha.includes("T")) return valorFecha.slice(0, 10);
      // MySQL: 2026-02-06 00:00:00
      if (valorFecha.includes(" ")) return valorFecha.split(" ")[0];
      // Ya es YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(valorFecha)) return valorFecha;
    }
    try {
      const d = new Date(valorFecha);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  // ======================
  // VALIDACIONES
  // ======================

  function validarCedulaRUC() {
    const valor = inputCedulaRUC.value.trim();
    limpiarError(inputCedulaRUC);

    if (valor === "") {
      mostrarError(inputCedulaRUC, "La cédula es obligatoria");
      return false;
    }

    if (valor.length === 10) return validarCedula(valor);

    mostrarError(inputCedulaRUC, "La cédula debe tener 10 dígitos");
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

  // RUC no se usa aquí (búsqueda/registro solo por cédula)

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

  function validarCorreo() {
    if (!inputCorreo) return true; // Si no existe el campo, no validar

    const correo = inputCorreo.value.trim();
    limpiarError(inputCorreo);

    if (correo === "") {
      mostrarError(inputCorreo, "El correo es obligatorio");
      return false;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      mostrarError(inputCorreo, "Correo electrónico inválido");
      return false;
    }

    return true;
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
