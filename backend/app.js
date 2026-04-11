const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
app.set("trust proxy", 1);

// --------------- Manual CORS Middleware ---------------
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ecommerce-template-xi-tan.vercel.app',
    'https://ecommerce-template-api-mu.vercel.app',
    'https://prudent-farsighted-yareli.ngrok-free.dev',
    'https://ecommerce-template-qr8sr5usu-parths-projects-fc15ae57.vercel.app'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Normalize origin check
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
    const isAllowed = !origin || allowedOrigins.some(ao => ao.replace(/\/$/, '') === normalizedOrigin) ||
        (origin.startsWith('https://ecommerce-template') && origin.endsWith('.vercel.app'));

    // if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // } else {
    //     console.log(origin + "Not Allowed...");
    // }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, X-Api-Version, Origin');

    // Handle Preflight OPTIONS immediately
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Relaxed rate limit for image/media endpoints to prevent blocking large product catalogs
const mediaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many media requests, please try again later.' },
});

// Apply specific limiters BEFORE the global one
app.use('/api/auth', authLimiter);
app.use('/api/product/images', mediaLimiter);

// Global Rate limiting for all other /api endpoints
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.originalUrl.includes('/api/auth') || req.originalUrl.includes('/api/product/images');
    },
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// --------------- Body Parsing ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --------------- Logging ---------------
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health check to be available before auth
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        message: 'Ecommerce API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;