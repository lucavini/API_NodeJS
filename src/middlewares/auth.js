const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// Validação de acesso da requisição
module.exports = (req, res) => {
  const authHeader = req.headers.authorization;

  // verifica se existe um token no header da requisição
  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' });
  }

  // verifica o formato do toke: Bearer + hash
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).send({ error: 'Token error' });
  }

  // verifica se o Schema contem o 'Bearer'
  const [schema, token] = parts;
  if (!/^Bearer$/i.test(schema)) {
    return res.status(401).send({ error: 'Token malformated' });
  }

  // verifica o token pela hash da aplicação
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Token invalid' });
    }
    req.userId = decoded.id;
  });
};
