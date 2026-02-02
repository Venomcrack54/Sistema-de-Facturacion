const ProductoModel = {

  obtenerProductos() {
    return JSON.parse(localStorage.getItem("productos")) || [];
  },

  guardarProductosIniciales() {

    if (localStorage.getItem("productos")) return;

    const productos = [
      { id: 1, nombre: "Cuaderno Universitario 100h", precio: 2.50 },
      { id: 2, nombre: "Esferográfico Azul", precio: 0.35 },
      { id: 3, nombre: "Esferográfico Negro", precio: 0.35 },
      { id: 4, nombre: "Lápiz HB", precio: 0.30 },
      { id: 5, nombre: "Borrador", precio: 0.25 },
      { id: 6, nombre: "Resaltador", precio: 0.80 },
      { id: 7, nombre: "Carpeta Plástica", precio: 1.20 },
      { id: 8, nombre: "Mochila Escolar", precio: 18.50 },
      { id: 9, nombre: "Regla 30cm", precio: 0.60 },
      { id:10, nombre: "Corrector", precio: 0.90 },
      { id:11, nombre: "Tijera Escolar", precio: 1.10 },
      { id:12, nombre: "Marcador Permanente", precio: 1.25 },
      { id:13, nombre: "Papel Bond Resma", precio: 4.75 },
      { id:14, nombre: "Calculadora Básica", precio: 6.90 },
      { id:15, nombre: "Goma en Barra", precio: 0.55 }
    ];

    localStorage.setItem("productos", JSON.stringify(productos));
  },

  buscarPorId(id) {
    return this.obtenerProductos().find(p => p.id == id);
  }

};

ProductoModel.guardarProductosIniciales();
