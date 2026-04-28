export const NEWSLETTER_TEMPLATES = [
    {
        id: 'welcome',
        name: 'Welcome Template',
        subject: 'Welcome to Our Family! 🌟',
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to Hanley Healthcare!</h1>
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
        <p style="font-size: 18px;">Hi there,</p>
        <p>We're absolutely thrilled to have you join our community! At Hanley Healthcare, we're dedicated to bringing you the finest health and wellness products.</p>
        <p>As a token of our appreciation, here's a special gift for your first order:</p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Use Code</p>
            <h2 style="margin: 5px 0; color: #2563eb; font-size: 32px; letter-spacing: 2px;">WELCOME10</h2>
            <p style="margin: 0; color: #64748b;">Get 10% OFF on your first purchase!</p>
        </div>
        <p>Stay tuned for exclusive health tips, new product launches, and special offers delivered straight to your inbox.</p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://hanleyhealthcare.com" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Start Shopping</a>
        </div>
    </div>
    <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p>© ${new Date().getFullYear()} Hanley Healthcare LLP. All rights reserved.</p>
    </div>
</div>`
    },
    {
        id: 'thank-you',
        name: 'Thank You Template',
        subject: 'A Big Thank You from Us! ❤️',
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #10b981; padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">You're Awesome!</h1>
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
        <p style="font-size: 18px;">Hi Valued Customer,</p>
        <p>We just wanted to take a moment to say <strong>Thank You</strong> for being a part of our journey. Your support means the world to us.</p>
        <p>It's customers like you who inspire us to keep improving and delivering the best possible healthcare solutions.</p>
        <div style="text-align: center; margin: 30px 0;">
            <img src="https://hanleyhealthcare.com/cdn/shop/files/Untitled-2.png" alt="Thank You" style="max-width: 150px;">
        </div>
        <p>Is there anything we can do better? We'd love to hear your feedback!</p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://hanleyhealthcare.com/contact" style="background: #10b981; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Give Feedback</a>
        </div>
    </div>
    <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p>© ${new Date().getFullYear()} Hanley Healthcare LLP. All rights reserved.</p>
    </div>
</div>`
    },
    {
        id: 'visit-website',
        name: 'Visit Website Template',
        subject: 'Something New Awaits You! 🚀',
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #4f46e5; padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Missing Something?</h1>
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
        <p style="font-size: 18px;">Hello,</p>
        <p>We've updated our collection with some exciting new wellness products that we think you'll love!</p>
        <p>Our website has a fresh new look and faster browsing experience. Come take a look and find your new favorites.</p>
        <div style="border: 1px dashed #4f46e5; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <ul style="margin: 0; padding-left: 20px;">
                <li>New Organic Supplements</li>
                <li>Advanced Skincare Range</li>
                <li>Exclusive Online-only Bundles</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://hanleyhealthcare.com" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Visit Our Website</a>
        </div>
    </div>
    <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p>© ${new Date().getFullYear()} Hanley Healthcare LLP. All rights reserved.</p>
    </div>
</div>`
    },
    {
        id: 'new-product',
        name: 'New Product Template',
        subject: 'Fresh Arrivals! 🎁 Discover What\'s New',
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #f59e0b; padding: 40px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">New Arrivals!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Fresh from our labs to your doorstep</p>
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
        <p style="font-size: 18px;">Big News!</p>
        <p>The wait is finally over. Our latest product line has just landed and it's better than ever.</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 12px; display: inline-block;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">✨ LIMITED STOCK AVAILABLE ✨</p>
            </div>
        </div>
        <p>Designed with the latest healthcare innovations, our new products are here to help you achieve your wellness goals more effectively.</p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://hanleyhealthcare.com/products" style="background: #f59e0b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Shop New Arrivals</a>
        </div>
    </div>
    <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p>© ${new Date().getFullYear()} Hanley Healthcare LLP. All rights reserved.</p>
    </div>
</div>`
    }
];
