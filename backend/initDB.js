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

        // 2.5. Seed Flavors
        const flavors = [
            { name: 'Dark Chocolate', active: true },
            { name: 'Vanilla', active: true },
            { name: 'Strawberry', active: true },
            { name: 'Cookie Blast', active: true },
            { name: 'Mango', active: true },
            { name: 'Banana Splurge', active: true },
            { name: 'Pineapple Swirl', active: true },
            { name: 'Fruit Punch', active: true },
            { name: 'Kiwi Lychee', active: true },
            { name: 'Default', active: true }
        ];
        const createdFlavors = [];
        for (const flavor of flavors) {
            const [createdFlavor] = await db.Flavor.findOrCreate({
                where: { name: flavor.name },
                defaults: flavor
            });
            createdFlavors.push(createdFlavor);
        }
        console.log(`Seeded ${createdFlavors.length} flavors.`);

        // 3. Seed Categories
        const categoriesPath = path.join(__dirname, '..', 'Front End', 'public', 'categories.json');
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const createdCategories = [];
        for (let i = 0; i < categoriesData.length; i++) {
            const cat = await db.Category.create({ title: categoriesData[i], order: i, active: true, type: Math.floor(Math.random() * 3) + 1 });
            createdCategories.push(cat);
        }
        console.log(`Seeded ${createdCategories.length} categories.`);

        // 4. Seed Products with random categories, flavors, and 3 images in flavor subfolders
        const productsPath = path.join(__dirname, '..', 'Front End', 'public', 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        for (const product of productsData) {
            const randomCat = createdCategories[Math.floor(Math.random() * createdCategories.length)];
            
            // Create product first to get ID
            const createdProduct = await db.Product.create({
                title: product.title,
                description: product.description,
                img: '', 
                category_id: randomCat.id,
                brand: product.brand,
                rating: product.rating,
                bestseller: product.bestseller,
                featured: product.featured,
                audience: product.audience,
                stock: product.stock,
                active: true,
                price: 0 // Pricing now in ProductFlavor
            });

            // Pick 2-4 random flavors for this product
            const productFlavorCount = Math.floor(Math.random() * 3) + 2;
            const shuffledFlavors = [...createdFlavors].sort(() => 0.5 - Math.random());
            const selectedFlavors = shuffledFlavors.slice(0, productFlavorCount);

            const productImagesDir = path.join(publicImagesPath, String(createdProduct.id));
            if (!fs.existsSync(productImagesDir)) {
                fs.mkdirSync(productImagesDir, { recursive: true });
            }

            for (let i = 0; i < selectedFlavors.length; i++) {
                const flavor = selectedFlavors[i];
                
                // Random Prices
                const priceS = Math.floor(Math.random() * 1000) + 500;
                const priceM = priceS + (Math.floor(Math.random() * 500) + 500);
                const priceL = priceM + (Math.floor(Math.random() * 50) + 700);

                await db.ProductFlavor.create({
                    product_id: createdProduct.id,
                    flavor_id: flavor.id,
                    price: priceS,
                    priceMedium: priceM,
                    priceLarge: priceL,
                    active: true
                });

                // Download 2 random images for this flavor
                const flavorFolder = path.join(productImagesDir, String(flavor.id));
                if (!fs.existsSync(flavorFolder)) {
                    fs.mkdirSync(flavorFolder, { recursive: true });
                }

                const selectedImages = [...imagePool].sort(() => 0.5 - Math.random()).slice(0, 2);
                for (let j = 0; j < selectedImages.length; j++) {
                    const imgUrl = getUnsplashUrl(selectedImages[j], `p${createdProduct.id}f${flavor.id}i${j}`);
                    const imgDestBase = path.join(flavorFolder, String(j + 1));
                    try {
                        const imgFinalPath = await downloadImage(imgUrl, imgDestBase);
                        const imgRelative = `/images/${createdProduct.id}/${flavor.id}/${path.basename(imgFinalPath)}`;
                        
                        await db.ProductImage.create({
                            product_id: createdProduct.id,
                            flavor_id: flavor.id,
                            url: imgRelative
                        });

                        // Set the very first image of the first flavor as the main product image
                        if (i === 0 && j === 0) {
                            await createdProduct.update({ img: imgRelative });
                        }
                    } catch (e) {
                        console.error(`Failed to download image for product ${createdProduct.id}:`, e.message);
                    }
                }
            }
            console.log(`Seeded product ${createdProduct.id} (${createdProduct.title}) with ${selectedFlavors.length} flavors.`);
        }
        console.log(`Seeded ${productsData.length} products with complete flavor-pricing and images.`);

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
