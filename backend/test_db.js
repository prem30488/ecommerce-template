require('dotenv').config();
const { Sequelize } = require('sequelize');
const dbUrl = process.env.DATABASE_URL;

console.log('Testing connection to:', dbUrl);

const sequelize = new Sequelize(dbUrl, {
    logging: console.log,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        connectTimeout: 120000,
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });
