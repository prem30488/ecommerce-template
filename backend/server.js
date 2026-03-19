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

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
// Serve MDB5 static files from the frontend's public folder
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
        // You can customize the forms to seed here, or fetch from a file if needed
        // Example: Seed with some default forms
        const defaultForms = [
            {
                "id": 2,
                "title": "Injection",
                "description": "Injection",
                "deleteFlag": false,
                "createdAt": "2026-03-19T04:14:29.054Z",
                "updatedAt": "2026-03-19T13:52:03.022Z"
            },
            {
                "id": 4,
                "title": "Liquid",
                "description": "Liquid",
                "deleteFlag": false,
                "createdAt": "2026-03-19T04:36:13.038Z",
                "updatedAt": "2026-03-19T13:53:05.496Z"
            },
            {
                "id": 5,
                "title": "Capsule",
                "description": "Capsule",
                "deleteFlag": false,
                "createdAt": "2026-03-19T13:53:09.781Z",
                "updatedAt": "2026-03-19T13:53:38.514Z"
            },
            {
                "id": 6,
                "title": "Powder",
                "description": "Powder",
                "deleteFlag": false,
                "createdAt": "2026-03-19T13:53:59.339Z",
                "updatedAt": "2026-03-19T13:53:59.339Z"
            },
            {
                "id": 7,
                "title": "Gel",
                "description": "Gel",
                "deleteFlag": false,
                "createdAt": "2026-03-19T13:54:19.047Z",
                "updatedAt": "2026-03-19T13:54:19.047Z"
            },
            {
                "id": 1,
                "title": "Sachet",
                "description": "Sachet",
                "deleteFlag": false,
                "createdAt": "2026-03-19T04:10:32.805Z",
                "updatedAt": "2026-03-19T14:23:42.413Z"
            },
            {
                "id": 3,
                "title": "Medicine",
                "description": "Medicine",
                "deleteFlag": false,
                "createdAt": "2026-03-19T04:15:30.084Z",
                "updatedAt": "2026-03-19T14:23:48.727Z"
            }
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
                        active: true
                    }
                });
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

        console.log('Seeding completed successfully.');
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

app.get('/api/product/getProducts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const { count, rows } = await db.Product.findAndCountAll({
            offset: page * size,
            limit: size,
            order: [['id', 'DESC']]
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
        const { count, rows } = await db.Category.findAndCountAll({
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
        const { count, rows } = await db.Coupon.findAndCountAll({
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
        const { count, rows } = await db.User.findAndCountAll({
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
        const product = await db.Product.findByPk(req.params.id);
        if (product) res.json(product);
        else res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/product/createProduct', authenticateToken, async (req, res) => {
    try {
        delete req.body.id;
        const product = await db.Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        require('fs').writeFileSync('product_error.log', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/product/:id', authenticateToken, async (req, res) => {
    try {
        await db.Product.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Product updated' });
    } catch (error) {
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

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
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
        const { count, rows } = await db.Form.findAndCountAll({
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
        const { count, rows } = await db.Testimonial.findAndCountAll({
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

app.post('/api/testimonial/upload', authenticateToken, (req, res) => res.json({ message: 'File uploaded' })); // Placeholder for actual upload logic

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

// Dashboard Stats Stubs
app.get('/api/order/fetchDailyTransactionsCount', authenticateToken, (req, res) => res.json(10));
app.get('/api/order/fetchDailyRevenueSum', authenticateToken, (req, res) => res.json(5000));
app.get('/api/order/fetchMonthlySalesSum', authenticateToken, (req, res) => res.json(150000));
app.get('/api/order/fetchWeeklySalesSum', authenticateToken, (req, res) => res.json(35000));

// Start server
const startServer = async () => {
    try {
        await ensureDatabaseExists();
        await db.sequelize.sync({ alter: true });
        await seedData();

        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
