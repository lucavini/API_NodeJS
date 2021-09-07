const mongoose = require('mongoose');

const dbConfig = 'mongodb://localhost/noderest';

const connection = mongoose.connect(dbConfig, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connection;
