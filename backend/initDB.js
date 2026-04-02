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
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { timeout: 10000 });
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
    } catch (err) {
        console.warn(`Image download failed for ${url}: ${err.message}`);
        return null;
    }
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

        // 2.5. Seed Flavors with images
        const flavorImagesPath = path.join(publicImagesPath, 'flavors');
        if (!fs.existsSync(flavorImagesPath)) {
            fs.mkdirSync(flavorImagesPath, { recursive: true });
        }

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
        for (let i = 0; i < flavors.length; i++) {
            const flavor = flavors[i];
            const randomImgId = imagePool[Math.floor(Math.random() * imagePool.length)];
            const flavorImgUrl = getUnsplashUrl(randomImgId, `flavor_${i}`);
            const flavorImgDestBase = path.join(flavorImagesPath, String(i + 1));
            
            console.log(`Downloading image for flavor: ${flavor.name}...`);
            const flavorImgFinalPath = await downloadImage(flavorImgUrl, flavorImgDestBase);
            const flavorImgRelative = flavorImgFinalPath 
                ? `/images/flavors/${path.basename(flavorImgFinalPath)}`
                : flavorImgUrl;

            const [createdFlavor] = await db.Flavor.findOrCreate({
                where: { name: flavor.name },
                defaults: { ...flavor, image: flavorImgRelative }
            });
            createdFlavors.push(createdFlavor);
        }
        console.log(`Seeded ${createdFlavors.length} flavors with images.`);


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
            // Pick 1-3 random categories
            const numCategories = Math.floor(Math.random() * 3) + 1;
            const shuffledCats = [...createdCategories].sort(() => 0.5 - Math.random()).slice(0, numCategories);
            const catIds = shuffledCats.map(cat => cat.id).join(',');
            const primaryCat = shuffledCats[0];
            
            // Generate multiple flavors and prices
            const numFlavors = Math.floor(Math.random() * 3) + 1;
            const selectedFlavors = [...createdFlavors].sort(() => 0.5 - Math.random()).slice(0, numFlavors);
            
            const firstFlavor = selectedFlavors[0];
            const baseUnitPrice = Math.max(800, product.price || (Math.floor(Math.random() * 1000) + 800));
            const selectedImages = [...imagePool].sort(() => 0.5 - Math.random()).slice(0, 3);

            // Create product first to get ID
            const createdProduct = await db.Product.create({
                title: product.title,
                description: product.description,
                img: '', // Will update later
                category_id: primaryCat.id,
                catIds: catIds,
                flavor_id: firstFlavor.id, // Primary flavor
                brand: product.brand,
                price: baseUnitPrice,
                rating: product.rating,
                bestseller: product.bestseller,
                featured: product.featured,
                audience: product.audience,
                stock: product.stock,
                active: true
            });

            // Create ProductFlavor entries with size-based pricing
            for (const flav of selectedFlavors) {
                // Variations based on base price, ensuring minimum 800
                const sPrice = Math.max(800, baseUnitPrice + (Math.floor(Math.random() * 200) - 100));
                const mPrice = sPrice + 500;
                const lPrice = mPrice + 700;

                await db.ProductFlavor.create({
                    product_id: createdProduct.id,
                    flavor_id: flav.id,
                    price: sPrice,
                    priceMedium: mPrice,
                    priceLarge: lPrice
                });
            }

            // Create 3-6 random reviews per product
            const reviewNames = ['Aria Mitchell', 'Leo Thompson', 'Isabella Clark', 'Noah Davis', 'Sophia Wilson', 'Ethan Brown', 'Mia Anderson', 'Lucas Taylor', 'Olivia Garcia', 'Mason Moore'];
            const reviewComments = [
                "Excellent quality, really made a difference in my routine!",
                "Great value for the price. Highly recommend to anyone looking for this.",
                "The flavors are amazing and it mixes very well. Will buy again.",
                "Good product, but the delivery took a bit longer than expected.",
                "Absolutely premium feel and packaging was top notch.",
                "Helped me achieve my results much faster. Very satisfied.",
                "A bit on the expensive side, but definitely worth the investment for the quality.",
                "Decent product, does exactly what it says on the box.",
                "Very impressed with the results after just one week of use.",
                "Love the brand and their commitment to quality. My new go-to."
            ];

            const numReviews = Math.floor(Math.random() * 4) + 3;
            for (let k = 0; k < numReviews; k++) {
                const randomName = reviewNames[Math.floor(Math.random() * reviewNames.length)];
                const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
                const randomRating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars

                await db.Review.create({
                    name: randomName,
                    email: randomName.toLowerCase().replace(' ', '.') + "@example.com",
                    rating: randomRating,
                    comment: randomComment,
                    status: 'approved',
                    productId: createdProduct.id
                });
            }




            const productImagesDir = path.join(publicImagesPath, String(createdProduct.id));
            if (!fs.existsSync(productImagesDir)) {
                fs.mkdirSync(productImagesDir, { recursive: true });
            }

            console.log(`Downloading images for product ${createdProduct.id} with flavor ${firstFlavor.name}...`);
            
            // Download main image into flavor subfolder
            const mainFlavorFolder = path.join(productImagesDir, String(firstFlavor.id));
            if (!fs.existsSync(mainFlavorFolder)) {
                fs.mkdirSync(mainFlavorFolder, { recursive: true });
            }
            
            const mainImgUrl = getUnsplashUrl(selectedImages[0], 'main');
            const mainImgDestBase = path.join(mainFlavorFolder, '1');
            const mainImgFinalPath = await downloadImage(mainImgUrl, mainImgDestBase);
            const mainImgRelative = mainImgFinalPath 
                ? `/images/${createdProduct.id}/${firstFlavor.id}/${path.basename(mainImgFinalPath)}`
                : mainImgUrl;

            await createdProduct.update({ img: mainImgRelative });

            // Download additional images to random flavor subfolders
            for (let j = 1; j < selectedImages.length; j++) {
                const randomFlavorForImage = createdFlavors[Math.floor(Math.random() * createdFlavors.length)];
                const flavorFolder = path.join(productImagesDir, String(randomFlavorForImage.id));
                if (!fs.existsSync(flavorFolder)) {
                    fs.mkdirSync(flavorFolder, { recursive: true });
                }
                
                const altImgUrl = getUnsplashUrl(selectedImages[j], `alt${j}`);
                const altImgDestBase = path.join(flavorFolder, String(j + 1));
                const altImgFinalPath = await downloadImage(altImgUrl, altImgDestBase);
                const altImgRelative = altImgFinalPath
                    ? `/images/${createdProduct.id}/${randomFlavorForImage.id}/${path.basename(altImgFinalPath)}`
                    : altImgUrl;

                await db.ProductImage.create({
                    product_id: createdProduct.id,
                    flavor_id: randomFlavorForImage.id,
                    url: altImgRelative
                });
            }

        }
        console.log(`Seeded ${productsData.length} products with flavor-organized images.`);

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
        
        // 5.5 Seed Testimonials with person images
        const testimonialImagesPath = path.join(publicImagesPath, 'testimonials');
        if (!fs.existsSync(testimonialImagesPath)) {
            fs.mkdirSync(testimonialImagesPath, { recursive: true });
        }

        const testimonialData = [
            { title: 'Sarah Jenkins', description: 'The quality of these healthcare products is unmatched. I have seen a significant improvement in my recovery time!', designation: 'Professional Athlete', organization: 'City Sports Club' },
            { title: 'Michael Chen', description: 'Finally, a brand that actually delivers on its promises. The flavor and mixability are top-notch.', designation: 'Fitness Coach', organization: 'Elite Training' },
            { title: 'Emma Rodriguez', description: 'I love how transparent they are about their ingredients. It gives me great peace of mind.', designation: 'Nutritionist', organization: 'Healthy Life' },
            { title: 'David Wilson', description: 'The customer service is outstanding, and the products arrive so quickly. Truly impressed!', designation: 'Daily User', organization: 'Individual' },
            { title: 'Jessica Taylor', description: 'Best investment I have made for my health this year. Worth every single ruppee.', designation: 'Yoga Instructor', organization: 'Mind & Body' },
            { title: 'Robert Smith', description: 'As a doctor, I recommend these to my patients frequently. The purity is exceptional.', designation: 'Medical Practitioner', organization: 'Main General Hospital' },
            { title: 'Linda Brown', description: 'The variety of flavors means I never get bored. My favorite is definitely the Cookie Blast!', designation: 'Health Enthusiast', organization: 'Gym Junkie' },
            { title: 'James Anderson', description: 'Outstanding results and no bloating at all. This is exactly what I was looking for.', designation: 'Bodybuilder', organization: 'Steel Gym' },
            { title: 'Emily Garcia', description: 'Perfect for my busy lifestyle. Quick, easy, and provides all the nutrients I need on the go.', designation: 'Business Executive', organization: 'Tech Solutions' },
            { title: 'William Moore', description: 'Top tier quality and the packaging is beautiful. You can tell they care about their customers.', designation: 'Marathon Runner', organization: 'Peak Performance' }
        ];

        for (let i = 0; i < testimonialData.length; i++) {
            const test = testimonialData[i];
            const randomPersonId = imagePool[Math.floor(Math.random() * imagePool.length)];
            const testImgUrl = `https://i.pravatar.cc/300?u=${test.title.replace(' ', '')}`; // Use Pravatar for better person images
            const testImgDestBase = path.join(testimonialImagesPath, String(i + 1));
            
            console.log(`Downloading image for testimonial: ${test.title}...`);
            const testImgFinalPath = await downloadImage(testImgUrl, testImgDestBase);
            const testImgRelative = testImgFinalPath 
                ? `/images/testimonials/${path.basename(testImgFinalPath)}`
                : testImgUrl;

            await db.Testimonial.create({
                ...test,
                imageURL: testImgRelative,
                rating: [4, 4.5, 5][Math.floor(Math.random() * 3)]
            });
        }
        console.log(`Seeded ${testimonialData.length} testimonials with images.`);

        // 5.7 Seed Leadership Team with professional images
        const leadershipImagesPath = path.join(publicImagesPath, 'leadership');
        if (!fs.existsSync(leadershipImagesPath)) {
            fs.mkdirSync(leadershipImagesPath, { recursive: true });
        }

        const leadershipData = [
            { name: 'Dr. Alexander Vaughn', designation: 'Chief Executive Officer', order: 1 },
            { name: 'Elena Rodriguez', designation: 'Chief Operations Officer', order: 2 },
            { name: 'Marcus Thorne', designation: 'Head of Research & Development', order: 3 },
            { name: 'Sarah Chen', designation: 'Director of Nutrition & Science', order: 4 },
            { name: 'Jonathan Pierce', designation: 'Senior Product Architect', order: 5 }
        ];

        for (let i = 0; i < leadershipData.length; i++) {
            const lead = leadershipData[i];
            const leadImgUrl = `https://i.pravatar.cc/400?u=lead_${i}`; // High-res professional avatars
            const leadImgDestBase = path.join(leadershipImagesPath, String(i + 1));
            
            console.log(`Downloading image for leadership member: ${lead.name}...`);
            const leadImgFinalPath = await downloadImage(leadImgUrl, leadImgDestBase);
            const leadImgRelative = leadImgFinalPath 
                ? `/images/leadership/${path.basename(leadImgFinalPath)}`
                : leadImgUrl;

            await db.LeadershipTeam.create({
                ...lead,
                image: leadImgRelative
            });
        }
        console.log(`Seeded ${leadershipData.length} leadership members with images.`);


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
