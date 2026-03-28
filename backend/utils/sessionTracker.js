/**
 * Session and Wishlist Tracker
 * Handles user sessions and sends email notifications when session closes
 */

const db = require('../models');
const nodemailer = require('nodemailer'); // Install with: npm install nodemailer

class SessionTracker {
  constructor() {
    this.activeSessions = new Map(); // Store active sessions
    this.emailService = this.initializeEmailService();
  }

  /**
   * Initialize email service
   * Configure with your email provider credentials
   */
  initializeEmailService() {
    // TODO: Configure with actual email service
    // For now, return a mock service
    return {
      sendMail: async (options) => {
        console.log('Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: 'See HTML preview'
        });
        return { success: true, messageId: 'mock-id' };
      }
    };

    // Real implementation example:
    /*
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    */
  }

  /**
   * Register a new user session
   */
  registerSession(userId, sessionId) {
    this.activeSessions.set(sessionId, {
      userId,
      startTime: new Date(),
      wishlistItems: [],
      emailSent: false
    });

    console.log(`Session registered: ${sessionId} for user ${userId}`);
  }

  /**
   * Add item to session wishlist tracking
   */
  addItemToSessionWishlist(sessionId, productId, itemDetails) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.wishlistItems.push({
        productId,
        ...itemDetails,
        addedAt: new Date()
      });
    }
  }

  /**
   * Remove item from session wishlist tracking
   */
  removeItemFromSessionWishlist(sessionId, productId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.wishlistItems = session.wishlistItems.filter(item => item.productId !== productId);
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Handle session close - Send email if wishlist has items
   */
  async handleSessionClose(userId, sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.emailSent) {
      return;
    }

    try {
      // Get user information
      const user = await db.User.findByPk(userId);
      if (!user || !user.email) {
        console.log('User not found or email not available');
        return;
      }

      // Get wishlist items from database
      const wishlistItems = await db.Wishlist.findAll({
        where: { user_id: userId },
        include: [{
          model: db.Product,
          attributes: ['id', 'title', 'price', 'priceMedium', 'priceLarge', 'img', 'category', 'description']
        }]
      });

      if (wishlistItems.length === 0) {
        console.log('No wishlist items to send');
        return;
      }

      // Send email
      const emailHtml = this.generateWishlistEmailHtml(user.username, wishlistItems);
      await this.sendWishlistEmail(
        user.email,
        user.username,
        wishlistItems,
        emailHtml
      );

      // Mark as email sent
      await db.Wishlist.update(
        { email_sent: true },
        { where: { user_id: userId } }
      );

      // Update session status
      session.emailSent = true;
      console.log(`Wishlist email sent to ${user.email}`);
    } catch (error) {
      console.error('Error handling session close:', error);
    }
  }

  /**
   * Send wishlist email to user
   */
  async sendWishlistEmail(email, username, items, htmlContent) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: email,
        subject: `🎁 Your Wishlist Items - Don't Miss Out!`,
        html: htmlContent,
        text: `Hi ${username},\n\nYou have ${items.length} items in your wishlist. Visit our store to check them out!\n\nBest regards,\nOur Team`
      };

      const result = await this.emailService.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML content for wishlist email
   */
  generateWishlistEmailHtml(username, items) {
    const itemsHtml = items.map((item, index) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px; text-align: center;">
          <img src="${item.Product.img}" alt="${item.Product.title}" 
               style="max-width: 100px; max-height: 100px; border-radius: 8px;">
        </td>
        <td style="padding: 15px;">
          <strong>${item.Product.title}</strong>
          <br/>
          <span style="color: #999; font-size: 13px;">Category: ${item.Product.category}</span>
          <br/>
          <span style="color: #666; font-size: 13px; margin-top: 5px; display: block;">
            ${item.Product.description?.substring(0, 80)}...
          </span>
        </td>
        <td style="padding: 15px; text-align: right; font-weight: bold; color: #ff4757;">
          $${item.Product.price}
        </td>
        <td style="padding: 15px; text-align: center;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/productDetails/${item.product_id}"
             style="background-color: #ff4757; color: white; padding: 8px 16px; 
                    border-radius: 6px; text-decoration: none; display: inline-block;">
            View
          </a>
        </td>
      </tr>
    `).join('');

    const totalPrice = items.reduce((sum, item) => sum + item.Product.price, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
          a { color: #667eea; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❤️ Your Wishlist is Waiting!</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
              Don't miss out on these amazing items
            </p>
          </div>

          <div class="content">
            <p>Hi ${username},</p>
            <p>You have <strong>${items.length}</strong> items in your wishlist. 
               Here's a quick preview of what you saved:</p>

            <table>
              <thead>
                <tr>
                  <th style="width: 120px;">Image</th>
                  <th>Product Details</th>
                  <th style="width: 100px;">Price</th>
                  <th style="width: 80px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">
              <p style="margin: 0 0 10px 0;"><strong>Wishlist Summary</strong></p>
              <p style="margin: 5px 0;">Total Items: <strong>${items.length}</strong></p>
              <p style="margin: 5px 0;">Total Value: <strong>$${totalPrice.toFixed(2)}</strong></p>
              <p style="margin: 10px 0 0 0;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/wishlist"
                   style="background-color: #ff4757; color: white; padding: 12px 24px; 
                          border-radius: 6px; text-decoration: none; display: inline-block;">
                  View Full Wishlist
                </a>
              </p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Share with Friends:</strong><br/>
              Click the share button on any item to send it to your friends and family!
            </p>

            <p style="color: #666; font-size: 14px;">
              Happy Shopping!<br/>
              <em>The Team</em>
            </p>
          </div>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/policies/privacy-policy">Privacy Policy</a> | 
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/policies/terms-of-use">Terms of Use</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Clean up closed sessions (remove from memory)
   */
  cleanupSession(sessionId) {
    this.activeSessions.delete(sessionId);
    console.log(`Session cleaned up: ${sessionId}`);
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      ...data
    }));
  }
}

// Export singleton instance
module.exports = new SessionTracker();
