const jwt = require("jsonwebtoken");
const { ErrorHTTP } = require("./errores");

// Reporta por la terminal cada consulta recibida: fecha, método, ruta y resultado
const reportarConsulta = (req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    console.log(
      `[${new Date().toLocaleString("es-CL")}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`
    );
  });
  next();
};

// Crea un middleware que revisa que el body traiga los campos indicados
const verificarCampos = (campos) => (req, res, next) => {
  const body = req.body ?? {};
  const faltantes = campos.filter(
    (campo) => typeof body[campo] !== "string" || body[campo].trim() === ""
  );
  if (faltantes.length > 0) {
    return next(new ErrorHTTP(400, `Faltan datos: ${faltantes.join(", ")}`));
  }
  next();
};

// Verifica que existan las credenciales necesarias en cada ruta
const verificarCredencialesRegistro = verificarCampos(["email", "password", "rol", "lenguage"]);
const verificarCredencialesLogin = verificarCampos(["email", "password"]);

// Valida el token de la cabecera Authorization ("Bearer <token>").
// Si es válido, guarda el email de su payload en req.email para la ruta siguiente.
const validarToken = (req, res, next) => {
  const authorization = req.header("Authorization") ?? "";
  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    return next(new ErrorHTTP(401, "Debes enviar un token en la cabecera Authorization: Bearer <token>"));
  }

  try {
    // jwt.verify comprueba la firma con la misma llave secreta y devuelve el payload decodificado
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    req.email = email;
    next();
  } catch (error) {
    const mensaje = error.name === "TokenExpiredError" ? "El token expiró, inicia sesión otra vez" : "El token no es válido";
    next(new ErrorHTTP(401, mensaje));
  }
};

module.exports = {
  reportarConsulta,
  verificarCredencialesRegistro,
  verificarCredencialesLogin,
  validarToken,
};
