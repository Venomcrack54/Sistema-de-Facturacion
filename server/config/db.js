const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "sistema_facturacion"
});

connection.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
    return;
  }
  console.log("Conectado a MySQL - sistema_facturacion");
});

const db = connection.promise();

module.exports = db;
