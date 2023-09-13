const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql', // Change this to your database dialect
  host: 'localhost', // Change this to your database host
  username: 'root', // Change this to your database username
  password: 'root', // Change this to your database password
  database: 'react_database', // Change this to your database name
});

module.exports = sequelize;
