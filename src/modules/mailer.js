const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const { host, port, user, pass } = require('../config/mail.json');

// Configuração de email com nodemailer
const transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  },
});

// configuração do template de email
transport.use(
  'compile',
  hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/'),
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  })
);

module.exports = transport;