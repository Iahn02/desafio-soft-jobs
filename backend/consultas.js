const bcrypt = require("bcryptjs");
const { pool } = require("./connection");
const { ErrorHTTP } = require("./errores");

// Registra un usuario nuevo. La contraseña se guarda encriptada con bcrypt,
// nunca en texto plano. El hash de bcrypt mide 60 caracteres (cabe en VARCHAR(60)).
const registrarUsuario = async ({ email, password, rol, lenguage }) => {
  const passwordEncriptada = await bcrypt.hash(password, 10);
  const consulta =
    "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING id, email, rol, lenguage";
  const { rows } = await pool.query(consulta, [email, passwordEncriptada, rol, lenguage]);
  return rows[0];
};

// Hash de relleno: se compara contra él cuando el email no existe,
// para que la respuesta tarde lo mismo exista o no el usuario.
const HASH_DE_RELLENO = bcrypt.hashSync("relleno", 10);

// Revisa que el email exista y que la contraseña coincida con la encriptada.
// Usa el mismo mensaje y el mismo tiempo en ambos casos para no revelar qué emails están registrados.
const verificarCredenciales = async (email, password) => {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
  const usuario = rows[0];
  const coincide = await bcrypt.compare(password, usuario ? usuario.password : HASH_DE_RELLENO);
  const passwordCorrecta = Boolean(usuario) && coincide;

  if (!passwordCorrecta) {
    throw new ErrorHTTP(401, "Email o contraseña incorrecta");
  }
};

// Devuelve los datos de un usuario por su email, sin la contraseña
const obtenerUsuario = async (email) => {
  const { rows } = await pool.query(
    "SELECT id, email, rol, lenguage FROM usuarios WHERE email = $1",
    [email]
  );
  if (rows.length === 0) {
    throw new ErrorHTTP(404, "No se encontró el usuario");
  }
  return rows[0];
};

module.exports = { registrarUsuario, verificarCredenciales, obtenerUsuario };
