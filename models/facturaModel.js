const FacturaModel = { 
    obtenerFacturas() { 
        return JSON.parse(localStorage.getItem("facturas")) || []; 
    }, 
    
    guardarFactura(factura) { 
        const facturas = this.obtenerFacturas(); 
        facturas.push(factura); 
        localStorage.setItem("facturas", JSON.stringify(facturas)); 
        return true; 
    }, 
    
    buscarPorCodigo(codigo) { 
        return this.obtenerFacturas().find((f) => f.codigo === codigo); 
    }, 
    
    buscarPorCliente(cedula) { 
        return this.obtenerFacturas().filter((f) => f.cliente === cedula); 
    }, 
    
    generarCodigo() { 
        const num = this.obtenerFacturas().length + 1;
        return "FAC-" + String(num).padStart(3, "0"); 
    }, 
    
    actualizarEstado(codigo, estado) { 
        const facturas = this.obtenerFacturas();
        const index = facturas.findIndex((f) => f.codigo === codigo); 
        if (index !== -1) { 
            facturas[index].estado = estado;
            localStorage.setItem("facturas", JSON.stringify(facturas)); 
            return true; 
        } 
        return false; 
    }, 
    
    actualizarFactura(codigo, datos) {
        const facturas = this.obtenerFacturas(); 
        const index = facturas.findIndex((f) => f.codigo === codigo); 
        if (index !== -1) { 
            facturas[index] = { ...facturas[index], ...datos }; 
            localStorage.setItem("facturas", JSON.stringify(facturas)); 
            return true; 
        } 
        return false; 
    }, 
    
    eliminarFactura(codigo) { 
        let facturas = this.obtenerFacturas().filter((f) => f.codigo !== codigo); 
        localStorage.setItem("facturas", JSON.stringify(facturas)); return true; 
    } 
};
