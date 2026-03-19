require('dotenv').config();
const db = require('./models');

async function fixSequences() {
    try {
        const tables = Object.keys(db).filter(key => key.toLowerCase() !== 'sequelize');
        for (const modelName of tables) {
            if (db[modelName].tableName) {
                const tableName = db[modelName].tableName;
                console.log(`Resetting sequence for ${tableName}`);
                const [results] = await db.sequelize.query(`
                    SELECT pg_get_serial_sequence('"${tableName}"', 'id') as seq;
                `);
                if (results[0] && results[0].seq) {
                    const seqName = results[0].seq;
                    await db.sequelize.query(`
                        SELECT setval('${seqName}', COALESCE((SELECT MAX(id)+1 FROM "${tableName}"), 1), false);
                    `);
                    console.log(`Successfully reset ${seqName}`);
                }
            }
        }
        console.log('All sequences reset.');
    } catch (error) {
        console.error('Error resetting sequences:', error);
    } finally {
        process.exit();
    }
}
fixSequences();
