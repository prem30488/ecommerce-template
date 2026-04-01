const { getRedisClient } = require('../config/redis');

const CACHE_KEYS = {
    ACTIVE_SALES: 'sales:active',
    SALE_DETAILS: (saleId) => `sale:${saleId}`,
    SALE_PRODUCTS: (saleId) => `sale:${saleId}:products`,
};

const CACHE_TTL = {
    ACTIVE_SALES: 15 * 60, // 15 minutes
    SALE_DETAILS: 30 * 60, // 30 minutes
    SALE_PRODUCTS: 30 * 60, // 30 minutes
};

/**
 * Get active sales from Redis cache
 * @returns {Promise<Array|null>} Cached active sales or null if not in cache
 */
const getActiveSalesFromCache = async () => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const cached = await client.get(CACHE_KEYS.ACTIVE_SALES);
        if (cached) {
            console.log('📦 Cache HIT: Active Sales');
            return JSON.parse(cached);
        }
        console.log('📭 Cache MISS: Active Sales');
        return null;
    } catch (error) {
        console.error('Error getting from Redis cache:', error);
        return null;
    }
};

/**
 * Set active sales in Redis cache
 * @param {Array} sales - Active sales data
 * @returns {Promise<boolean>} Success status
 */
const setActiveSalesCache = async (sales) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.setEx(
            CACHE_KEYS.ACTIVE_SALES,
            CACHE_TTL.ACTIVE_SALES,
            JSON.stringify(sales)
        );
        console.log('💾 Cached: Active Sales (TTL: 15min)');
        return true;
    } catch (error) {
        console.error('Error setting Redis cache:', error);
        return false;
    }
};

/**
 * Get sale details from cache
 * @param {number} saleId - Sale ID
 * @returns {Promise<Object|null>}
 */
const getSaleFromCache = async (saleId) => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const cached = await client.get(CACHE_KEYS.SALE_DETAILS(saleId));
        if (cached) {
            console.log(`📦 Cache HIT: Sale #${saleId}`);
            return JSON.parse(cached);
        }
        console.log(`📭 Cache MISS: Sale #${saleId}`);
        return null;
    } catch (error) {
        console.error('Error getting sale from cache:', error);
        return null;
    }
};

/**
 * Set sale details in cache
 * @param {number} saleId - Sale ID
 * @param {Object} sale - Sale data
 * @returns {Promise<boolean>}
 */
const setSaleCache = async (saleId, sale) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.setEx(
            CACHE_KEYS.SALE_DETAILS(saleId),
            CACHE_TTL.SALE_DETAILS,
            JSON.stringify(sale)
        );
        console.log(`💾 Cached: Sale #${saleId} (TTL: 30min)`);
        return true;
    } catch (error) {
        console.error('Error setting sale cache:', error);
        return false;
    }
};

/**
 * Get sale products from cache
 * @param {number} saleId - Sale ID
 * @returns {Promise<Array|null>}
 */
const getSaleProductsFromCache = async (saleId) => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const cached = await client.get(CACHE_KEYS.SALE_PRODUCTS(saleId));
        if (cached) {
            console.log(`📦 Cache HIT: Sale #${saleId} Products`);
            return JSON.parse(cached);
        }
        console.log(`📭 Cache MISS: Sale #${saleId} Products`);
        return null;
    } catch (error) {
        console.error('Error getting sale products from cache:', error);
        return null;
    }
};

/**
 * Set sale products in cache
 * @param {number} saleId - Sale ID
 * @param {Array} products - Products data
 * @returns {Promise<boolean>}
 */
const setSaleProductsCache = async (saleId, products) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.setEx(
            CACHE_KEYS.SALE_PRODUCTS(saleId),
            CACHE_TTL.SALE_PRODUCTS,
            JSON.stringify(products)
        );
        console.log(`💾 Cached: Sale #${saleId} Products (TTL: 30min)`);
        return true;
    } catch (error) {
        console.error('Error setting sale products cache:', error);
        return false;
    }
};

/**
 * Invalidate all sale-related caches
 * @returns {Promise<boolean>}
 */
const invalidateSalesCache = async (saleId = null) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        if (saleId) {
            // Invalidate specific sale caches
            await client.del(CACHE_KEYS.SALE_DETAILS(saleId));
            await client.del(CACHE_KEYS.SALE_PRODUCTS(saleId));
            console.log(`🗑️ Invalidated: Sale #${saleId} cache`);
        }

        // Always invalidate active sales cache
        await client.del(CACHE_KEYS.ACTIVE_SALES);
        console.log('🗑️ Invalidated: Active Sales cache');

        return true;
    } catch (error) {
        console.error('Error invalidating cache:', error);
        return false;
    }
};

/**
 * Clear all Redis cache
 * @returns {Promise<boolean>}
 */
const flushCache = async () => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.flushAll();
        console.log('🧹 All cache cleared');
        return true;
    } catch (error) {
        console.error('Error flushing cache:', error);
        return false;
    }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>}
 */
const getCacheStats = async () => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const info = await client.info('stats');
        return info;
    } catch (error) {
        console.error('Error getting cache stats:', error);
        return null;
    }
};

module.exports = {
    getActiveSalesFromCache,
    setActiveSalesCache,
    getSaleFromCache,
    setSaleCache,
    getSaleProductsFromCache,
    setSaleProductsCache,
    invalidateSalesCache,
    flushCache,
    getCacheStats,
    CACHE_KEYS,
    CACHE_TTL,
};
