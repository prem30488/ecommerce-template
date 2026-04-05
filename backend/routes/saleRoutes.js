const express = require('express');
const router = express.Router();
const db = require('../models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Op } = require('sequelize');
const {
    getActiveSalesFromCache,
    setActiveSalesCache,
    getSaleFromCache,
    setSaleCache,
    getSaleProductsFromCache,
    setSaleProductsCache,
    invalidateSalesCache,
} = require('../utils/cacheManager');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const { SaleEvent, Offer, Product, ProductImage } = db;

const saleStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const saleId = req.query.saleId;
        if (!saleId) {
            return cb(new Error('Missing saleId parameter'), null);
        }
        const uploadPath = path.join(__dirname, '..', 'public', 'images', 'sales', String(saleId));
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${cleanName}`);
    }
});

const uploadSaleBanner = multer({ storage: saleStorage });

router.post('/upload', verifyToken, isAdmin, uploadSaleBanner.single('file'), async (req, res) => {
    try {
        const saleId = req.query.saleId;
        if (!saleId) {
            return res.status(400).json({ success: false, message: 'saleId is required' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const fileUrl = `/images/sales/${saleId}/${req.file.filename}`;
        res.status(201).json({ success: true, data: { url: fileUrl, filename: req.file.filename } });
    } catch (error) {
        console.error('Error uploading sale banner:', error);
        res.status(500).json({ success: false, message: 'Failed to upload sale banner', error: error.message });
    }
});

router.get('/images/:saleId', verifyToken, isAdmin, async (req, res) => {
    try {
        const { saleId } = req.params;
        const dirPath = path.join(__dirname, '..', 'public', 'images', 'sales', String(saleId));
        if (!fs.existsSync(dirPath)) {
            return res.status(200).json({ success: true, data: [] });
        }
        const files = fs.readdirSync(dirPath).filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));
        const imageUrls = files.map((file) => `/images/sales/${saleId}/${encodeURIComponent(file)}`);
        res.status(200).json({ success: true, data: imageUrls });
    } catch (error) {
        console.error('Error reading sale images:', error);
        res.status(500).json({ success: false, message: 'Failed to read sale images', error: error.message });
    }
});

/**
 * GET /api/sale
 * Get all sales for admin
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const sales = await SaleEvent.findAll({
            order: [['id', 'DESC']],
        });

        res.status(200).json({
            success: true,
            data: sales,
        });
    } catch (error) {
        console.error('Error fetching all sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sale list',
            error: error.message,
        });
    }
});

/**
 * GET /api/sale/active
 * Get all currently active sales (auto-filtered by date)
 * Uses Redis cache with fallback to database
 */
router.get('/active', async (req, res) => {
    try {
        // Try to get from cache first
        const cachedSales = await getActiveSalesFromCache();
        if (cachedSales) {
            return res.status(200).json({
                success: true,
                data: cachedSales,
                source: 'cache',
            });
        }

        // If not cached, query database
        const now = new Date();
        const activeSales = await SaleEvent.findAll({
            where: {
                active: true,
                startDate: {
                    [Op.lte]: now,
                },
                endDate: {
                    [Op.gte]: now,
                },
            },
            order: [['startDate', 'ASC']],
            raw: true,
        });

        // Cache the results
        await setActiveSalesCache(activeSales);

        res.status(200).json({
            success: true,
            data: activeSales,
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching active sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active sales',
            error: error.message,
        });
    }
});

/**
 * GET /api/sale/:id
 * Get sale details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Try to get from cache
        const cachedSale = await getSaleFromCache(id);
        if (cachedSale) {
            return res.status(200).json({
                success: true,
                data: cachedSale,
                source: 'cache',
            });
        }

        // Query database
        const sale = await SaleEvent.findByPk(id);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        // Cache the result
        await setSaleCache(id, sale);

        res.status(200).json({
            success: true,
            data: sale,
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sale',
            error: error.message,
        });
    }
});

/**
 * GET /api/sale/:id/products
 * Get all products in a specific sale with discount details applied
 */
router.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 0, size = 10 } = req.query;

        // Try cache first
        const cachedProducts = await getSaleProductsFromCache(id);
        if (cachedProducts) {
            return res.status(200).json({
                success: true,
                data: cachedProducts,
                source: 'cache',
            });
        }

        // Get sale details
        const sale = await SaleEvent.findByPk(id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        // Get products linked to this sale via offers
        const products = await Product.findAll({
            include: [
                {
                    model: Offer,
                    where: {
                        saleEventId: id,
                        active: true,
                    },
                    as: 'offers',
                },
                {
                    model: ProductImage,
                    as: 'images',
                },
            ],
            offset: parseInt(page) * parseInt(size),
            limit: parseInt(size),
            raw: false,
        });

        // Enhance products with sale info
        const productsWithSaleInfo = products.map((product) => {
            const offer = product.offers?.[0];
            return {
                ...product.toJSON(),
                saleInfo: {
                    saleId: id,
                    saleName: sale.name,
                    discountType: sale.discountType,
                    discountValue: sale.discountValue,
                    daysRemaining: Math.ceil(
                        (new Date(sale.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                    ),
                    offerDetails: offer || null,
                },
            };
        });

        // Cache the results
        await setSaleProductsCache(id, productsWithSaleInfo);

        res.status(200).json({
            success: true,
            data: productsWithSaleInfo,
            source: 'database',
        });
    } catch (error) {
        console.error('Error fetching sale products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sale products',
            error: error.message,
        });
    }
});

/**
 * POST /api/sale
 * Create a new sale event (Admin only)
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            bannerImage,
            startDate,
            endDate,
            category,
            audience,
            discountType,
            discountValue,
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !startDate ||
            !endDate ||
            !discountType ||
            !discountValue
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Missing required fields: name, startDate, endDate, discountType, discountValue',
            });
        }

        // Validate date range
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'startDate must be before endDate',
            });
        }

        const sale = await SaleEvent.create({
            name,
            description,
            bannerImage,
            startDate,
            endDate,
            category,
            audience,
            discountType,
            discountValue,
            active: true,
        });

        // Invalidate cache
        await invalidateSalesCache();

        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: sale,
        });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sale',
            error: error.message,
        });
    }
});

/**
 * PUT /api/sale/:id
 * Update a sale event (Admin only)
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const sale = await SaleEvent.findByPk(id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        // Validate date range if both dates are provided
        if (updates.startDate && updates.endDate) {
            if (new Date(updates.startDate) >= new Date(updates.endDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate must be before endDate',
                });
            }
        }

        await sale.update(updates);

        // Invalidate cache
        await invalidateSalesCache(id);

        res.status(200).json({
            success: true,
            message: 'Sale updated successfully',
            data: sale,
        });
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sale',
            error: error.message,
        });
    }
});

/**
 * DELETE /api/sale/:id
 * Soft delete a sale (Admin only)
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await SaleEvent.findByPk(id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        await sale.update({ active: false });

        // Invalidate cache
        await invalidateSalesCache(id);

        res.status(200).json({
            success: true,
            message: 'Sale deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sale',
            error: error.message,
        });
    }
});

/**
 * POST /api/sale/:id/analytics
 * Track view/click event for a sale
 */
router.post('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const { event } = req.body; // 'view' or 'click' or 'conversion'

        const sale = await SaleEvent.findByPk(id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        // Update analytics
        const analytics = sale.analyticsData || { views: 0, clicks: 0, conversions: 0 };

        if (event === 'view') analytics.views += 1;
        else if (event === 'click') analytics.clicks += 1;
        else if (event === 'conversion') analytics.conversions += 1;

        await sale.update({ analyticsData: analytics });

        // Invalidate cache
        await invalidateSalesCache(id);

        res.status(200).json({
            success: true,
            message: `Analytics ${event} recorded`,
            data: analytics,
        });
    } catch (error) {
        console.error('Error recording analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording analytics',
            error: error.message,
        });
    }
});

/**
 * GET /api/sale/:id/analytics
 * Get analytics data for a sale
 */
router.get('/:id/analytics', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await SaleEvent.findByPk(id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                saleId: id,
                saleName: sale.name,
                analytics: sale.analyticsData,
            },
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message,
        });
    }
});

module.exports = router;
