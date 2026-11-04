require("dotenv").config({ quiet: true });

if (!process.env.JWT_SECRET) {
  console.error("Falta JWT_SECRET. Copia .env.example como .env y define una llave secreta.");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { registrarUsuario, verificarCredenciales, obtenerUsuario } = require("./consultas");
const {
  reportarConsulta,
  verificarCredencialesRegistro,
  verificarCredencialesLogin,
  validarToken,
} = require("./middlewares");
const { manejarErrores, ErrorHTTP } = require("./errores");

const app = express();
const PORT = 3000;

// El reporte va primero para registrar todas las consultas, incluso las que fallan después
app.use(reportarConsulta);
app.use(cors());
app.use(express.json());

// POST /usuarios : registra un usuario nuevo (con la contraseña encriptada)
app.post("/usuarios", verificarCredencialesRegistro, async (req, res, next) => {
  try {
    const usuario = await registrarUsuario(req.body);
    res.status(201).json({ message: "Usuario registrado con éxito", usuario });
  } catch (error) {
    next(error);
  }
});

// POST /login : revisa las credenciales y devuelve un token JWT con el email en su payload
app.post("/login", verificarCredencialesLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// GET /usuarios : devuelve los datos del usuario dueño del token.
// validarToken ya verificó la firma y decodificó el email del payload.
// Se responde un arreglo porque así lo lee el cliente React ({ data: [user] }).
app.get("/usuarios", validarToken, async (req, res, next) => {
  try {
    const usuario = await obtenerUsuario(req.email);
    res.json([usuario]);
  } catch (error) {
    next(error);
  }
});

// Cualquier otra ruta no existe
app.use((req, res, next) => {
  next(new ErrorHTTP(404, "La ruta que intentas consultar no existe"));
});

// Captura todos los errores y los devuelve como { message }
app.use(manejarErrores);

app.listen(PORT, () => {
  console.log(`Servidor encendido en http://localhost:${PORT}`);
});
