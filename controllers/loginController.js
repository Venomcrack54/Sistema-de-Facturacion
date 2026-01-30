// ========================================
// VALIDACIONES DEL FORMULARIO DE LOGIN
// ========================================

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

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuarioValido = validarUsuario();
    const passwordValido = validarPassword();
    const rolValido = validarRol();

    if (usuarioValido && passwordValido && rolValido) {
      //VERIFICAR SI USUARIO YA EXISTE
      if (usuarioExiste(inputUsuario.value.trim())) {
        modalUsuarioExiste.classList.add("mostrar");
        return;
      }

      //GUARDAR USUARIO
      guardarUsuario();

      //guardar sesión
      localStorage.setItem(
        "sesionActiva",
        JSON.stringify({
          usuario: inputUsuario.value.trim(),
          rol: selectRol.value,
          fechaLogin: new Date().toISOString(),
        }),
      );

      window.location.href = "menu.html";
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
  // USUARIOS (LOCALSTORAGE)
  // ======================

  function usuarioExiste(usuario) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.some((u) => u.usuario === usuario);
  }

  function guardarUsuario() {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    usuarios.push({
      usuario: inputUsuario.value.trim(),
      password: inputPassword.value, // solo demo
      rol: selectRol.value,
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
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
