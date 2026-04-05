'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const { URL } = require('url');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const fullConfig = require(__dirname + '/../config/config.json');
const config = fullConfig[env] || fullConfig['development'];
const db = {};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  let dbUrl = process.env[config.use_env_variable];
  // Normalize protocol for Sequelize
  if (dbUrl.startsWith('postgresql://')) {
    dbUrl = dbUrl.replace('postgresql://', 'postgres://');
  }
  try {
    const parsedUrl = new URL(dbUrl);
    sequelize = new Sequelize(
      parsedUrl.pathname.substring(1),
      parsedUrl.username,
      parsedUrl.password,
      {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        dialect: config.dialect || 'postgres',
        logging: false,
        ...config
      }
    );
  } catch (error) {
    console.error('Error parsing DATABASE_URL, using connection string directly:', error);
    sequelize = new Sequelize(dbUrl, config);
  }
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
