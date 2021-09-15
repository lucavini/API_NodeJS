const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const crypto = require('crypto');
const mailer = require('../modules/mailer');

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

  // Rota /forgot_password
  async forgot_password(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ error: 'User not found' });
      }

      // token e data de expriração
      const token = crypto.randomBytes(20).toString('hex');
      const now = new Date();
      now.setHours(now.getHours() + 1); // hora atual + 1 hora

      // busca e atualiza determinados campos do usuario
      await User.findByIdAndUpdate(user.id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      // envia email para recuperar a senha
      mailer.sendMail(
        {
          to: email,
          from: 'lucass.lv.lv@gmail.com',
          template: 'auth/forgot_password', // template html para o email
          context: { token }, // variaveis usuadas no email
        },
        (err) => {
          if (err)
            return res
              .status(400)
              .send({ error: 'Cannot send forgot password email' });

          return res.send();
        }
      );
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Error on forgot password, try again' });
    }
  },

  // Rota /reset_password
  async reset_password(req, res) {
    const { email, token, password } = req.body;
    try {
      const user = await User.findOne({ email }).select(
        '+passwordResetToken passwordResetExpires'
      );

      // verifica se existe um user com esse email
      if (!user) return res.status(400).send({ error: 'User not found' });

      // verifica se o token enviado bate coom o token no bd
      if (token !== user.passwordResetToken)
        return res.status(400).send({ error: 'Token invalid' });

      // verifica se o token está expirado
      const now = new Date();
      if (now > user.passwordResetExpires)
        return res
          .status(400)
          .send({ error: 'Token expired, generate a new one' });

      // atualiza a senha do usuario
      user.password = password;
      await user.save();


      return res.status(200).send()

    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Cannot reset password, try again' });
    }
  },
};
