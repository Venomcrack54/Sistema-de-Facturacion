// ==================== CONSTANTES DE LOCAL STORAGE ====================
// Claves utilizadas para almacenar datos en localStorage

const STORAGE_KEYS = {
  CLIENTES: "clientes",
  FACTURAS: "facturas",
  USUARIOS: "usuarios",
};

// Exportar para uso en otros archivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = STORAGE_KEYS;
}
