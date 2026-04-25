const { Sequelize } = require('sequelize');
const { URL } = require('url');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
let sequelize;

if (dbUrl) {
    try {
        const parsedUrl = new URL(dbUrl);
        sequelize = new Sequelize(
            parsedUrl.pathname.substring(1),
            parsedUrl.username,
            parsedUrl.password,
            {
                host: parsedUrl.hostname,
                port: parsedUrl.port,
                pool: {
                    max: 20,
                    min: 0,
                    acquire: 120000,
                    idle: 10000
                },
                dialect: 'postgres',
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    },
                    connectTimeout: 120000,
                },
                logging: false,

            }
        );
    } catch (e) {
        console.error('Error parsing DATABASE_URL in db.js, using connection string directly.');
        sequelize = new Sequelize(dbUrl, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: false
        });
    }
}

module.exports = sequelize;