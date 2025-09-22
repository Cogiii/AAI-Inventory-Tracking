# AAI Inventory Tracking - Backend Server

A robust Node.js/Express.js backend server for the AAI Inventory Tracking System with JWT authentication and comprehensive inventory management features.

## Features

- 🔐 **JWT-based Authentication** - Secure user registration, login, and authorization
- 📦 **Complete Inventory Management** - CRUD operations for inventory items
- 👥 **User Management** - Role-based access control (Admin, Manager, User)
- 🔍 **Advanced Filtering & Search** - Pagination, sorting, and search functionality
- ⚡ **Express.js Framework** - Fast, unopinionated web framework
- 🛡️ **Security Middleware** - Helmet, CORS, rate limiting, input validation
- 📊 **Statistics & Analytics** - Inventory stats and low-stock alerts
- 🔧 **Environment Configuration** - Flexible configuration for different environments

## Project Structure

```
server/
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication & authorization middleware
│   ├── errorHandler.js  # Global error handling
│   ├── notFound.js      # 404 route handler
│   └── validation.js    # Input validation middleware
├── routes/              # API route handlers
│   ├── auth.js          # Authentication routes
│   ├── inventory.js     # Inventory management routes
│   └── users.js         # User management routes
├── utils/               # Utility functions
│   ├── jwt.js           # JWT token utilities
│   └── password.js      # Password hashing utilities
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── server.js            # Main server entry point
```

## Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file:
     ```env
     NODE_ENV=development
     PORT=5000
     CLIENT_URL=http://localhost:3000
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRE=7d
     BCRYPT_ROUNDS=12
     ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Server will be running at:** `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `POST /logout` - Logout user
- `GET /stats` - Get authentication statistics (Admin only)

### Inventory Routes (`/api/inventory`)
- `GET /` - Get all inventory items (with pagination/filtering)
- `GET /:id` - Get single inventory item
- `POST /` - Create new inventory item (Manager/Admin)
- `PUT /:id` - Update inventory item (Manager/Admin)
- `DELETE /:id` - Delete inventory item (Admin only)
- `GET /alerts/low-stock` - Get low stock items
- `GET /meta/categories` - Get all categories
- `GET /meta/stats` - Get inventory statistics

### User Routes (`/api/users`)
- `GET /` - Get all users (Admin/Manager)
- `GET /:id` - Get single user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)
- `PUT /:id/deactivate` - Deactivate user (Admin only)
- `PUT /:id/activate` - Activate user (Admin only)

### Health Check
- `GET /api/health` - Server health status
- `GET /` - API information and available endpoints

## Authentication & Authorization

### User Roles
- **Admin**: Full access to all features
- **Manager**: Can manage inventory, limited user access
- **User**: Read-only access to inventory

### JWT Token Usage
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Example API Calls

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get inventory items
```bash
curl -X GET "http://localhost:5000/api/inventory?page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create inventory item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "category": "Electronics",
    "quantity": 100,
    "price": 299.99,
    "sku": "PROD001",
    "location": "Warehouse A",
    "minStockLevel": 10,
    "supplier": "Tech Corp"
  }'
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message here",
  "details": [
    // Validation error details (if applicable)
  ]
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers protection
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Comprehensive validation using Joi
- **Password Hashing**: Secure password hashing with bcrypt
- **JWT Tokens**: Secure authentication tokens with expiration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `CLIENT_URL` | Frontend application URL | http://localhost:3000 |
| `JWT_SECRET` | Secret for JWT token signing | - |
| `JWT_EXPIRE` | JWT token expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Adding Database Integration

This server currently uses in-memory mock data stores. To integrate with a real database:

1. Choose your database (MongoDB, PostgreSQL, MySQL, etc.)
2. Install appropriate database driver
3. Replace mock data stores in middleware/auth.js and routes files
4. Add database connection configuration
5. Update environment variables for database connection

### Example Database Integration Points

- `middleware/auth.js` - Replace `mockUsers` array
- `routes/inventory.js` - Replace `mockInventory` array
- Add database models/schemas
- Add database connection configuration

## Contributing

1. Follow the existing code structure and patterns
2. Add proper validation for new endpoints
3. Include error handling for all operations
4. Update this README for any new features
5. Test all functionality before submitting

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please contact the development team or create an issue in the project repository.