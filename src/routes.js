const express = require('express');
const routes = express.Router();

//Controllers
const authController = require('./controllers/authController');
const projectController = require('./controllers/projectController');

// Rota /auth
routes.post('/auth/register', authController.register);
routes.post('/auth/autheticate', authController.autheticate);
routes.post('/auth/forgot_password', authController.forgot_password);
routes.post('/auth/reset_password', authController.reset_password);

// Requisições protegidas via middlewares
// Rota /projects
routes.get('/projects',projectController.getAllprojects);
routes.get('/projects/:projectId',projectController.getProject);
routes.post('/projects',projectController.projectCreate);
routes.put('/projects/:projectId',projectController.projectUpdate);
routes.delete('/projects/:projectId',projectController.projectDelete);



module.exports = routes;
