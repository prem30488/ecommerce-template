require('dotenv').config();
const db = require('./models');

async function verify() {
    try {
        const catCount = await db.Category.count();
        const prodCount = await db.Product.count();
        const imgCount = await db.ProductImage.count();
        const sliderCount = await db.Slider.count();
        const userCount = await db.User.count();
        const privCount = await db.Privilege.count();

        console.log('--- Seeding Verification ---');
        console.log(`Categories: ${catCount}`);
        console.log(`Products: ${prodCount}`);
        console.log(`Product Images: ${imgCount}`);
        console.log(`Sliders: ${sliderCount}`);
        console.log(`Users: ${userCount}`);
        console.log(`Privileges: ${privCount}`);

        const sampleProduct = await db.Product.findOne({
            include: [{ model: db.ProductImage }]
        });
        if (sampleProduct) {
            console.log('\nSample Product:', sampleProduct.title);
            console.log('Main Image:', sampleProduct.img);
            console.log('Additional Images:', sampleProduct.ProductImages.map(i => i.url));
        }

        const superadmin = await db.User.findOne({ where: { role: 'superadmin' } });
        if (superadmin) {
            const privs = await db.Privilege.findOne({ where: { user_id: superadmin.id } });
            console.log('\nSuperadmin Privileges:', privs ? 'Found' : 'Missing');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
    }
}

verify();
