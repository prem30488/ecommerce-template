const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database if not exists
async function initializeDatabase() {
    try {
        // Check if products table exists
        const result = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products')");

        if (!result.rows[0].exists) {
            console.log('Database not initialized, initializing...');

            // Create tables
            await db.query(`
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    "order" INTEGER DEFAULT 0
                );
                
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    img VARCHAR(500),
                    category VARCHAR(100),
                    brand VARCHAR(100),
                    price DECIMAL(10,2),
                    rating VARCHAR(10),
                    bestseller BOOLEAN DEFAULT false,
                    featured BOOLEAN DEFAULT false,
                    audience VARCHAR(50),
                    stock INTEGER DEFAULT 0,
                    compare BOOLEAN DEFAULT false
                );
                
                CREATE TABLE IF NOT EXISTS coupons (
                    id SERIAL PRIMARY KEY,
                    code VARCHAR(100) UNIQUE NOT NULL,
                    discount DECIMAL(5,2),
                    from_date VARCHAR(20),
                    to_date VARCHAR(20)
                );
                
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255),
                    password VARCHAR(255)
                );
                
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    total DECIMAL(10,2),
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS order_items (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER REFERENCES orders(id),
                    product_id INTEGER REFERENCES products(id),
                    quantity INTEGER,
                    price DECIMAL(10,2)
                );
                
                CREATE TABLE IF NOT EXISTS cart (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    product_id INTEGER REFERENCES products(id),
                    quantity INTEGER,
                    UNIQUE(user_id, product_id)
                );
            `);

            // Seed data
            const categoriesPath = path.join(__dirname, '..', 'Front End', 'public', 'categories.json');
            const productsPath = path.join(__dirname, '..', 'Front End', 'public', 'products.json');
            const couponsPath = path.join(__dirname, '..', 'Front End', 'public', 'couponCode.json');

            const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
            const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
            const coupons = JSON.parse(fs.readFileSync(couponsPath, 'utf8'));

            // Insert categories
            for (let i = 0; i < categories.length; i++) {
                await db.query('INSERT INTO categories (name, "order") VALUES ($1, $2) ON CONFLICT DO NOTHING', [categories[i], i]);
            }

            // Insert products
            for (const product of products) {
                await db.query(`
                    INSERT INTO products (id, title, description, img, category, brand, price, rating, bestseller, featured, audience, stock, compare)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    product.id, product.title, product.description, product.img, product.category,
                    product.brand, product.price, product.rating, product.bestseller, product.featured,
                    product.audience, product.stock, product.compare
                ]);
            }

            // Insert coupons
            for (const coupon of coupons) {
                await db.query(`
                    INSERT INTO coupons (code, discount, from_date, to_date)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (code) DO NOTHING
                `, [coupon.code, coupon.discount, coupon.from, coupon.to]);
            }

            // Insert default user
            await db.query('INSERT INTO users (username, email) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING', ['admin', 'admin@example.com']);

            console.log('Database initialized successfully');
        } else {
            console.log('Database already initialized');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Simple auth middleware
    const requireAuth = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token === 'mock-token') {
                next();
            } else {
                res.status(401).json({ error: 'Invalid token' });
            }
        } else {
            res.status(401).json({ error: 'No token provided' });
        }
    };

    // API Routes
    app.get('/api/products', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM products ORDER BY id');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load products' });
        }
    });

    app.get('/api/product/getProducts', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 0;
            const size = parseInt(req.query.size) || 10;
            const offset = page * size;
            const result = await db.query('SELECT * FROM products ORDER BY id DESC LIMIT $1 OFFSET $2', [size, offset]);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load products' });
        }
    });

    app.get('/api/categories', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM categories ORDER BY "order"');
            res.json(result.rows.map(row => row.name));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load categories' });
        }
    });

    app.get('/api/category/getCategories', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM categories ORDER BY "order"');
            res.json(result.rows.map(row => row.name));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load categories' });
        }
    });

    app.get('/api/coupons', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM coupons');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load coupons' });
        }
    });

    app.get('/api/coupon/getCoupon', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM coupons');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load coupons' });
        }
    });

    // Get single product by ID
    app.get('/api/products/:id', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load product' });
        }
    });

    app.get('/api/product/fetchById/:id', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to load product' });
        }

        // Get products by category
        app.get('/api/products/category/:category', async (req, res) => {
            try {
                const result = await db.query('SELECT * FROM products WHERE category = $1', [req.params.category]);
                res.json(result.rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to load products' });
            }

            // Cart endpoints
            app.get('/api/cart', requireAuth, async (req, res) => {
                try {
                    const result = await db.query(`
                        SELECT c.*, p.title, p.price, p.img
                        FROM cart c
                        JOIN products p ON c.product_id = p.id
                        WHERE c.user_id = $1
                    `, [1]);
                    res.json(result.rows);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to load cart' });
                }
            });

            app.post('/api/cart', requireAuth, async (req, res) => {
                try {
                    const { product_id, quantity } = req.body;
                    await db.query(`
                        INSERT INTO cart (user_id, product_id, quantity)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (user_id, product_id) DO UPDATE SET
                        quantity = EXCLUDED.quantity
                    `, [1, product_id, quantity]);
                    res.json({ message: 'Added to cart' });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to add to cart' });
                }
            });

            app.put('/api/cart/:product_id', requireAuth, async (req, res) => {
                try {
                    const { quantity } = req.body;
                    await db.query('UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3', [quantity, 1, req.params.product_id]);
                    res.json({ message: 'Cart updated' });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to update cart' });
                }
            });

            app.delete('/api/cart/:product_id', requireAuth, async (req, res) => {
                try {
                    await db.query('DELETE FROM cart WHERE user_id = $1 AND product_id = $2', [1, req.params.product_id]);
                    res.json({ message: 'Removed from cart' });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to remove from cart' });
                }
            });

            // Checkout endpoint
            app.post('/api/checkout', requireAuth, async (req, res) => {
                try {
                    const { items, total } = req.body;
                    // Create order
                    const orderResult = await db.query('INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id', [1, total]);
                    const orderId = orderResult.rows[0].id;

                    // Add order items
                    for (const item of items) {
                        await db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                            [orderId, item.product_id, item.quantity, item.price]);
                    }

                    // Clear cart
                    await db.query('DELETE FROM cart WHERE user_id = $1', [1]);

                    res.json({ message: 'Order placed successfully', orderId });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to place order' });
                }
            });

            // Orders endpoint
            app.get('/api/orders', requireAuth, async (req, res) => {
                try {
                    const result = await db.query(`
                        SELECT o.*, string_agg(oi.product_id || ',' || oi.quantity || ',' || oi.price, ',') as items
                        FROM orders o
                        LEFT JOIN order_items oi ON o.id = oi.order_id
                        WHERE o.user_id = $1
                        GROUP BY o.id
                        ORDER BY o.created_at DESC
                    `, [1]);

                    // Parse items
                    const rows = result.rows.map(row => {
                        if (row.items) {
                            row.items = row.items.split(',').map((item, index) => {
                                if (index % 3 === 0) return { product_id: parseInt(item) };
                                if (index % 3 === 1) return { quantity: parseInt(item) };
                                return { price: parseFloat(item) };
                            });
                        } else {
                            row.items = [];
                        }
                        return row;
                    });

                    res.json(rows);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to load orders' });
                }
            });

            // User endpoints
            app.get('/api/user/me', requireAuth, (req, res) => {
                res.json({ id: 1, username: 'admin', email: 'admin@example.com' });
            });

            app.get('/api/user/privileges/:id', requireAuth, (req, res) => {
                res.json(['ADMIN']);
            });

            app.get('/api/user/users', requireAuth, (req, res) => {
                res.json([{ id: 1, username: 'admin' }]);
            });

            app.post('/api/user/users', requireAuth, (req, res) => {
                res.json({ message: 'User created' });
            });

            app.put('/api/user/users', requireAuth, (req, res) => {
                res.json({ message: 'User updated' });
            });

            app.delete('/api/user/deleteUser/:id', requireAuth, (req, res) => {
                res.json({ message: 'User deleted' });
            });

            app.get('/api/user/fetchUserById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), username: 'user' });
            });

            // Order endpoints
            app.get('/api/order/getOrders', requireAuth, async (req, res) => {
                try {
                    const page = parseInt(req.query.page) || 0;
                    const size = parseInt(req.query.size) || 10;
                    const offset = page * size;

                    const result = await db.query(`
                        SELECT o.*, string_agg(oi.product_id || ',' || oi.quantity || ',' || oi.price, ',') as items
                        FROM orders o
                        LEFT JOIN order_items oi ON o.id = oi.order_id
                        GROUP BY o.id
                        ORDER BY o.id DESC
                        LIMIT $1 OFFSET $2
                    `, [size, offset]);

                    // Parse items
                    const rows = result.rows.map(row => {
                        if (row.items) {
                            const itemStrings = row.items.split(',');
                            row.items = [];
                            for (let i = 0; i < itemStrings.length; i += 3) {
                                row.items.push({
                                    product_id: parseInt(itemStrings[i]),
                                    quantity: parseInt(itemStrings[i + 1]),
                                    price: parseFloat(itemStrings[i + 2])
                                });
                            }
                        } else {
                            row.items = [];
                        }
                        return row;
                    });

                    res.json(rows);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to load orders' });
                }
            });

            // Forms endpoints
            app.get('/api/forms/getForms', requireAuth, (req, res) => {
                res.json([]);
            });

            app.post('/api/forms/createForms', requireAuth, (req, res) => {
                res.json({ message: 'Form created' });
            });

            app.put('/api/forms/updateForms', requireAuth, (req, res) => {
                res.json({ message: 'Form updated' });
            });

            app.delete('/api/forms/deleteForms/:id', requireAuth, (req, res) => {
                res.json({ message: 'Form deleted' });
            });

            app.get('/api/forms/fetchById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), name: 'Form' });
            });

            app.get('/api/forms/fetchFormById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), name: 'Form' });
            });

            // Testimonial endpoints
            app.get('/api/testimonial/getTestimonials', requireAuth, (req, res) => {
                res.json([]);
            });

            app.post('/api/testimonial/createTestimonial', requireAuth, (req, res) => {
                res.json({ message: 'Testimonial created' });
            });

            app.post('/api/testimonial/upload', requireAuth, (req, res) => {
                res.json({ message: 'Uploaded' });
            });

            app.put('/api/testimonial/updateTestimonial', requireAuth, (req, res) => {
                res.json({ message: 'Testimonial updated' });
            });

            app.delete('/api/testimonial/deleteTestimonial/:id', requireAuth, (req, res) => {
                res.json({ message: 'Testimonial deleted' });
            });

            app.get('/api/testimonial/fetchTestimonialById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), text: 'Testimonial' });
            });

            // Offer endpoints
            app.get('/api/offer/getOffers', requireAuth, (req, res) => {
                res.json([]);
            });

            app.get('/api/offer/getOffersByProductId/:productId', requireAuth, (req, res) => {
                res.json([]);
            });

            app.post('/api/offer/createOffer', requireAuth, (req, res) => {
                res.json({ message: 'Offer created' });
            });

            app.put('/api/offer/updateOffer', requireAuth, (req, res) => {
                res.json({ message: 'Offer updated' });
            });

            app.delete('/api/offer/deleteOffer/:id', requireAuth, (req, res) => {
                res.json({ message: 'Offer deleted' });
            });

            // Category endpoints (additional)
            app.post('/api/category/createCategory', requireAuth, (req, res) => {
                res.json({ message: 'Category created' });
            });

            app.put('/api/category/updateCategory', requireAuth, (req, res) => {
                res.json({ message: 'Category updated' });
            });

            app.delete('/api/category/deleteCategory/:id', requireAuth, (req, res) => {
                res.json({ message: 'Category deleted' });
            });

            app.get('/api/category/fetchById/:id', requireAuth, async (req, res) => {
                try {
                    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
                    if (result.rows.length > 0) {
                        res.json({ id: result.rows[0].id, name: result.rows[0].name });
                    } else {
                        res.json({ id: parseInt(req.params.id), name: 'Category' });
                    }
                } catch (error) {
                    console.error(error);
                    res.json({ id: parseInt(req.params.id), name: 'Category' });
                }
            });

            app.get('/api/category/fetchCategoryById/:id', requireAuth, async (req, res) => {
                try {
                    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
                    if (result.rows.length > 0) {
                        res.json({ id: result.rows[0].id, name: result.rows[0].name });
                    } else {
                        res.json({ id: parseInt(req.params.id), name: 'Category' });
                    }
                } catch (error) {
                    console.error(error);
                    res.json({ id: parseInt(req.params.id), name: 'Category' });
                }
            });

            // Coupon endpoints (additional)
            app.post('/api/coupon/createCoupon', requireAuth, (req, res) => {
                res.json({ message: 'Coupon created' });
            });

            app.put('/api/coupon/updateCoupon', requireAuth, (req, res) => {
                res.json({ message: 'Coupon updated' });
            });

            app.delete('/api/coupon/deleteCoupon/:id', requireAuth, (req, res) => {
                res.json({ message: 'Coupon deleted' });
            });

            // Product delete (mock)
            app.delete('/api/product/deleteProduct/:id', requireAuth, (req, res) => {
                res.json({ message: 'Product deleted' });
            });

            // Additional fetch endpoints
            app.get('/api/generalProfile/fetchGeneralProfileById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), profile: 'General Profile' });
            });

            app.get('/api/overview/fetchOverviewById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), overview: 'Overview' });
            });

            app.get('/api/mission/fetchMissionById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), mission: 'Mission' });
            });

            app.get('/api/leadership/fetchLeadershipById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), leadership: 'Leadership' });
            });

            app.get('/api/award/fetchAwardById/:id', requireAuth, (req, res) => {
                res.json({ id: parseInt(req.params.id), award: 'Award' });
            });

            // Solr entities (mock)
            app.get('/api/solrEntities/fetchSolrEntitiesDesc', requireAuth, (req, res) => {
                res.json([]);
            });

            app.get('/api/solrEntities/fetchSolrEntitiesViewedDesc', requireAuth, (req, res) => {
                res.json([]);
