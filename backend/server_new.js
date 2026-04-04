const express = require('express');
const cors = require('cors');
const db = require('./models');
const fs = require('fs');
const path = require('path');
const emailService = require('./utils/emailService');
const sessionTracker = require('./utils/sessionTracker');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database if not exists
async function initializeDatabase() {
    try {
        await db.sequelize.sync({ alter: true });
        console.log('Database synchronized/altered');
    } catch (err) {
        console.error('Failed to sync DB:', err);
    }
}


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
        const offset = page * size;
        const products = await db.Product.findAll({
            order: [['id', 'DESC']],
            limit: size,
            offset: offset,
            include: [
                { model: db.Offer, as: 'offers', required: false },
                {
                    model: db.ProductFlavor, as: 'productFlavors',
                    include: [{ model: db.Flavor }],
                    required: false
                },
                { model: db.Category, required: false },
                { model: db.Form, as: 'Form', required: false }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.Category.findAll({ order: [['order', 'ASC']] });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

app.get('/api/category/getCategories', async (req, res) => {
    try {
        const categories = await db.Category.findAll({
            order: [['order', 'ASC']],
            attributes: ['name']
        });
        res.json(categories.map(cat => cat.name));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

app.get('/api/coupons', async (req, res) => {
    try {
        const coupons = await db.Coupon.findAll();
        res.json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load coupons' });
    }
});

app.get('/api/coupon/getCoupon', async (req, res) => {
    try {
        const coupons = await db.Coupon.findAll();
        res.json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load coupons' });
    }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await db.Product.findByPk(req.params.id);
        if (product) {
            res.json(product);
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
        const product = await db.Product.findByPk(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load product' });
    }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const products = await db.Product.findAll({
            where: { category: req.params.category }
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

// Cart endpoints
app.get('/api/cart', requireAuth, async (req, res) => {
    try {
        const cartItems = await db.Cart.findAll({
            where: { user_id: 1 },
            include: [{
                model: db.Product,
                attributes: ['title', 'price', 'img']
            }]
        });
        res.json(cartItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load cart' });
    }
});

app.post('/api/cart', requireAuth, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        await db.Cart.upsert({
            user_id: 1,
            product_id: product_id,
            quantity: quantity
        });
        res.json({ message: 'Added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

app.put('/api/cart/:product_id', requireAuth, async (req, res) => {
    try {
        const { quantity } = req.body;
        await db.Cart.update(
            { quantity: quantity },
            { where: { user_id: 1, product_id: req.params.product_id } }
        );
        res.json({ message: 'Cart updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

app.delete('/api/cart/:product_id', requireAuth, async (req, res) => {
    try {
        await db.Cart.destroy({
            where: { user_id: 1, product_id: req.params.product_id }
        });
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Checkout endpoint
app.post('/api/checkout', requireAuth, async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { items, total } = req.body;
        // Create order
        const order = await db.Order.create({
            user_id: 1,
            total: total
        }, { transaction });

        // Add order items
        for (const item of items) {
            await db.OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }, { transaction });
        }

        // Clear cart
        await db.Cart.destroy({
            where: { user_id: 1 },
            transaction
        });

        await transaction.commit();
        res.json({ message: 'Order placed successfully', orderId: order.id });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Orders endpoint
app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        const orders = await db.Order.findAll({
            where: { user_id: 1 },
            include: [{
                model: db.OrderItem,
                attributes: ['product_id', 'quantity', 'price']
            }],
            order: [['created_at', 'DESC']]
        });

        // Format the response to match the original structure
        const formattedOrders = orders.map(order => ({
            ...order.toJSON(),
            items: order.OrderItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }))
        }));

        res.json(formattedOrders);
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

        const orders = await db.Order.findAll({
            include: [{
                model: db.OrderItem,
                attributes: ['product_id', 'quantity', 'price']
            }],
            order: [['id', 'DESC']],
            limit: size,
            offset: offset
        });

        // Format the response to match the original structure
        const formattedOrders = orders.map(order => ({
            ...order.toJSON(),
            items: order.OrderItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }))
        }));

        res.json(formattedOrders);
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
        const category = await db.Category.findByPk(req.params.id);
        if (category) {
            res.json({ id: category.id, name: category.name });
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
        const category = await db.Category.findByPk(req.params.id);
        if (category) {
            res.json({ id: category.id, name: category.name });
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
});

// ==================== WISHLIST ENDPOINTS ====================

// Get all wishlist items for user
app.get('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const userId = req.query.user_id || 1; // Default to user 1 for mock
        const wishlistItems = await db.Wishlist.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'price', 'priceMedium', 'priceLarge', 'img', 'category', 'description']
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
app.post('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const { product_id, session_id } = req.body;
        const userId = req.query.user_id || 1; // Default to user 1 for mock

        // Check if item already exists
        const existing = await db.Wishlist.findOne({
            where: { user_id: userId, product_id: product_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Item already in wishlist' });
        }

        const wishlistItem = await db.Wishlist.create({
            user_id: userId,
            product_id: product_id,
            session_id: session_id
        });

        res.json(wishlistItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove item from wishlist
app.delete('/api/wishlist/:product_id', requireAuth, async (req, res) => {
    try {
        const userId = req.query.user_id || 1; // Default to user 1 for mock
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
app.delete('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const userId = req.query.user_id || 1; // Default to user 1 for mock
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
                attributes: ['id', 'title', 'price', 'priceMedium', 'priceLarge', 'img', 'category', 'description']
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
app.post('/api/wishlist/email-on-close', requireAuth, async (req, res) => {
    try {
        const { user_id, session_id, wishlist_items } = req.body;

        // Get user email
        const user = await db.User.findByPk(user_id);
        if (!user || !user.email) {
            return res.status(404).json({ error: 'User not found or email not available' });
        }

        // Get wishlist items details
        const items = await db.Wishlist.findAll({
            where: { user_id: user_id, product_id: wishlist_items },
            include: [{
                model: db.Product,
                attributes: ['id', 'title', 'price', 'priceMedium', 'priceLarge', 'img', 'category', 'description']
            }]
        });

        if (items.length === 0) {
            return res.json({ message: 'No wishlist items to send' });
        }

        // Send email using email service
        try {
            await emailService.sendWishlistNotification(
                user.email,
                user.username,
                items,
                process.env.APP_URL || '${API_BASE_URL}'
            );
        } catch (emailError) {
            console.error('Email sending failed, but continuing:', emailError);
            // Don't fail the request if email fails
        }

        // Mark items as email sent
        await db.Wishlist.update(
            { email_sent: true },
            { where: { user_id: user_id } }
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

// Start server with database initialization
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});