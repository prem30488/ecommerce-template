# Wishlist Feature - Quick Start Guide

## TL;DR Setup (5 minutes)

### Step 1: Run Database Migration
```bash
cd backend
npx sequelize-cli db:migrate
```

### Step 2: Install Dependencies
If not already installed:
```bash
npm install react-icons
# Optional for real emails:
npm install nodemailer
```

### Step 3: Configure Environment (.env)
```env
EMAIL_PROVIDER=mock
EMAIL_FROM=noreply@ecommerce.com
APP_URL=http://localhost:3000
```

### Step 4: Start Using
- Wishlist icon appears on all product pages ❤️
- Navigate to `/wishlist` to view full wishlist
- Click share to send via social media
- Email sent automatically on session end

---

## 🎯 Where to Find Everything

### User-Facing Features
| Feature | Location | Path |
|---------|----------|------|
| Add to Wishlist | Product Details Page | Click heart icon |
| View Wishlist | Main Page | `/wishlist` |
| Share Item | Wishlist | Click share button |
| Shared Wishlist | Friend's Link | `/wishlist/shared?userId=X` |

### Developer Files
| File | Purpose |
|------|---------|
| `src/context/wishlist-context.jsx` | State management |
| `src/components/WishlistIcon.jsx` | Heart button component |
| `src/pages/wishlist/wishlist.jsx` | Main wishlist page |
| `backend/models/wishlist.js` | Database schema |
| `backend/server_new.js` | API endpoints |
| `backend/utils/emailService.js` | Email sending |

---

## 🚀 Quick Features Reference

### Context API Methods
```javascript
// All available from useContext(WishlistContext)
addToWishlist(productId)           // Add item
removeFromWishlist(productId)      // Remove item
isInWishlist(productId)            // Check if in wishlist (boolean)
getWishlistCount()                 // Get total items count
getWishlistItemsWithDetails()      // Get full item objects with product info
clearWishlist()                    // Clear all items
getWishlistShareLink()             // Get public share URL
```

### API Endpoints
```
GET    /api/wishlist                    # Get user's wishlist
POST   /api/wishlist                    # Add item
DELETE /api/wishlist/:product_id        # Remove item
DELETE /api/wishlist                    # Clear all
GET    /api/wishlist/shared/:userId     # Get shared wishlist (public)
POST   /api/wishlist/email-on-close     # Send email on session close
```

---

## 📧 Email Setup (Optional)

### Option 1: Mock (Default - Logs to Console)
No setup needed! Emails print to console:
```
EMAIL_PROVIDER=mock
```

### Option 2: Gmail
1. Enable 2FA on Gmail
2. Generate app password: https://myaccount.google.com/apppasswords
3. Update .env:
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Option 3: SendGrid
1. Create account and get API key
2. Update .env:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
```

---

## 🎨 Styling Components

### WishlistIcon
```jsx
import WishlistIcon from './components/WishlistIcon';

<WishlistIcon 
  productId={5}
  size="large"  // small, medium, large
/>
```

### Wishlist Page
- Located at `/wishlist`
- Automatically styled
- Responsive design included

### Shared Wishlist
- Located at `/wishlist/shared?userId=USER_ID`
- Public viewable
- No authentication required

---

## 🧪 Quick Test

### Test Add to Wishlist
1. Go to any product page
2. Click heart icon ❤️
3. Icon turns red (filled)
4. Go to `/wishlist` to verify

### Test Share
1. Add item to wishlist
2. Go to `/wishlist`
3. Click "Share" button
4. Select social platform
5. Verify share link copied

### Test Email (if configured)
1. Add items to wishlist
2. Call `/api/wishlist/email-on-close` endpoint
3. Check email (or console if mock)

---

## 🔧 Common Customizations

### Change Heart Icon Color
Edit `src/components/wishlist-icon.css`:
```css
.wishlist-icon {
  color: #ff4757;  /* Change this */
}
```

### Change Email Sender Name
Edit `.env`:
```env
EMAIL_FROM=YourStore Support <support@yourstore.com>
```

### Customize Email Template
Edit `backend/utils/emailService.js`:
```javascript
generateWishlistEmailHtml(username, items, appUrl) {
  // Edit HTML here
  // Change colors, add logo, etc.
}
```

---

## 📊 Database Schema

### Wishlist Table
```sql
CREATE TABLE Wishlists (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  session_id VARCHAR(255),
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, product_id),
  FOREIGN KEY(user_id) REFERENCES Users(id),
  FOREIGN KEY(product_id) REFERENCES Products(id)
);
```

---

## 🐛 Debugging Tips

### Check Wishlist in Console
```javascript
// In browser console
const ctx = document.querySelector('div').__reactPropsCache.find(key => 
  key.includes('wishlist')
);
```

### Check API Responses
```bash
# Get wishlist
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer mock-token"

# Add to wishlist
curl -X POST http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer mock-token" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 5, "session_id": "test"}'
```

### Check Database
```javascript
// node
const db = require('./models');
const items = await db.Wishlist.findAll();
console.log(items);
```

---

## ✅ Validation Checklist

- [ ] Database migration succeeded
- [ ] Wishlist context loads in App.jsx
- [ ] Heart icon appears on products
- [ ] Add/remove functionality works
- [ ] Wishlist page displays items
- [ ] Share buttons work
- [ ] Email sending configured (if needed)
- [ ] Shared wishlist URL works
- [ ] Mobile responsive

---

## 🆘 Troubleshooting

### Wishlist icon not showing
```javascript
// Verify import in component
import WishlistIcon from '../../components/WishlistIcon';
// Check react-icons installed
npm list react-icons
```

### Context not working
```javascript
// Verify provider in App.jsx
<WishlistContextProvider>
  {/* App content */}
</WishlistContextProvider>
```

### API 401 Error
```javascript
// Add authorization header
Header: Authorization: Bearer mock-token
// Or set actual token in localStorage
localStorage.setItem('authToken', 'your-token');
```

### Email not sending
```javascript
// Check .env variables
console.log(process.env.EMAIL_PROVIDER);
// Check email service logs
// Or use mock provider for testing
EMAIL_PROVIDER=mock
```

---

## 📚 Learn More

- Full docs: See `WISHLIST_IMPLEMENTATION.md`
- Context API: `src/context/wishlist-context.jsx`
- Email service: `backend/utils/emailService.js`
- Session tracker: `backend/utils/sessionTracker.js`

---

## 🎉 You're All Set!

Your wishlist feature is ready to use. Visit `/wishlist` to get started!

Happy coding! ❤️
