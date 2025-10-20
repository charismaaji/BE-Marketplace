# Marketplace Backend API

A dummy backend for a marketplace application built with Express.js and TypeScript, featuring JWT-based authentication.

## Features

- 🔐 **JWT Authentication** with access and refresh tokens
- 🔄 **Token Refresh** with IP address and device ID tracking
- 🚪 **Logout** functionality (single and all devices)
- 📦 **JSON Database** using local JSON files
- 🎯 **TypeScript** for type safety
- 🚀 **Express.js** REST API

## Project Structure

```
BE-Marketplace/
├── database/
│   ├── users.json       # User data
│   ├── products.json    # Product data
│   └── carts.json       # Cart data
├── src/
│   ├── middleware/
│   │   └── auth.ts      # Authentication middleware
│   ├── routes/
│   │   └── auth.ts      # Authentication routes
│   ├── types/
│   │   └── index.ts     # TypeScript interfaces
│   ├── utils/
│   │   ├── database.ts  # Database utilities
│   │   ├── jwt.ts       # JWT utilities
│   │   └── tokenStore.ts # Refresh token storage
│   └── server.ts        # Main server file
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (already set in `.env`):
```
PORT=3000
JWT_ACCESS_SECRET=marketplace-access-secret-key-2024
JWT_REFRESH_SECRET=marketplace-refresh-secret-key-2024
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### 1. Login
**POST** `/api/auth/login`

Request body:
```json
{
  "username": "emilys",
  "password": "emilyspass",
  "ipAddress": "192.168.1.1",
  "deviceId": "device-123-abc"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "emilys",
    "email": "emily.johnson@x.dummyjson.com",
    "firstName": "Emily",
    "lastName": "Johnson"
  }
}
```

#### 2. Refresh Token
**POST** `/api/auth/refresh`

Request body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ipAddress": "192.168.1.1",
  "deviceId": "device-123-abc"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** IP address and device ID must match the ones used during login for security.

#### 3. Logout
**POST** `/api/auth/logout`

Request body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

#### 4. Get User Profile
**GET** `/api/auth/profile/:id`

Headers:
```
Authorization: Bearer <access-token>
```

URL Parameters:
- `id` - User ID (must match the authenticated user's ID)

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Emily",
    "lastName": "Johnson",
    "maidenName": "Smith",
    "age": 28,
    "gender": "female",
    "email": "emily.johnson@x.dummyjson.com",
    "phone": "+81 965-431-3024",
    "username": "emilys",
    "birthDate": "1996-5-30",
    "image": "https://dummyjson.com/icon/emilys/128",
    "bloodGroup": "O-",
    "height": 193.24,
    "weight": 63.16,
    "eyeColor": "Green",
    "hair": {
      "color": "Brown",
      "type": "Curly"
    },
    "ip": "42.48.100.32",
    "address": { ... },
    "macAddress": "47:fa:41:18:ec:eb",
    "university": "University of Wisconsin--Madison",
    "bank": { ... },
    "company": { ... },
    "ein": "...",
    "ssn": "...",
    "userAgent": "...",
    "crypto": { ... },
    "role": "admin"
  }
}
```

**Note:** Password field is excluded from the response. Users can only access their own profile.

### Products

#### 5. Get Product List
**GET** `/api/products`

Headers:
```
Authorization: Bearer <access-token>
```

Query Parameters (optional):
- `page` - Page number (default: 1)
- `limit` - Items per page, max 100 (default: 10)
- `category` - Filter by category (e.g., "beauty", "furniture")
- `search` - Search in title or description

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Essence Mascara Lash Princess",
      "description": "The Essence Mascara Lash Princess is a popular mascara...",
      "category": "beauty",
      "price": 9.99,
      "discountPercentage": 10.48,
      "rating": 2.56,
      "stock": 99,
      "tags": ["beauty", "mascara"],
      "brand": "Essence",
      "sku": "BEA-ESS-ESS-001",
      "weight": 4,
      "dimensions": {
        "width": 15.14,
        "height": 13.08,
        "depth": 22.99
      },
      "warrantyInformation": "1 week warranty",
      "shippingInformation": "Ships in 3-5 business days",
      "availabilityStatus": "In Stock",
      "reviews": [...],
      "returnPolicy": "No return policy",
      "minimumOrderQuantity": 48,
      "meta": {
        "createdAt": "2025-01-20T10:00:00.000Z",
        "updatedAt": "2025-01-20T10:00:00.000Z",
        "barcode": "1234567890123",
        "qrCode": "..."
      },
      "images": [...],
      "thumbnail": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### 6. Get Product by ID
**GET** `/api/products/:id`

Headers:
```
Authorization: Bearer <access-token>
```

URL Parameters:
- `id` - Product ID

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Essence Mascara Lash Princess",
    "description": "The Essence Mascara Lash Princess is a popular mascara...",
    "category": "beauty",
    "price": 9.99,
    // ... complete product details
  }
}
```

### Cart

#### 7. Get User Cart
**GET** `/api/cart`

Headers:
```
Authorization: Bearer <access-token>
```

Description: Get the authenticated user's cart. Creates an empty cart if none exists.

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "products": [
      {
        "id": 1,
        "title": "Essence Mascara Lash Princess",
        "price": 9.99,
        "quantity": 2,
        "total": 19.98,
        "discountPercentage": 10.48,
        "discountedTotal": 17.89,
        "thumbnail": "https://..."
      }
    ],
    "total": 19.98,
    "discountedTotal": 17.89,
    "userId": 1,
    "totalProducts": 1,
    "totalQuantity": 2
  }
}
```

#### 8. Add Product to Cart
**POST** `/api/cart`

Headers:
```
Authorization: Bearer <access-token>
```

Request Body:
```json
{
  "productId": 1,
  "quantity": 2
}
```

Description: Add a product to cart. If product already exists, increases the quantity. Automatically calculates totals and applies discounts.

Response:
```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "id": 1,
    "products": [...],
    "total": 19.98,
    "discountedTotal": 17.89,
    "userId": 1,
    "totalProducts": 1,
    "totalQuantity": 2
  }
}
```

#### 9. Update Cart Product Quantity
**PATCH** `/api/cart`

Headers:
```
Authorization: Bearer <access-token>
```

Request Body:
```json
{
  "productId": 1,
  "quantity": 1
}
```

Description: Update product quantity in cart:
- **Positive quantity**: Add to existing quantity (e.g., `+1` adds 1 more)
- **Negative quantity**: Reduce from existing quantity (e.g., `-1` removes 1)
- **Zero quantity**: Remove product from cart completely

Response:
```json
{
  "success": true,
  "message": "Product quantity increased",
  "data": {
    "id": 1,
    "products": [...],
    "total": 29.97,
    "discountedTotal": 26.84,
    "userId": 1,
    "totalProducts": 1,
    "totalQuantity": 3
  }
}
```

**Note:** 
- Cart data is persisted to `database/carts.json`
- All calculations (totals, discounts) are automatic
- If quantity becomes 0 or negative, the product is removed from cart

### Orders

#### 10. Create Order
**POST** `/api/orders`

Headers:
```
Authorization: Bearer <access-token>
```

Request Body:
```json
{
  "products": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ],
  "paymentMethod": {
    "paymentType": "card",
    "provider": "mastercard"
  }
}
```

**Payment Method Options:**
- **paymentType**: `"card"` or `"virtual account"`
- **provider**: Payment provider (e.g., `"bca"`, `"mastercard"`, `"mandiri"`, `"visa"`, etc.)

Description: Create a new order with products and payment method. Price is calculated automatically based on product prices from the products database multiplied by quantity. All new orders are automatically created with status "not paid" (waiting for payment).

Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "products": [
      {
        "id": 1,
        "title": "Essence Mascara Lash Princess",
        "price": 9.99,
        "quantity": 2,
        "total": 19.98,
        "discountPercentage": 10.48,
        "discountedTotal": 17.89,
        "thumbnail": "https://..."
      },
      {
        "id": 5,
        "title": "Another Product",
        "price": 29.99,
        "quantity": 1,
        "total": 29.99,
        "discountPercentage": 5.0,
        "discountedTotal": 28.49,
        "thumbnail": "https://..."
      }
    ],
    "total": 49.97,
    "discountedTotal": 46.38,
    "totalProducts": 2,
    "totalQuantity": 3,
    "status": "not paid",
    "paymentMethod": {
      "paymentType": "card",
      "provider": "mastercard"
    },
    "createdAt": "2025-10-20T11:44:00.000Z",
    "updatedAt": "2025-10-20T11:44:00.000Z"
  }
}
```

#### 11. Get User Orders
**GET** `/api/orders`

Headers:
```
Authorization: Bearer <access-token>
```

Query Parameters (optional):
- `page` - Page number (default: 1)
- `limit` - Items per page, max 100 (default: 10)
- `status` - Filter by status: "paid" or "not paid"

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "products": [...],
      "total": 49.97,
      "discountedTotal": 46.38,
      "totalProducts": 2,
      "totalQuantity": 3,
      "status": "paid",
      "paymentMethod": {
        "paymentType": "card",
        "provider": "mastercard"
      },
      "createdAt": "2025-10-20T11:44:00.000Z",
      "updatedAt": "2025-10-20T11:44:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Note:**
- Order data is persisted to `database/orders.json`
- Users can only see their own orders (filtered by userId from token)
- Orders are sorted by creation date (newest first)
- All price calculations and discounts are automatic

## Testing

You can test the API using curl, Postman, or any HTTP client.

Example with curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "emilys",
    "password": "emilyspass",
    "ipAddress": "192.168.1.1",
    "deviceId": "device-123"
  }'

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN",
    "ipAddress": "192.168.1.1",
    "deviceId": "device-123"
  }'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Get user profile (replace YOUR_ACCESS_TOKEN and USER_ID)
curl -X GET http://localhost:3000/api/auth/profile/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get product list (with pagination and filters)
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get product list with filters
curl -X GET "http://localhost:3000/api/products?category=beauty&search=mascara" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get product by ID
curl -X GET http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get user's cart
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Add product to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'

# Update cart quantity (add 1 more)
curl -X PATCH http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 1
  }'

# Update cart quantity (reduce by 1)
curl -X PATCH http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": -1
  }'

# Remove product from cart
curl -X PATCH http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 0
  }'

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 5,
        "quantity": 1
      }
    ],
    "paymentMethod": {
      "paymentType": "card",
      "provider": "mastercard"
    }
  }'

# Get user orders (all)
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get user orders with filters
curl -X GET "http://localhost:3000/api/orders?page=1&limit=10&status=paid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Available Users

The system reads users from `database/users.json`. Example user:
- **Username:** `emilys`
- **Password:** `emilyspass`

Check the `database/users.json` file for more users.

## Security Notes

⚠️ **This is a dummy backend for development purposes only!**

- Passwords are stored in plain text (use bcrypt in production)
- Refresh tokens are stored in memory (use Redis or database in production)
- No rate limiting implemented
- No input sanitization beyond basic validation
- IP address and device ID tracking for security demonstration

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **jsonwebtoken** - JWT implementation
- **cors** - CORS middleware
- **dotenv** - Environment variables

## License

ISC
