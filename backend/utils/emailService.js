/**
 * Email Service Configuration
 * Handles sending various emails from the application
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * Supports multiple providers: Gmail, SendGrid, AWS SES, etc.
   */
  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'mock';

    //switch (emailProvider) {
    //case 'gmail':
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use app password, not regular password
      }
    });

    // case 'sendgrid':
    //   return nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: 'apikey',
    //       pass: process.env.SENDGRID_API_KEY
    //     }
    //   });

    // case 'aws':
    //   return nodemailer.createTransport({
    //     SES: {
    //       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //       region: process.env.AWS_REGION || 'us-east-1'
    //     }
    //   });

    // case 'mock':
    // default:
    //   // Mock transporter for development
    //   return {
    //     sendMail: async (options) => {
    //       console.log('📧 Mock Email Sent:');
    //       console.log(`To: ${options.to}`);
    //       console.log(`Subject: ${options.subject}`);
    //       console.log('---');
    //       return { success: true, messageId: `mock-${Date.now()}` };
    //     }
    //   };
    //}
  }

  /**
   * Send a general email
   * @param {Object} options - { to, subject, text, html }
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hanleyhealthcare.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send wishlist notification email
   */
  async sendWishlistNotification(userEmail, username, wishlistItems, appUrl) {
    try {
      const emailHtml = this.generateWishlistEmailHtml(username, wishlistItems, appUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: userEmail,
        subject: `🎁 Your Wishlist Items - ${wishlistItems.length} items waiting for you!`,
        html: emailHtml,
        text: `Hi ${username},\n\nYou have ${wishlistItems.length} items in your wishlist. Visit our store to check them out and don't miss great deals!\n\nBest regards,\nThe Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Wishlist email sent to ${userEmail}`);
      return result;
    } catch (error) {
      console.error('❌ Error sending wishlist email:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(userEmail, username, orderDetails, appUrl) {
    try {
      const itemsHtml = orderDetails.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1>Order Confirmation</h1>
            <p>Hi ${username},</p>
            <p>Thank you for your order! Here are your order details:</p>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <p><strong>Total: $${orderDetails.total.toFixed(2)}</strong></p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: userEmail,
        subject: `Order Confirmation - #${orderDetails.orderId}`,
        html: emailHtml
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail, username, appUrl) {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1>Welcome ${username}!</h1>
            <p>Thank you for joining our store. We're excited to have you here!</p>
            <p><a href="${appUrl}" style="color: #667eea; text-decoration: none;">Start Shopping</a></p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: userEmail,
        subject: 'Welcome to Our Store!',
        html: emailHtml
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Generate wishlist email HTML
   */
  generateWishlistEmailHtml(username, items, appUrl = 'http://localhost:3000') {
    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px; text-align: center;">
          <img src="${item.Product?.img || item.img}" alt="${item.Product?.title || item.title}" 
               style="max-width: 100px; max-height: 100px; border-radius: 8px;">
        </td>
        <td style="padding: 15px;">
          <strong>${item.Product?.title || item.title}</strong>
          <br/>
          <span style="color: #999; font-size: 13px;">Category: ${item.Product?.category || item.category}</span>
        </td>
        <td style="padding: 15px; text-align: right; font-weight: bold; color: #ff4757;">
          $${item.Product?.price || item.price}
        </td>
        <td style="padding: 15px; text-align: center;">
          <a href="${appUrl}/productDetails/${item.product_id || item.id}"
             style="background-color: #ff4757; color: white; padding: 8px 16px; 
                    border-radius: 6px; text-decoration: none; display: inline-block;">
            View
          </a>
        </td>
      </tr>
    `).join('');

    const totalPrice = items.reduce((sum, item) => sum + (item.Product?.price || item.price), 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4757; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
          .btn { background-color: #ff4757; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; }
          .btn:hover { background-color: #ff3838; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
          a { color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">❤️ Your Wishlist is Waiting!</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Don't miss out on these amazing items</p>
          </div>

          <div class="content">
            <p>Hi ${username},</p>
            <p>You have <strong>${items.length}</strong> item${items.length !== 1 ? 's' : ''} in your wishlist. Here's a preview:</p>

            <table style="margin: 20px 0;">
              <thead>
                <tr>
                  <th style="width: 120px;">Image</th>
                  <th>Product</th>
                  <th style="width: 100px;">Price</th>
                  <th style="width: 80px;">Action</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div class="summary">
              <p style="margin: 0 0 10px 0; font-weight: bold;">📊 Wishlist Summary</p>
              <p style="margin: 5px 0;">Total Items: <strong>${items.length}</strong></p>
              <p style="margin: 5px 0;">Total Value: <strong>$${totalPrice.toFixed(2)}</strong></p>
              <p style="margin: 15px 0 0 0;">
                <a href="${appUrl}/wishlist" class="btn">View Full Wishlist</a>
              </p>
            </div>

            <p style="color: #666; font-size: 14px;">
              💡 <strong>Tip:</strong> Share items with friends using the share button on each product!
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2024 Our Store. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">
              <a href="${appUrl}/policies/privacy-policy">Privacy</a> | 
              <a href="${appUrl}/policies/terms-of-use">Terms</a> | 
              <a href="${appUrl}/contact">Contact</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email sending
   */
  async testEmail(recipientEmail) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: recipientEmail,
        subject: 'Test Email',
        html: '<h1>Test Email</h1><p>This is a test email from the ecommerce platform.</p>'
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
