const db = require('../db');

const validateUser = (request, response, next) => {
  const userId = Number(request.query.userId);

  if (!userId) {
    return response.sendStatus(403);
  }

  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

  if (!user) {
    return response.sendStatus(403);
  }

  request.userId = user.user_id;
  return next();
};

module.exports = validateUser;
