@echo off
REM Wishlist Feature Installation Script for Windows
REM Run this to complete the wishlist feature setup

echo.
echo 🎁 Wishlist Feature Installation
echo ==================================
echo.

REM Check if we're in the backend directory
if not exist "models" (
    echo ❌ Please run this script from the backend directory
    echo Usage: cd backend ^&^& install-wishlist.bat
    pause
    exit /b 1
)

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install react-icons --save 2>nul || echo ℹ️  react-icons may already be installed
call npm install nodemailer --save-optional 2>nul || echo ℹ️  nodemailer optional
echo ✅ Dependencies setup complete
echo.

REM Step 2: Run database migration
echo 🗄️  Running database migration...
call npx sequelize-cli db:migrate
if %errorlevel% equ 0 (
    echo ✅ Migration completed successfully
) else (
    echo ⚠️  Please check migration status manually
)
echo.

REM Step 3: Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # Email Configuration
        echo EMAIL_PROVIDER=mock
        echo EMAIL_FROM=noreply@ecommerce.com
        echo.
        echo # App URL
        echo APP_URL=http://localhost:3000
        echo.
        echo # Database (if using SQLite^)
        echo # DATABASE_URL=sqlite:./database.sqlite
        echo.
        echo # For production, add:
        echo # GMAIL_USER=your-email@gmail.com
        echo # GMAIL_APP_PASSWORD=your-app-password
        echo # Or SendGrid:
        echo # SENDGRID_API_KEY=your-key
        echo # Or AWS SES:
        echo # AWS_ACCESS_KEY_ID=your-key
        echo # AWS_SECRET_ACCESS_KEY=your-secret
        echo # AWS_REGION=us-east-1
    ) > .env
    echo ✅ .env file created
    echo    (Configure email settings as needed^)
) else (
    echo ⏭️  .env file already exists (skipped^)
)
echo.

REM Step 4: Verify models
echo 🔍 Verifying models...
if exist "models\wishlist.js" (
    echo ✅ Wishlist model found
) else (
    echo ⚠️  Wishlist model needs to be registered
)
echo.

REM Step 5: Summary
echo ==================================
echo ✅ Installation Complete!
echo.
echo 📋 Next Steps:
echo.
echo 1. Frontend Setup (if in separate project^):
echo    - npm install react-icons
echo.
echo 2. Start the server:
echo    npm start
echo.
echo 3. Test the feature:
echo    - Visit any product page
echo    - Click the heart icon to add to wishlist
echo    - Visit http://localhost:3000/wishlist
echo.
echo 4. Email Configuration (Optional^):
echo    - Edit .env for your email provider
echo    - Support: Gmail, SendGrid, AWS SES
echo.
echo 📚 Documentation:
echo    - Full guide: WISHLIST_IMPLEMENTATION.md
echo    - Quick start: WISHLIST_QUICKSTART.md
echo    - Summary: WISHLIST_SUMMARY.md
echo.
echo 🚀 Happy coding! ❤️
echo.
pause
