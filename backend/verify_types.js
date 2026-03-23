require('dotenv').config();
const db = require('./models');

async function verify() {
    try {
        const categories = await db.Category.findAll({ limit: 10 });
        console.log('Sample Categories with Types:');
        categories.forEach(cat => {
            console.log(`- ${cat.title} (Type: ${cat.type})`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
