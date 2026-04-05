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

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
        let size = parseInt(req.query.size) || 10;
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

        // Database Initialization
        await ensureDatabaseExists();

        // ONLY sync/seed if NOT in production or if explicitly asked
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

        if (!isProduction) {
            console.log('Initializing database in development mode...');
            //await db.sequelize.query('DROP TABLE IF EXISTS "Reviews" CASCADE;');
            await db.sequelize.sync({ alter: true });
            //console.log('Database synced successfully');
            //await seedData();
        } else {
            // In production, just sync without dropping (safe alter)
            await db.sequelize.sync({ alter: true });
            console.log('Database synced (production/alter only)');
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
