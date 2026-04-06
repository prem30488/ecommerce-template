const { Client } = require('pg');
require('dotenv').config();

const testLocal = async () => {
    // Try local postgres default
    const connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres';
    console.log('Testing connection to local postgres at localhost:5432...');
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('✅ Success! Connected to local postgres.');
        const res = await client.query('SELECT current_database(), version()');
        console.log('Database:', res.rows[0].current_database);
        console.log('Version:', res.rows[0].version);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to connect to local postgres:', err.message);
        process.exit(1);
    }
};

testLocal();
