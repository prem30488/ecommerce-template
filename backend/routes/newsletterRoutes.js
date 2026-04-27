const express = require('express');
const router = express.Router();
const db = require('../models');
const emailService = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware for admin routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Public: Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const [subscriber, created] = await db.Subscriber.findOrCreate({
            where: { email },
            defaults: { status: 'active', subscribed_at: new Date() }
        });

        if (!created) {
            if (subscriber.status === 'inactive') {
                subscriber.status = 'active';
                await subscriber.save();
                return res.json({ success: true, message: 'Welcome back! Your subscription has been reactivated.' });
            }
            return res.status(400).json({ success: false, message: 'You are already subscribed.' });
        }

        res.json({ success: true, message: 'Successfully subscribed to our newsletter!' });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.' });
    }
});

// Admin: Get all subscribers
router.get('/subscribers', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const { Op } = db.Sequelize;

        const where = {};
        if (search) {
            where.email = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await db.Subscriber.findAndCountAll({
            where,
            offset: page * size,
            limit: size,
            order: [['subscribed_at', 'DESC']]
        });

        res.json({
            content: rows,
            totalElements: count,
            totalPages: Math.ceil(count / size),
            size,
            number: page
        });
    } catch (error) {
        console.error('Newsletter get subscribers error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
    }
});

// Admin: Toggle subscriber status
router.put('/subscribers/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const subscriber = await db.Subscriber.findByPk(id);
        if (!subscriber) {
            return res.status(404).json({ success: false, message: 'Subscriber not found' });
        }

        subscriber.status = status;
        await subscriber.save();

        res.json({ success: true, message: `Subscriber status updated to ${status}` });
    } catch (error) {
        console.error('Newsletter status update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

// Admin: Send email to all active subscribers
router.post('/send-email', authenticateToken, async (req, res) => {
    try {
        console.log('Newsletter request body:', req.body);
        const { subject, htmlBody } = req.body;
        console.log('Sending newsletter:', { subject, htmlBodyLength: htmlBody?.length });

        if (!subject || !htmlBody) {
            return res.status(400).json({ success: false, message: 'Subject and HTML body are required' });
        }

        const activeSubscribers = await db.Subscriber.findAll({
            where: { status: 'active' }
        });
        console.log(`Found ${activeSubscribers.length} active subscribers`);

        if (activeSubscribers.length === 0) {
            return res.status(400).json({ success: false, message: 'No active subscribers found' });
        }

        // Send emails (In a real app, this should be a background job)
        const emailPromises = activeSubscribers.map(sub => {
            return emailService.sendEmail({
                to: sub.email,
                subject: subject,
                html: htmlBody
            }).catch(err => {
                console.error(`Failed to send email to ${sub.email}:`, err);
                return null;
            });
        });

        await Promise.all(emailPromises);

        res.json({ success: true, message: `Newsletter sent to ${activeSubscribers.length} subscribers` });
    } catch (error) {
        console.error('Newsletter send email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send newsletter' });
    }
});

module.exports = router;
