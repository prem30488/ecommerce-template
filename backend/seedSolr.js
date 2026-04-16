require('dotenv').config();
const db = require('./models');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SOLR_URL = (process.env.VITE_SOLR_URL || "http://localhost:8983").replace(/\/$/, '') + "/solr/hanley/update?commit=true";

// Root of public images folder relative to backend/
const PUBLIC_IMAGES = path.join(__dirname, '..', 'Front End', 'public', 'images');

/**
 * Given a productId and a list of flavorIds (ordered by priority),
 * returns the first real image path found on disk, e.g. "/images/5/3/1.jpg"
 * Falls back to the stored product.img field, then null.
 */
function resolveProductImage(productId, flavorIds, storedImg) {
    for (const flavorId of flavorIds) {
        const dir = path.join(PUBLIC_IMAGES, String(productId), String(flavorId));
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir).filter(f =>
            /\.(jpg|jpeg|png|webp)$/i.test(f)
        );
        if (files.length > 0) {
            // Use the first file alphabetically (usually "1.jpg")
            files.sort();
            return `/images/${productId}/${flavorId}/${files[0]}`;
        }
    }
    // Fall back to what the DB has stored
    return storedImg || null;
}

async function indexToSolr() {
    try {
        console.log('Fetching products + productFlavors for Solr indexing...');

        const products = await db.Product.findAll({
            include: [
                { model: db.Category },
                { model: db.Form, as: 'Form' },
                {
                    model: db.ProductFlavor,
                    as: 'productFlavors',
                    include: [
                        { model: db.Flavor, attributes: ['id', 'name'] }
                    ]
                }
            ]
        });

        const allCategories = await db.Category.findAll();
        const catMap = {};
        allCategories.forEach(c => {
            catMap[c.id] = c.title;
        });

        if (products.length === 0) {
            console.log('No products found in database to index.');
            return;
        }

        console.log(`Resolving images and building Solr documents for ${products.length} products...`);

        const solrDocs = products.map(product => {
            const flavors = product.productFlavors || [];

            // ── Price: cheapest from all flavors, or DB price ──
            const basePrice = flavors.length > 0
                ? Math.min(...flavors.map(f => f.price || 0).filter(p => p > 0))
                : (parseFloat(product.price) || 1000);

            // ── Flavor metadata ──
            const flavorIds   = flavors.map(f => f.flavor_id);
            const flavorNames = flavors.map(f => f.Flavor?.name).filter(Boolean);

            // ── Image: resolve from disk using productId/flavorId structure ──
            const resolvedImg = resolveProductImage(product.id, flavorIds, product.img);

            // ── Discount from active offers ──
            const activeDiscount = product.offers?.find(o => o.active && o.discount > 0);
            const discountLabel = activeDiscount
                ? (activeDiscount.type === 2
                    ? `₹${activeDiscount.discount} OFF`
                    : `${activeDiscount.discount}% OFF`)
                : '0%';

            // ── Categories: resolve all from subset ──
            const categorySet = new Set();
            if (product.Category && product.Category.title) {
                categorySet.add(product.Category.title);
            }
            if (product.catIds) {
                String(product.catIds).split(',').map(id => id.trim()).filter(Boolean).forEach(id => {
                    if (catMap[id]) categorySet.add(catMap[id]);
                });
            }
            if (categorySet.size === 0) {
                categorySet.add('Uncategorized');
            }

            return {
                id:           String(product.id),
                title:        product.title || '',
                title_s:      product.title || '',
                categories:   Array.from(categorySet),
                categories_ss:Array.from(categorySet),
                audience:     product.audience || 'General',
                audience_s:   product.audience || 'General',
                form_s:       product.Form?.title || 'Other',
                price:        basePrice,
                price_f:      basePrice,
                img:          resolvedImg,
                flavor_ids:   flavorIds,          // multi-valued: all flavor IDs
                flavor_names: flavorNames,        // multi-valued: all flavor names
                bestseller:   product.bestseller ? 'Yes' : 'No',
                bestseller_s: product.bestseller ? 'Yes' : 'No',
                featured:     product.featured    ? 'Yes' : 'No',
                featured_s:   product.featured    ? 'Yes' : 'No',
                discount:     discountLabel,
                discount_s:   discountLabel,
                stock:        product.stock || 0,
                in_stock_s:   (product.stock || 0) > 0 ? 'Yes' : 'No',
                rating_f:     parseFloat(product.rating) || 0,
                brand:        product.brand || '',
                updated_at:   product.updatedAt
                    ? product.updatedAt.toISOString()
                    : new Date().toISOString()
            };
        });

        // Log a sample for verification
        console.log('\nSample doc (first product):');
        console.log(JSON.stringify(solrDocs[0], null, 2));

        console.log(`\nIndexing ${solrDocs.length} documents to Solr...`);

        const response = await fetch(SOLR_URL, {
            method: 'POST',
            body: JSON.stringify(solrDocs),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log('✅ Solr indexing successful!');
            const result = await response.json();
            console.log('Solr response:', JSON.stringify(result, null, 2));
        } else {
            const error = await response.text();
            console.error('❌ Solr indexing failed:', error);
        }

    } catch (error) {
        console.error('Error during Solr indexing:', error);
        throw error;
    } finally {
        await db.sequelize.close();
    }
}

indexToSolr();
