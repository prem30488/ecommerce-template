require('dotenv').config();
const { Category } = require('../models');

async function updateCategories() {
    const mappings = {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
        7: 6, 8: 4, 9: 5, 10: 1, 11: 4, 12: 1, 13: 2,
        14: 5, 15: 1, 16: 4, 17: 3, 18: 6, 19: 1, 20: 1,
        21: 4, 22: 5, 23: 4, 24: 1, 25: 3, 28: 5
    };

    for (const [catId, imgId] of Object.entries(mappings)) {
        try {
            await Category.update(
                { imageUrl: `/images/category/cat_${imgId}.png` }, 
                { where: { id: catId } }
            );
            console.log(`Updated category ${catId} with cat_${imgId}.png`);
        } catch (err) {
            console.error(`Error updating category ${catId}:`, err);
        }
    }
    console.log("✅ All 26 categories processed.");
    process.exit();
}

updateCategories();
