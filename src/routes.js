const express = require('express');
const routes = express.Router();

//Controllers
const authController = require('./controllers/authController');

// Rota /auth
routes.post('/auth/register', authController.register);

// exporta as rotas definidas
module.exports = routes;
