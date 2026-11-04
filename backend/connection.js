const { Pool } = require("pg");

// Datos de conexión a PostgreSQL, leídos desde el archivo .env
// (con los valores por defecto del curso si no vienen).
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "softjobs",
  allowExitOnIdle: true,
});

module.exports = { pool };
