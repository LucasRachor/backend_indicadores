const jwt = require('jsonwebtoken');

function extractEmailFromJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.name) {
      return res.status(401).json({ message: 'Token inválido: e-mail ausente' });
    }

    req.email = decoded.name;
    req.perfilId = decoded.perfilId;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = extractEmailFromJWT;
