require('dotenv').config();
const db = require('./models');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// High-quality Unsplash Image IDs
const imagePool = [
    '1496181754640-f2f46e820e74', '1499951360447-b19be8fe80f5', '1517336714460-d35fc4a96046',
    '1511707171634-5f897ff02aa9', '1510557880182-3d4d3cba35a5', '1523206489230-c012cba445f4',
    '1523275335684-37898b6baf30', '1542496658-e33a6d0d50f6', '1508685096489-7aac296bf393',
    '1505740420928-5e560c06d30e', '1484704849700-f032a568e944', '1546435770-a3e426fb472b',
    '1526170315876-c9580199738d', '1572635196237-14b3f281503f', '1585333127302-d32617770339',
    '1525547718573-047e172e274b', '1498050108023-c5249f4df085', '14997503101bf-7ad2022b87f3'
];

const getUnsplashUrl = (id, seed = 'default') => `https://picsum.photos/seed/${id}${seed}/800/600`;

async function downloadImage(url, dest) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    const buffer = await response.buffer();

    // Determine extension from content-type or URL
    const contentType = response.headers.get('content-type');
    let ext = 'jpg';
    if (contentType) {
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('jpeg')) ext = 'jpg';
        else if (contentType.includes('webp')) ext = 'webp';
    } else {
        const urlExt = path.extname(new URL(url).pathname);
        if (urlExt) ext = urlExt.substring(1);
    }

    const finalDest = `${dest}.${ext}`;
    await fs.promises.writeFile(finalDest, buffer);
    return finalDest;
}

async function seedData() {
    try {
        console.log('Starting seeding process...');

        const publicImagesPath = path.join(__dirname, '..', 'Front End', 'public', 'images');
        if (!fs.existsSync(publicImagesPath)) {
            fs.mkdirSync(publicImagesPath, { recursive: true });
        }

        // 1. Seed Audiences
        const audiences = [{ id: 1, name: 'Men' }, { id: 2, name: 'Women' }, { id: 3, name: 'Kids' }];
        for (const aud of audiences) await db.Audience.findOrCreate({ where: { id: aud.id }, defaults: aud });
        console.log('Seeded audiences.');

        // 2. Seed Genders
        const genders = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }, { id: 3, name: 'Transgender' }];
        for (const gen of genders) await db.Gender.findOrCreate({ where: { id: gen.id }, defaults: gen });
        console.log('Seeded genders.');

        // 3. Seed Categories
        const categoriesPath = path.join(__dirname, '..', 'Front End', 'public', 'categories.json');
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const createdCategories = [];
        for (let i = 0; i < categoriesData.length; i++) {
            const cat = await db.Category.create({ title: categoriesData[i], order: i, active: true, type: Math.floor(Math.random() * 3) + 1 });
            createdCategories.push(cat);
        }
        console.log(`Seeded ${createdCategories.length} categories.`);

        // 4. Seed Products with random categories and 3 images total
        const productsPath = path.join(__dirname, '..', 'Front End', 'public', 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        for (const product of productsData) {
            const randomCat = createdCategories[Math.floor(Math.random() * createdCategories.length)];
            const selectedImages = [...imagePool].sort(() => 0.5 - Math.random()).slice(0, 3);

            // Create product first to get ID
            const createdProduct = await db.Product.create({
                title: product.title,
                description: product.description,
                img: '', // Will update later
                category_id: randomCat.id,
                brand: product.brand,
                price: product.price,
                rating: product.rating,
                bestseller: product.bestseller,
                featured: product.featured,
                audience: product.audience,
                stock: product.stock,
                active: true
            });

            const productImagesDir = path.join(publicImagesPath, String(createdProduct.id));
            if (!fs.existsSync(productImagesDir)) {
                fs.mkdirSync(productImagesDir, { recursive: true });
            }

            // Download main image
            console.log(`Downloading images for product ${createdProduct.id}...`);
            const mainImgUrl = getUnsplashUrl(selectedImages[0], 'main');
            const mainImgDestBase = path.join(productImagesDir, '1');
            const mainImgFinalPath = await downloadImage(mainImgUrl, mainImgDestBase);
            const mainImgRelative = `/images/${createdProduct.id}/${path.basename(mainImgFinalPath)}`;

            await createdProduct.update({ img: mainImgRelative });

            // Download additional images
            for (let j = 1; j < selectedImages.length; j++) {
                const altImgUrl = getUnsplashUrl(selectedImages[j], `alt${j}`);
                const altImgDestBase = path.join(productImagesDir, String(j + 1));
                const altImgFinalPath = await downloadImage(altImgUrl, altImgDestBase);
                const altImgRelative = `/images/${createdProduct.id}/${path.basename(altImgFinalPath)}`;

                await db.ProductImage.create({
                    product_id: createdProduct.id,
                    url: altImgRelative
                });
            }
        }
        console.log(`Seeded ${productsData.length} products with localized images.`);

        // 5. Seed Sliders (Can also localize sliders if needed, but keeping online for now or localize them too)
        const sliderData = [
            { headline: 'Premium Technology', id: '1496181754640-f2f46e820e74' },
            { headline: 'Elegance & Power', id: '1499951360447-b19be8fe80f5' },
            { headline: 'Connect Your World', id: '1511707171634-5f897ff02aa9' }
        ];
        for (const slide of sliderData) {
            await db.Slider.create({
                headline: slide.headline,
                body: 'Experience the best in modern innovation and design.',
                src: getUnsplashUrl(slide.id),
                cta: 'Shop Now',
                category: 'Featured'
            });
        }
        console.log('Seeded sliders.');

        // 6. Seed Users and Privileges
        const hashedSuperPassword = await bcrypt.hash('superpass123', 10);
        const superadmin = await db.User.create({
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: hashedSuperPassword,
            role: 'superadmin'
        });
        await db.Privilege.create({
            user_id: superadmin.id,
            categories: true, forms: true, products: true, orders: true, coupons: true, testimonials: true
        });

        const hashedAdminPassword = await bcrypt.hash('adminpass123', 10);
        const admin = await db.User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            role: 'admin'
        });
        await db.Privilege.create({
            user_id: admin.id,
            categories: true, forms: false, products: true, orders: true, coupons: false, testimonials: true
        });

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
}

async function initDB() {
    try {
        console.log('Checking database...');
        await db.sequelize.sync({ force: true });
        console.log('Tables recreated.');
        await seedData();
        console.log('Database initialization completed.');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
    }
}

initDB();
