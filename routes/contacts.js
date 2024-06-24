const db = require('../db');
const NAME_REGEX = /^[A-Z][a-z]*[ ][A-Z][a-z ]*$/;
const NUMBER_REGEX = /^[0](412|212|424|426|414|416)[0-9]{7}$/;
const contactsRouter = require('express').Router();

contactsRouter.post('/', async (req, res) => {
  try {
    //1.obtener usuario y contrasena del body
    const { name, phone } = req.body;
    //1.1 Verificar que el nombre y el telefono es correcto
    if (!NAME_REGEX.test(name)) {
      console.log(1);
      return res.status(400).json({
        error: 'El nombre es invalido',
      });
    } else if (!NUMBER_REGEX.test(phone)) {
      console.log(2);
      return res.status(400).json({
        error: 'El numero es invalido',
      });
    }

    //2. crear el nuevo contacto (guardarlo)
    const statement = db.prepare(`
    INSERT INTO contacts (name, phone, user_id) VALUES (?, ?, ?)
    RETURNING *
    `);

    //aqui van las variables
    const contact = statement.get(name, phone, req.userId);

    // 4. Enviar la respuesta
    return res.status(201).json(contact);
  } catch (error) {
    console.log('ERROR', error.code);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El nombre de usuario ya existe',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});
// dos puntos : convierte en parametro
contactsRouter.put('/:id', async (req, res) => {
  try {
    //1.obtener usuario y contrasena del body
    const { name, phone } = req.body;
    //1.1 Verificar que el nombre y el telefono es correcto
    if (!NAME_REGEX.test(name)) {
      return res.status(400).json({
        error: 'El nombre es invalido',
      });
    } else if (!NUMBER_REGEX.test(phone)) {
      return res.status(400).json({
        error: 'El numero es invalido',
      });
    }

    //2. actualizar el contacto (guardarlo), Set modifica los parametros,
    const statement = db.prepare(`
    UPDATE contacts 
    SET
      name = ?, 
      phone = ?
    WHERE contact_id = ? AND user_id = ?
    RETURNING *
    `);

    //aqui van las variables
    const contact = statement.get(name, phone, req.params.id, req.userId);
    if(!contact){
      return res.status(403).json({
        error: 'No tienes los permisos',
      });
    }
    // 4. Enviar la respuesta
    return res.status(200).json(contact);
  } catch (error) {
    console.log('ERROR', error.code);

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'Numero duplicado',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

contactsRouter.delete('/:id', async (req, res) => {
  try {
    //2. actualizar el contacto (guardarlo), Set modifica los parametros,
    const statement = db.prepare(`
    DELETE FROM contacts WHERE contact_id = ? AND user_id = ?
    `);

    //aqui van las variables
    const { changes } = statement.run(req.params.id, req.userId);
    
    if(!changes){
      return res.status(400).json({
        error: 'el contacto no existe',
        });
    }
    // 4. Enviar la respuesta
    return res.status(200).json({ message:'contacto eliminado correctamente' });
  } catch (error) {
    console.log('ERROR', error.code);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'Numero duplicado',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});
module.exports = contactsRouter;
