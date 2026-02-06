// ========================================
// CONTROLADOR DE LOGIN - CONECTADO AL BACKEND
// ========================================

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

document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.querySelector("form");
  const inputUsuario = document.querySelector('input[type="text"]');
  const inputPassword = document.querySelector('input[type="password"]');
  const selectRol = document.querySelector("select");

  const modalUsuarioExiste = document.getElementById("modalUsuarioExiste");
  const btnCerrarModal = document.getElementById("btnCerrarModal");

  // requisitos visuales
  const contenedorRequisitos = document.getElementById("passwordRequisitos");

  // ======================
  // EVENTOS
  // ======================

  inputUsuario.addEventListener("blur", validarUsuario);
  selectRol.addEventListener("change", validarRol);

  inputPassword.addEventListener("focus", () => {
    contenedorRequisitos.style.display = "block";
  });

  inputPassword.addEventListener("input", () => {
    validarRequisitosPassword();
    validarPassword();
  });

  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuarioValido = validarUsuario();
    const passwordValido = validarPassword();
    const rolValido = validarRol();

    if (usuarioValido && passwordValido && rolValido) {
      const usuario = inputUsuario.value.trim();
      const contrasena = inputPassword.value;
      const rolFrontend = selectRol.value;

      // Mapear roles del frontend al backend
      const rolesMap = {
        factura: "FACTURACION",
        admin: "ADMINISTRADOR",
        contabilidad: "CONTABILIDAD",
      };
      const rol = rolesMap[rolFrontend] || rolFrontend;

      try {
        // 1) Verificar si el usuario ya existe en la BD
        const existeResp = await fetch(
          `${API_BASE}/api/usuarios/existe/${encodeURIComponent(usuario)}`,
        );
        const existeJson = await existeResp.json();

        if (existeJson.success && existeJson.data.existe) {
          // El usuario ya existe → intentar LOGIN
          const loginResp = await fetch(`${API_BASE}/api/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, contrasena }),
          });

          const loginJson = await loginResp.json();

          if (loginJson.success) {
            // Login exitoso → guardar sesión y redirigir
            sessionStorage.setItem(
              "sesionActiva",
              JSON.stringify({
                idUsuario: loginJson.data.idUsuario,
                usuario: loginJson.data.usuario,
                nombre: loginJson.data.nombre,
                apellido: loginJson.data.apellido,
                rol: loginJson.data.rol,
                fechaLogin: new Date().toISOString(),
              }),
            );

            window.location.href = "menu.html";
          } else {
            // Credenciales incorrectas
            mostrarError(
              inputPassword,
              "Contraseña incorrecta para este usuario",
            );
          }
          return;
        }

        // 2) El usuario NO existe → crear (registrar) nuevo usuario
        const crearResp = await fetch(`${API_BASE}/api/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: usuario,
            contrasena: contrasena,
            nombre: usuario,
            apellido: "-",
            rol: rol,
          }),
        });

        const crearJson = await crearResp.json();

        if (crearJson.success) {
          // Usuario creado exitosamente → guardar sesión y redirigir
          sessionStorage.setItem(
            "sesionActiva",
            JSON.stringify({
              idUsuario: crearJson.data.idUsuario,
              usuario: crearJson.data.usuario,
              nombre: crearJson.data.nombre,
              apellido: crearJson.data.apellido,
              rol: crearJson.data.rol,
              fechaLogin: new Date().toISOString(),
            }),
          );

          alert("✅ Usuario registrado exitosamente");
          window.location.href = "menu.html";
        } else if (crearResp.status === 409) {
          // Conflicto: usuario ya existe (carrera entre verificación y creación)
          modalUsuarioExiste.classList.add("mostrar");
        } else {
          alert("❌ Error al registrar usuario: " + crearJson.message);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        alert(
          "❌ No se pudo conectar al servidor. Asegúrese de que el servidor esté corriendo en " +
            API_BASE,
        );
      }
    }
  });

  btnCerrarModal.addEventListener("click", () => {
    modalUsuarioExiste.classList.remove("mostrar");
  });

  // ======================
  // VALIDACIONES
  // ======================

  function validarUsuario() {
    const usuario = inputUsuario.value.trim();
    limpiarError(inputUsuario);

    if (usuario === "") {
      mostrarError(inputUsuario, "El usuario es obligatorio");
      return false;
    }

    if (usuario.length < 8 || usuario.length > 20) {
      mostrarError(
        inputUsuario,
        "El usuario debe tener entre 8 y 20 caracteres",
      );
      return false;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(usuario)) {
      mostrarError(inputUsuario, "Solo letras, números, punto y guion bajo");
      return false;
    }

    return true;
  }

  function validarPassword() {
    const password = inputPassword.value;
    limpiarError(inputPassword);

    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9*._@\-&%]/.test(password) ||
      password.length < 8
    ) {
      mostrarError(inputPassword, "La contraseña no cumple los requisitos");
      return false;
    }

    return true;
  }

  function validarRol() {
    const rol = selectRol.value;
    limpiarError(selectRol);

    if (rol === "") {
      mostrarError(selectRol, "Debe seleccionar un rol");
      return false;
    }

    return true;
  }

  // ======================
  // REQUISITOS VISUALES
  // ======================

  function validarRequisitosPassword() {
    const password = inputPassword.value;

    marcar("req-minuscula", /[a-z]/.test(password));
    marcar("req-mayuscula", /[A-Z]/.test(password));
    marcar("req-numero", /[0-9*._@\-&%]/.test(password));
    marcar("req-longitud", password.length >= 8);
  }

  function marcar(id, cumple) {
    const item = document.getElementById(id);

    const textoBase = item.textContent.replace(/^✔ |^• /, "");

    if (cumple) {
      item.style.color = "green";
      item.textContent = "✔ " + textoBase;
    } else {
      item.style.color = "#555";
      item.textContent = "• " + textoBase;
    }
  }

  // ======================
  // ERRORES
  // ======================

  function mostrarError(input, mensaje) {
    limpiarError(input);

    const mensajeError = document.createElement("span");
    mensajeError.className = "mensaje-error";
    mensajeError.textContent = mensaje;
    mensajeError.style.color = "red";
    mensajeError.style.fontSize = "12px";
    mensajeError.style.display = "block";
    mensajeError.style.marginTop = "4px";

    input.parentElement.appendChild(mensajeError);
  }

  function limpiarError(input) {
    const mensajeError = input.parentElement.querySelector(".mensaje-error");
    if (mensajeError) mensajeError.remove();
  }
});
