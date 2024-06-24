const bcrypt = require('bcrypt');
const db = require('../db');
const USERNAME_REGEX = /^[a-z0-9]{4,12}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&*.!¡-])[a-zA-Z0-9@#$%^&*.!¡-]{6,}$/;
const usersRouter = require('express').Router();
usersRouter.post('/', async (request, response) => {
  try {
    //1.obtener usuario y contrasena del body
    const { username, password } = request.body;
    //1.1 Verificar que el nombre de usuario es correcto
    if (!USERNAME_REGEX.test(username)) {
      return response.status(400).json({
        error: 'El nombre es invalido',
      });
    } else if (!PASSWORD_REGEX.test(password)) {
      return response.status(400).json({
        error: 'La contraseña es invalida',
      });
    }
    //1.2 Verificar que la contrasena es correcta (el else de arriba linea 17)
    // 2. encryptar contrasena (se instalo bcrypt en el terminal)
    const passwordHash = await bcrypt.hash(password, 10);

    //3. crear el nuevo usuario (guardarlo)
    const statement = db.prepare(`
   INSERT INTO users (username, password) VALUES (?, ?)
   RETURNING *
  `);
    //aqui van las variables
    statement.run(username, passwordHash);

    // 4. Enviar la respuesta
    return response.status(201).json({ message: `El usuario ${username} se ha creado con exito` });
  } catch (error) {
    console.log('ERROR', error.code);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return response.status(409).json({
        error: 'El nombre de usuario ya existe',
      });
    }
    return response.status(500).json({ error: 'Hubo un error' });
  }
});

module.exports = usersRouter;
