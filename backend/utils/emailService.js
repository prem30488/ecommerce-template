/**
 * Email Service Configuration
 * Handles sending various emails from the application
 */

const nodemailer = require('nodemailer');

// ─── Company Details ──────────────────────────────────────────────────────────
const COMPANY = {
  name: 'Hanley Healthcare LLP',
  address1: 'Pushpam Industrial Estate',
  address2: 'Phase I, Vatva GIDC',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pinCode: '382445',
  phone: '+91 7777936090',
  email: 'info@hanleyhealthcare.com',
  gstin: '24AAAFH1234A1Z5',
  logoUrl: 'https://hanleyhealthcare.com/cdn/shop/files/Untitled-2.png',
  website: 'https://hanleyhealthcare.com',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _formatDate(date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function _getSizeLabel(size) {
  if (size === 'small') return 'Small Pack';
  if (size === 'medium') return 'Medium Pack';
  if (size === 'large') return 'Large Pack';
  return size || '';
}

function _generateInvoiceHTML(order, orderId) {
  const customer = order.customer || {};
  const billingAddress =
    typeof order.billingAddress === 'string'
      ? JSON.parse(order.billingAddress)
      : order.billingAddress || {};
  const shippingAddress =
    typeof order.delieveryAddress === 'string'
      ? JSON.parse(order.delieveryAddress)
      : order.delieveryAddress || {};

  const totalAmount = parseFloat(order.subTotal || order.total || 0);
  const discountAmount = parseFloat(order.discountAmount || 0);
  const total = parseFloat(order.total || 0);
  const gst = total * 0.18;
  const grandTotal = total * 1.18;
  const paidItems = (order.lineItems || []).filter((i) => i.price > 0);
  const freeItems = (order.lineItems || []).filter((i) => i.price === 0);

  const itemRows = paidItems.map((item) => {
    const amount = item.price * item.quantity;
    const sizeName = _getSizeLabel(item.size);
    const productName = item.product?.title || item.product?.productName || 'Product';
    const flavor = item.flavor || '';
    const hsn = item.product?.hmscode || '3004';
    return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;">
            <strong style="display:block;color:#1e293b;font-size:13px;">${productName}</strong>
            <span style="color:#64748b;font-size:12px;">${sizeName}${flavor ? ' &bull; ' + flavor : ''}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:center;color:#475569;font-size:13px;">${hsn}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:right;color:#475569;font-size:13px;">&#8377;${item.price.toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:center;color:#475569;font-size:13px;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:right;color:#1e293b;font-weight:600;font-size:13px;">&#8377;${amount.toFixed(2)}</td>
        </tr>`;
  }).join('');

  const freeRows = freeItems.map((item) => {
    const sizeName = _getSizeLabel(item.size);
    const productName = item.product?.title || item.product?.productName || 'Free Gift';
    const hsn = item.product?.hmscode || '3004';
    return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;">
            <strong style="display:block;color:#1e293b;font-size:13px;">${productName}
              <span style="background:#FFF7ED;color:#C2410C;font-size:10px;padding:2px 7px;border-radius:4px;margin-left:6px;font-weight:700;">FREE GIFT</span>
            </strong>
            <span style="color:#64748b;font-size:12px;">${sizeName}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:center;color:#475569;font-size:13px;">${hsn}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:right;color:#10b981;font-size:13px;">&#8377;0.00</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:center;color:#475569;font-size:13px;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8eaf0;text-align:right;color:#10b981;font-weight:600;font-size:13px;">&#8377;0.00</td>
        </tr>`;
  }).join('');

  const discountRow = discountAmount > 0 ? `
      <tr>
        <td style="padding:9px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</td>
        <td style="padding:9px 16px;text-align:right;color:#10b981;font-size:13px;border-bottom:1px solid #e2e8f0;">-&#8377;${discountAmount.toFixed(2)}</td>
      </tr>` : '';

  const customerName = customer.name ||
    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
    'Valued Customer';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice #${orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
  <tr><td align="center">
    <table width="680" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:680px;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <img src="${COMPANY.logoUrl}" alt="${COMPANY.name}" height="40" style="display:block;" />
                <p style="color:rgba(255,255,255,0.8);font-size:11px;margin:5px 0 0;">${COMPANY.address1}, ${COMPANY.address2}, ${COMPANY.city} - ${COMPANY.pinCode}</p>
                <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:2px 0 0;">GSTIN: ${COMPANY.gstin} &nbsp;|&nbsp; ${COMPANY.phone}</p>
              </td>
              <td align="right" style="vertical-align:top;">
                <h2 style="color:#fff;margin:0;font-size:20px;font-weight:700;">TAX INVOICE</h2>
                <p style="color:rgba(255,255,255,0.9);margin:3px 0 0;font-size:13px;">#${orderId}</p>
                <p style="color:rgba(255,255,255,0.75);margin:3px 0 0;font-size:12px;">Date: ${_formatDate(order.created_at)}</p>
                <span style="display:inline-block;margin-top:8px;background:#10b981;color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;">PAID</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Payment Confirmed Banner -->
      <tr>
        <td style="background:#ecfdf5;border-bottom:1px solid #d1fae5;padding:12px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><strong style="color:#065f46;font-size:13px;">&#10003;&nbsp; Payment successful! Your order is confirmed.</strong></td>
            <td align="right"><span style="color:#065f46;font-size:12px;">Method: <strong>${order.paymentType || 'Razorpay Secure'}</strong></span></td>
          </tr></table>
        </td>
      </tr>

      <!-- Address -->
      <tr>
        <td style="padding:24px 36px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="50%" style="vertical-align:top;padding-right:14px;">
              <h4 style="margin:0 0 7px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Bill To</h4>
              <p style="margin:0;font-weight:700;color:#1e293b;font-size:13px;">${customerName}</p>
              <p style="margin:2px 0 0;color:#64748b;font-size:12px;">${customer.email || ''}</p>
              <p style="margin:2px 0 0;color:#64748b;font-size:12px;">
                ${billingAddress.street || ''}<br/>
                ${billingAddress.addressLine2 ? billingAddress.addressLine2 + '<br/>' : ''}
                ${billingAddress.city || ''}, ${billingAddress.state || ''}<br/>
                ${billingAddress.country || 'India'} - ${billingAddress.zipcode || ''}
              </p>
              <p style="margin:3px 0 0;color:#64748b;font-size:12px;">${customer.mobile || customer.mobileNumber || ''}</p>
            </td>
            <td width="50%" style="vertical-align:top;padding-left:14px;border-left:1px solid #e2e8f0;">
              <h4 style="margin:0 0 7px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Ship To</h4>
              <p style="margin:0;font-weight:700;color:#1e293b;font-size:13px;">${customerName}</p>
              <p style="margin:2px 0 0;color:#64748b;font-size:12px;">
                ${shippingAddress.street || billingAddress.street || ''}<br/>
                ${(shippingAddress.addressLine2 || billingAddress.addressLine2) ? (shippingAddress.addressLine2 || billingAddress.addressLine2) + '<br/>' : ''}
                ${shippingAddress.city || billingAddress.city || ''}, ${shippingAddress.state || billingAddress.state || ''}<br/>
                ${shippingAddress.country || billingAddress.country || 'India'} - ${shippingAddress.zipcode || billingAddress.zipcode || ''}
              </p>
              <p style="margin:3px 0 0;color:#64748b;font-size:12px;">${customer.mobile || customer.mobileNumber || ''}</p>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- Items Table -->
      <tr>
        <td style="padding:0 36px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Description</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">HSN</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Rate</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${freeItems.length ? `<tr><td colspan="5" style="padding:7px 12px;background:#fff7ed;font-size:10px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.6px;border-top:1px solid #fed7aa;border-bottom:1px solid #fed7aa;">&#127873; Complimentary Gifts / Bonus Items</td></tr>${freeRows}` : ''}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Totals -->
      <tr>
        <td style="padding:0 36px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="55%"></td>
            <td width="45%">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;">
                <tr>
                  <td style="padding:9px 16px;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;">Subtotal</td>
                  <td style="padding:9px 16px;text-align:right;color:#1e293b;font-size:12px;border-bottom:1px solid #e2e8f0;">&#8377;${totalAmount.toFixed(2)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding:9px 16px;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;">GST (18%)</td>
                  <td style="padding:9px 16px;text-align:right;color:#1e293b;font-size:12px;border-bottom:1px solid #e2e8f0;">&#8377;${gst.toFixed(2)}</td>
                </tr>
                <tr style="background:#1e40af;">
                  <td style="padding:11px 16px;color:#fff;font-size:13px;font-weight:700;">Total Amount</td>
                  <td style="padding:11px 16px;text-align:right;color:#fff;font-size:13px;font-weight:700;">&#8377;${grandTotal.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- Notes -->
      <tr>
        <td style="padding:0 36px 24px;">
          <div style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;padding:14px 18px;">
            <h4 style="margin:0 0 8px;color:#1e293b;font-size:12px;">Notes &amp; Terms</h4>
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;">&bull; Goods once sold will not be taken back or exchanged.</p>
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;">&bull; A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;">&bull; This is a computer-generated invoice and does not require a signature.</p>
            <p style="margin:0;color:#64748b;font-size:11px;">&bull; For queries, contact <a href="mailto:${COMPANY.email}" style="color:#3b82f6;">${COMPANY.email}</a></p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:18px 36px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.95);font-size:13px;font-weight:600;">Thank you for choosing ${COMPANY.name}!</p>
          <p style="margin:5px 0 0;color:rgba(255,255,255,0.7);font-size:11px;">
            <a href="${COMPANY.website}" style="color:rgba(255,255,255,0.8);text-decoration:none;">${COMPANY.website}</a>
            &nbsp;|&nbsp; ${COMPANY.phone} &nbsp;|&nbsp; ${COMPANY.email}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

class EmailService {
  constructor() {
    this.transporter = this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * Supports multiple providers: Gmail, SendGrid, AWS SES, etc.
   */
  initializeTransporter() {
    //const emailProvider = process.env.EMAIL_PROVIDER || 'mock';

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
        from: process.env.EMAIL_FROM || 'prem30488@gmail.com',
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
            <p style="margin: 0;">© ${new Date().getFullYear()} Our Store. All rights reserved.</p>
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

  /**
   * Send Tax Invoice Email after successful payment
   * @param {Object} order  - Full order object (with lineItems, customer, addresses)
   * @param {number|string} orderId - Order ID
   */
  async sendTaxInvoiceEmail(order, orderId) {
    try {
      const customer = order.customer || {};
      const customerEmail = customer.email;
      const customerName =
        customer.name ||
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
        'Valued Customer';

      if (!customerEmail) {
        console.warn(`[Email] No customer email for order #${orderId}. Skipping invoice email.`);
        return;
      }

      const invoiceHTML = _generateInvoiceHTML(order, orderId);
      const total = parseFloat(order.total || 0);
      const grandTotal = (total * 1.18).toFixed(2);

      const mailOptions = {
        from: `"${COMPANY.name}" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `\u2705 Your Tax Invoice #${orderId} \u2014 ${COMPANY.name}`,
        html: invoiceHTML,
        text:
          `Dear ${customerName},\n\n` +
          `Thank you for your order! Your payment has been successfully processed.\n\n` +
          `Order ID   : #${orderId}\n` +
          `Total Paid : \u20B9${grandTotal} (incl. 18% GST)\n\n` +
          `You can also view your invoice online at:\n` +
          `${COMPANY.website}/previewInvoice/${orderId}\n\n` +
          `For any queries, please contact us at ${COMPANY.email}\n\n` +
          `Best regards,\n${COMPANY.name}\n${COMPANY.phone}`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[Email] Tax invoice sent to ${customerEmail} for order #${orderId}. MsgId: ${info.messageId}`);
      return info;
    } catch (err) {
      // Email failure must NOT break the payment success flow
      console.error(`[Email] Failed to send tax invoice for order #${orderId}:`, err.message);
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
