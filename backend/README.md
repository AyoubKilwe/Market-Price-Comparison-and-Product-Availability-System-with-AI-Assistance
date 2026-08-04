# MarketEye Backend

The MarketEye backend is a REST API built with Node.js, Express, MongoDB, and Mongoose.

It allows:

- customers to search products, compare prices, view stock availability, and ask the AI assistant;
- vendors to register, create a shop, and manage product listings;
- administrators to manage products, approve shops, and view all listings.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- Gemini API

## Folder structure

```text
backend/
├── config/          MongoDB connection
├── controllers/     Request handling and business logic
├── middleware/      Authentication, roles, validation, and errors
├── models/          Mongoose database schemas
├── routes/          API endpoint definitions
├── services/        Gemini API communication
├── utils/           Reusable helper functions
├── .env             Local environment variables
├── server.js        Express server entry point
└── package.json     Dependencies and npm scripts
```

## Installation

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

## Environment variables

Create `backend/.env` and add:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/marketeye
JWT_SECRET=replace_with_a_secure_secret
GEMINI_API_KEY=replace_with_your_gemini_key
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Do not commit `.env` because it contains private credentials.

## Start the server

```bash
npm start
```

The default address is:

```text
http://localhost:5000
```

MongoDB must be running before the backend starts.

## Authentication

Customers use public routes without an account.

Vendors and administrators log in using the same endpoint. Protected requests must include the JWT:

```text
Authorization: Bearer YOUR_TOKEN
```

Public registration always creates a Vendor account. An Admin account must not be created through the public registration route.

## API routes

### Authentication

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a Vendor |
| POST | `/api/auth/login` | Public | Login Vendor or Admin |
| GET | `/api/auth/me` | Vendor/Admin | Return the current user |

### Products

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/products` | Public | List and search active products |
| GET | `/api/products/:id` | Public | View one product |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete or deactivate a product |

Search example:

```text
GET /api/products?search=rice
```

### Shops

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/shops` | Vendor | Create a shop |
| GET | `/api/shops` | Public | List approved shops |
| GET | `/api/shops/:id` | Public | View an approved shop and listings |
| GET | `/api/shops/my-shop` | Vendor | View the Vendor's shop |
| PUT | `/api/shops/my-shop` | Vendor | Update the Vendor's shop |
| PATCH | `/api/shops/:id/status` | Admin | Change a shop's approval status |
| GET | `/api/admin/shops` | Admin | View all shops and statuses |

Shop statuses are:

```text
Pending, Approved, Rejected, Suspended
```

### Listings

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/listings` | Vendor | Create a listing |
| GET | `/api/listings/my-listings` | Vendor | View personal listings |
| PUT | `/api/listings/:id` | Vendor | Update price or stock |
| DELETE | `/api/listings/:id` | Vendor | Delete a personal listing |
| GET | `/api/listings/product/:productId` | Public | Compare a product across approved shops |
| GET | `/api/listings/shop/:shopId` | Public | View active listings for a shop |
| GET | `/api/admin/listings` | Admin | View all listings |

Stock statuses are:

```text
In Stock, Low Stock, Out of Stock
```

The comparison endpoint returns the lowest, highest, and average price.

### AI assistant

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/ai/ask` | Public | Ask a question about MarketEye data |

Example request:

```json
{
  "question": "Which shop has the lowest price for Maweel Rice 25kg?",
  "productId": "PRODUCT_ID"
}
```

The backend retrieves MarketEye data before calling Gemini. Gemini must not invent prices, shops, or availability information.

## Main business rules

- User email must be unique.
- Passwords are hashed and are not returned by normal API responses.
- User roles are Vendor and Admin.
- Admin creates the official products.
- Each Vendor can create one shop.
- Only approved shops appear publicly.
- A Shop can list the same Product only once.
- Listing price must be greater than zero.
- Vendors can manage only their own Shop and Listings.
- Public comparison uses only active Listings from approved Shops.

## Common errors

| Status | Meaning |
|---|---|
| `400` | Invalid request data |
| `401` | Missing or invalid login token |
| `403` | User does not have permission |
| `404` | Requested record was not found |
| `409` | Duplicate record |
| `500` | Unexpected server error |

## Suggested commit message

```text
backend docs: add simple backend setup and API guide
```
