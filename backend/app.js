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
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Normalize origin check
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
    const isAllowed = !origin || allowedOrigins.some(ao => ao.replace(/\/$/, '') === normalizedOrigin) ||
        (origin === 'https://ecommerce-template-xi-tan.vercel.app');

    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

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

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased for a large template
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

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