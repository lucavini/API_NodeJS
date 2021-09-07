const User = require('../models/User');

module.exports = {
  // Rota /register
  async register(req, res) {
    const { email } = req.body;

    try {
      // pesquisa se o email ja existe
      if (await User.findOne({ email })) {
        return res.status(400).send({ error: 'User alredy exists' });
      }
      const user = await User.create(req.body);
      user.password = undefined;

      return res.send({ user });
    } catch (err) {
      return res.status(400).send({ error: 'Registration failed' });
    }
  },

  // Rota /
};
