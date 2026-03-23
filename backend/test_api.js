const fetch = require('node-fetch');

async function testApi() {
    try {
        // Test with a known category ID (e.g., 1)
        const res = await fetch('http://localhost:5000/api/product/getProducts?categoryId=1');
        const json = await res.json();
        console.log('API Response for categoryId=1:');
        console.log(`Total elements: ${json.totalElements}`);
        if (json.content.length > 0) {
            console.log('First product category_id:', json.content[0].category_id);
            const allMatch = json.content.every(p => p.category_id == 1);
            console.log('All products match category 1:', allMatch);
        } else {
            console.log('No products found for category 1 (seeding might have randomized them elsewhere).');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testApi();
