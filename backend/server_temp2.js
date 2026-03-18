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
