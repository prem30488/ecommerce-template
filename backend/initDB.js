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

        // Seed flavors first
        const defaultFlavors = [
            { id: 1, name: 'Default', active: true, image: '/images/Flavors/default.jpg' },
            { id: 2, name: 'Dark Chocolate', active: true, image: '/images/Flavors/dark_chocolate.jpg' },
            { id: 3, name: 'Vanilla', active: true, image: '/images/Flavors/vanilla.jpg' },
            { id: 4, name: 'Strawberry', active: true, image: '/images/Flavors/strawberry.jpg' },
            { id: 5, name: 'Mango', active: true, image: '/images/Flavors/mango.jpg' },
            { id: 6, name: 'Cookie Blast', active: true, image: '/images/Flavors/cookie_blast.jpg' },
            { id: 7, name: 'Banana Splurge', active: true, image: '/images/Flavors/banana_splurge.jpg' },
            { id: 8, name: 'Pineapple Swirl', active: true, image: '/images/Flavors/pineapple_swirl.jpg' },
            { id: 9, name: 'Fruit Punch', active: true, image: '/images/Flavors/fruit_punch.jpg' },
            { id: 10, name: 'Kiwi Lychee', active: true, image: '/images/Flavors/kiwi_lychee.jpg' },
        ];

        const createdFlavors = defaultFlavors;

        for (const flavorData of defaultFlavors) {
            await db.Flavor.findOrCreate({
                where: { id: flavorData.id },
                defaults: flavorData
            });
        }

        console.log(`Seeded ${defaultFlavors.length} flavors.`);

        // Seed audiences
        const defaultAudiences = [
            { id: 1, name: 'Men' },
            { id: 2, name: 'Women' },
            { id: 3, name: 'Kids' }
        ];
        for (const audience of defaultAudiences) {
            await db.Audience.findOrCreate({
                where: { id: audience.id },
                defaults: { name: audience.name }
            });
        }

        console.log(`Seeded ${defaultAudiences.length} flavors.`);

        // Seed genders
        const defaultGenders = [
            { id: 1, name: 'Male' },
            { id: 2, name: 'Female' },
            { id: 3, name: 'Transgender' }
        ];
        for (const gender of defaultGenders) {
            await db.Gender.findOrCreate({
                where: { id: gender.id },
                defaults: { name: gender.name }
            });
        }

        console.log(`Seeded ${defaultGenders.length} genders.`);

        // Seed one random offer per product (only if none exists yet)
        const offerTemplates = [
            { type: 0, discount: 5, buy: null, buyget: null, label: '5% OFF' },
            { type: 0, discount: 10, buy: null, buyget: null, label: '10% OFF' },
            { type: 0, discount: 15, buy: null, buyget: null, label: '15% OFF' },
            { type: 0, discount: 20, buy: null, buyget: null, label: '20% OFF' },
            { type: 0, discount: 25, buy: null, buyget: null, label: '25% OFF' },
            { type: 0, discount: 30, buy: null, buyget: null, label: '30% OFF' },
            { type: 1, discount: 0, buy: 2, buyget: 1, label: 'Buy 2 Get 1 Free' },
            { type: 1, discount: 0, buy: 3, buyget: 1, label: 'Buy 3 Get 1 Free' },
            { type: 2, discount: 0, buy: 2, buyget: 1, label: 'Buy 2 Get 1 Free' },
            { type: 0, discount: 12, buy: null, buyget: null, label: '12% OFF' },
        ];


        const createdForms = [];
        // Form seeding
        const defaultForms = [
            { id: 2, title: "Injection", description: "Injection", deleteFlag: false },
            { id: 4, title: "Liquid", description: "Liquid", deleteFlag: false },
            { id: 5, title: "Capsule", description: "Capsule", deleteFlag: false },
            { id: 6, title: "Powder", description: "Powder", deleteFlag: false },
            { id: 7, title: "Gel", description: "Gel", deleteFlag: false },
            { id: 1, title: "Sachet", description: "Sachet", deleteFlag: false },
            { id: 3, title: "Medicine", description: "Medicine", deleteFlag: false }
        ];
        for (const form of defaultForms) {
            await db.Form.create(form);
            createdForms.push(form);
        }
        console.log(`Seeded ${createdForms.length} forms.`);

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
            const randomForm = createdForms[Math.floor(Math.random() * createdForms.length)];
            const randomFlavor = createdFlavors[Math.floor(Math.random() * createdFlavors.length)];
            const selectedImages = [...imagePool].sort(() => 0.5 - Math.random()).slice(0, 3);

            // Create product first to get ID
            const createdProduct = await db.Product.create({
                title: product.title,
                description: product.description,
                img: '', // Will update later
                category_id: randomCat.id,
                flavor_id: randomFlavor.id,
                brand: product.brand,
                price: product.price,
                rating: product.rating,
                bestseller: product.bestseller,
                featured: product.featured,
                audience: product.audience,
                stock: product.stock,
                active: true,
                comingSoon: product.id % 3 == 0,
                catIds: randomCat.id + ',' + (randomCat.id + 1) + ',' + (randomCat.id - 2),
                formId: randomForm.id,

            });

            const productImagesDir = path.join(publicImagesPath, String(createdProduct.id));
            if (!fs.existsSync(productImagesDir)) {
                fs.mkdirSync(productImagesDir, { recursive: true });
            }

            console.log(`Downloading images for product ${createdProduct.id} with flavor ${randomFlavor.name}...`);

            // Download main image into flavor subfolder
            const mainFlavorFolder = path.join(productImagesDir, String(randomFlavor.id));
            if (!fs.existsSync(mainFlavorFolder)) {
                fs.mkdirSync(mainFlavorFolder, { recursive: true });
            }

            const mainImgUrl = getUnsplashUrl(selectedImages[0], 'main');
            const mainImgDestBase = path.join(mainFlavorFolder, '1');
            const mainImgFinalPath = await downloadImage(mainImgUrl, mainImgDestBase);
            const mainImgRelative = `/images/${createdProduct.id}/${randomFlavor.id}/${path.basename(mainImgFinalPath)}`;

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
                const altImgRelative = `/images/${createdProduct.id}/${randomFlavorForImage.id}/${path.basename(altImgFinalPath)}`;

                await db.ProductImage.create({
                    product_id: createdProduct.id,
                    flavor_id: randomFlavorForImage.id,
                    url: altImgRelative
                });
            }

            // Seed Reviews for this product
            for (let k = 0; k < 3; k++) {
                await db.Review.create({
                    name: `Customer ${k + 1}`,
                    email: `customer${k + 1}@example.com`,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 star
                    comment: `This is a wonderful product! Highly recommend the ${createdProduct.title}.`,
                    status: 'approved',
                    productId: createdProduct.id
                });
            }

            // Seed Offers for this product
            for (let k = 0; k < 2; k++) {
                await db.Offer.create({
                    name: `Offer ${k + 1}`,
                    description: `This is a wonderful product! Highly recommend the ${createdProduct.title}.`,
                    status: 'approved',
                    productId: createdProduct.id
                });
            }

            // Seed FAQs for this product
            for (let k = 0; k < 2; k++) {
                await db.FAQ.create({
                    question: `How to use ${createdProduct.title}?`,
                    answer: `Please follow the instructions on the packaging for best results.`,
                    askedBy: `User ${k + 1}`,
                    productId: createdProduct.id,
                    isActive: true
                });
            }
        }
        console.log(`Seeded ${productsData.length} products with flavor-organized images, reviews, and FAQs.`);

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
        console.log(`Seeded ${sliderData.length} sliders.`);

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

        console.log(`Seeded 2 admins.`);
        console.log('Checking for initial data seeding...');

        const allProducts = await db.Product.findAll();
        for (const prod of allProducts) {
            const existingOffer = await db.Offer.findOne({ where: { productId: prod.id } });
            if (!existingOffer) {
                const tpl = offerTemplates[(prod.id - 1) % offerTemplates.length];
                await db.Offer.create({
                    productId: prod.id,
                    type: tpl.type,
                    discount: tpl.discount,
                    buy: tpl.buy,
                    buyget: tpl.buyget,
                    size: 'S',
                    active: true,
                    from: new Date(),
                    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                });
            }
        }


        // Seed sliders
        const defaultSliders = [
            {
                id: 1,
                src: "https://assets.mspimages.in/wp-content/uploads/2021/06/pjimage-1.jpg",
                headline: "Power and Portability at your Fingertips",
                body: "Discover our wide range of laptops for all your computing needs. From ultrabooks to gaming laptops, our selection offers the perfect combination of power and portability for your lifestyle.",
                cta: "Shop now",
                category: "laptop"
            },
            {
                id: 2,
                src: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                headline: "Stay Connected on the Go",
                body: "Keep up with the latest trends and stay connected on-the-go with our selection of smartphones. Choose from top brands and affordable options, with advanced features to enhance your mobile experience.",
                cta: "Shop now",
                category: "smartphone"
            },
            {
                id: 3,
                src: "https://images.unsplash.com/photo-1631281956016-3cdc1b2fe5fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
                headline: "Track your Fitness and Stay Connected",
                body: "Enhance your lifestyle with our range of smartwatches. Monitor your fitness goals and stay connected to your digital life with ease. Choose from popular brands and a variety of styles and features.",
                cta: "Shop now",
                category: "smartwatch"
            },
            {
                id: 4,
                src: "https://images.unsplash.com/photo-1600003263720-95b45a4035d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                headline: "The Ultimate Gaming Experience",
                body: "Take your gaming experience to the next level with our high-performance graphics cards. Choose from top brands and the latest technology for smooth and fast gameplay.",
                cta: "Shop now",
                category: "graphics card"
            },
            {
                id: 5,
                src: "https://images.unsplash.com/photo-1526876798423-97e53fb23428?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                headline: "Listen in Style and Comfort",
                body: "Elevate your audio experience with our selection of earbuds and headphones. Choose from the latest models and top brands, with noise-cancelling and wireless options for a customized listening experience.",
                cta: "Shop now",
                category: "earbuds"
            }
        ];
        for (const slider of defaultSliders) {
            await db.Slider.findOrCreate({
                where: { id: slider.id },
                defaults: slider
            });
        }

        // Seed leadership team
        const defaultLeaders = [
            { name: 'Jaymin Patel', designation: 'Partner', image: '/images/leadership/jaymin_patel.png', order: 1 },
            { name: 'Nikul Sisodiya', designation: 'Partner', image: '/images/leadership/nikul_sisodiya.png', order: 2 },
            { name: 'Parth Trivedi', designation: 'CEO', image: '/images/leadership/parth_trivedi.png', order: 3 },
            { name: 'Miraj Trivedi', designation: 'VP', image: '/images/leadership/miraj_trivedi.png', order: 4 },
            { name: 'Jay Patel', designation: 'VP', image: '/images/leadership/jay_patel.png', order: 5 }
        ];

        try {
            await db.LeadershipTeam.sync();
            const leaderCount = await db.LeadershipTeam.count();
            if (leaderCount === 0) {
                for (const leader of defaultLeaders) {
                    await db.LeadershipTeam.create(leader);
                }
                console.log('Seeded Leadership Team');
            }
        } catch (err) {
            console.error('Error seeding Leadership Team:', err);
        }

        // Seed testimonials
        const defaultTestimonials = [
            {
                title: 'Prembhai',
                designation: 'Director',
                organization: 'Ecommerce Inc.',
                description: 'Excellent service and great support. Highly recommended!',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Prembhai.jpg',
            },
            {
                title: 'Rosie',
                designation: 'CEO',
                organization: 'Prem Micro Serv Pvt Ltd',
                description: 'The team delivered beyond expectations. Will work again!',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Rosie.jpg',
            },
            {
                title: 'Roose',
                designation: 'CA',
                organization: 'Hzneley Pvt Ltd',
                description: 'Professional and reliable service. Very satisfied.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Roose.jpg',
            },
            {
                title: 'Foose',
                designation: 'IT Head',
                organization: 'Caamunda',
                description: 'Great experience from start to finish. Highly recommend!',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Foose.jpg',
            },
            {
                title: 'Sarah Jenkins',
                designation: 'Marketing Lead',
                organization: 'Creative Spark',
                description: 'We saw immediate improvements in our workflow. Absolutely fantastic.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Sarah_Jenkins.jpg',
            },
            {
                title: 'Michael Chen',
                designation: 'Product Manager',
                organization: 'TechFlow',
                description: 'A seamless integration built by a stellar team. Highly knowledgeable.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Michael_Chen.jpg',
            },
            {
                title: 'Amanda Williams',
                designation: 'VP of Engineering',
                organization: 'Globex Corp',
                description: 'The attention to detail and professional communication was exactly what we needed.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Amanda_Williams.jpg',
            },
            {
                title: 'Robert Fox',
                designation: 'Founder',
                organization: 'NextGen Solutions',
                description: 'Exceeded expectations. Very happy with the final product delivered on time.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Robert_Fox.jpg',
            },
            {
                title: 'Elena Rodriguez',
                designation: 'Operations Director',
                organization: 'Apex Dynamics',
                description: 'Streamlined our entire customer funnel. Support has been top notch!',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Elena_Rodriguez.jpg',
            },
            {
                title: 'David Kim',
                designation: 'CTO',
                organization: 'Pioneer Web',
                description: 'Robust architecture with great UI/UX sensibilities. Extremely polished work.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/David_Kim.jpg',
            },
            {
                title: 'Laura Bennett',
                designation: 'E-commerce Manager',
                organization: 'Retail Pro',
                description: 'Sales went up exactly as promised! Best decision we made all year.',
                rating: Math.floor(Math.random() * 5) + 1,
                imageURL: '/images/testimonials/Laura_Bennett.jpg',
            }
        ];

        try {
            await db.Testimonial.sync({ alter: true });

            // Re-seed all to update the images and randomized rating
            await db.Testimonial.destroy({ where: {} });

            for (const t of defaultTestimonials) {
                await db.Testimonial.create(t);
            }
            console.log(`Seeded ${defaultTestimonials.length} testimonials`);

        } catch (err) {
            console.error('Error seeding Testimonials:', err);
        }

        // Seed FAQs
        const defaultFAQs = [
            {
                question: 'What are your shipping options?',
                answer: 'We offer free shipping on orders over $50, standard shipping (5-7 business days), express shipping (2-3 business days), and overnight shipping.',
                askedBy: 'Customer Service',
                isActive: true
            },
            {
                question: 'How long does delivery take?',
                answer: 'Standard delivery typically takes 5-7 business days. Express delivery takes 2-3 business days. International orders may take 10-21 business days depending on the destination.',
                askedBy: 'Support Team',
                isActive: true
            },
            {
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase. Items must be in original condition with all packaging and accessories. Once received and inspected, refunds are processed within 5-10 business days.',
                askedBy: 'Returns Department',
                isActive: true
            },
            {
                question: 'Do you offer international shipping?',
                answer: 'Yes, we ship to over 100 countries worldwide. International shipping rates and delivery times vary by destination. Please check our shipping rates page for your specific location.',
                askedBy: 'Logistics Team',
                isActive: true
            },
            {
                question: 'How can I track my order?',
                answer: 'After your order ships, you will receive a tracking number via email. You can use this number to track your package in real-time on our website or the carrier\'s website.',
                askedBy: 'Customer Support',
                isActive: true
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers for qualifying orders.',
                askedBy: 'Billing Team',
                isActive: true
            },
            {
                question: 'Is my personal information secure?',
                answer: 'Yes, we use industry-standard SSL encryption to protect your personal and payment information. Your data is never shared with third parties without your consent.',
                askedBy: 'Security Team',
                isActive: true
            },
            {
                question: 'Can I modify or cancel my order?',
                answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters our fulfillment process and cannot be changed. Please contact support for special requests.',
                askedBy: 'Order Management',
                isActive: true
            },
            {
                question: 'Do you offer gift wrapping?',
                answer: 'Yes! We offer complimentary gift wrapping for orders. You can select this option at checkout. A personalized gift message can also be included.',
                askedBy: 'Customer Service',
                isActive: true
            },
            {
                question: 'How do I use a discount code?',
                answer: 'During checkout, enter your promotional code in the "Discount Code" field and click "Apply". The discount will be reflected in your order total before completing payment.',
                askedBy: 'Sales Team',
                isActive: true
            },
            {
                question: 'What is your price match guarantee?',
                answer: 'We match competitor prices on identical items. Contact our sales team with a screenshot of the lower price, and we will match it along with an additional 5% discount.',
                askedBy: 'Pricing Team',
                isActive: true
            },
            {
                question: 'Do you have a loyalty program?',
                answer: 'Yes! Join our rewards program to earn points on every purchase. Points can be redeemed for discounts, free shipping, or exclusive products.',
                askedBy: 'Customer Loyalty',
                isActive: true
            }
        ];

        try {
            // Check if we need to seed FAQs
            const faqCount = await db.FAQ.count();
            if (faqCount === 0) {
                const allProducts = await db.Product.findAll({ attributes: ['id'] });
                console.log(`Starting bulk seeding of FAQs for ${allProducts.length} products...`);
                let faqData = [];
                for (const prod of allProducts) {
                    for (const faq of defaultFAQs) {
                        faqData.push({ ...faq, productId: prod.id });
                    }
                }
                await db.FAQ.bulkCreate(faqData);
                console.log(`Seeded FAQs for ${allProducts.length} products`);
            } else {
                console.log('FAQs already exist, skipping seed.');
            }

            // Seed sample reviews
            const reviewCount = await db.Review.count();
            if (reviewCount === 0) {
                const sampleReviews = [
                    { name: 'Jaymin Patel', email: 'jaymin@example.com', rating: 5, comment: 'Life-changing product! The quality is unmatched.', status: 'approved' },
                    { name: 'Nikul Sisodiya', email: 'nikul@example.com', rating: 4, comment: 'Really effective, though delivery took an extra day.', status: 'approved' },
                    { name: 'Parth Trivedi', email: 'parth@example.com', rating: 5, comment: 'Absolutely phenomenal. Highly recommend to everyone.', status: 'approved' },
                    { name: 'Miraj Trivedi', email: 'miraj@example.com', rating: 3, comment: 'Decent product, but I was expecting local sourcing.', status: 'approved' },
                    { name: 'Jay Patel', email: 'jay@example.com', rating: 5, comment: 'Boutique quality at a great price point.', status: 'approved' },
                ];

                const allProducts = await db.Product.findAll({ attributes: ['id'] });
                let reviewData = [];
                // Limit reviews to first 100 products for performance
                for (const prod of allProducts.slice(0, 100)) {
                    for (let i = 0; i < 3; i++) {
                        const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
                        reviewData.push({ ...review, productId: prod.id });
                    }
                }
                await db.Review.bulkCreate(reviewData);
                console.log(`Seeded reviews for products.`);
            } else {
                console.log('Reviews already exist, skipping seed.');
            }

        } catch (err) {
            console.error('Error during data seeding:', err);
        }

        console.log('Seeding process completed.');

        // Seed ProductFlavors with random prices and filesystem-resolved images
        console.log('Seeding ProductFlavors with prices and images...');
        try {
            const allAvailableProducts = await db.Product.findAll();
            const allAvailableFlavors = await db.Flavor.findAll();
            let productFlavorsData = [];

            for (const prod of allAvailableProducts) {
                for (const flav of allAvailableFlavors) {
                    const randomBase = Math.floor(Math.random() * 500); // 0 to 499

                    // Resolve first image from filesystem for this product+flavor combo
                    let resolvedImage = null;
                    const flavorFolder = path.join(publicImagesPath, String(prod.id), String(flav.id));
                    if (fs.existsSync(flavorFolder)) {
                        const files = fs.readdirSync(flavorFolder).filter(f =>
                            /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
                        );
                        if (files.length > 0) {
                            // Sort so we consistently pick the first (e.g. "1.jpg" before "2.jpg")
                            files.sort();
                            resolvedImage = `/images/${prod.id}/${flav.id}/${files[0]}`;
                        }
                    }

                    productFlavorsData.push({
                        product_id: prod.id,
                        flavor_id: flav.id,
                        price: 1000 + randomBase,
                        priceMedium: 1500 + randomBase,
                        priceLarge: 2000 + randomBase,
                        image: resolvedImage
                    });
                }
            }

            await db.ProductFlavor.bulkCreate(productFlavorsData);
            const withImage = productFlavorsData.filter(pf => pf.image !== null).length;
            console.log(`Successfully seeded ${productFlavorsData.length} ProductFlavors (${withImage} with images, ${productFlavorsData.length - withImage} without).`);
        } catch (error) {
            console.error('Error seeding ProductFlavors:', error);
        }

        // Reset sequences to prevent duplicate ID errors on next create
        const tables = ['Sliders', 'Flavors', 'Products', 'Categories', 'Forms', 'Testimonials', 'Coupons', 'leadership_teams', 'FAQs', 'Reviews', 'ProductFlavors'];
        for (const tableName of tables) {
            try {
                const [results] = await db.sequelize.query(`SELECT pg_get_serial_sequence('"${tableName}"', 'id') as seq;`);
                if (results[0] && results[0].seq) {
                    const seqName = results[0].seq;
                    await db.sequelize.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX(id)+1 FROM "${tableName}"), 1), false);`);
                    console.log(`Reset sequence for ${tableName}`);
                }
            } catch (seqError) {
                // Ignore if sequence doesn't exist or other minor issues
                // console.error(`Error resetting sequence for ${tableName}:`, seqError.message);
            }
        }
    } catch (error) {
        console.error('Error seeding data:', error);
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
