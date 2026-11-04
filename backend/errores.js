// Error con código HTTP, para responder 400, 401, 404, etc. con un mensaje claro
class ErrorHTTP extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Middleware final de errores: captura cualquier error de las rutas o middlewares
// y lo devuelve al cliente como { message }, que es lo que muestra la app React.
const manejarErrores = (error, req, res, next) => {
  // Email repetido: viola la restricción UNIQUE de la tabla usuarios
  if (error.code === "23505") {
    return res.status(409).json({ message: "El email ya está registrado" });
  }
  // Algún dato supera el largo de la columna (ej: email de más de 50 caracteres)
  if (error.code === "22001") {
    return res.status(400).json({ message: "Algún dato es demasiado largo" });
  }
  // El cuerpo de la consulta no es un JSON válido
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "El cuerpo de la consulta no es un JSON válido" });
  }
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "Ocurrió un error en el servidor" });
};

module.exports = { ErrorHTTP, manejarErrores };
