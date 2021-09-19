const authMiddleware = require('../middlewares/auth'); // Intercepta e verifica a requisição
const Project = require('../models/Projects');
const Task = require('../models/Task');

module.exports = {
  // Rota: get /projects
  async getAllprojects(req, res) {
    try {
      authMiddleware(req, res);
      const projects = await Project.find().populate(['user', 'tasks']);

      res.send({ projects });
    } catch (err) {
      return res.status(400).send({ error: 'Error loading projects' });
    }
  },

  // Rota: get /projects/:projectId
  async getProject(req, res) {
    try {
      authMiddleware(req, res);
      const { projectId } = req.params;
      const project = await Project.findById(projectId).populate([
        'user',
        'tasks',
      ]);

      res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error loading project' });
    }
  },

  // Rota: post /projects
  async projectCreate(req, res) {
    try {
      authMiddleware(req, res);

      // Cria o projeto com um vetor de Tasks vazio
      const { title, description, tasks } = req.body;
      const project = await Project.create({
        title,
        description,
        user: req.userId,
      });

      // Percorre o vetor de tasks recebido na requisição e
      // cria as tasks uma por uma e adiciona no vetor do Project
      await Promise.all(
        tasks.map(async (task) => {
          const projectTask = new Task({ ...task, project: project._id });
          await projectTask.save();
          project.tasks.push(projectTask);
        })
      );

      await project.save();
      res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error creating a new Project' });
    }
  },

  // Rota: put /projects/:projectId
  async projectUpdate(req, res) {
    try {
      authMiddleware(req, res);

      // Atualiza um projeto ja criado buscando id na requisição
      // {new: true} retorna o projeto atualizado
      const { title, description, tasks } = req.body;
      const project = await Project.findByIdAndUpdate(req.params.projectId, {
        title,
        description,
      }, {new: true});


      project.tasks = []; // Remove todas as tasks daquele projeto
      await Task.deleteMany({project: project._id}); // Deleta a tasks associada aquele projeto


      // Cria novamente as tasks
      // Percorre o vetor de tasks recebido na requisição e
      // cria as tasks uma por uma e adiciona no vetor do Project
      await Promise.all(
        tasks.map(async (task) => {
          const projectTask = new Task({ ...task, project: project._id });
          await projectTask.save();
          project.tasks.push(projectTask);
        })
      );

      await project.save();
      res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error updating a Project' });
    }
  },

  // Rota: delete /projects/:projectId
  async projectDelete(req, res) {
    try {
      authMiddleware(req, res);
      const { projectId } = req.params;
      const project = await Project.findByIdAndDelete(projectId);

      await Task.deleteMany({project: project._id}); // Deleta a tasks associada aquele projeto

      res.send();
    } catch (err) {
      return res.status(400).send({ error: 'Error deleting a new Project' });
    }
  },
};
