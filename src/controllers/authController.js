const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

function tokenCreator(id) {
  // informa o dado que nunca vai se repetir,
  // hash da aplicação,
  // data de expiração do token (sec)
  const token = jwt.sign(id, authConfig.secret, {
    expiresIn: 86400,
  });

  return token;
}

module.exports = {
  // Rota: /register
  async register(req, res) {
    const { email } = req.body;

    try {
      // pesquisa se o email ja existe
      if (await User.findOne({ email })) {
        return res.status(400).send({ error: 'User alredy exists' });
      }

      const user = await User.create(req.body);
      user.password = undefined; //faz com que a senha não seja retornada após o create
      const token = tokenCreator({ id: user._id });

      return res.send({ user, token });
    } catch (err) {
      return res.status(400).send({ error: 'Registration failed' });
    }
  },

  // Rota: /autheticate
  async autheticate(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password'); // busca uma propriedade select=false

    // validação de login e senha
    if (!user) {
      return res.status(400).send({ error: 'User not found' });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Invalid password' });
    }
    user.password = undefined;
    const token = tokenCreator({ id: user._id });

    return res.send({ user, token });
  },
};
