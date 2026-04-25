require('dotenv').config();
const { Client } = require('pg');
const { URL } = require('url');

async function resetDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }

    const postgresUrlObj = new URL(dbUrl);
    postgresUrlObj.pathname = '/postgres';
    postgresUrlObj.search = ''; 
    const postgresUrl = postgresUrlObj.toString();

    const client = new Client({ 
        connectionString: postgresUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        // Force disconnect other users from the database we want to drop
        console.log(`Terminating connections to database "${dbName}"...`);
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = $1
              AND pid <> pg_backend_pid();
        `, [dbName]);

        console.log(`Dropping database "${dbName}"...`);
        await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
        
        console.log(`Creating database "${dbName}"...`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        
        console.log('Database reset successfully.');
    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

resetDatabase();
