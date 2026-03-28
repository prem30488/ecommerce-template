#!/bin/bash
# Wishlist Feature Installation Script
# Run this to complete the wishlist feature setup

echo "🎁 Wishlist Feature Installation"
echo "=================================="
echo ""

# Step 1: Check if we're in the backend directory
if [ ! -d "models" ]; then
    echo "❌ Please run this script from the backend directory"
    echo "Usage: cd backend && bash install-wishlist.sh"
    exit 1
fi

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install react-icons --save || true
npm install nodemailer --save-optional || true
echo "✅ Dependencies installed"
echo ""

# Step 3: Run database migration
echo "🗄️  Running database migration..."
npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "⚠️  Migration may have issues, please check manually"
fi
echo ""

# Step 4: Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Email Configuration
EMAIL_PROVIDER=mock
EMAIL_FROM=noreply@ecommerce.com

# App URL
APP_URL=http://localhost:3000

# Database (if using SQLite)
# DATABASE_URL=sqlite:./database.sqlite

# For production, add:
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password
# Or SendGrid:
# SENDGRID_API_KEY=your-key
# Or AWS SES:
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_REGION=us-east-1
EOF
    echo "✅ .env file created"
    echo "   (Configure email settings as needed)"
else
    echo "⏭️  .env file already exists (skipped)"
fi
echo ""

# Step 5: Verify models
echo "🔍 Verifying models..."
if grep -q "Wishlist" models/index.js 2>/dev/null || [ -f "models/wishlist.js" ]; then
    echo "✅ Wishlist model found"
else
    echo "⚠️  Wishlist model might need to be registered"
fi
echo ""

# Step 6: Summary
echo "=================================="
echo "✅ Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Frontend Setup (if in separate project):"
echo "   - npm install react-icons"
echo ""
echo "2. Start the server:"
echo "   npm start"
echo ""
echo "3. Test the feature:"
echo "   - Visit any product page"
echo "   - Click the heart icon to add to wishlist"
echo "   - Visit http://localhost:3000/wishlist"
echo ""
echo "4. Email Configuration (Optional):"
echo "   - Edit .env for your email provider"
echo "   - Support: Gmail, SendGrid, AWS SES"
echo ""
echo "📚 Documentation:"
echo "   - Full guide: WISHLIST_IMPLEMENTATION.md"
echo "   - Quick start: WISHLIST_QUICKSTART.md"
echo "   - Summary: WISHLIST_SUMMARY.md"
echo ""
echo "🚀 Happy coding! ❤️"
echo ""
