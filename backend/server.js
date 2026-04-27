require('dotenv').config();
const app = require('./app');
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
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('./utils/emailService');
const newsletterRoutes = require('./routes/newsletterRoutes');


const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Dynamic import for node-fetch (ESM in CommonJS)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Solr Proxy Endpoint
 * Bypasses CORS by routing search requests through the backend.
 * Uses VITE_SOLR_URL from environment variables.
 */
app.get('/api/solr-proxy/hanley/select', async (req, res) => {
    try {
        const solrBaseUrl = (process.env.VITE_SOLR_URL || 'http://localhost:8983').replace(/\/$/, '');

        // Correctly handle multiple query parameters with the same name (like facet.field)
        const solrParams = new URLSearchParams();
        for (const [key, value] of Object.entries(req.query)) {
            if (Array.isArray(value)) {
                value.forEach(v => solrParams.append(key, v));
            } else {
                solrParams.append(key, value);
            }
        }

        const solrUrl = `${solrBaseUrl}/solr/hanley/select?${solrParams.toString()}`;

        const response = await fetch(solrUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('--- SOLR ERROR DETAILS ---');
            console.error(errorText);
            return res.status(response.status).json({ error: 'Solr Error', detail: errorText });
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.setHeader('Content-Type', contentType || 'text/plain');
            res.send(text);
        }
    } catch (error) {
        console.error('Solr Proxy Error:', error);
        res.status(500).json({ error: 'Failed to fetch from Solr', message: error.message });
    }
});

// Razorpay Initialization
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// Static Assets Configuration
const frontendPublicPath = path.join(__dirname, '..', 'Front End', 'public');
const backendPublicPath = path.join(__dirname, 'public');

// Priority serving for backend's own assets (like uploads)
app.use(express.static(backendPublicPath));

// Fallback serving for Frontend static files
if (fs.existsSync(frontendPublicPath)) {
    app.use(express.static(frontendPublicPath));
    app.use('/MDB5-STANDARD-UI-KIT-Free-9.3.0', express.static(path.join(frontendPublicPath, 'MDB5-STANDARD-UI-KIT-Free-9.3.0')));
}

// Special route for /images to ensure global accessibility with CORS
app.use('/images', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
}, express.static(path.join(backendPublicPath, 'images')), express.static(path.join(frontendPublicPath, 'images')));

// Authentication middleware
// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Support header OR query param for flexibility
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

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

/**
 * Scan filesystem for product media based on flavors
 * Rule: Get images from the first discovered flavor folder.
 * Returns: { mainImage: string, allImages: Array<string> }
 */
const scanProductFilesystemMedia = (productId) => {
    const productIdStr = String(productId);
    const productDir = path.join(__dirname, '..', 'Front End', 'public', 'images', productIdStr);
    let mainImage = null;
    let allImages = [];

    if (fs.existsSync(productDir)) {
        try {
            // Get subdirectories (flavors)
            const flavorFolders = fs.readdirSync(productDir)
                .filter(f => fs.statSync(path.join(productDir, f)).isDirectory())
                .sort((a, b) => parseInt(a) - parseInt(b)); // Sort by ID if possible

            if (flavorFolders.length > 0) {
                // Use the FIRST discovered flavor folder as requested
                const firstFlavorDir = path.join(productDir, flavorFolders[0]);
                const files = fs.readdirSync(firstFlavorDir)
                    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

                if (files.length > 0) {
                    files.forEach(file => {
                        allImages.push(`/images/${productIdStr}/${flavorFolders[0]}/${file}`);
                    });
                    mainImage = allImages[0];
                }
            }
        } catch (err) {
            console.error(`Error scanning media for product ${productId}:`, err);
        }
    }
    return { mainImage, allImages };
};

// Database Initialization (PostgreSQL only, removed SQLite references)
async function ensureDatabaseExists() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    try {
        const parsedUrl = new URL(dbUrl);
        const dbName = parsedUrl.pathname.substring(1);

        // Connect to 'postgres' database to check if target DB exists
        const postgresUrlObj = new URL(dbUrl);
        postgresUrlObj.pathname = '/postgres';
        postgresUrlObj.search = ''; // Clear search params to avoid conflicting SSL settings
        const postgresUrl = postgresUrlObj.toString();
        const client = new Client({
            connectionString: postgresUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

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

app.use('/api/newsletter', newsletterRoutes);

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

        if (product) {
            const productJson = product.toJSON();
            const { mainImage, allImages } = scanProductFilesystemMedia(productJson.id);
            if (mainImage) {
                productJson.image = mainImage;
                productJson.cardCarouselImages = allImages;
            }
            res.json(productJson);
        }
        else res.status(404).json({ error: 'No product found' });
    } catch (error) {
        console.error('Error fetching weekly best seller:', error);
        res.status(500).json({ error: 'Failed to fetch weekly best seller' });
    }
});

app.get('/api/product/getProducts', async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    let size = parseInt(req.query.size) || 10;
    try {
        if (size > 200) size = 200; // Cap to prevent connection overload
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
            distinct: true,
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
                    model: db.FAQ, as: 'faqs', required: false,
                    attributes: ['id', 'question', 'answer'],
                    separate: true,
                    limit: 5
                },
                {
                    model: db.Review, as: 'reviews', required: false,
                    attributes: ['id', 'name', 'rating', 'comment'],
                    separate: true,
                    limit: 5
                }
            ]
        });

        // Enhance products with filesystem-first media for cards
        const enhancedRows = rows.map(product => {
            const productJson = product.toJSON();
            const { mainImage, allImages } = scanProductFilesystemMedia(productJson.id);

            // If filesystem has images, override the default 'image' for cards
            if (mainImage) {
                productJson.image = mainImage;
                productJson.cardCarouselImages = allImages;
            }
            return productJson;
        });

        res.json(getPaginatedResponse(enhancedRows, count, page, size));
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', message: error.message });
    }
});

app.get('/api/category/getCategories', async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    let size = parseInt(req.query.size) || 10;
    try {
        if (size > 200) size = 200; // Cap to prevent overload
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

// Menu Routes
app.get('/api/menu', async (req, res) => {
    try {
        let setting = await db.AppSetting.findOne({ where: { setting_key: 'MAIN_MENU' } });
        if (!setting) {
            // default menu
            const defaultMenu = [
                { id: '1', title: 'Home', url: '/', order: 1, children: [] },
                { id: '2', title: 'Shop', url: '/products', order: 2, children: [
                    { id: '3', title: 'All Products', url: '/products', order: 1, children: [] },
                    { id: '4', title: 'Coming Soon', url: '/products?filter=comingSoon', order: 2, children: [] }
                ] },
                { id: '5', title: 'Men', url: '/productMen', order: 3, children: [] },
                { id: '6', title: 'Women', url: '/productWomen', order: 4, children: [] },
                { id: '7', title: 'Kids', url: '/productKids', order: 5, children: [] },
                { id: '8', title: 'BestSellers', url: '/bestsellers', order: 6, children: [] },
                { id: '9', title: 'Featured', url: '/featured', order: 7, children: [] },
                { id: '10', title: 'Search', url: '/advancedSearch', order: 8, children: [] },
                { id: '11', title: 'Track Order', url: '/trackOrder', order: 9, children: [] }
            ];
            setting = await db.AppSetting.create({ setting_key: 'MAIN_MENU', setting_value: JSON.stringify(defaultMenu) });
        }
        res.json(JSON.parse(setting.setting_value));
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

app.post('/api/menu', authenticateToken, async (req, res) => {
    try {
        const menuData = req.body;
        let setting = await db.AppSetting.findOne({ where: { setting_key: 'MAIN_MENU' } });
        if (!setting) {
            await db.AppSetting.create({ setting_key: 'MAIN_MENU', setting_value: JSON.stringify(menuData) });
        } else {
            setting.setting_value = JSON.stringify(menuData);
            await setting.save();
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ error: 'Failed to save menu' });
    }
});

// Home Sections Routes
app.get('/api/home-sections', async (req, res) => {
    try {
        const sections = await db.HomeSection.findAll({
            order: [['order', 'ASC']]
        });
        res.json(sections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch home sections' });
    }
});

app.put('/api/home-sections/updateOrder', authenticateToken, async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { sections } = req.body; // Array of {id, order}
        for (const item of sections) {
            await db.HomeSection.update(
                { order: item.order },
                { where: { id: item.id }, transaction: t }
            );
        }
        await t.commit();
        res.json({ success: true });
    } catch (error) {
        if (t) await t.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

app.put('/api/home-sections/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { active, displayName } = req.body;
        await db.HomeSection.update(
            { active, displayName },
            { where: { id } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

app.get('/api/coupon/getCoupon', async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    try {
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
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    try {
        const { count, rows } = await db.Order.findAndCountAll({
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']],
            include: [{
                model: db.OrderItem,
                include: [db.Product, db.Flavor]
            }]
        });
        const mappedRows = rows.map(r => {
            const json = r.toJSON();
            json.lineItems = json.OrderItems?.map(item => ({
                id: item.id,
                quantity: item.quantity,
                product: item.Product,
                size: item.size || 'small',
                flavor: item.Flavor ? item.Flavor.name : (item.flavor_id ? 'Flavor ID: ' + item.flavor_id : 'Standard'),
                price: item.price,
                createdAt: item.createdAt
            })) || [];
            return json;
        });
        res.json(getPaginatedResponse(mappedRows, count, page, size));
    } catch (error) {
        console.error('getOrders error:', error);
        res.json(getPaginatedResponse([], 0, page, size));
    }
});

app.put('/api/order/updateStatus/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = { status: status };

        // Record timestamp based on status
        const now = new Date();
        if (status.toLowerCase() === 'processing') updateData.processing_at = now;
        if (status.toLowerCase() === 'shipped') updateData.shipped_at = now;
        if (status.toLowerCase() === 'delivered') updateData.delivered_at = now;
        if (status.toLowerCase() === 'cancelled') updateData.cancelled_at = now;

        await db.Order.update(
            updateData,
            { where: { id: id } }
        );
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

app.get('/api/order/fetchById/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db.Order.findByPk(id, {
            include: [{
                model: db.OrderItem,
                include: [db.Product, db.Flavor]
            }]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const json = order.toJSON();
        json.lineItems = json.OrderItems?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: item.Product,
            size: item.size || 'small',
            flavor: item.Flavor ? item.Flavor.name : (item.flavor_id ? 'Flavor ID: ' + item.flavor_id : 'Standard'),
            price: item.price,
            createdAt: item.createdAt
        })) || [];

        res.json({ success: true, order: json });
    } catch (error) {
        console.error('Fetch order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details' });
    }
});

app.get('/api/order/track/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db.Order.findByPk(id, {
            attributes: ['id', 'status', 'created_at', 'processing_at', 'shipped_at', 'delivered_at', 'cancelled_at']
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tracking info' });
    }
});
app.post('/api/order/createOrder', async (req, res) => {
    // --- Early validation BEFORE starting DB transaction ---
    const {
        firstName, lastName, email, mobileNumber, billingAddress, shippingAddress, paymentType,
        sameAddress, subTotal, total, cartItems, martItems, lartItems,
        couponCode, discountAmount, detailedItems
    } = req.body;

    // Validate total amount
    const parsedTotal = parseFloat(total);
    if (!parsedTotal || parsedTotal <= 0 || isNaN(parsedTotal)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Order',
            message: 'Order total must be greater than zero. Please add items to your cart before checking out.'
        });
    }

    // Validate that the cart has items
    const hasCartItems = Object.values(cartItems || {}).some(q => q > 0);
    const hasMartItems = Object.values(martItems || {}).some(q => q > 0);
    const hasLartItems = Object.values(lartItems || {}).some(q => q > 0);
    const hasDetailedItems = Array.isArray(detailedItems) && detailedItems.length > 0;

    if (!hasCartItems && !hasMartItems && !hasLartItems && !hasDetailedItems) {
        return res.status(400).json({
            success: false,
            error: 'Empty Cart',
            message: 'Your cart is empty. Please add items before placing an order.'
        });
    }

    // Validate required customer fields
    if (!email || !mobileNumber || !firstName) {
        return res.status(400).json({
            success: false,
            error: 'Missing Information',
            message: 'Customer name, email and mobile number are required.'
        });
    }

    const t = await db.sequelize.transaction();
    try {
        console.log('--- CREATE ORDER REQUEST ---');
        console.log('Total:', parsedTotal);
        console.log('Items Count:', Object.keys(cartItems || {}).length + Object.keys(martItems || {}).length + Object.keys(lartItems || {}).length);

        const customerInfo = { firstName, lastName, email, mobile: mobileNumber, name: `${firstName} ${lastName}`.trim() };

        // 1. Create order in our database
        const order = await db.Order.create({
            total: parsedTotal,
            subTotal: parseFloat(subTotal) || parsedTotal,
            paymentType: paymentType || 'Razorpay',
            customer: customerInfo,
            billingAddress: billingAddress,
            delieveryAddress: shippingAddress,
            status: 'Pending',
            created_at: new Date(),
            couponCode: couponCode || null,
            discountAmount: parseFloat(discountAmount) || 0
        }, { transaction: t });

        // --- Stock Management Logic ---
        // Aggregate all items (including free ones) to check total demand per product
        const stockDemand = {};
        const itemsToProcess = detailedItems || [];

        const collectFromMap = (map) => {
            if (!map) return;
            Object.entries(map).forEach(([key, qty]) => {
                const pid = key.split('_')[0];
                if (qty > 0) {
                    stockDemand[pid] = (stockDemand[pid] || 0) + qty;
                }
            });
        };

        if (itemsToProcess.length === 0) {
            collectFromMap(cartItems);
            collectFromMap(martItems);
            collectFromMap(lartItems);
        } else {
            itemsToProcess.forEach(item => {
                stockDemand[item.productId] = (stockDemand[item.productId] || 0) + item.quantity;
            });
        }

        // Validate and Decrement Stock atomically
        for (const [pid, qty] of Object.entries(stockDemand)) {
            const product = await db.Product.findByPk(pid, {
                transaction: t,
                lock: true // FOR UPDATE lock to prevent race conditions during transaction
            });

            if (!product) {
                throw new Error(`Product with ID ${pid} not found.`);
            }

            // Check for availability
            if (product.stock === null || product.stock === undefined || product.stock < qty) {
                throw new Error(`Insufficient stock for "${product.title}". Requested: ${qty}, Available: ${product.stock || 0}`);
            }

            // Decrement stock
            await product.update({
                stock: Math.max(0, product.stock - qty)
            }, { transaction: t });
        }
        // --- End Stock Management Logic ---

        // Helper to process items
        const processItems = async (items, itemsType) => {
            if (!items) return;
            const entries = Object.entries(items);
            for (const [key, qty] of entries) {
                if (qty > 0) {
                    const [productId, flavorId] = key.split('_');

                    let unitPrice = 0;
                    try {
                        const pf = await db.ProductFlavor.findOne({
                            where: {
                                product_id: parseInt(productId),
                                flavor_id: flavorId ? parseInt(flavorId) : 1
                            }
                        });
                        if (pf) {
                            if (itemsType === 'small') unitPrice = pf.price || 0;
                            else if (itemsType === 'medium') unitPrice = pf.priceMedium || 0;
                            else if (itemsType === 'large') unitPrice = pf.priceLarge || 0;
                        }
                    } catch (e) {
                        console.error('Price lookup error:', e);
                    }

                    await db.OrderItem.create({
                        order_id: order.id,
                        product_id: parseInt(productId),
                        flavor_id: flavorId ? parseInt(flavorId) : null,
                        size: itemsType,
                        quantity: qty,
                        price: unitPrice,
                        createdAt: new Date()
                    }, { transaction: t });
                }
            }
        };

        if (req.body.detailedItems && Array.isArray(req.body.detailedItems)) {
            for (const item of req.body.detailedItems) {
                await db.OrderItem.create({
                    order_id: order.id,
                    product_id: item.productId,
                    flavor_id: item.flavorId,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    createdAt: new Date()
                }, { transaction: t });
            }
        } else {
            await processItems(cartItems, 'small');
            await processItems(martItems, 'medium');
            await processItems(lartItems, 'large');
        }

        // 2. Create Razorpay Order
        const razorpayAmount = Math.round(parsedTotal * 100);
        if (razorpayAmount <= 0) {
            throw new Error('Calculated Razorpay amount is zero or negative. Please check the order total.');
        }
        const options = {
            amount: razorpayAmount,
            currency: "INR",
            receipt: `rcpt_${order.id}`
        };

        const razorpayOrder = await razorpay.orders.create(options);
        console.log('Razorpay Order Created:', razorpayOrder.id);

        await t.commit();

        res.status(201).json({
            id: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error('CRITICAL: Error in createOrder:', error);

        // Detect Razorpay-specific errors (they have statusCode / description)
        const isRazorpayError = !!(error.statusCode || error.description);
        const statusCode = isRazorpayError ? (error.statusCode || 400) : 500;

        let errorMessage;
        if (isRazorpayError && error.statusCode === 401) {
            errorMessage = 'Razorpay authentication failed. Please check API keys.';
        } else if (isRazorpayError) {
            errorMessage = error.description || error.message || 'Payment gateway error.';
        } else if (error.message?.includes('stock') || error.message?.includes('Stock')) {
            errorMessage = error.message; // surface stock errors as-is
        } else {
            errorMessage = 'Failed to create order. Please try again.';
        }

        res.status(statusCode).json({
            success: false,
            error: isRazorpayError ? 'Razorpay Error' : 'Order Error',
            message: errorMessage,
            detail: error.metadata || null
        });
    }
});

app.post('/api/payment/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            await db.Order.update(
                {
                    status: 'Processing',
                    razorpay_order_id: razorpay_order_id,
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_signature: razorpay_signature
                },
                { where: { id: order_id } }
            );

            // ── Send Tax Invoice Email (async, non-blocking) ───────────────────
            (async () => {
                try {
                    const orderForEmail = await db.Order.findByPk(order_id, {
                        include: [{
                            model: db.OrderItem,
                            include: [db.Product, db.Flavor]
                        }]
                    });
                    if (orderForEmail) {
                        const orderJson = orderForEmail.toJSON();
                        orderJson.lineItems = (orderJson.OrderItems || []).map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            product: item.Product,
                            size: item.size || 'small',
                            flavor: item.Flavor ? item.Flavor.name : (item.flavor_id ? 'Flavor #' + item.flavor_id : 'Standard'),
                            price: item.price,
                        }));
                        await emailService.sendTaxInvoiceEmail(orderJson, order_id);
                    }
                } catch (emailErr) {
                    console.error('[Email] Error preparing invoice email:', emailErr.message);
                }
            })();
            // ─────────────────────────────────────────────────────────────────

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// BlueDart Tracking Endpoint
app.post('/api/admin/tracking/checkpoints', async (req, res) => {
    try {
        const { tracking_number } = req.body;
        // Mock success data for the bluedart-tracking-web-component
        return res.json({
            success: true,
            data: {
                tracking_number: tracking_number || "75484923054",
                status: "In Transit",
                checkpoints: [
                    { location: "Mumbai", status: "Picked up", time: "2026-04-09 10:00 AM" },
                    { location: "Pune", status: "In Transit", time: "2026-04-09 02:00 PM" },
                    { location: "Bangalore", status: "Reached Hub", time: "2026-04-10 08:00 AM" }
                ]
            }
        });
    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(500).json({ error: 'Failed' });
    }
});

// User Management Routes
app.get('/api/user/users', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    try {
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
        if (product) {
            const productData = product.toJSON();
            const productImages = productData.images || [];

            // Scan filesystem for additional flavor images
            const productIdStr = String(req.params.id);
            const productDir = path.join(__dirname, '..', 'Front End', 'public', 'images', productIdStr);

            if (fs.existsSync(productDir)) {
                try {
                    const flavorFolders = fs.readdirSync(productDir);
                    flavorFolders.forEach(flavorIdStr => {
                        const flavorDirPath = path.join(productDir, flavorIdStr);
                        if (fs.statSync(flavorDirPath).isDirectory()) {
                            const files = fs.readdirSync(flavorDirPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
                            files.forEach(file => {
                                const url = `/images/${productIdStr}/${flavorIdStr}/${file}`;
                                // Avoid duplicates if already in DB
                                if (!productImages.find(img => img.url === url)) {
                                    productImages.push({
                                        product_id: parseInt(productIdStr),
                                        flavor_id: parseInt(flavorIdStr) || null,
                                        url: url,
                                        isFileSystem: true
                                    });
                                }
                            });
                        }
                    });
                } catch (err) {
                    console.error('Error scanning product image directory:', err);
                }
            }

            productData.images = productImages;

            // Apply special card media logic (First folder, First image)
            const { mainImage, allImages } = scanProductFilesystemMedia(productIdStr);
            if (mainImage) {
                productData.image = mainImage;
                productData.cardCarouselImages = allImages;
            }

            res.json(productData);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/product/createProduct', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const productData = { ...req.body };

        if (productData.ProductImages) {
            productData.images = productData.ProductImages;
        }

        // Create product (Sequelize handles the associated ProductImages)
        const product = await db.Product.create(productData, {
            include: [{ model: db.ProductImage, as: 'images' }, { model: db.ProductFlavor, as: 'productFlavors' }]
        });

        // After creation, migrate any 'temp' images to the product's own folder
        const images = await db.ProductImage.findAll({ where: { product_id: product.id } });
        for (const img of images) {
            if (img.url && img.url.includes('/images/temp/')) {
                try {
                    const oldPath = path.join(__dirname, '..', 'Front End', 'public', img.url);
                    const newFileName = path.basename(img.url);
                    // Product images are stored as: /images/:productId/:flavorId/:file
                    // If uploaded to temp, it was: /images/temp/:flavorId/:file
                    const urlParts = img.url.split('/'); // ["", "images", "temp", flavorId, filename]
                    const flavorId = urlParts[3] || 'default';

                    const newDir = path.join(__dirname, '..', 'Front End', 'public', 'images', String(product.id), flavorId);
                    const newUrl = `/images/${product.id}/${flavorId}/${newFileName}`;
                    const newPath = path.join(newDir, newFileName);

                    if (fs.existsSync(oldPath)) {
                        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
                        fs.renameSync(oldPath, newPath);
                        await img.update({ url: newUrl });
                    }
                } catch (err) {
                    console.error('Error migrating product image from temp:', err);
                }
            }
        }

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

        // Sync ProductImages
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

        // Sync productFlavors
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
        if (t) await t.rollback();
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/product/delete/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await db.Product.findByPk(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // If 'hard' query param is true, perform real delete and cleanup
        if (req.query.hard === 'true') {
            const productFolder = path.join(__dirname, '..', 'Front End', 'public', 'images', String(productId));
            deleteMediaFolder(productFolder);

            await product.destroy();
            res.json({ message: 'Product permanently deleted and media cleaned up' });
        } else {
            // Default to soft delete
            await product.update({ active: false });
            res.json({ message: 'Product deactivated' });
        }
    } catch (error) {
        console.error(error);
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

        // Find maximum order value to place new item at the end
        const maxOrder = await db.Category.max('order') || 0;
        const newCategory = {
            ...req.body,
            order: maxOrder + 1
        };

        const category = await db.Category.create(newCategory);
        res.status(201).json(category);
    } catch (error) {
        console.error(error);
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
        const flavorData = req.body;
        const flavor = await db.Flavor.create(flavorData);

        // If image was in temp folder, move it to the flavor's own folder
        if (flavor.image && flavor.image.includes('/Flavors/temp/')) {
            try {
                const oldPath = path.join(__dirname, '..', 'Front End', 'public', flavor.image);
                const newFileName = path.basename(flavor.image);
                const newDir = path.join(__dirname, '..', 'Front End', 'public', 'images', 'Flavors', String(flavor.id));
                const newUrl = `/images/Flavors/${flavor.id}/${newFileName}`;
                const newPath = path.join(newDir, newFileName);

                if (fs.existsSync(oldPath)) {
                    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
                    fs.renameSync(oldPath, newPath);
                    await flavor.update({ image: newUrl });
                }
            } catch (err) {
                console.error('Error moving flavor image from temp:', err);
            }
        }

        res.status(201).json(flavor);
    } catch (error) {
        console.error(error);
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
        const flavorId = req.params.id;
        const flavor = await db.Flavor.findByPk(flavorId);

        if (flavor) {
            // Cleanup ID-based folder
            const flavorFolder = path.join(__dirname, '..', 'Front End', 'public', 'images', 'Flavors', String(flavorId));
            deleteMediaFolder(flavorFolder);

            // Cleanup if it references temp path
            if (flavor.image && flavor.image.includes('/Flavors/temp/')) {
                const tempPath = path.join(__dirname, '..', 'Front End', 'public', flavor.image);
                if (fs.existsSync(tempPath)) {
                    try {
                        fs.unlinkSync(tempPath);
                    } catch (e) {
                        console.error('Error unlinking temp flavor image', e);
                    }
                }
            }
        }

        await db.Flavor.destroy({ where: { id: flavorId } });
        res.json({ message: 'Flavor deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete flavor' });
    }
});

// Utility to delete media folder
const deleteMediaFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        try {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log('Deleted media folder:', folderPath);
        } catch (err) {
            console.error(`Error deleting media folder: ${folderPath}`, err);
        }
    }
};

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
        const team = await db.LeadershipTeam.findByPk(req.params.id);
        if (team && team.image) {
            const imagePath = path.join(__dirname, '..', 'Front End', 'public', team.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await db.LeadershipTeam.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Leadership team deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete leadership team' });
    }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
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

app.post('/api/auth/signup', async (req, res) => {
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

app.put('/api/user/me', authenticateToken, async (req, res) => {
    try {
        const { username, phoneNumber } = req.body;
        const updateFields = {};
        if (username !== undefined) updateFields.username = username.trim();
        if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber.trim();

        await db.User.update(updateFields, { where: { id: req.user.id } });

        const updated = await db.User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'role', 'phoneNumber']
        });
        const userData = updated.toJSON();
        userData.roles = [{ name: 'ROLE_' + updated.role.toUpperCase() }];
        res.json(userData);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.put('/api/user/me/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both current and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }

        const user = await db.User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.User.update({ password: hashed }, { where: { id: req.user.id } });

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to update password.' });
    }
});

app.get('/api/user/privileges/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.user.role.toLowerCase() !== 'superadmin' && req.user.id != userId) {
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
                flavors: false,
                faqs: false,
                reviews: false,
                sales: false,
                sliders: false,
                leadership: false,
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
        const privilegesData = { ...req.body };

        if (req.user.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Sanitize data: remove primary key and alias fields to prevent Sequelize conflicts
        delete privilegesData.id;
        delete privilegesData.userId;
        privilegesData.user_id = userId;

        let [privilege, created] = await db.Privilege.findOrCreate({
            where: { user_id: userId },
            defaults: privilegesData
        });

        if (!created) {
            await privilege.update(privilegesData);
        }

        res.json({ message: 'Privileges updated successfully' });
    } catch (error) {
        console.error('Error updating privileges:', error);
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
const {
    uploadTestimonialImage,
    uploadLeadershipImage,
    uploadSliderImage,
    uploadFlavorImage,
    uploadProductFlavorImage,
    uploadTempImage,
    uploadCMSImage,
    uploadCategoryImage
} = require('./utils/blobUpload');

// ── Shared multer instance using memory storage ──────────────────────────────
// Files are held in RAM (req.file.buffer) and streamed to Vercel Blob or
// written to the local filesystem via the blobUpload utility.
const memUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
});

// ── /api/flavor/upload  ──────────────────────────────────────────────────────
// Folder in Blob:  flavors/<flavorId>/
app.post('/api/flavor/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const flavorId = req.query.flavorId || 'temp';
        const fileUrl = await uploadFlavorImage(req.file, flavorId);
        res.send(fileUrl);
    } catch (err) {
        console.error('Flavor upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

// ── /api/product/upload  ─────────────────────────────────────────────────────
// Folder in Blob:  productFlavors/<productId>/<flavorId>/
//                  OR  temp/<flavorId>/  when no productId supplied
app.post('/api/product/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const productId = req.query.productId;
        const flavorId = req.query.flavorId || 'default';
        let fileUrl;
        if (productId) {
            fileUrl = await uploadProductFlavorImage(req.file, productId, flavorId);
        } else {
            // No productId yet → stage in temp
            fileUrl = await uploadTempImage(req.file, flavorId);
        }
        res.send(fileUrl);
    } catch (err) {
        console.error('Product image upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

app.get('/api/product/scanMedia/:id', (req, res) => {
    try {
        const { mainImage, allImages } = scanProductFilesystemMedia(req.params.id);
        res.json({ mainImage, allImages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to scan media' });
    }
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

// ── /api/testimonial/upload  ─────────────────────────────────────────────────
// Folder in Blob:  testimonials/
app.post('/api/testimonial/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileUrl = await uploadTestimonialImage(req.file);
        res.send(fileUrl);
    } catch (err) {
        console.error('Testimonial upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

// ── /api/leadership/upload  ──────────────────────────────────────────────────
// Folder in Blob:  leadership/
app.post('/api/leadership/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileUrl = await uploadLeadershipImage(req.file);
        res.send(fileUrl);
    } catch (err) {
        console.error('Leadership upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

// ── /api/slider/upload  ──────────────────────────────────────────────────────
// Folder in Blob:  sliders/
app.post('/api/slider/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileUrl = await uploadSliderImage(req.file);
        res.send(fileUrl);
    } catch (err) {
        console.error('Slider upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

app.post('/api/cms/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileUrl = await uploadCMSImage(req.file);
        res.send(fileUrl);
    } catch (err) {
        console.error('CMS upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

app.post('/api/category/upload', authenticateToken, memUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileUrl = await uploadCategoryImage(req.file);
        res.send(fileUrl);
    } catch (err) {
        console.error('Category upload error:', err);
        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
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
let emailWishlistService;
try {
    emailWishlistService = require('./utils/emailService');
} catch (e) {
    emailWishlistService = {
        sendWishlistNotification: async () => { console.log("Mock email sent (wishlist)"); },
        sendEmail: async (options) => {
            console.log("Mock email sent (general):", options);
            return { success: true, messageId: 'mock-id' };
        }
    };
}

// Email Sending Route (Contact Form)
app.post('/api/email/send', memUpload.none(), async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        await emailService.sendEmail({
            to: to || 'Info@hanelyhealthcare.com',
            subject: subject || 'New Inquiry',
            text: text,
            html: html
        });

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email route error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

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

        const item = await db.Wishlist.create({
            user_id: userId,
            product_id: product_id,
            session_id: session_id
        });
        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// ==================== SETTINGS ENDPOINTS ====================

// Get all settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.AppSetting.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.setting_key] = s.setting_value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
app.post('/api/settings', authenticateToken, async (req, res) => {
    try {
        const { settings } = req.body; // Expects { key: value, ... }
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Invalid settings format' });
        }

        for (const [key, value] of Object.entries(settings)) {
            // Use findOrCreate + update or upsert depending on Sequelize version
            // For Postgres, upsert works well if there's a unique constraint
            await db.AppSetting.upsert({
                setting_key: key,
                setting_value: String(value)
            });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
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

        console.log('Fetching FAQs with where:', JSON.stringify(where));
        const { count, rows: faqs } = await db.FAQ.findAndCountAll({
            where,
            include: [{
                model: db.Product,
                as: 'product',
                attributes: ['title']
            }],
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        });

        res.json(getPaginatedResponse(faqs, count, pageNum, pageSize));
    } catch (error) {
        console.error('CRITICAL: Error fetching FAQs:', error);
        res.status(500).json({ error: 'Failed to load FAQs', message: error.message });
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

// --------------- Dashboard KPI Range ---------------
app.get('/api/admin/dashboard-kpis', async (req, res) => {
    try {
        const { Op } = db.Sequelize;

        // 1. Total Revenue
        const totalRevenueResult = await db.Order.sum('total');
        const purchaseRevenue = totalRevenueResult || 0;

        // 2. Total Purchases (Orders)
        const totalOrders = await db.Order.count();

        // 3. Total Users (registered)
        const totalRegisteredUsers = await db.User.count();

        // 4. Total Purchasers
        let totalPurchasers = 0;
        let firstTimePurchasers = 0;

        try {
            const usersQuery = await db.sequelize.query('SELECT COUNT(DISTINCT user_id) as total_purchasers FROM "Orders" WHERE user_id IS NOT NULL');
            totalPurchasers = parseInt(usersQuery[0][0].total_purchasers) || 0;

            const firstTimeQuery = await db.sequelize.query(`
               SELECT COUNT(*) as first_time FROM (
                   SELECT user_id FROM "Orders" WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(id) = 1
               ) as sub
           `);
            firstTimePurchasers = parseInt(firstTimeQuery[0][0].first_time) || 0;

            if (totalPurchasers === 0) {
                const guestQuery = await db.sequelize.query(`SELECT COUNT(DISTINCT customer->>'email') as total_purchasers FROM "Orders" WHERE customer->>'email' IS NOT NULL`);
                totalPurchasers = parseInt(guestQuery[0][0].total_purchasers) || 0;

                const guestFirstTimeQuery = await db.sequelize.query(`
                SELECT COUNT(*) as first_time FROM (
                   SELECT customer->>'email' as email FROM "Orders" WHERE customer->>'email' IS NOT NULL GROUP BY customer->>'email' HAVING COUNT(id) = 1
               ) as sub
              `);
                firstTimePurchasers = parseInt(guestFirstTimeQuery[0][0].first_time) || 0;
            }
        } catch (e) {
            console.log("Error running raw queries for dashboard KPIs", e);
        }

        if (totalPurchasers === 0 && totalOrders > 0) {
            totalPurchasers = totalOrders;
            firstTimePurchasers = totalOrders;
        }

        const avgRevenuePerUser = totalPurchasers > 0 ? (purchaseRevenue / totalPurchasers) : 0;
        const purchaserRate = totalRegisteredUsers > 0 ? ((totalPurchasers / totalRegisteredUsers) * 100) : 0;

        // 5. Refund Rate (Cancelled / Total)
        const cancelledOrders = await db.Order.count({ where: { status: 'Cancelled' } });
        const refundRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

        res.json({
            purchaseRevenue: purchaseRevenue,
            ecommercePurchases: totalOrders,
            purchaserRate: purchaserRate,
            firstTimePurchasers: firstTimePurchasers,
            totalPurchasers: totalPurchasers,
            avgRevenuePerUser: avgRevenuePerUser,
            refundRate: refundRate
        });
    } catch (error) {
        console.error('KPI error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
    }
});

app.get('/api/admin/dashboard-discount-codes', async (req, res) => {
    try {
        const { Op } = db.Sequelize;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const orders = await db.Order.findAll({
            where: {
                createdAt: { [Op.gte]: oneWeekAgo },
                couponCode: { [Op.ne]: null }
            }
        });

        const discountStats = {};
        orders.forEach(o => {
            const code = o.couponCode;
            if (!code) return;
            if (!discountStats[code]) {
                discountStats[code] = { code, uses: 0, revenue: 0 };
            }
            discountStats[code].uses += 1;
            discountStats[code].revenue += (o.total || 0);
        });

        const sortedStats = Object.values(discountStats)
            .sort((a, b) => b.uses - a.uses)
            .slice(0, 5);

        res.json(sortedStats);
    } catch (error) {
        console.error('Discount code KPI error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-order-stats-week', async (req, res) => {
    try {
        const { Op } = db.Sequelize;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const cancellationsThisWeek = await db.Order.count({
            where: {
                createdAt: { [Op.gte]: oneWeekAgo },
                status: 'Cancelled'
            }
        });

        const cancellationsLastWeek = await db.Order.count({
            where: {
                createdAt: { [Op.gte]: twoWeeksAgo, [Op.lt]: oneWeekAgo },
                status: 'Cancelled'
            }
        });

        let cancelPercent = 0;
        if (cancellationsLastWeek > 0) {
            cancelPercent = ((cancellationsThisWeek - cancellationsLastWeek) / cancellationsLastWeek) * 100;
        } else if (cancellationsThisWeek > 0) {
            cancelPercent = 100;
        }

        const unfulfilledThisWeek = await db.Order.count({
            where: {
                createdAt: { [Op.gte]: oneWeekAgo },
                status: { [Op.notIn]: ['Delivered', 'Cancelled', 'Shipped'] }
            }
        });

        res.json({
            cancellations: cancellationsThisWeek,
            cancellationsPercentVsLastWeek: cancelPercent,
            unfulfilled: unfulfilledThisWeek
        });
    } catch (error) {
        console.error('Order stats KPI error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-monthly-stats', async (req, res) => {
    try {
        const { Op } = db.Sequelize;
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Current Month Stats
        const currentMonthRevenue = await db.Order.sum('total', {
            where: { createdAt: { [Op.gte]: startOfCurrentMonth } }
        }) || 0;
        const currentMonthOrders = await db.Order.count({
            where: { createdAt: { [Op.gte]: startOfCurrentMonth } }
        });

        // Last Month Stats
        const lastMonthRevenue = await db.Order.sum('total', {
            where: { createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth } }
        }) || 0;
        const lastMonthOrders = await db.Order.count({
            where: { createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth } }
        });

        // Percent changes
        const revChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : (currentMonthRevenue > 0 ? 100 : 0);
        const ordChange = lastMonthOrders > 0 ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : (currentMonthOrders > 0 ? 100 : 0);

        res.json({
            revenue: currentMonthRevenue,
            revenuePercent: revChange,
            orders: currentMonthOrders,
            ordersPercent: ordChange
        });
    } catch (error) {
        console.error('Monthly stats KPI error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-product-audience', async (req, res) => {
    try {
        const { Op } = db.Sequelize;

        // 1. Discover Table and Column names dynamically
        const columns = await db.sequelize.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND (table_name ILIKE '%OrderItems%' OR table_name ILIKE '%order_items%')
        `, { type: db.sequelize.QueryTypes.SELECT });

        if (columns.length === 0) {
            console.warn('⚠️ No OrderItems table found in information_schema');
            return res.json({ topProducts: [], bestsellers: [], locations: [] });
        }

        const oiTable = columns[0].table_name;
        // Find which column represents the product ID (usually product_id or productId)
        const productIdCol = columns.find(c => c.column_name.toLowerCase().includes('product'))?.column_name || 'product_id';
        const quantityCol = columns.find(c => c.column_name.toLowerCase().includes('quantity'))?.column_name || 'quantity';

        console.log(`📊 Analytics using table: "${oiTable}", product column: "${productIdCol}", qty column: "${quantityCol}"`);

        // 2. Top Products (All Time) - Robust Query
        const topProducts = await db.sequelize.query(`
            SELECT 
                p.id, 
                p.title as name, 
                p.img, 
                c.title as category,
                SUM(COALESCE(oi."${quantityCol}", 0)) as sales,
                (SELECT MIN(pf.price) FROM "ProductFlavors" pf WHERE pf.product_id = p.id) as price
            FROM "Products" p
            INNER JOIN "${oiTable}" oi ON p.id = oi."${productIdCol}"
            LEFT JOIN "Categories" c ON c.id = p.category_id
            GROUP BY p.id, p.title, p.img, c.title
            ORDER BY sales DESC
            LIMIT 5
        `, { type: db.sequelize.QueryTypes.SELECT });

        // 3. Bestsellers
        const bestsellers = await db.sequelize.query(`
            SELECT 
                p.id, 
                p.title as name, 
                p.img,
                c.title as category,
                SUM(COALESCE(oi."${quantityCol}", 0)) as sales
            FROM "${oiTable}" oi
            INNER JOIN "Products" p ON p.id = oi."${productIdCol}"
            LEFT JOIN "Categories" c ON c.id = p.category_id
            GROUP BY p.id, p.title, p.img, c.title
            ORDER BY sales DESC
            LIMIT 5
        `, { type: db.sequelize.QueryTypes.SELECT });

        // 4. Locations
        const locations = await db.sequelize.query(`
            SELECT 
                COALESCE("billingAddress"->>'city', "billingAddress"->>'City', 'Other') as name, 
                count(*) as count 
            FROM "Orders" 
            GROUP BY name 
            ORDER BY count DESC 
            LIMIT 5
        `, { type: db.sequelize.QueryTypes.SELECT });

        res.json({
            topProducts: topProducts.map(p => ({
                id: p.id,
                name: p.name,
                image: p.img,
                category: p.category || 'General',
                sales: parseInt(p.sales) || 0,
                price: parseFloat(p.price) || 0
            })),
            bestsellers: bestsellers.map(p => ({
                id: p.id,
                name: p.name,
                image: p.img,
                category: p.category || 'General',
                sales: parseInt(p.sales) || 0
            })),
            locations: locations.map(l => ({
                name: l.name,
                count: parseInt(l.count) || 0
            }))
        });
    } catch (error) {
        console.error('❌ Analytics API Crash:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// --------------- Sales Overview (Monthly Daily Data) ---------------
app.get('/api/admin/dashboard-sales-overview', async (req, res) => {
    try {
        const { Op } = db.Sequelize;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch daily stats for the current month
        const dailyStats = await db.sequelize.query(`
            WITH RECURSIVE days AS (
                SELECT DATE_TRUNC('day', CAST(:start AS TIMESTAMP)) as day
                UNION ALL
                SELECT day + INTERVAL '1 day'
                FROM days
                WHERE day < DATE_TRUNC('day', CAST(:end AS TIMESTAMP))
            )
            SELECT 
                TO_CHAR(days.day, 'Mon DD') as date,
                COALESCE(SUM(o.total), 0) as revenue,
                COUNT(o.id) as orders,
                COALESCE(SUM(o.total * 0.15), 0) as profit -- Estimation: 15% profit margin
            FROM days
            LEFT JOIN "Orders" o ON DATE_TRUNC('day', o."createdAt") = days.day
            GROUP BY days.day
            ORDER BY days.day ASC
        `, {
            replacements: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json(dailyStats.map(d => ({
            date: d.date,
            revenue: parseFloat(d.revenue) || 0,
            orders: parseInt(d.orders) || 0,
            profit: parseFloat(d.profit) || 0
        })));
    } catch (error) {
        console.error('Sales Overview API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-order-status', async (req, res) => {
    try {
        const stats = await db.Order.findAll({
            attributes: [
                'status',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        // Map statuses to standard names for the frontend
        const statusMap = {
            'Delivered': 'Completed',
            'Processing': 'Processing',
            'Pending': 'Pending',
            'Cancelled': 'Cancelled',
            'Shipped': 'Shipped'
        };

        const result = {
            'Completed': 0,
            'Processing': 0,
            'Shipped': 0,
            'Pending': 0,
            'Cancelled': 0
        };

        stats.forEach(s => {
            const status = s.status || 'Pending';
            const mapped = statusMap[status] || 'Pending';
            if (result[mapped] !== undefined) {
                result[mapped] += parseInt(s.get('count'));
            } else {
                // If it's a new status not in map, maybe we should just add it to result?
                // For now, default to Pending if not mapped
                result['Pending'] += parseInt(s.get('count'));
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Order Status API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-sales-by-category', async (req, res) => {
    try {
        // 1. Discover Table and Column names dynamically (standardizing across all analytics)
        const oiResults = await db.sequelize.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND (table_name ILIKE 'OrderItems' OR table_name ILIKE 'order_items')
        `, { type: db.sequelize.QueryTypes.SELECT });

        const oiTable = oiResults[0]?.table_name || 'OrderItems';
        const productIdCol = oiResults.find(c => c.column_name.toLowerCase().includes('product'))?.column_name || 'product_id';
        const priceCol = oiResults.find(c => c.column_name.toLowerCase().includes('price'))?.column_name || 'price';
        const quantityCol = oiResults.find(c => c.column_name.toLowerCase().includes('quantity'))?.column_name || 'quantity';

        const stats = await db.sequelize.query(`
            SELECT 
                COALESCE(c.title, 'General') as category,
                SUM(COALESCE(oi."${priceCol}", 0) * COALESCE(oi."${quantityCol}", 0)) as revenue
            FROM "${oiTable}" oi
            INNER JOIN "Products" p ON oi."${productIdCol}" = p.id
            LEFT JOIN "Categories" c ON p.category_id = c.id
            GROUP BY COALESCE(c.title, 'General')
            ORDER BY revenue DESC
            LIMIT 5
        `, { type: db.sequelize.QueryTypes.SELECT });

        res.json(stats.map(s => ({
            category: s.category || 'Uncategorized',
            revenue: parseFloat(s.revenue) || 0
        })));
    } catch (error) {
        console.error('Sales By Category API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-goals', async (req, res) => {
    try {
        const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        let goal = await db.Goal.findOne({ where: { month } });

        if (!goal) {
            goal = await db.Goal.create({
                month,
                revenueTarget: 25000,
                ordersTarget: 100,
                customersTarget: 50
            });
        }
        res.json(goal);
    } catch (error) {
        console.error('Goals API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/admin/dashboard-goals', async (req, res) => {
    try {
        const month = new Date().toISOString().slice(0, 7);
        const { revenueTarget, ordersTarget, customersTarget } = req.body;

        let goal = await db.Goal.findOne({ where: { month } });
        if (goal) {
            await goal.update({ revenueTarget, ordersTarget, customersTarget });
        } else {
            goal = await db.Goal.create({ month, revenueTarget, ordersTarget, customersTarget });
        }
        res.json(goal);
    } catch (error) {
        console.error('Update Goals Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/dashboard-top-customers', async (req, res) => {
    try {
        const stats = await db.sequelize.query(`
            SELECT 
                COALESCE(o.customer->>'firstName', o.customer->>'name', 'Guest') as firstname,
                COALESCE(o.customer->>'lastName', '') as lastname,
                o.customer->>'email' as email,
                o.customer->>'phone' as phone,
                COUNT(o.id) as orders,
                SUM(o.total) as revenue
            FROM "Orders" o
            WHERE o.customer->>'email' IS NOT NULL
            GROUP BY firstname, lastname, email, phone
            ORDER BY revenue DESC
            LIMIT 5
        `, { type: db.sequelize.QueryTypes.SELECT });

        res.json(stats.map(s => {
            const fullName = `${s.firstname} ${s.lastname}`.trim();
            return {
                name: fullName,
                email: s.email,
                phone: s.phone || '-',
                orders: parseInt(s.orders) || 0,
                revenue: parseFloat(s.revenue) || 0,
                initials: (fullName || 'G').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            };
        }));
    } catch (error) {
        console.error('Top Customers API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/admin/getCustomers', async (req, res) => {
    try {
        const query = `
            WITH GeneralStats AS (
                SELECT 
                    LOWER(CAST(customer->>'email' AS TEXT)) as email_id,
                    COALESCE(MAX(customer->>'firstName'), split_part(MAX(customer->>'name'), ' ', 1), 'Guest') as firstname,
                    COALESCE(MAX(customer->>'lastName'), split_part(MAX(customer->>'name'), ' ', 2), '') as lastname,
                    COALESCE(MAX(customer->>'mobile'), MAX(customer->>'phone'), '-') as mobile_num,
                    COUNT(id) as total_orders_count,
                    MAX(id) as last_order_id,
                    (MAX(CASE WHEN "is_blocked" THEN 1 ELSE 0 END) > 0) as is_blocked_final
                FROM "Orders"
                WHERE customer->>'email' IS NOT NULL AND customer->>'email' != ''
                GROUP BY LOWER(CAST(customer->>'email' AS TEXT))
            ),
            LatestAddresses AS (
                SELECT DISTINCT ON (LOWER(customer->>'email'))
                    LOWER(customer->>'email') as email_id,
                    "billingAddress",
                    "delieveryAddress"
                FROM "Orders"
                ORDER BY LOWER(customer->>'email'), "createdAt" DESC
            ),
            ProductCounts AS (
                SELECT 
                    LOWER(CAST(o.customer->>'email' AS TEXT)) as email_id,
                    COALESCE(p.title, 'Product #' || oi.product_id) as productName,
                    SUM(COALESCE(oi.quantity, 1)) as totalQty,
                    MAX(oi.id) as last_oi_id
                FROM "OrderItems" oi
                JOIN "Orders" o ON oi.order_id = o.id
                LEFT JOIN "Products" p ON oi.product_id = p.id
                WHERE o.customer->>'email' IS NOT NULL AND o.customer->>'email' != ''
                GROUP BY LOWER(CAST(o.customer->>'email' AS TEXT)), productName
            ),
            TopProductPerCustomer AS (
                SELECT DISTINCT ON (email_id)
                    email_id,
                    productName
                FROM ProductCounts
                ORDER BY email_id, totalQty DESC, last_oi_id DESC
            )
            SELECT 
                gs.*,
                la."billingAddress" as billingaddress,
                la."delieveryAddress" as deliveryaddress,
                tp.productName as topproduct
            FROM GeneralStats gs
            LEFT JOIN LatestAddresses la ON gs.email_id = la.email_id
            LEFT JOIN TopProductPerCustomer tp ON gs.email_id = tp.email_id
            ORDER BY gs.total_orders_count DESC
        `;

        const result = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT });

        res.json(result.map(r => ({
            id: `UID-${r.email_id}`,
            name: `${r.firstname} ${r.lastname}`.trim(),
            email: r.email_id,
            mobile: r.mobile_num,
            is_blocked: !!r.is_blocked_final,
            isBlocked: !!r.is_blocked_final,
            totalOrders: parseInt(r.total_orders_count) || 0,
            topProduct: r.topproduct || 'N/A',
            lastOrderId: r.last_order_id,
            billingAddress: r.billingaddress,
            deliveryAddress: r.deliveryaddress,
        })));
    } catch (error) {
        console.error('Get Customers Error:', error);
        res.status(500).json({ error: 'Failed', details: error.message });
    }
});

app.post('/api/admin/toggleBlockUser', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const trimmedEmail = email.trim();

        // 1. Get current status specifically from our new column
        const blockQuery = await db.sequelize.query(
            'SELECT is_blocked FROM "Orders" WHERE customer->>\'email\' = :email ORDER BY "createdAt" DESC LIMIT 1',
            { replacements: { email: trimmedEmail }, type: db.sequelize.QueryTypes.SELECT }
        );

        const currentStatus = blockQuery.length > 0 ? !!blockQuery[0].is_blocked : false;
        const newStatus = !currentStatus;

        // 2. Update all orders with this email
        await db.sequelize.query(
            'UPDATE "Orders" SET "is_blocked" = :status WHERE customer->>\'email\' = :email',
            { replacements: { status: newStatus, email: trimmedEmail } }
        );

        // 3. Also update User table if registered
        await db.User.update(
            { isBlocked: newStatus },
            { where: { email: trimmedEmail } }
        );

        res.json({ success: true, is_blocked: newStatus });
    } catch (error) {
        console.error('Toggle Block Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/public/checkBlockStatus', async (req, res) => {
    try {
        const { email, mobile } = req.query;
        if (!email && !mobile) return res.json({ is_blocked: false });

        const trimmedEmail = email ? email.trim() : null;
        const trimmedMobile = mobile ? mobile.trim() : null;

        const blockQuery = await db.sequelize.query(`
            SELECT "is_blocked" 
            FROM "Orders" 
            WHERE (customer->>'email' = :email AND :email IS NOT NULL AND :email != '')
               OR (customer->>'mobile' = :mobile AND :mobile IS NOT NULL AND :mobile != '')
               OR (customer->>'phone' = :mobile AND :mobile IS NOT NULL AND :mobile != '')
            ORDER BY "createdAt" DESC 
            LIMIT 1
        `, {
            replacements: { email: trimmedEmail, mobile: trimmedMobile },
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json({ is_blocked: blockQuery.length > 0 ? !!blockQuery[0].is_blocked : false });
    } catch (error) {
        console.error('Public Block Check Error:', error);
        res.status(500).json({ is_blocked: false });
    }
});

app.get('/api/admin/dashboard-notifications', async (req, res) => {
    try {
        const [orders, users, locations] = await Promise.all([
            db.Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'total', 'customer', 'createdAt']
            }),
            db.User.findAll({
                limit: 3,
                order: [['createdAt', 'DESC']],
                attributes: ['username', 'createdAt']
            }),
            db.sequelize.query(`
                SELECT 
                    COALESCE("billingAddress"->>'city', "billingAddress"->>'City', 'Gandhinagar') as name, 
                    count(*) as count 
                FROM "Orders" 
                WHERE "createdAt" >= NOW() - INTERVAL '7 days'
                GROUP BY name 
                ORDER BY count DESC 
                LIMIT 3
            `, { type: db.sequelize.QueryTypes.SELECT })
        ]);

        const notifications = [];

        // 1. Order Notifications
        orders.forEach(o => {
            const name = o.customer?.firstName || o.customer?.name || 'Customer';
            notifications.push({
                id: `order-${o.id}`,
                text: `${name} has placed order worth INR ${parseFloat(o.total).toFixed(0)}`,
                time: o.createdAt,
                type: 'order'
            });
            // Also show invoice generation for same order for variety
            notifications.push({
                id: `inv-${o.id}`,
                text: `Tax Invoice has been generated for ${name}`,
                time: new Date(o.createdAt.getTime() + 1000 * 60), // Mock 1 min later
                type: 'invoice'
            });
        });

        // 2. Location Notifications
        locations.forEach(l => {
            notifications.push({
                id: `loc-${l.name}`,
                text: `More new ${l.count} active sessions from ${l.name}`,
                time: new Date(), // "Live" sessions
                type: 'session'
            });
        });

        // 3. User Notifications
        users.forEach(u => {
            notifications.push({
                id: `user-${u.username}`,
                text: `New user registration: ${u.username}`,
                time: u.createdAt,
                type: 'user'
            });
        });

        // Sort by time descending
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(notifications.slice(0, 10));
    } catch (error) {
        console.error('Notifications API Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/order/printInvoice/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await db.Order.findByPk(orderId, {
            include: [{
                model: db.OrderItem,
                include: [db.Product, db.Flavor]
            }]
        });

        if (!order) {
            return res.status(404).send('<h1>Order Not Found</h1>');
        }

        const formatAddressInternal = (addr) => {
            if (!addr) return 'N/A';
            if (typeof addr === 'string') return addr;
            const parts = [
                addr.firstName && addr.lastName ? `${addr.firstName} ${addr.lastName}` : (addr.name || ''),
                addr.addressLine1 || addr.address || addr.street || '',
                addr.addressLine2 || '',
                addr.city || '',
                addr.state || addr.province || '',
                addr.zipcode || addr.pincode || addr.zip || ''
            ].filter(p => p && p.trim() !== '');
            return parts.length > 0 ? parts.join(', ') : 'Address Details Missing';
        };

        const items = order.OrderItems || [];
        const subTotal = order.subTotal || order.total || 0;
        const discountAmount = order.discountAmount || 0;
        const total = order.total || 0;
        const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice - #${order.id}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
        .company-info h1 { margin: 0; color: #3b82f6; font-size: 24px; }
        .company-info p { margin: 2px 0; font-size: 13px; color: #64748b; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 20px; }
        .invoice-details p { margin: 2px 0; font-size: 13px; }
        .addresses { display: flex; gap: 40px; margin-bottom: 30px; }
        .address-box { flex: 1; }
        .address-box h3 { font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .address-box p { margin: 2px 0; font-size: 14px; line-height: 1.5; }
        table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 20px; }
        table th { background: #f8fafc; padding: 12px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .total-section { display: flex; justify-content: flex-end; }
        .total-table { width: 250px; }
        .total-table td { border: none; padding: 5px 12px; }
        .grand-total { font-weight: bold; color: #3b82f6; font-size: 18px !important; border-top: 1px solid #e2e8f0 !important; }
        .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
            .no-print { display: none; }
            body { padding: 0; }
            .invoice-box { border: none; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: right; margin-bottom: 20px;">
        <button onclick="window.focus(); window.print();" style="padding: 10px 20px; background: #4318ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);">Print Invoice PDF</button>
    </div>
    <div class="invoice-box">
        <div class="header">
            <div class="company-info">
                <h1>${companyInfo.name}</h1>
                <p>Pushpam Industrial Estate, Vatva GIDC</p>
                <p>Ahmedabad, Gujarat - 382445</p>
                <p>Email: ${companyInfo.email}</p>
                <p>GSTIN: 24AAAFH1234A1Z5</p>
            </div>
            <div class="invoice-details">
                <h2>TAX INVOICE</h2>
                <p><b>Order ID:</b> #${order.id}</p>
                <p><b>Date:</b> ${createdAt}</p>
                <p><b>Status:</b> ${order.status}</p>
            </div>
        </div>

        <div class="addresses">
            <div class="address-box">
                <h3>Billing To</h3>
                <p>${formatAddressInternal(order.billingAddress)}</p>
                <p>Email: ${order.customer?.email || 'N/A'}</p>
                <p>Contact: ${order.customer?.mobile || order.customer?.phone || 'N/A'}</p>
            </div>
            <div class="address-box">
                <h3>Shipping To</h3>
                <p>${formatAddressInternal(order.delieveryAddress || order.billingAddress)}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th style="text-align: center;">Size</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>
                            <b>${item.Product?.title || 'Unknown Product'}</b>
                            <div style="font-size: 12px; color: #64748b;">${item.Flavor?.name || 'Standard'}</div>
                        </td>
                        <td style="text-align: center; text-transform: capitalize;">${item.size || 'small'}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
                        <td style="text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <table class="total-table">
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">₹${parseFloat(subTotal).toFixed(2)}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                    <td>Discount (${order.couponCode || 'PROMO'}):</td>
                    <td style="text-align: right; color: #ef4444;">-₹${parseFloat(discountAmount).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td class="grand-total">Grand Total:</td>
                    <td class="grand-total" style="text-align: right;">₹${parseFloat(total).toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>This is a computer generated invoice and does not require a physical signature.</p>
            <p>Thank you for shopping with ${companyInfo.name}!</p>
        </div>
    </div>
</body>
</html>
        `;
        res.send(html);
    } catch (error) {
        console.error('Invoice Print Error:', error);
        res.status(500).send('<h1>Error generating invoice</h1>');
    }
});

app.get('/api/admin/checkBlockStatus', async (req, res) => {
    // Reuse public logic but keep the route if needed
    try {
        const { email, mobile } = req.query;
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/public/checkBlockStatus?email=${email}&mobile=${mobile}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.json({ is_blocked: false });
    }
});

// --------------- Insta Reels Routes ---------------
app.get('/api/insta-reels', async (req, res) => {
    try {
        const reels = await db.InstaReel.findAll({
            order: [['orderIndex', 'ASC']]
        });
        res.json(reels);
    } catch (error) {
        console.error('Error fetching insta reels:', error);
        res.status(500).json({ error: 'Failed to fetch insta reels' });
    }
});

app.post('/api/insta-reels', authenticateToken, async (req, res) => {
    try {
        const { url, caption, tag, active } = req.body;
        const count = await db.InstaReel.count();
        const reel = await db.InstaReel.create({
            url, caption, tag, active: active !== undefined ? active : true, orderIndex: count
        });
        res.json(reel);
    } catch (error) {
        console.error('Error creating insta reel:', error);
        res.status(500).json({ error: 'Failed to create insta reel' });
    }
});

app.put('/api/insta-reels/updateOrder', authenticateToken, async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { reels } = req.body; // Array of {id, orderIndex}
        for (const item of reels) {
            await db.InstaReel.update(
                { orderIndex: item.orderIndex },
                { where: { id: item.id }, transaction: t }
            );
        }
        await t.commit();
        res.json({ success: true });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating reel order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

app.put('/api/insta-reels/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { url, caption, tag, active } = req.body;
        await db.InstaReel.update(
            { url, caption, tag, active },
            { where: { id } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating reel:', error);
        res.status(500).json({ error: 'Failed to update reel' });
    }
});

app.delete('/api/insta-reels/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.InstaReel.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting reel:', error);
        res.status(500).json({ error: 'Failed to delete reel' });
    }
});

// --------------- 404 Handler ---------------
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl });
});

// --------------- Global Error Handler ---------------
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// Start server
const startServer = async () => {
    try {
        // Initialize Redis (graceful - app works without it)
        try {
            const redisClient = await initRedis();
            if (redisClient) {
                console.log('✅ Redis initialized successfully');
            }
        } catch (redisError) {
            console.log('⚠️  Redis connection failed - continuing without it');
        }

        // Check environment accurately
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL_URL;

        // Database Initialization
        if (!isProduction) {
            console.log('Running database existence check (Development)...');
            await ensureDatabaseExists();
        } else {
            console.log('Skipping database existence check (Production/Vercel)...');
        }

        // ONLY sync/seed if NOT in production or if explicitly asked
        if (!isProduction) {
            console.log('Initializing database in development mode...');
            try {
                // Ensure tables exist first
                await db.sequelize.sync();
                console.log('✅ Base tables synced');

                // Manually add columns to Privileges table if they don't exist
                const columnsToAdd = ['flavors', 'faqs', 'reviews', 'sales', 'sliders', 'leadership'];
                for (const col of columnsToAdd) {
                    try {
                        // Using a more robust Postgres-specific way to add columns column-by-column if they don't exist
                        await db.sequelize.query(`
                            DO $$ 
                            BEGIN 
                                BEGIN
                                    ALTER TABLE "Privileges" ADD COLUMN "${col}" BOOLEAN DEFAULT FALSE;
                                EXCEPTION
                                    WHEN duplicate_column THEN RAISE NOTICE 'column ${col} already exists';
                                END;
                            END $$;
                        `);
                    } catch (e) {
                        // console.log(`Note: Tried to add column ${col} to Privileges - might already exist.`);
                    }
                }
                console.log('✅ Custom privilege columns ensured');

                // Ensure Orders and OrderItems tables have correct columns
                try {
                    await db.sequelize.query(`
                        CREATE TABLE IF NOT EXISTS "Orders" (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER,
                            total FLOAT,
                            status VARCHAR(255) DEFAULT 'pending',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            "createdAt" TIMESTAMP,
                            "updatedAt" TIMESTAMP,
                            "couponCode" VARCHAR(255),
                            "discountAmount" FLOAT
                        );
                    `);
                    await db.sequelize.query(`
                        CREATE TABLE IF NOT EXISTS "OrderItems" (
                            id SERIAL PRIMARY KEY,
                            order_id INTEGER REFERENCES "Orders"(id),
                            product_id INTEGER,
                            flavor_id INTEGER,
                            quantity INTEGER,
                            price FLOAT,
                            "createdAt" TIMESTAMP,
                            "updatedAt" TIMESTAMP
                        );
                    `);
                    console.log('✅ Orders and OrderItems schema ensured');

                    // Check for coupon fields explicitly since they are newly added
                    try {
                        await db.sequelize.query(`
                            DO $$ 
                            BEGIN 
                                BEGIN
                                    ALTER TABLE "Orders" ADD COLUMN "couponCode" VARCHAR(255);
                                EXCEPTION
                                    WHEN duplicate_column THEN RAISE NOTICE 'column couponCode already exists';
                                END;
                                BEGIN
                                    ALTER TABLE "Orders" ADD COLUMN "discountAmount" FLOAT;
                                EXCEPTION
                                    WHEN duplicate_column THEN RAISE NOTICE 'column discountAmount already exists';
                                END;
                            END $$;
                        `);
                    } catch (e) {
                    }
                    console.log('✅ Orders schema updated with discount fields');
                } catch (schemaErr) {
                    console.error('⚠️ Schema ensure minor error:', schemaErr.message);
                }

                // Ensure 'is_blocked' exists on Orders
                try {
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "is_blocked" BOOLEAN DEFAULT false');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "processing_at" TIMESTAMP');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "shipped_at" TIMESTAMP');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP');
                    console.log('✅ Order schema updated with tracking timestamps');
                } catch (orderErr) {
                    console.log('⚠️ Tracking columns Order check note:', orderErr.message);
                }

                // Ensure 'saleEventId' exists on Offers
                try {
                    await db.sequelize.query('ALTER TABLE "Offers" ADD COLUMN IF NOT EXISTS "saleEventId" INTEGER REFERENCES "SaleEvents"(id)');
                    console.log('✅ Offers schema updated with saleEventId');
                } catch (offerErr) {
                    console.log('⚠️ Offers schema update note:', offerErr.message);
                }

                // Ensure 'imageUrl' exists on Categories
                try {
                    await db.sequelize.query('ALTER TABLE "Categories" ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(255)');
                    console.log('✅ Categories schema updated with imageUrl');
                } catch (catErr) {
                    console.log('⚠️ Categories schema update note:', catErr.message);
                }

                // Ensure Razorpay payment columns exist on Orders
                try {
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "razorpay_order_id" VARCHAR(255)');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "razorpay_payment_id" VARCHAR(255)');
                    await db.sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "razorpay_signature" VARCHAR(512)');
                    console.log('✅ Orders schema updated with Razorpay payment columns');
                } catch (rzpErr) {
                    console.log('⚠️ Orders Razorpay columns update note:', rzpErr.message);
                }
            } catch (syncError) {
                console.error('⚠️ Database sync error details:', syncError);
                await db.sequelize.sync();
            }
        } else {
            // In production, just sync without dropping (safe alter)
            try {
                await db.sequelize.sync({ alter: true });
                console.log('✅ Database synced (production/alter)');
            } catch (prodSyncError) {
                console.error('⚠️ Production sync error (continuing):', prodSyncError);
                await db.sequelize.sync();
            }
        }

        // Start listening
        if (process.env.VERCEL !== '1') {
            app.listen(PORT, () => {
                console.log('Server is running on port ' + PORT);
            });
        }
    } catch (err) {
        console.error('Failed to start server:', err);
        // On Vercel, we don't want to exit(1) as it kills the instance
        if (process.env.VERCEL !== '1') {
            process.exit(1);
        }
    }
};

startServer();

// Export for Vercel
module.exports = app;
