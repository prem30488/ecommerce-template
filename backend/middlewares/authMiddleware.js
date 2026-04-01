const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token middleware
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required',
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }
        req.user = user;
        next();
    });
};

/**
 * Check if user is admin
 * Requires verifyToken to be called first
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'User not authenticated',
        });
    }

    // Check if user has admin role (assuming role is stored in token or user object)
    // Adjust this based on your actual user structure
    const userRole = (req.user.role || '').toLowerCase();
    if (!['admin', 'superadmin'].includes(userRole) && !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    next();
};

module.exports = {
    verifyToken,
    isAdmin,
};
