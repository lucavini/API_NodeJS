const express = require('express');
const routes = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

module.exports = {
  projects(req, res) {
    try {
      // Intercepta a requisição antes de
      // prosseguir para o controller
      authMiddleware(req, res);

      res.send({ ok: true, user: req.userId });
    } catch (err) {
      return res.send(err);
    }
  },
};
