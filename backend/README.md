# Ecommerce Backend

A simple Node.js backend for the ecommerce template using SQLite database.

## Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Initialize the database:
   ```
   node initDB.js
   ```

4. Start the server:
   ```
   npm start
   ```

The server will run on http://localhost:5000

## Database

The backend uses SQLite database (`ecommerce.db`) with the following tables:
- `categories` - Product categories
- `products` - Product catalog
- `coupons` - Discount coupons
- `users` - User accounts
- `orders` - Customer orders
- `order_items` - Order line items
- `cart` - Shopping cart items

## API Endpoints

### Public Endpoints
- GET /api/products - Get all products
- GET /api/product/getProducts?page=0&size=10&sort=id,desc - Get paginated products
- GET /api/products/:id - Get product by ID
- GET /api/product/fetchById/:id - Get product by ID (alternative)
- GET /api/products/category/:category - Get products by category
- GET /api/categories - Get all categories
- GET /api/category/getCategories - Get all categories
- GET /api/coupons - Get all coupons
- GET /api/coupon/getCoupon - Get all coupons
- POST /auth/login - Login (mock)
- POST /auth/signup - Signup (mock)

### Protected Endpoints (Require Bearer Token)
- GET /api/user/me - Get current user
- GET /api/user/privileges/:id - Get user privileges
- GET /api/user/users - Get all users
- POST /api/user/users - Create user
- PUT /api/user/users - Update user
- DELETE /api/user/deleteUser/:id - Delete user
- GET /api/user/fetchUserById/:id - Get user by ID
- GET /api/order/getOrders - Get orders
- GET /api/forms/getForms - Get forms
- POST /api/forms/createForms - Create form
- PUT /api/forms/updateForms - Update form
- DELETE /api/forms/deleteForms/:id - Delete form
- GET /api/forms/fetchById/:id - Get form by ID
- GET /api/forms/fetchFormById/:id - Get form by ID
- GET /api/testimonial/getTestimonials - Get testimonials
- POST /api/testimonial/createTestimonial - Create testimonial
- POST /api/testimonial/upload - Upload testimonial
- PUT /api/testimonial/updateTestimonial - Update testimonial
- DELETE /api/testimonial/deleteTestimonial/:id - Delete testimonial
- GET /api/testimonial/fetchTestimonialById/:id - Get testimonial by ID
- GET /api/offer/getOffers - Get offers
- GET /api/offer/getOffersByProductId/:productId - Get offers by product
- POST /api/offer/createOffer - Create offer
- PUT /api/offer/updateOffer - Update offer
- DELETE /api/offer/deleteOffer/:id - Delete offer
- POST /api/category/createCategory - Create category
- PUT /api/category/updateCategory - Update category
- DELETE /api/category/deleteCategory/:id - Delete category
- GET /api/category/fetchById/:id - Get category by ID
- GET /api/category/fetchCategoryById/:id - Get category by ID
- POST /api/coupon/createCoupon - Create coupon
- PUT /api/coupon/updateCoupon - Update coupon
- DELETE /api/coupon/deleteCoupon/:id - Delete coupon
- DELETE /api/product/deleteProduct/:id - Delete product
- GET /api/generalProfile/fetchGeneralProfileById/:id - Get general profile
- GET /api/overview/fetchOverviewById/:id - Get overview
- GET /api/mission/fetchMissionById/:id - Get mission
- GET /api/leadership/fetchLeadershipById/:id - Get leadership
- GET /api/award/fetchAwardById/:id - Get award
- GET /api/solrEntities/fetchSolrEntitiesDesc - Get solr entities
- GET /api/solrEntities/fetchSolrEntitiesViewedDesc - Get viewed solr entities

### Cart & Checkout
- GET /api/cart - Get cart items
- POST /api/cart - Add item to cart
- PUT /api/cart/:product_id - Update cart item quantity
- DELETE /api/cart/:product_id - Remove item from cart
- POST /api/checkout - Place order
- GET /api/orders - Get user orders

## Authentication
Protected endpoints require a Bearer token in the Authorization header.
Use "Bearer mock-token" for testing.

## Data Source
The database is seeded with data from JSON files in the `../Front End/public/` directory.