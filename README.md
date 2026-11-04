# Desafío - Soft Jobs

Servidor Express para la plataforma Soft Jobs con autenticación y autorización de usuarios usando JWT. Los usuarios se guardan en PostgreSQL con la contraseña encriptada (bcrypt). Incluye el cliente React entregado en el material de apoyo.

## Estructura

- `backend/`: servidor Express.
  - `index.js`: rutas `POST /usuarios`, `POST /login` y `GET /usuarios`.
  - `middlewares.js`: reporte de consultas, verificación de credenciales y validación del token.
  - `consultas.js`: consultas a la base de datos y encriptación de contraseñas.
  - `errores.js`: clase `ErrorHTTP` y middleware que devuelve todos los errores como `{ message }`.
  - `connection.js`: conexión a PostgreSQL con `Pool` de `pg`.
  - `schema.sql`: crea la base `softjobs` y la tabla `usuarios`.
  - `.env.example`: plantilla de variables de entorno.
- `frontend/`: cliente React + Vite (material de apoyo, sin cambios).

## Cómo ejecutarlo

Requiere Node.js y PostgreSQL.

1. Crear la base de datos y la tabla:

   ```bash
   psql -U postgres -f backend/schema.sql
   ```

2. Configurar las variables de entorno. Copia la plantilla y cambia `JWT_SECRET` por una llave larga y aleatoria:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Para generar una llave aleatoria puedes usar:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Instalar dependencias y levantar el servidor (puerto 3000):

   ```bash
   npm install
   npm start
   ```

4. En otra terminal, levantar el cliente:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Abre la URL que muestra Vite (normalmente http://localhost:5173).

## Rutas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/usuarios` | Registra un usuario. Recibe `{ email, password, rol, lenguage }` y guarda la contraseña encriptada. |
| POST | `/login` | Recibe `{ email, password }`. Si son correctos, devuelve `{ token }`: un JWT con el `email` en su payload, válido por 1 hora. |
| GET | `/usuarios` | Requiere la cabecera `Authorization: Bearer <token>`. Devuelve los datos del usuario dueño del token (sin la contraseña). |

`GET /usuarios` responde un arreglo con el usuario (`[{ id, email, rol, lenguage }]`), porque así lo lee el cliente React.

## Middlewares

- `reportarConsulta`: muestra en la terminal cada consulta recibida, con fecha, método, ruta, código de respuesta y duración.
- `verificarCredencialesRegistro` y `verificarCredencialesLogin`: revisan que el body traiga los campos necesarios en `POST /usuarios` y `POST /login`. Si falta alguno responde `400`.
- `validarToken`: en `GET /usuarios`, extrae el token de la cabecera `Authorization`, lo verifica con la misma llave secreta usada al firmarlo y deja el `email` del payload disponible para la ruta.

## Errores

Todos los errores se devuelven como `{ message }`, que es lo que muestra el cliente:

| Situación | Código |
| --- | --- |
| Faltan datos, son muy largos o el JSON es inválido | `400` |
| Email o contraseña incorrecta | `401` |
| Falta el token, no es válido o expiró | `401` |
| El email ya está registrado | `409` |
| El usuario del token ya no existe, o la ruta no existe | `404` |
| Error inesperado en el servidor | `500` |

## Seguridad

- Las contraseñas se encriptan con bcrypt antes de guardarlas; nunca se guardan ni se devuelven en texto plano.
- La llave secreta del JWT vive en `.env`, que no se sube al repositorio.
- El login responde el mismo mensaje y en el mismo tiempo si el email no existe o si la contraseña es incorrecta, para no revelar qué emails están registrados.
- Todas las consultas SQL usan parámetros (`$1`, `$2`, ...) para evitar SQL Injection.
