const db = require('./models');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function databaseExists() {
    try {
        // Check if tables exist by trying to count records
        const categoryCount = await db.Category.count();
        return categoryCount > 0;
    } catch (error) {
        // If there's an error (tables don't exist), return false
        return false;
    }
}

async function createTables() {
    try {
        // Create tables if they don't exist (alter: true will add missing columns)
        await db.sequelize.sync({ alter: true });
        console.log('Tables created/updated successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

async function seedData() {
    try {
        // Check if data already exists
        const existingCategories = await db.Category.count();
        if (existingCategories > 0) {
            console.log('Data already exists, skipping seeding');
            return;
        }

        // Seed categories
        const categoriesPath = path.join(__dirname, '..', 'Front End', 'public', 'categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        for (let i = 0; i < categories.length; i++) {
            await db.Category.create({ name: categories[i], order: i });
        }

        // Seed products
        const productsPath = path.join(__dirname, '..', 'Front End', 'public', 'products.json');
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        for (const product of products) {
            // Find the category ID by name
            const category = await db.Category.findOne({ where: { name: product.category } });
            await db.Product.create({
                id: product.id,
                title: product.title,
                description: product.description,
                img: product.img,
                category_id: category ? category.id : null,
                brand: product.brand,
                price: product.price,
                rating: product.rating,
                bestseller: product.bestseller,
                featured: product.featured,
                audience: product.audience,
                stock: product.stock,
                compare: product.compare
            });
        }

        // Seed coupons
        const couponsPath = path.join(__dirname, '..', 'Front End', 'public', 'couponCode.json');
        const coupons = JSON.parse(fs.readFileSync(couponsPath, 'utf8'));
        for (const coupon of coupons) {
            await db.Coupon.create({
                code: coupon.code,
                discount: coupon.discount,
                from_date: coupon.from,
                to_date: coupon.to
            });
        }

        // Seed a mock user
        const hashedAdminPassword = await bcrypt.hash('adminpass123', 10);
        await db.User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            role: 'admin',
            phoneNumber: '0987654321'
        });

        // Seed superadmin user
        const hashedSuperPassword = await bcrypt.hash('superpass123', 10);
        const superadmin = await db.User.create({
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: hashedSuperPassword,
            role: 'superadmin',
            phoneNumber: '1234567890'
        });

        // Seed regular user
        const hashedUserPassword = await bcrypt.hash('userpass123', 10);
        const regularUser = await db.User.create({
            username: 'user',
            email: 'user@example.com',
            password: hashedUserPassword,
            role: 'user',
            phoneNumber: '1122334455'
        });

        // Create privileges
        const privileges = [
            { name: 'read_products', description: 'Can view products' },
            { name: 'create_products', description: 'Can create products' },
            { name: 'update_products', description: 'Can update products' },
            { name: 'delete_products', description: 'Can delete products' },
            { name: 'read_users', description: 'Can view users' },
            { name: 'create_users', description: 'Can create users' },
            { name: 'update_users', description: 'Can update users' },
            { name: 'delete_users', description: 'Can delete users' },
            { name: 'read_orders', description: 'Can view orders' },
            { name: 'update_orders', description: 'Can update orders' },
            { name: 'read_categories', description: 'Can view categories' },
            { name: 'create_categories', description: 'Can create categories' },
            { name: 'update_categories', description: 'Can update categories' },
            { name: 'delete_categories', description: 'Can delete categories' },
            { name: 'manage_coupons', description: 'Can manage coupons' },
            { name: 'view_reports', description: 'Can view reports' },
            { name: 'manage_settings', description: 'Can manage system settings' }
        ];

        const createdPrivileges = [];
        for (const privilege of privileges) {
            const created = await db.Privilege.create(privilege);
            createdPrivileges.push(created);
        }

        // Assign all privileges to superadmin
        for (const privilege of createdPrivileges) {
            await superadmin.addPrivilege(privilege);
        }

        // Assign admin privileges (most privileges except user management and settings)
        const adminPrivileges = createdPrivileges.filter(p =>
            !['create_users', 'update_users', 'delete_users', 'manage_settings'].includes(p.name)
        );
        const adminUser = await db.User.findOne({ where: { username: 'admin' } });
        for (const privilege of adminPrivileges) {
            await adminUser.addPrivilege(privilege);
        }

        // Assign basic privileges to regular user (only read operations)
        const userPrivileges = createdPrivileges.filter(p =>
            p.name.startsWith('read_')
        );
        for (const privilege of userPrivileges) {
            await regularUser.addPrivilege(privilege);
        }

        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

async function initDB() {
    try {
        console.log('Checking database...');

        // Create tables if they don't exist
        await createTables();

        // Seed data if database is empty
        await seedData();

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
    }
}

initDB();