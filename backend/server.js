require('dotenv').config();

const { Client } = require('pg');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./models');
const { initRedis } = require('./config/redis');
const saleRoutes = require('./routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ecommerce-template-xi-tan.vercel.app',
    'https://ecommerce-template-api-mu.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('https://ecommerce-template-xi-tan')) {
            return callback(null, true);
        }
        return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
// Serve static files from the frontend's public folder
app.use(express.static(path.join(__dirname, '..', 'Front End', 'public')));
// Serve MDB5 static files specifically if needed
app.use('/MDB5-STANDARD-UI-KIT-Free-9.3.0', express.static(path.join(__dirname, '..', 'Front End', 'public', 'MDB5-STANDARD-UI-KIT-Free-9.3.0')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper for paginated responses
const getPaginatedResponse = (data, count, page, size) => {
    return {
        content: data,
        totalElements: count,
        totalPages: Math.ceil(count / size),
        size: parseInt(size),
        number: parseInt(page)
    };
};

// Database Initialization (PostgreSQL only, removed SQLite references)
async function ensureDatabaseExists() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    try {
        const parsedUrl = new URL(dbUrl);
        const dbName = parsedUrl.pathname.substring(1);

        // Connect to 'postgres' database to check if target DB exists
        const postgresUrl = dbUrl.replace(`/${dbName}`, '/postgres');
        const client = new Client({ connectionString: postgresUrl });

        await client.connect();
        const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

        if (res.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" exists.`);
        }
        await client.end();
    } catch (err) {
        console.error('Error ensuring database exists:', err);
    }
}

async function seedData() {
    try {
        console.log('Checking for initial data seeding...');

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

        for (const flavorData of defaultFlavors) {
            await db.Flavor.findOrCreate({
                where: { id: flavorData.id },
                defaults: flavorData
            });
        }
        console.log('Seeded Flavors');

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

        // Drop and recreate Category table, then seed with random type
        await db.Category.drop({ force: true });
        await db.Category.sync({ force: true });
        const categoriesPath = path.join(__dirname, '..', 'Front End', 'public', 'categories.json');
        if (fs.existsSync(categoriesPath)) {
            const categoriesContent = fs.readFileSync(categoriesPath, 'utf8');
            const categories = JSON.parse(categoriesContent);
            for (let i = 0; i < categories.length; i++) {
                const randomType = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
                await db.Category.create({
                    title: categories[i],
                    order: i,
                    active: true,
                    type: randomType
                });
            }
        }

        // Drop and recreate Form table, then seed with existing forms
        await db.Form.drop({ force: true });
        await db.Form.sync({ force: true });
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
        }

        // Seed products
        const productsPath = path.join(__dirname, '..', 'Front End', 'public', 'products.json');
        if (fs.existsSync(productsPath)) {
            const productsContent = fs.readFileSync(productsPath, 'utf8');
            const products = JSON.parse(productsContent);
            for (const product of products) {
                const category = await db.Category.findOne({ where: { title: product.category } });

                // Assign a random flavor, except product 31 gets Chocolate (2)
                const randomFlavorId = product.id === 31 ? 2 : (Math.floor(Math.random() * (defaultFlavors.length)) + 1);

                await db.Product.findOrCreate({
                    where: { id: product.id },
                    defaults: {
                        title: product.title,
                        description: product.description,
                        img: product.img,
                        category_id: category ? category.id : null,
                        brand: product.brand,
                        price: parseFloat(product.price),
                        rating: product.rating,
                        bestseller: product.bestseller === 'true' || product.bestseller === true,
                        featured: product.featured === 'true' || product.featured === true,
                        audience: product.audience,
                        stock: parseInt(product.stock) || 0,
                        active: true,
                        flavor_id: randomFlavorId
                    }
                });
            }

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
        }

        // Seed users from users.csv
        const usersPath = path.join(__dirname, 'users.csv');
        if (fs.existsSync(usersPath)) {
            const usersData = fs.readFileSync(usersPath, 'utf8');
            const lines = usersData.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim());

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length < headers.length) continue;

                const userObj = {};
                headers.forEach((header, index) => {
                    userObj[header] = values[index];
                });

                const existingUser = await db.User.findOne({ where: { email: userObj.email } });
                if (!existingUser) {
                    const hashedPassword = await bcrypt.hash(userObj.password, 10);
                    await db.User.create({
                        username: userObj.username,
                        email: userObj.email,
                        password: hashedPassword,
                        role: userObj.role,
                        phoneNumber: userObj.phoneNumber || '',
                        active: true
                    });
                }
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
            console.log('Seeded Testimonials');

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

        // Reset sequences to prevent duplicate ID errors on next create
        const tables = ['Sliders', 'Flavors', 'Products', 'Categories', 'Forms', 'Testimonials', 'Coupons', 'leadership_teams', 'FAQs', 'Reviews'];
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

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.Product.findAll({ order: [['id', 'ASC']] });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/product/weeklyBestSeller', async (req, res) => {
    try {
        const { Op } = db.Sequelize;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Try to find the most ordered product in the last 7 days
        // Orders store items as JSON in an 'items' field; we parse and tally product IDs
        const recentOrders = await db.Order.findAll({
            where: { createdAt: { [Op.gte]: oneWeekAgo } }
        });

        const tally = {};
        for (const order of recentOrders) {
            try {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                for (const item of items) {
                    const pid = item.productId || item.id;
                    if (pid) tally[pid] = (tally[pid] || 0) + (item.quantity || 1);
                }
            } catch (_) { }
        }

        let product = null;
        const include = [
            { model: db.Offer, as: 'offers', required: false },
            {
                model: db.ProductFlavor, as: 'productFlavors',
                include: [{ model: db.Flavor }],
                required: false
            }
        ];

        if (Object.keys(tally).length > 0) {
            const topId = Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b);
            product = await db.Product.findByPk(topId, { include });
        }

        // Fallback: find Whey Protein by title
        if (!product) {
            product = await db.Product.findOne({
                where: { title: { [Op.iLike]: '%whey%' } },
                include
            });
        }

        // Final fallback: first bestseller
        if (!product) {
            product = await db.Product.findOne({ where: { bestseller: true }, include });
        }

        if (product) res.json(product);
        else res.status(404).json({ error: 'No product found' });
    } catch (error) {
        console.error('Error fetching weekly best seller:', error);
        res.status(500).json({ error: 'Failed to fetch weekly best seller' });
    }
});

app.get('/api/product/getProducts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const { categoryId } = req.query;

        const where = {};
        if (categoryId) {
            where.category_id = categoryId;
        }

        const { count, rows } = await db.Product.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']],
            include: [
                { model: db.Offer, as: 'offers', required: false },
                {
                    model: db.ProductFlavor, as: 'productFlavors',
                    include: [{ model: db.Flavor }],
                    required: false
                },
                { model: db.Category, required: false },
                { model: db.Form, as: 'Form', required: false },
                {
                    model: db.FAQ,
                    as: 'faqs',
                    where: { isActive: true },
                    required: false
                },
                {
                    model: db.Review,
                    as: 'reviews',
                    where: { status: 'approved', isDeleted: false },
                    required: false
                }
            ]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', message: error.message });
    }
});

app.get('/api/category/getCategories', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                title: { [Op.iLike]: `%${search}%` }
            };
        }

        const { count, rows } = await db.Category.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['order', 'ASC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.get('/api/coupon/getCoupon', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                [Op.or]: [
                    { code: { [Op.iLike]: `%${search}%` } },
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.Coupon.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        res.json(getPaginatedResponse([], 0, page, size));
    }
});

app.get('/api/order/getOrders', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const { count, rows } = await db.Order.findAndCountAll({
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        res.json(getPaginatedResponse([], 0, page, size));
    }
});

// User Management Routes
app.get('/api/user/users', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { phoneNumber: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.User.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['id', 'ASC']],
            attributes: { exclude: ['password'] }
        });
        const rowsWithRoles = rows.map(user => {
            const userData = user.toJSON();
            userData.roles = [{ name: 'ROLE_' + user.role.toUpperCase() }];
            return userData;
        });
        res.json(getPaginatedResponse(rowsWithRoles, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/user/users', authenticateToken, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        const user = await db.User.create({ username, email, password: hashedPassword, role: role || 'user' });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/user/users/:id', authenticateToken, async (req, res) => {
    try {
        await db.User.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get('/api/user/deleteUser/:id', authenticateToken, async (req, res) => {
    try {
        await db.User.destroy({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.get('/api/user/users/:id', authenticateToken, async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        if (user) {
            const userData = user.toJSON();
            userData.roles = [{ name: 'ROLE_' + user.role.toUpperCase() }];
            res.json(userData);
        }
        else res.status(404).json({ error: 'User not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Product CRUD
app.get('/api/product/fetchById/:id', async (req, res) => {
    try {
        const product = await db.Product.findByPk(req.params.id, {
            include: [
                {
                    model: db.ProductImage,
                    as: 'images',
                    include: [{ model: db.Flavor }]
                },
                {
                    model: db.ProductFlavor, as: 'productFlavors',
                    include: [{ model: db.Flavor }]
                },
                { model: db.Offer, as: 'offers' },
                { model: db.Category, required: false },
                { model: db.Form, as: 'Form', required: false },
                {
                    model: db.FAQ,
                    as: 'faqs',
                    where: { isActive: true },
                    required: false
                },
                {
                    model: db.Review,
                    as: 'reviews',
                    where: { status: 'approved', isDeleted: false },
                    required: false
                }
            ]
        });
        if (product) res.json(product);
        else res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/product/createProduct', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const productData = req.body;
        // If ProductImages provided, handle them
        const product = await db.Product.create(productData, {
            include: [{ model: db.ProductImage }, { model: db.ProductFlavor, as: 'productFlavors' }]
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/product/:id', authenticateToken, async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const productData = req.body;
        await db.Product.update(productData, {
            where: { id: req.params.id },
            transaction: t
        });

        // If ProductImages are provided, sync them
        if (productData.ProductImages) {
            await db.ProductImage.destroy({
                where: { product_id: req.params.id },
                transaction: t
            });

            const imagesToCreate = productData.ProductImages.map(img => ({
                ...img,
                product_id: req.params.id
            }));

            await db.ProductImage.bulkCreate(imagesToCreate, { transaction: t });
        }

        // If productFlavors are provided, sync them
        if (productData.productFlavors) {
            await db.ProductFlavor.destroy({
                where: { product_id: req.params.id },
                transaction: t
            });

            const flavorsToCreate = productData.productFlavors.map(f => ({
                ...f,
                product_id: req.params.id
            }));

            await db.ProductFlavor.bulkCreate(flavorsToCreate, { transaction: t });
        }

        await t.commit();
        res.json({ message: 'Product updated' });
    } catch (error) {
        await t.rollback();
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/product/delete/:id', authenticateToken, async (req, res) => {
    try {
        // Soft delete or hard delete? The frontend sends data.
        // For now let's just update 'active' if it exists or hard delete.
        const product = await db.Product.findByPk(req.params.id);
        if (product) {
            await product.update({ active: false });
            res.json({ message: 'Product deactivated' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.delete('/api/product/undelete/:id', authenticateToken, async (req, res) => {
    try {
        const product = await db.Product.findByPk(req.params.id);
        if (product) {
            await product.update({ active: true });
            res.json({ message: 'Product activated' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to undelete product' });
    }
});

// Category CRUD
app.get('/api/category/fetchById/:id', async (req, res) => {
    try {
        const category = await db.Category.findByPk(req.params.id);
        if (category) res.json(category);
        else res.status(404).json({ error: 'Category not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

app.post('/api/category/createCategory', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const category = await db.Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/category/:id', authenticateToken, async (req, res) => {
    try {
        await db.Category.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/category/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Category.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Flavor CRUD
app.get('/api/flavor/getFlavors', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search ? req.query.search.trim() : '';
        const { Op } = db.Sequelize;

        let where = {};

        if (search) {
            where = {
                name: { [Op.iLike]: `%${search}%` }
            };
        }

        const { count, rows } = await db.Flavor.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['name', 'ASC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch flavors' });
    }
});

app.post('/api/flavor/createFlavor', authenticateToken, async (req, res) => {
    try {
        const flavor = await db.Flavor.create(req.body);
        res.status(201).json(flavor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create flavor' });
    }
});

app.put('/api/flavor/:id', authenticateToken, async (req, res) => {
    try {
        await db.Flavor.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Flavor updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update flavor' });
    }
});

app.delete('/api/flavor/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Flavor.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Flavor deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete flavor' });
    }
});

// Leadership CRUD
app.get('/api/leadership/getTeams', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 12;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { designation: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.LeadershipTeam.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['order', 'ASC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leadership team' });
    }
});

app.post('/api/leadership/create', authenticateToken, async (req, res) => {
    try {
        const team = await db.LeadershipTeam.create(req.body);
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create leadership team' });
    }
});

app.put('/api/leadership/:id', authenticateToken, async (req, res) => {
    try {
        await db.LeadershipTeam.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Leadership team updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update leadership team' });
    }
});

app.delete('/api/leadership/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.LeadershipTeam.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Leadership team deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete leadership team' });
    }
});

// Authentication Routes
app.post('/auth/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginIdentifier = username || email;

        if (!loginIdentifier || !password) {
            return res.status(400).json({ error: 'Username/Email and password are required' });
        }

        const user = await db.User.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { username: loginIdentifier },
                    { email: loginIdentifier }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isAdmin = ['admin', 'superadmin'].includes(user.role.toLowerCase());
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const roles = [{ name: 'ROLE_' + user.role.toUpperCase() }];

        res.json({
            accessToken: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                roles: roles
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/auth/signup', async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            phoneNumber: phoneNumber || ''
        });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            accessToken: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// User Routes
app.get('/api/user/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'role', 'phoneNumber']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = user.toJSON();
        userData.roles = [{ name: 'ROLE_' + user.role.toUpperCase() }];
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.get('/api/user/privileges/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.user.role !== 'superadmin' && req.user.id != userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        let privileges = await db.Privilege.findOne({
            where: { user_id: userId }
        });

        if (!privileges) {
            // Return default privileges if none exist
            privileges = {
                user_id: userId,
                categories: false,
                forms: false,
                products: false,
                orders: false,
                coupons: false,
                testimonials: false,
                deleteFlag: false
            };
        }

        res.json(privileges);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get privileges' });
    }
});

app.put('/api/user/privileges/update/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const privilegesData = req.body;

        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        let [privilege, created] = await db.Privilege.findOrCreate({
            where: { user_id: userId },
            defaults: { ...privilegesData, user_id: userId }
        });

        if (!created) {
            await privilege.update(privilegesData);
        }

        res.json({ message: 'Privileges updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update privileges' });
    }
});

// Forms CRUD
app.get('/api/forms/getForms', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.Form.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['id', 'ASC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

app.post('/api/forms/createForms', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const form = await db.Form.create(req.body);
        res.status(201).json(form);
    } catch (error) {
        console.error('Error creating form:', error);
        require('fs').writeFileSync('form_error.log', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Failed to create form' });
    }
});

app.put('/api/forms/:id', authenticateToken, async (req, res) => {
    try {
        await db.Form.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Form updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update form' });
    }
});

app.delete('/api/forms/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Form.update({ deleteFlag: true }, { where: { id: req.params.id } });
        res.json({ message: 'Form deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

app.delete('/api/forms/undelete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Form.update({ deleteFlag: false }, { where: { id: req.params.id } });
        res.json({ message: 'Form undeleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to undelete form' });
    }
});

app.get('/api/forms/fetchById/:id', authenticateToken, async (req, res) => {
    try {
        const form = await db.Form.findByPk(req.params.id);
        if (form) res.json(form);
        else res.status(404).json({ error: 'Form not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// Testimonial CRUD
app.get('/api/testimonial/getTestimonials', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = {};
        if (search && search.trim()) {
            where = {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { organization: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.Testimonial.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

app.post('/api/testimonial/createTestimonial', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const testimonial = await db.Testimonial.create(req.body);
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

const multer = require('multer');
const flavorStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const flavorId = req.query.flavorId || 'temp';
        const uploadPath = path.join(__dirname, '..', 'Front End', 'public', 'images', 'Flavors', String(flavorId));

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const uploadFlavorIcon = multer({ storage: flavorStorage });

app.post('/api/flavor/upload', authenticateToken, uploadFlavorIcon.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const flavorId = req.query.flavorId || 'temp';
    const fileUrl = `/images/Flavors/${flavorId}/${req.file.filename}`;
    res.send(fileUrl);
});

const testimonialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'Front End', 'public', 'images', 'testimonials');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const productId = req.query.productId || 'temp';
        const flavorId = req.query.flavorId || 'default';
        const uploadPath = path.join(__dirname, '..', 'Front End', 'public', 'images', String(productId), String(flavorId));

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const uploadProductImage = multer({ storage: productStorage });

app.post('/api/product/upload', authenticateToken, uploadProductImage.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const productId = req.query.productId || 'temp';
    const flavorId = req.query.flavorId || 'default';
    const fileUrl = `/images/${productId}/${flavorId}/${req.file.filename}`;
    res.send(fileUrl);
});

app.get('/api/product/images/:productId/:flavorId', (req, res) => {
    const { productId, flavorId } = req.params;
    const dirPath = path.join(__dirname, '..', 'Front End', 'public', 'images', String(productId), String(flavorId));

    if (!fs.existsSync(dirPath)) {
        return res.json([]);
    }

    try {
        const files = fs.readdirSync(dirPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
        const imageUrls = files.map(file => `/images/${productId}/${flavorId}/${file}`);
        res.json(imageUrls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read directory' });
    }
});

const uploadTestimonial = multer({ storage: testimonialStorage });

app.post('/api/testimonial/upload', authenticateToken, uploadTestimonial.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/images/testimonials/${req.file.filename}`;
    res.send(fileUrl);
});
app.put('/api/testimonial/:id', authenticateToken, async (req, res) => {
    try {
        await db.Testimonial.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Testimonial updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
});

app.delete('/api/testimonial/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Testimonial.update({ deleteFlag: true }, { where: { id: req.params.id } });
        res.json({ message: 'Testimonial deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

app.delete('/api/testimonial/undelete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Testimonial.update({ deleteFlag: false }, { where: { id: req.params.id } });
        res.json({ message: 'Testimonial undeleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to undelete testimonial' });
    }
});

// Coupon CRUD
app.get('/api/coupon/getCoupon', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const { count, rows } = await db.Coupon.findAndCountAll({
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

app.post('/api/coupon/createCoupon', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const coupon = await db.Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

app.put('/api/coupon/:id', authenticateToken, async (req, res) => {
    try {
        await db.Coupon.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Coupon updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

app.delete('/api/coupon/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Coupon.update({ deleteFlag: true }, { where: { id: req.params.id } });
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

app.delete('/api/coupon/undelete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Coupon.update({ deleteFlag: false }, { where: { id: req.params.id } });
        res.json({ message: 'Coupon undeleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to undelete coupon' });
    }
});

// Offer CRUD
app.get('/api/offer/getOffers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const { count, rows } = await db.Offer.findAndCountAll({
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

app.post('/api/offer/createOffer', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const offer = await db.Offer.create(req.body);
        res.status(201).json(offer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create offer' });
    }
});

app.delete('/api/offer/delete/:id', authenticateToken, async (req, res) => {
    try {
        // Offers use 'active' field instead of deleteFlag in ProductManager.jsx
        await db.Offer.update({ active: false }, { where: { id: req.params.id } });
        res.json({ message: 'Offer deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete offer' });
    }
});

app.get('/api/offer/getOffersByProductId/:id', async (req, res) => {
    try {
        const offers = await db.Offer.findAll({ where: { productId: req.params.id } });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch offers for product' });
    }
});

// Slider CRUD
app.get('/api/slider/getSliders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const activeOnly = req.query.active === 'true';
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        let where = { deleteFlag: false };
        if (activeOnly) {
            where.active = true;
        }

        if (search && search.trim()) {
            where[Op.or] = [
                { headline: { [Op.iLike]: `%${search}%` } },
                { category: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await db.Slider.findAndCountAll({
            where: where,
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
        });
        res.json(getPaginatedResponse(rows, count, page, size));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch sliders' });
    }
});

app.get('/api/slider/fetchById/:id', async (req, res) => {
    try {
        const slider = await db.Slider.findByPk(req.params.id);
        if (slider) res.json(slider);
        else res.status(404).json({ error: 'Slider not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch slider' });
    }
});

app.post('/api/slider/createSlider', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const slider = await db.Slider.create(req.body);
        res.status(201).json(slider);
    } catch (error) {
        console.error('Error creating slider:', error);
        require('fs').writeFileSync('slider_error.log', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Failed to create slider' });
    }
});

app.put('/api/slider/:id', authenticateToken, async (req, res) => {
    try {
        await db.Slider.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Slider updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update slider' });
    }
});

app.delete('/api/slider/delete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Slider.update({ deleteFlag: true }, { where: { id: req.params.id } });
        res.json({ message: 'Slider deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete slider' });
    }
});

app.delete('/api/slider/undelete/:id', authenticateToken, async (req, res) => {
    try {
        await db.Slider.update({ deleteFlag: false }, { where: { id: req.params.id } });
        res.json({ message: 'Slider undeleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to undelete slider' });
    }
});

// Dashboard Stats Stubs
app.get('/api/order/fetchDailyTransactionsCount', authenticateToken, (req, res) => res.json(10));
app.get('/api/order/fetchDailyRevenueSum', authenticateToken, (req, res) => res.json(5000));
app.get('/api/order/fetchMonthlySalesSum', authenticateToken, (req, res) => res.json(150000));
app.get('/api/order/fetchWeeklySalesSum', authenticateToken, (req, res) => res.json(35000));

// ==================== WISHLIST ENDPOINTS ====================
let emailService;
try {
    emailService = require('./utils/emailService');
} catch (e) {
    emailService = {
        sendWishlistNotification: async () => { console.log("Mock email sent"); }
    };
}

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'mock-token') {
        req.user = { id: 1 }; // Default mock user
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) req.user = { id: 1 };
        else req.user = user;
        next();
    });
};

// Get all wishlist items for user
app.get('/api/wishlist', optionalAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlistItems = await db.Wishlist.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'price', 'img', 'description']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(wishlistItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load wishlist' });
    }
});

// Add item to wishlist
app.post('/api/wishlist', optionalAuth, async (req, res) => {
    try {
        const { product_id, session_id } = req.body;
        const userId = req.user.id;

        const existing = await db.Wishlist.findOne({
            where: { user_id: userId, product_id: product_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Item already in wishlist' });
        }

        const wishlistItem = await db.Wishlist.create({
            user_id: userId,
            product_id: product_id,
            session_id: session_id || 'mock-session'
        });

        res.json(wishlistItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove item from wishlist
app.delete('/api/wishlist/:product_id', optionalAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await db.Wishlist.destroy({
            where: { user_id: userId, product_id: req.params.product_id }
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// Clear entire wishlist
app.delete('/api/wishlist', optionalAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await db.Wishlist.destroy({
            where: { user_id: userId }
        });
        res.json({ message: 'Wishlist cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to clear wishlist' });
    }
});

// Get wishlist by user ID for sharing
app.get('/api/wishlist/shared/:userId', async (req, res) => {
    try {
        const wishlistItems = await db.Wishlist.findAll({
            where: { user_id: req.params.userId },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'price', 'img', 'description']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(wishlistItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load shared wishlist' });
    }
});

// Send email on session close with wishlist items
app.post('/api/wishlist/email-on-close', optionalAuth, async (req, res) => {
    try {
        const { user_id, session_id, wishlist_items } = req.body;
        const uid = user_id || req.user.id;

        const user = await db.User.findByPk(uid);
        if (!user || !user.email) {
            return res.status(404).json({ error: 'User not found or email not available' });
        }

        const items = await db.Wishlist.findAll({
            where: { user_id: uid, product_id: wishlist_items },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'price', 'img', 'description']
            }]
        });

        if (items.length === 0) return res.json({ message: 'No wishlist items to send' });

        try {
            await emailService.sendWishlistNotification(
                user.email,
                user.username,
                items,
                process.env.APP_URL || '${API_BASE_URL}'
            );
        } catch (emailError) {
            console.error('Email sending failed, but continuing:', emailError);
        }

        await db.Wishlist.update(
            { email_sent: true },
            { where: { user_id: uid } }
        );

        res.json({
            message: 'Wishlist email prepared and sent',
            recipientEmail: user.email,
            itemsCount: items.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send wishlist email' });
    }
});

// API route for FAQs
app.get('/api/faq', async (req, res) => {
    try {
        const { page = 0, size = 10, search = '' } = req.query;
        const pageNum = parseInt(page) || 0;
        const pageSize = parseInt(size) || 10;
        const offset = pageNum * pageSize;

        const { Op } = db.Sequelize;
        let where = {};

        if (req.query.productId) {
            where.productId = req.query.productId;
        }

        if (search && search.trim()) {
            const searchCondition = {
                [Op.or]: [
                    { question: { [Op.iLike]: `%${search}%` } },
                    { answer: { [Op.iLike]: `%${search}%` } },
                    { askedBy: { [Op.iLike]: `%${search}%` } }
                ]
            };
            if (where.productId) {
                where = { [Op.and]: [where, searchCondition] };
            } else {
                where = searchCondition;
            }
        }

        const { count, rows: faqs } = await db.FAQ.findAndCountAll({
            where,
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        });

        res.json(getPaginatedResponse(faqs, count, pageNum, pageSize));
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ error: 'Failed to load FAQs' });
    }
});

// CRUD API routes for FAQs

// Create FAQ (Public submission for "Ask a Question" feature)
app.post('/api/faq', async (req, res) => {
    try {
        const { question, answer, askedBy, isActive, productId } = req.body;
        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }
        const newFAQ = await db.FAQ.create({
            question,
            answer: 'Thank you for your question. Our team will get back to you soon!',
            askedBy: askedBy || 'Anonymous',
            isActive: false, // Force false for public submissions for moderation
            isDeleted: false,
            productId: productId
        });
        res.status(201).json(newFAQ);
    } catch (error) {

        console.error('Error creating FAQ:', error);
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

// Read FAQ by ID
app.get('/api/faq/:id', async (req, res) => {
    try {
        const faq = await db.FAQ.findByPk(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(faq);
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
});

// Update FAQ
app.put('/api/faq/:id', authenticateToken, async (req, res) => {
    try {
        const { question, answer, askedBy, isActive, isDeleted, productId } = req.body;
        const faq = await db.FAQ.findByPk(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        faq.askedBy = askedBy !== undefined ? askedBy : faq.askedBy;
        faq.isActive = isActive !== undefined ? isActive : faq.isActive;
        faq.isDeleted = isDeleted !== undefined ? isDeleted : faq.isDeleted;
        if (productId) faq.productId = productId;
        await faq.save();
        res.json(faq);
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
});

// Delete FAQ
app.delete('/api/faq/:id', authenticateToken, async (req, res) => {
    try {
        const faq = await db.FAQ.findByPk(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        await faq.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});
// API routes for Reviews
// Get Reviews for a product (Approved only for public)
app.get('/api/review', async (req, res) => {
    try {
        const { productId, page = 0, size = 10 } = req.query;
        const pageNum = parseInt(page) || 0;
        const pageSize = parseInt(size) || 10;
        const offset = pageNum * pageSize;

        let where = { status: 'approved' };
        if (productId) {
            where.productId = productId;
        }

        const { count, rows: reviews } = await db.Review.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: offset
        });

        res.json(getPaginatedResponse(reviews, count, pageNum, pageSize));
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to load reviews', message: error.message, stack: error.stack });
    }
});

// Admin Get All Reviews
app.get('/api/review/admin', authenticateToken, async (req, res) => {
    try {
        const { page = 0, size = 10, status, productId, search } = req.query;
        const pageNum = parseInt(page) || 0;
        const pageSize = parseInt(size) || 10;
        const offset = pageNum * pageSize;
        const { Op } = db.Sequelize;

        let where = {};
        if (status) where.status = status;
        if (productId) where.productId = productId;

        if (search && search.trim()) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { comment: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: reviews } = await db.Review.findAndCountAll({
            where,
            include: [
                { model: db.Product, as: 'product', attributes: ['title'] },
                { model: db.User, as: 'approver', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: offset
        });

        res.json(getPaginatedResponse(reviews, count, pageNum, pageSize));
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ error: 'Failed to load admin reviews' });
    }
});

// Submit a Review (Public)
app.post('/api/review', async (req, res) => {
    try {
        const { name, email, rating, comment, productId } = req.body;
        if (!productId || !rating || !comment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newReview = await db.Review.create({
            name,
            email,
            rating,
            comment,
            productId,
            status: 'pending' // Default to pending
        });
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// Admin Update Review (Approve/Reject/Edit)
app.put('/api/review/:id', authenticateToken, async (req, res) => {
    try {
        const { status, rating, comment } = req.body;
        const review = await db.Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (status) {
            review.status = status;
            // Track who approved or rejected the review
            if (status === 'approved' || status === 'rejected') {
                review.approvedBy = req.user.id;
            }
        }
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;
        await review.save();
        // Return with approver info
        const updatedReview = await db.Review.findByPk(req.params.id, {
            include: [
                { model: db.Product, as: 'product', attributes: ['title'] },
                { model: db.User, as: 'approver', attributes: ['username'] }
            ]
        });
        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Admin Delete Review
app.delete('/api/review/:id', authenticateToken, async (req, res) => {
    try {
        const review = await db.Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        await review.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// Mount Sale Routes
app.use('/api/sale', saleRoutes);

// Start server
const startServer = async () => {
    try {
        // Initialize Redis (graceful - app works without it)
        const redisClient = await initRedis();
        if (redisClient) {
            console.log('✅ Redis initialized successfully');
        } else {
            console.log('⚠️  Starting without Redis - some features like caching will be unavailable');
        }

        await ensureDatabaseExists();
        await db.sequelize.query('DROP TABLE IF EXISTS "Reviews" CASCADE;');
        //await db.sequelize.query('DROP TABLE IF EXISTS "Flavors" CASCADE;');
        await db.sequelize.sync({ alter: true });
        console.log('Database synced successfully (alter applied)');
        await seedData();

        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
